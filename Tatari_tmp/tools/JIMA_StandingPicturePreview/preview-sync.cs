// JIMA preview v0.4.0. Windows-only, read-only accessibility bridge.
// Compiled in memory by Windows PowerShell 5.1. No MZ/game code is patched.
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Web.Script.Serialization;
using System.Windows.Automation;
using Accessibility;

namespace JimaStandingPreview
{
    public sealed class PreviewBridge : IDisposable
    {
        const string ToolPath = "/tools/JIMA_StandingPicturePreview/";
        readonly object gate = new object();
        readonly string root;
        readonly string token = Guid.NewGuid().ToString("N");
        readonly int ownPid = Process.GetCurrentProcess().Id;
        readonly Semaphore connections = new Semaphore(12, 12);
        HashSet<string> ids = new HashSet<string>(StringComparer.Ordinal);
        TcpListener listener;
        volatile bool running;
        string origin, cookieName, processName = "", pictureId = "", source = "", observed = "", configError = "";
        string hint = "請按「綁定 MZ」，再於 8 秒內將滑鼠移到 MZ 的立繪 ID 選單。";
        int boundPid;
        long sequence;
        bool hovering;
        DateTime bindAt = DateTime.MinValue, lastProbe = DateTime.MinValue, configStamp = DateTime.MinValue;

        [StructLayout(LayoutKind.Sequential)]
        struct POINT { public int X; public int Y; }
        [DllImport("user32.dll")] static extern bool GetCursorPos(out POINT point);
        [DllImport("user32.dll")] static extern IntPtr WindowFromPoint(POINT point);
        [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr window, out uint pid);
        [DllImport("user32.dll")] static extern IntPtr SetThreadDpiAwarenessContext(IntPtr value);
        [DllImport("oleacc.dll")]
        static extern int AccessibleObjectFromPoint(POINT point, [MarshalAs(UnmanagedType.Interface)] out IAccessible accessible,
            [MarshalAs(UnmanagedType.Struct)] out object child);

        public PreviewBridge(string projectRoot)
        {
            root = Path.GetFullPath(projectRoot).TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
            if (!File.Exists(Path.Combine(root, "js", "plugins.js")))
                throw new FileNotFoundException("找不到 js/plugins.js。請把整個 tools 資料夾放進 MZ 專案。");
            if (!File.Exists(Path.Combine(root, "tools", "JIMA_StandingPicturePreview", "index.html")))
                throw new FileNotFoundException("找不到預覽工具的 index.html。請完整解壓 tools 資料夾。");
        }
        public string Url { get { return origin + ToolPath + "index.html?jima_sync=" + token; } }

        public void Start()
        {
            if (running) return;
            ReloadIds();
            listener = new TcpListener(IPAddress.Loopback, 0);
            listener.Start();
            origin = "http://127.0.0.1:" + ((IPEndPoint)listener.LocalEndpoint).Port.ToString(CultureInfo.InvariantCulture);
            cookieName = "jimaPreview_" + token.Substring(0, 12);
            running = true;
            Thread server = new Thread(ListenLoop);
            server.IsBackground = true; server.Name = "JIMA local preview"; server.Start();
            Thread native = new Thread(CursorLoop);
            native.IsBackground = true; native.Name = "JIMA MZ accessibility";
            native.SetApartmentState(ApartmentState.MTA); native.Start();
        }
        public void Dispose()
        {
            running = false;
            if (listener != null) listener.Stop();
        }
        JavaScriptSerializer Json()
        {
            return new JavaScriptSerializer { MaxJsonLength = 16 * 1024 * 1024, RecursionLimit = 64 };
        }
        // Match Jima_StandingPicture v1.2.2: an extensionless image filename is its ID.
        static string RegisteredImageId(object raw)
        {
            string name = Convert.ToString(raw ?? "");
            if (name.StartsWith("jima-image:", StringComparison.Ordinal)) name = Uri.UnescapeDataString(name.Substring(11));
            name = name.Replace('\\', '/');
            if (name.Length == 0) return null;
            if (name.StartsWith("img/pictures/", StringComparison.Ordinal)) name = name.Substring(13);
            if (Regex.IsMatch(name, @"[\x00-\x1f\x7f:]") || name.StartsWith("/", StringComparison.Ordinal))
                throw new FormatException("立繪圖片名稱無效，請回 MZ 重新選圖。");
            foreach (string segment in name.Split('/'))
                if (segment.Length == 0 || segment == "." || segment == "..") throw new FormatException("立繪圖片路徑無效。");
            return name.Substring(name.LastIndexOf('/') + 1);
        }
        void ReloadIds()
        {
            try
            {
                string path = Path.Combine(root, "js", "plugins.js");
                DateTime stamp = File.GetLastWriteTimeUtc(path);
                if (stamp == configStamp) return;
                string text = File.ReadAllText(path, Encoding.UTF8);
                Match match = Regex.Match(text, @"\b(?:var|let|const)\s+\$plugins\s*=\s*(\[[\s\S]*\])\s*;?\s*$");
                if (!match.Success) throw new FormatException("js/plugins.js 不是標準的 MZ 插件清單。");
                object[] plugins = Json().DeserializeObject(match.Groups[1].Value) as object[];
                HashSet<string> found = new HashSet<string>(StringComparer.Ordinal);
                bool present = false;
                if (plugins == null) throw new FormatException("讀不到插件陣列。");
                foreach (object item in plugins)
                {
                    Dictionary<string, object> plugin = item as Dictionary<string, object>;
                    if (plugin == null || !plugin.ContainsKey("name") || (Convert.ToString(plugin["name"]) != "Jima_StandingPicture" && Convert.ToString(plugin["name"]) != "LL_StandingPicture")) continue;
                    present = true;
                    Dictionary<string, object> parameters = plugin.ContainsKey("parameters") ? plugin["parameters"] as Dictionary<string, object> : null;
                    if (parameters == null || !parameters.ContainsKey("sPictures")) continue;
                    string saved = Convert.ToString(parameters["sPictures"]);
                    object[] rows = Json().DeserializeObject(saved.Length == 0 ? "[]" : saved) as object[];
                    if (rows == null) throw new FormatException("立繪個別樣式必須是清單。");
                    foreach (object row in rows)
                    {
                        if (row == null || (row is string && ((string)row).Length == 0)) continue;
                        Dictionary<string, object> picture = row as Dictionary<string, object>;
                        if (picture == null && row is string)
                        {
                            try { picture = Json().DeserializeObject((string)row) as Dictionary<string, object>; }
                            catch (ArgumentException) { continue; }
                        }
                        if (picture == null || !picture.ContainsKey("imageName")) continue;
                        string id = RegisteredImageId(picture["imageName"]);
                        if (id != null) found.Add(id);
                    }
                }
                if (!present) throw new FormatException("專案中找不到 Jima_StandingPicture。");
                lock (gate)
                {
                    ids = found; configError = ""; configStamp = stamp;
                    if (!ids.Contains(pictureId)) { pictureId = ""; hovering = false; sequence++; }
                }
            }
            catch (Exception error)
            {
                lock (gate) { ids = new HashSet<string>(StringComparer.Ordinal); configError = error.Message; hovering = false; }
            }
        }
        static string RecognizedId(string label, HashSet<string> allowed)
        {
            if (allowed.Contains(label)) return label;
            string id = label.Trim();
            if (id.StartsWith("jima-id:", StringComparison.Ordinal))
            {
                try { id = Uri.UnescapeDataString(id.Substring(8)); }
                catch (UriFormatException) { return null; }
            }
            if (allowed.Contains(id)) return id;
            id = id.Replace('＠', '@');
            return allowed.Contains(id) ? id : null;
        }
        void BeginBind()
        {
            lock (gate)
            {
                boundPid = 0; hovering = false; source = ""; observed = ""; processName = "";
                bindAt = DateTime.UtcNow.AddSeconds(8);
                hint = "請切回 MZ，打開立繪 ID 下拉選單，並把滑鼠留在其中一個 ID 上。";
            }
        }
        Dictionary<string, object> Snapshot()
        {
            lock (gate)
            {
                double seconds = bindAt == DateTime.MinValue ? 0 : Math.Ceiling((bindAt - DateTime.UtcNow).TotalSeconds);
                return new Dictionary<string, object>
                {
                    {"version", "0.4.0"}, {"pid", boundPid}, {"process", processName},
                    {"id", pictureId}, {"sequence", sequence}, {"hovering", hovering},
                    {"source", source}, {"observed", observed}, {"hint", hint},
                    {"countdown", Math.Max(0, seconds)}, {"registered", ids.Count}, {"configError", configError},
                    {"probeAge", lastProbe == DateTime.MinValue ? 0 : (int)Math.Min(99999, (DateTime.UtcNow - lastProbe).TotalSeconds)}
                };
            }
        }
        static int PidAt(POINT point)
        {
            uint pid;
            GetWindowThreadProcessId(WindowFromPoint(point), out pid);
            return (int)pid;
        }
        void CaptureBinding(POINT point)
        {
            int pid = PidAt(point);
            string name = "";
            try { using (Process process = Process.GetProcessById(pid)) name = process.ProcessName; } catch { }
            string lower = name.ToLowerInvariant();
            bool wrong = pid <= 0 || pid == ownPid || lower == "msedge" || lower == "chrome" ||
                lower == "firefox" || lower == "explorer" || lower == "cmd" || lower == "powershell" ||
                lower == "pwsh" || lower == "windowsterminal" || lower == "conhost" || lower == "openconsole";
            lock (gate)
            {
                bindAt = DateTime.MinValue; hovering = false;
                if (wrong)
                {
                    hint = "沒有綁定成功：倒數結束時滑鼠未停在 MZ。請再按一次「綁定 MZ」。";
                    return;
                }
                boundPid = pid; processName = name;
                hint = "已綁定 " + name + "。請打開立繪 ID 下拉選單，滑過 ID 測試。";
            }
        }
        void CursorLoop()
        {
            // UIA uses physical coordinates. Set this worker's DPI mode, not MZ's.
            try { SetThreadDpiAwarenessContext(new IntPtr(-4)); } catch (EntryPointNotFoundException) { }
            DateTime nextConfigRead = DateTime.MinValue;
            while (running)
            {
                try
                {
                    if (DateTime.UtcNow >= nextConfigRead)
                    {
                        ReloadIds(); nextConfigRead = DateTime.UtcNow.AddSeconds(1);
                    }
                    POINT point;
                    if (!GetCursorPos(out point)) { Thread.Sleep(150); continue; }
                    DateTime pending; int target; HashSet<string> allowed;
                    lock (gate) { pending = bindAt; target = boundPid; allowed = ids; }
                    if (pending != DateTime.MinValue && DateTime.UtcNow >= pending) CaptureBinding(point);
                    else if (target != 0 && PidAt(point) == target)
                    {
                        lock (gate) { lastProbe = DateTime.UtcNow; }
                        string via, label;
                        string found = ReadHoveredId(point, target, allowed, out via, out label);
                        // Reject results if the user has moved to another window while UIA was busy.
                        POINT after;
                        if (!GetCursorPos(out after) || after.X != point.X || after.Y != point.Y || PidAt(after) != target) found = null;
                        lock (gate)
                        {
                            if (boundPid == target && bindAt == DateTime.MinValue)
                            {
                                if (found != null && (!hovering || pictureId != found)) sequence++;
                                hovering = found != null;
                                if (found != null) pictureId = found;
                                source = via; observed = label;
                                hint = found == null
                                    ? "尚未讀到登錄 ID。請把滑鼠移到已展開的選單項目；若仍無反應，請回報下方偵測資訊。"
                                    : "正在跟隨 MZ：" + found;
                            }
                        }
                    }
                    else { lock (gate) { hovering = false; } }
                }
                catch (Exception error)
                {
                    lock (gate) { hovering = false; hint = "偵測暫停：" + Short(error.Message) + "。請重新綁定 MZ。"; }
                }
                Thread.Sleep(150);
            }
        }
        static string Short(string text)
        {
            text = (text ?? "").Replace('\r', ' ').Replace('\n', ' ').Trim();
            return text.Length > 180 ? text.Substring(0, 180) : text;
        }
        static bool Within(System.Windows.Rect rectangle, POINT point)
        {
            return !rectangle.IsEmpty && rectangle.Width > 0 && rectangle.Height > 0 &&
                rectangle.Contains(new System.Windows.Point(point.X, point.Y));
        }
        static bool ItemType(ControlType type)
        {
            return type == ControlType.ListItem || type == ControlType.MenuItem ||
                type == ControlType.Text || type == ControlType.DataItem;
        }
        static string InspectUia(AutomationElement element, POINT point, int pid, HashSet<string> allowed, ref string observed)
        {
            AutomationElement.AutomationElementInformation info = element.Current;
            if (info.ProcessId != pid || !Within(info.BoundingRectangle, point)) return null;
            string name = info.Name ?? "";
            observed = Short(info.ControlType.ProgrammaticName + " / " + name);
            // A combo box's Name can be the OLD committed selection: never accept it as hover.
            if (!ItemType(info.ControlType)) return null;
            return RecognizedId(name, allowed);
        }
        static string ReadHoveredId(POINT point, int pid, HashSet<string> allowed, out string via, out string observed)
        {
            via = ""; observed = "";
            try
            {
                AutomationElement element = AutomationElement.FromPoint(new System.Windows.Point(point.X, point.Y));
                Stopwatch budget = Stopwatch.StartNew();
                // Descend only through the hit rectangle; never scan the desktop tree.
                for (int depth = 0; element != null && depth < 6 && budget.ElapsedMilliseconds < 200; depth++)
                {
                    string id = InspectUia(element, point, pid, allowed, ref observed);
                    if (id != null) { via = "UI Automation"; return id; }
                    AutomationElement next = null;
                    AutomationElement child = TreeWalker.ControlViewWalker.GetFirstChild(element);
                    for (int count = 0; child != null && count < 256 && budget.ElapsedMilliseconds < 200; count++)
                    {
                        if (child.Current.ProcessId == pid && Within(child.Current.BoundingRectangle, point)) { next = child; break; }
                        child = TreeWalker.ControlViewWalker.GetNextSibling(child);
                    }
                    element = next;
                }
            }
            catch (Exception error) { observed = Short("UIA: " + error.Message); }
            // Qt editors may expose legacy MSAA objects instead of UIA list items.
            IAccessible accessible = null;
            object childId = null;
            object hitObject = null;
            try
            {
                if (AccessibleObjectFromPoint(point, out accessible, out childId) == 0 && accessible != null)
                {
                    string id = InspectMsaa(accessible, childId, point, allowed, ref observed);
                    if (id != null) { via = "MSAA"; return id; }
                    hitObject = accessible.accHitTest(point.X, point.Y);
                    if (hitObject is int)
                        id = InspectMsaa(accessible, hitObject, point, allowed, ref observed);
                    else if (hitObject is IAccessible)
                        id = InspectMsaa((IAccessible)hitObject, 0, point, allowed, ref observed);
                    if (id != null) { via = "MSAA"; return id; }
                }
            }
            catch (Exception error) { observed = Short(observed + " / MSAA: " + error.Message); }
            finally
            {
                if (hitObject != null && !Object.ReferenceEquals(hitObject, accessible) && Marshal.IsComObject(hitObject)) Marshal.ReleaseComObject(hitObject);
                if (accessible != null && Marshal.IsComObject(accessible)) Marshal.ReleaseComObject(accessible);
            }
            return null;
        }
        static string InspectMsaa(IAccessible item, object child, POINT point, HashSet<string> allowed, ref string observed)
        {
            child = child ?? 0;
            string name = item.get_accName(child) ?? "";
            int role = Convert.ToInt32(item.get_accRole(child), CultureInfo.InvariantCulture);
            observed = Short("MSAA role=" + role + " / " + name);
            // ROLE_SYSTEM_MENUITEM=12, LISTITEM=34, STATICTEXT=41.
            string id = RecognizedId(name, allowed);
            if ((role != 12 && role != 34 && role != 41) || id == null) return null;
            int x, y, width, height;
            item.accLocation(out x, out y, out width, out height, child);
            return width > 0 && height > 0 && point.X >= x && point.X < x + width &&
                point.Y >= y && point.Y < y + height ? id : null;
        }

        void ListenLoop()
        {
            while (running)
            {
                try
                {
                    TcpClient client = listener.AcceptTcpClient();
                    if (!connections.WaitOne(0)) { client.Close(); continue; }
                    ThreadPool.QueueUserWorkItem(delegate
                    {
                        try { using (client) Serve(client); } catch { }
                        finally { connections.Release(); }
                    });
                }
                catch (SocketException) { if (!running) return; }
                catch (ObjectDisposedException) { return; }
            }
        }
        static string ReadHeader(NetworkStream stream)
        {
            List<byte> bytes = new List<byte>();
            int tail = 0;
            while (bytes.Count < 16384)
            {
                int value = stream.ReadByte();
                if (value < 0) throw new IOException("Disconnected.");
                bytes.Add((byte)value); tail = (tail << 8) | value;
                if (tail == 0x0d0a0d0a) return Encoding.ASCII.GetString(bytes.ToArray());
            }
            throw new IOException("Header too long.");
        }
        void Serve(TcpClient client)
        {
            client.ReceiveTimeout = 3000; client.SendTimeout = 5000;
            NetworkStream stream = client.GetStream();
            string[] lines = ReadHeader(stream).Split(new string[] { "\r\n" }, StringSplitOptions.None);
            string[] request = lines[0].Split(' ');
            if (request.Length != 3) { Reply(stream, 400, "Bad Request", "text/plain", Encoding.UTF8.GetBytes("Bad request."), false); return; }
            Dictionary<string, string> headers = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            for (int n = 1; n < lines.Length; n++)
            {
                int colon = lines[n].IndexOf(':');
                if (colon > 0) headers[lines[n].Substring(0, colon)] = lines[n].Substring(colon + 1).Trim();
            }
            string host;
            if (!headers.TryGetValue("Host", out host) || "http://" + host != origin)
            { Reply(stream, 403, "Forbidden", "text/plain", Encoding.UTF8.GetBytes("Local access only."), false); return; }
            string target = request[1];
            if (!target.StartsWith("/", StringComparison.Ordinal) || target.StartsWith("//", StringComparison.Ordinal))
            { Reply(stream, 400, "Bad Request", "text/plain", Encoding.UTF8.GetBytes("Bad path."), false); return; }
            int question = target.IndexOf('?');
            string rawPath = question >= 0 ? target.Substring(0, question) : target;
            string path = Uri.UnescapeDataString(rawPath);
            string query = question >= 0 ? target.Substring(question + 1) : "";
            bool initial = path == ToolPath + "index.html" && query == "jima_sync=" + token;
            string cookie;
            bool authenticated = initial;
            if (headers.TryGetValue("Cookie", out cookie))
                foreach (string part in cookie.Split(';')) if (part.Trim() == cookieName + "=" + token) authenticated = true;
            if (!authenticated)
            { Reply(stream, 403, "Forbidden", "text/plain", Encoding.UTF8.GetBytes("Please use the sync launcher."), false); return; }
            if (request[0] == "POST" && path == "/__jima_sync/bind")
            {
                string refererOrigin, action;
                if (!headers.TryGetValue("Origin", out refererOrigin) || refererOrigin != origin ||
                    !headers.TryGetValue("X-Jima-Action", out action) || action != "bind")
                { Reply(stream, 403, "Forbidden", "text/plain", Encoding.UTF8.GetBytes("Invalid origin."), false); return; }
                BeginBind();
                Reply(stream, 200, "OK", "application/json; charset=utf-8", Encoding.UTF8.GetBytes("{\"ok\":true}"), false);
                return;
            }
            if (request[0] != "GET")
            { Reply(stream, 405, "Method Not Allowed", "text/plain", Encoding.UTF8.GetBytes("GET only."), false); return; }
            if (path == "/__jima_sync/state.json")
            {
                Reply(stream, 200, "OK", "application/json; charset=utf-8", Encoding.UTF8.GetBytes(Json().Serialize(Snapshot())), false);
                return;
            }
            string fullPath = ResolveFile(path);
            if (fullPath == null || !File.Exists(fullPath))
            { Reply(stream, 404, "Not Found", "text/plain", Encoding.UTF8.GetBytes("File not found."), false); return; }
            string type = path.EndsWith(".html", StringComparison.OrdinalIgnoreCase) ? "text/html; charset=utf-8"
                : path.EndsWith(".js", StringComparison.OrdinalIgnoreCase) ? "text/javascript; charset=utf-8" : "image/png";
            using (FileStream file = File.Open(fullPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete))
            {
                WriteHead(stream, 200, "OK", type, file.Length, initial);
                file.CopyTo(stream);
            }
        }
        string ResolveFile(string path)
        {
            bool allowed = path == ToolPath + "index.html" || path == ToolPath + "preview-core.js" ||
                path == ToolPath + "preview-app.js" || path == "/js/plugins.js" ||
                (path.StartsWith("/img/pictures/", StringComparison.Ordinal) && path.EndsWith(".png", StringComparison.OrdinalIgnoreCase));
            if (!allowed || path.IndexOf('\\') >= 0 || path.IndexOf(':') >= 0 || path.IndexOf('\0') >= 0) return null;
            foreach (string segment in path.Split('/')) if (segment == "." || segment == "..") return null;
            string result = Path.GetFullPath(Path.Combine(root, path.TrimStart('/').Replace('/', Path.DirectorySeparatorChar)));
            return result.StartsWith(root + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase) ? result : null;
        }
        void Reply(NetworkStream stream, int code, string message, string type, byte[] body, bool setCookie)
        {
            WriteHead(stream, code, message, type, body.Length, setCookie); stream.Write(body, 0, body.Length);
        }
        void WriteHead(NetworkStream stream, int code, string message, string type, long length, bool setCookie)
        {
            string header = "HTTP/1.1 " + code + " " + message + "\r\nContent-Type: " + type +
                "\r\nContent-Length: " + length.ToString(CultureInfo.InvariantCulture) +
                "\r\nCache-Control: no-store\r\nConnection: close\r\nX-Content-Type-Options: nosniff" +
                "\r\nX-Frame-Options: DENY\r\nReferrer-Policy: no-referrer\r\n";
            if (setCookie) header += "Set-Cookie: " + cookieName + "=" + token + "; Path=/; HttpOnly; SameSite=Strict\r\n";
            byte[] bytes = Encoding.ASCII.GetBytes(header + "\r\n"); stream.Write(bytes, 0, bytes.Length);
        }
    }
}
