(function() {
  "use strict";
  var choose = document.getElementById("choose"), toggle = document.getElementById("toggle");
  var sync = document.getElementById("sync"), status = document.getElementById("status");
  var detail = document.getElementById("detail"), ids = document.getElementById("ids");
  var root = null, active = false, busy = false, timer = null, lastIds = "";
  function show(message, info, error) {
    status.textContent = message;
    status.className = error ? "error" : "";
    detail.textContent = info;
  }
  function schedule() {
    clearTimeout(timer);
    if (active) timer = setTimeout(check, 1200);
  }
  function controls() {
    choose.disabled = busy;
    toggle.disabled = !root || busy;
    sync.disabled = !root || busy;
    toggle.textContent = active ? "停止同步" : "繼續同步";
  }
  async function check() {
    if (!root || busy) return;
    busy = true;
    controls();
    try {
      var result = await window.JimaRegisteredSync.syncProject(root);
      var signature = JSON.stringify(result.ids);
      if (signature !== lastIds) {
        ids.replaceChildren();
        result.ids.forEach(function(id) {
          var row = document.createElement("li");
          row.textContent = id;
          ids.appendChild(row);
        });
        lastIds = signature;
      }
      show((active ? "監看中" : "已停止自動同步") + "：" + root.name + "，已登錄 " + result.count + " 張立繪",
        result.changed ? "選項已更新。請回 MZ 重新整理插件，再重新開啟插件命令參數視窗。"
          : "清單已一致。修改後請儲存專案；MZ 若仍顯示舊選項，請重新整理插件或重新開啟專案。");
    } catch (error) {
      if (error.name === "NotAllowedError" || error.name === "SecurityError") active = false;
      show("尚未完成同步", error.message + (active ? "\n檔案穩定後會自動重試。" : "\n請重新選擇專案，允許讀寫。"), true);
    } finally {
      busy = false;
      controls();
      schedule();
    }
  }
  choose.addEventListener("click", async function() {
    if (!window.showDirectoryPicker) {
      show("此瀏覽器不支援資料夾存取", "請使用 Microsoft Edge 或 Google Chrome 開啟此頁。", true);
      return;
    }
    try {
      var selected = await window.showDirectoryPicker({id: "jima-registered-sync", mode: "readwrite"});
      clearTimeout(timer);
      root = selected;
      lastIds = "";
      ids.replaceChildren();
      active = true;
      await check();
    } catch (error) {
      if (error.name !== "AbortError") show("無法開啟專案", error.message, true);
    }
  });
  toggle.addEventListener("click", function() {
    active = !active;
    clearTimeout(timer);
    controls();
    if (active) check();
    else show("已停止自動同步", "現有選項保留；按「繼續同步」恢復儲存後的自動檢查。");
  });
  sync.addEventListener("click", check);
  window.addEventListener("beforeunload", function() { active = false; clearTimeout(timer); });
})();
