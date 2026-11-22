/* JIMA registered-list sync v1.7.1 (legacy and compact command menus). Project settings and image files are read-only. */
(function(root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.JimaRegisteredSync = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createRegisteredSyncCore() {
  "use strict";
  var pluginPath = ["js", "plugins", "Jima_StandingPicture.js"];
  var configPath = ["js", "plugins.js"];
  var backupPath = ["js", "plugins", "Jima_StandingPicture.js.jima-registered-sync.bak"];
  function parsePlugins(source) {
    var match = /\b(?:var|let|const)\s+\$plugins\s*=\s*(\[[\s\S]*\])\s*;?\s*$/.exec(source);
    if (!match) throw new Error("js/plugins.js 格式無法辨識，未更新選項。");
    var plugins = JSON.parse(match[1]);
    if (!Array.isArray(plugins)) throw new Error("插件設定必須是清單。");
    return plugins;
  }
  function normalizeImageName(value) {
    var name = String(value == null ? "" : value);
    if (name.indexOf("jima-image:") === 0) name = decodeURIComponent(name.slice(11));
    name = name.replace(/\\/g, "/");
    if (!name) return "";
    if (name.indexOf("img/pictures/") === 0) name = name.slice(13);
    if (/[\u0000-\u001f\u007f:]/.test(name) || name[0] === "/"
        || name.split("/").some(function(part) { return !part || part === "." || part === ".."; })) {
      throw new Error("立繪圖片名稱無效，請從 jima_tool 重新選圖。");
    }
    return name.indexOf("jima_tool/") === 0 ? name : "jima_tool/" + name;
  }
  function entries(parameters) {
    var rows = parameters && parameters.sPictures;
    if (rows == null || rows === "") rows = [];
    if (typeof rows === "string") rows = JSON.parse(rows);
    if (!Array.isArray(rows)) throw new Error("立繪個別樣式格式有誤，未更新選項。");
    var seen = new Set(), result = [];
    rows.forEach(function(row) {
      if (row == null || row === "") return;
      if (typeof row === "string") row = JSON.parse(row);
      if (row == null || row === "") return;
      if (typeof row !== "object" || Array.isArray(row)) throw new Error("立繪個別樣式包含無效項目。");
      var imageName = normalizeImageName(row.imageName);
      if (!imageName) return;
      var id = imageName.split("/").pop();
      if (seen.has(id)) throw new Error("立繪檔名「" + id + "」重複登錄；每個檔名只保留一筆樣式後再儲存。");
      seen.add(id);
      result.push({id: id, imageName: imageName});
    });
    return result;
  }
  function registered(plugins) {
    var matches = plugins.filter(function(item) { return item && (item.name === "Jima_StandingPicture" || item.name === "LL_StandingPicture"); });
    if (matches.length !== 1) throw new Error("請選擇已加入 Jima_StandingPicture 的專案根目錄，並先儲存專案。");
    return entries(matches[0].parameters);
  }
  function patchPlugin(source, list) {
    var newline = source.indexOf("\r\n") >= 0 ? "\r\n" : "\n";
    var lines = [" * @jimaPictureOptionsBegin",
      " * @option （維持此位置目前圖片；首次請選立繪）", " * @value jima-keep-current"];
    list.forEach(function(item) {
      var label = item.id.replace(/\*\//g, "*／");
      lines.push(" * @option " + label, " * @value jima-id:" + encodeURIComponent(item.id));
    });
    lines.push(" * @jimaPictureOptionsEnd");
    var count = 0;
    var updated = source.replace(/^ \* @jimaPictureOptionsBegin\r?\n[\s\S]*?^ \* @jimaPictureOptionsEnd(?=\r?$)/gm, function() {
      count++;
      return lines.join(newline);
    });
    if (count !== 2 && count !== 4) throw new Error("插件選項標記不完整，請先覆蓋完整的 Jima 插件；未改寫原檔。");
    return updated;
  }
  async function handle(root, parts, create) {
    var current = root;
    for (var i = 0; i < parts.length - 1; i++) current = await current.getDirectoryHandle(parts[i]);
    return current.getFileHandle(parts[parts.length - 1], {create: !!create});
  }
  async function read(file) { return (await file.getFile()).text(); }
  async function write(file, content, guard) {
    var stream = await file.createWritable();
    try {
      await stream.write(content);
      if (guard) await guard();
      await stream.close();
    } catch (error) {
      try { await stream.abort(); } catch (_) {}
      throw error;
    }
  }
  async function syncProject(root) {
    var configFile = await handle(root, configPath);
    var config = await read(configFile);
    var list = registered(parsePlugins(config));
    var file = await handle(root, pluginPath), before = await read(file);
    var after = patchPlugin(before, list);
    async function guard() {
      if (await read(configFile) !== config || await read(file) !== before) {
        throw new Error("專案檔案正在儲存，稍後會自動重試。");
      }
    }
    await guard();
    var changed = before !== after;
    if (changed) {
      var backup = null;
      try { backup = await handle(root, backupPath); }
      catch (error) { if (error.name !== "NotFoundError") throw error; }
      if (!backup) {
        await guard();
        await write(await handle(root, backupPath, true), before);
      }
      await guard();
      await write(file, after, guard);
    }
    return {changed: changed, count: list.length, ids: list.map(function(item) { return item.id; })};
  }
  return {parsePlugins: parsePlugins, normalizeImageName: normalizeImageName,
    entries: entries, registered: registered, patchPlugin: patchPlugin, syncProject: syncProject};
});
