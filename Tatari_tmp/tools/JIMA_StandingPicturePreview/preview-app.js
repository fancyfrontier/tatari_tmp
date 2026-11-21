/* JIMA Standing Picture Preview v0.4.0 — registered filename IDs and native hover. */
(function () {
  'use strict';
  var C = window.JimaPreviewCore;
  var sourceDocument = document, baseUrl = document.baseURI;
  var app = document.getElementById('app'), list = document.getElementById('pictureList');
  var stage = document.getElementById('stage'), empty = document.getElementById('emptyPreview');
  var search = document.getElementById('search'), output = document.getElementById('idOutput');
  var notice = document.getElementById('notice'), count = document.getElementById('count');
  var heading = document.getElementById('selectedId'), meta = document.getElementById('imageMeta');
  var copyButton = document.getElementById('copy'), status = document.getElementById('copyStatus');
  var floatButton = document.getElementById('float'), refreshButton = document.getElementById('refresh');
  var extent = document.getElementById('extent'), cropTop = document.getElementById('cropTop');
  var upper = document.getElementById('upper'), full = document.getElementById('full');
  var cache = new C.LruCache(), pictures = [], visible = [], selected = null, canvas = null;
  var request = 0, loadRevision = 0, pendingTimer = null, activeImage = null, pipWindow = null;
  var storageKey = 'jima-standing-picture-preview-v1:' + new URL('../../', baseUrl).href;
  var preferences = loadPreferences(), currentView = C.normalizeView();
  var syncBar = document.getElementById('syncBar'), syncStatus = document.getElementById('syncStatus');
  var syncBind = document.getElementById('syncBind'), syncFollow = document.getElementById('syncFollow');
  var syncDetails = document.getElementById('syncDetails');
  var launchUrl = new URL(baseUrl);
  var syncMode = launchUrl.protocol === 'http:' && launchUrl.hostname === '127.0.0.1'
    && launchUrl.searchParams.has('jima_sync');
  var following = true, lastSequence = -1, latestSync = null, syncStopped = false;
  var projectBusy = false, projectAgain = false, projectTimer = null, registrySignature = '';
  function loadPreferences() {
    try {
      var saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    } catch (_) { return {}; }
  }
  function savePreferences() {
    try { localStorage.setItem(storageKey, JSON.stringify(preferences)); } catch (_) {}
  }
  function viewKey(picture) { return picture.id + '\n' + picture.imageName; }
  function showNotice(message) { notice.hidden = !message; notice.textContent = message || ''; }
  function clearCanvas(message) {
    if (canvas) { canvas.remove(); canvas = null; }
    empty.hidden = false; empty.textContent = message;
    if (!empty.parentNode) stage.appendChild(empty);
  }
  function cancelPreview() {
    request++;
    if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; }
    if (activeImage) { if (activeImage._jimaUrl) URL.revokeObjectURL(activeImage._jimaUrl); activeImage.onload = activeImage.onerror = null; activeImage.src = ''; activeImage = null; }
  }
  function fitCanvas() {
    if (!canvas) return;
    var width = Math.max(1, stage.clientWidth - 28), height = Math.max(1, stage.clientHeight - 28);
    var scale = Math.min(1, width / canvas.width, height / canvas.height);
    canvas.style.width = Math.max(1, Math.floor(canvas.width * scale)) + 'px';
    canvas.style.height = Math.max(1, Math.floor(canvas.height * scale)) + 'px';
  }
  // UI nodes move into the floating document; keep references rather than looking them up there.
  var extentValue = document.getElementById('extentValue'), topValue = document.getElementById('topValue');
  function controls() {
    upper.setAttribute('aria-pressed', String(currentView.mode === 'upper'));
    full.setAttribute('aria-pressed', String(currentView.mode === 'full'));
    extent.value = String(currentView.extent); cropTop.max = String(100 - currentView.extent);
    cropTop.value = String(currentView.top); extentValue.textContent = currentView.extent + '%';
    topValue.textContent = currentView.top + '%';
    extent.disabled = cropTop.disabled = currentView.mode === 'full' || !selected;
  }
  function markSelection() {
    Array.from(list.querySelectorAll('.pictureRow')).forEach(function (row) {
      row.setAttribute('aria-selected', String(selected && row.dataset.id === selected.id));
    });
  }
  function displayThumbnail(entry, picture, token) {
    if (token !== request || !selected || picture.id !== selected.id) return;
    if (canvas) canvas.remove();
    canvas = entry.canvas; empty.hidden = true; stage.appendChild(canvas); fitCanvas();
    meta.textContent = picture.imageName + '.png　｜　原圖 ' + entry.originalWidth + '×' + entry.originalHeight
      + ' → 預覽 ' + canvas.width + '×' + canvas.height;
  }
  function startPreview(picture, immediate) {
    cancelPreview(); var token = request;
    var key = C.cacheKey(picture, currentView), cached = cache.get(key);
    if (cached) { displayThumbnail(cached, picture, token); return; }
    clearCanvas('正在載入圖片…'); meta.textContent = picture.imageName || '尚未選取圖片';
    if (picture.problem) { clearCanvas(picture.problem); return; }
    var settings = C.normalizeView(currentView);
    pendingTimer = setTimeout(async function () {
      var image = new Image(); activeImage = image; image.decoding = 'async';
      image.onload = function () {
        if (token !== request) return;
        try {
          var geometry = C.geometry(image.naturalWidth, image.naturalHeight, settings);
          var thumbnail = sourceDocument.createElement('canvas');
          thumbnail.width = geometry.width; thumbnail.height = geometry.height;
          thumbnail.setAttribute('aria-label', picture.id + ' 的立繪預覽');
          var context = thumbnail.getContext('2d');
          context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
          context.drawImage(image, geometry.sx, geometry.sy, geometry.sw, geometry.sh, 0, 0, geometry.width, geometry.height);
          var entry = {canvas: thumbnail, originalWidth: image.naturalWidth, originalHeight: image.naturalHeight};
          cache.set(key, entry, geometry.width * geometry.height * 4);
          displayThumbnail(entry, picture, token);
        } catch (error) { if (token === request) clearCanvas('無法建立預覽：' + error.message); }
        finally {
          if (activeImage === image) activeImage = null;
          image.onload = image.onerror = null; if (image._jimaUrl) URL.revokeObjectURL(image._jimaUrl); image.src = '';
        }
      };
      image.onerror = function () {
        if (token === request) clearCanvas('找不到或無法讀取圖片：\n' + picture.imageName + '.png\n\n請確認原圖位於專案的 img/pictures 資料夾，並先在 MZ 儲存登錄清單。');
        if (activeImage === image) activeImage = null;
        image.onload = image.onerror = null; if (image._jimaUrl) URL.revokeObjectURL(image._jimaUrl);
      };
      var imageUrl = new URL('../../' + picture.imagePath, baseUrl);
      imageUrl.searchParams.set('jima_preview', String(loadRevision));
      image.src = imageUrl.href;
    }, immediate ? 0 : 90);
  }
  function selectPicture(picture, immediate) {
    if (!picture) return;
    var changed = !selected || selected.id !== picture.id || selected.imageName !== picture.imageName;
    selected = picture; output.value = picture.id; copyButton.disabled = false; heading.textContent = picture.id;
    if (changed) {
      currentView = C.normalizeView(preferences[viewKey(picture)]);
      status.textContent = ''; controls(); markSelection(); startPreview(picture, immediate);
    }
  }
  function renderList() {
    visible = C.filter(pictures, search.value);
    list.replaceChildren();
    var fragment = sourceDocument.createDocumentFragment();
    visible.forEach(function (picture) {
      var row = sourceDocument.createElement('button'); row.className = 'pictureRow';
      row.type = 'button'; row.setAttribute('role', 'option'); row.dataset.id = picture.id;
      row.setAttribute('aria-selected', String(selected && picture.id === selected.id));
      row.title = picture.id + '\n' + (picture.imageName || '未選圖片');
      var id = sourceDocument.createElement('strong'); id.textContent = picture.id;
      var filename = sourceDocument.createElement('small'); filename.textContent = picture.imageName || '尚未選取圖片';
      row.append(id, filename); fragment.appendChild(row);
    });
    if (!visible.length) {
      var message = sourceDocument.createElement('div'); message.className = 'emptyList';
      message.textContent = pictures.length ? '找不到符合的立繪。' : '請在 MZ 的「立繪個別樣式」登錄圖片，並儲存專案。';
      fragment.appendChild(message);
    }
    list.appendChild(fragment);
    count.textContent = '顯示 ' + visible.length + '／' + pictures.length + ' 個立繪 ID';
  }
  function pictureForRow(row) { return row && visible.find(function (picture) { return picture.id === row.dataset.id; }); }
  list.addEventListener('pointerover', function (event) {
    var row = event.target.closest('.pictureRow');
    if (row && list.contains(row)) selectPicture(pictureForRow(row), false);
  });
  list.addEventListener('focusin', function (event) {
    var row = event.target.closest('.pictureRow'); if (row) selectPicture(pictureForRow(row), true);
  });
  list.addEventListener('click', function (event) {
    var row = event.target.closest('.pictureRow');
    if (row && list.contains(row)) { selectPicture(pictureForRow(row), true); copyId(); }
  });
  list.addEventListener('keydown', function (event) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    var index = selected ? visible.findIndex(function (picture) { return picture.id === selected.id; }) : -1;
    index = Math.min(visible.length - 1, Math.max(0, index + (event.key === 'ArrowDown' ? 1 : -1)));
    var rows = list.querySelectorAll('.pictureRow');
    if (rows[index]) { rows[index].focus(); rows[index].scrollIntoView({block: 'nearest'}); }
  });
  search.addEventListener('input', renderList);
  search.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowDown') { var first = list.querySelector('.pictureRow'); if (first) { event.preventDefault(); first.focus(); } }
  });
  async function copyId() {
    if (!selected) return;
    var id = selected.id, activeDocument = app.ownerDocument, activeWindow = activeDocument.defaultView;
    var copied = false;
    try {
      if (activeWindow.navigator.clipboard && activeWindow.navigator.clipboard.writeText) {
        await activeWindow.navigator.clipboard.writeText(id); copied = true;
      }
    } catch (_) {}
    if (!copied) {
      var temporary;
      try {
        temporary = activeDocument.createElement('textarea'); temporary.value = id;
        temporary.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0';
        app.appendChild(temporary); temporary.focus(); temporary.select();
        copied = activeDocument.execCommand('copy');
      } catch (_) {}
      finally { if (temporary) temporary.remove(); }
    }
    if (copied) status.textContent = '已複製 ' + id + '。回 MZ「立繪 ID → 文字」貼上即可。';
    else {
      output.value = id; output.focus(); output.select();
      status.textContent = '請按 Ctrl+C 複製 ' + id + '，再回 MZ 的「文字」分頁貼上。';
    }
  }
  copyButton.addEventListener('click', copyId);
  output.addEventListener('click', function () { output.select(); });
  function updateView(change) {
    currentView = C.normalizeView(Object.assign({}, currentView, change)); controls();
    if (selected) { preferences[viewKey(selected)] = currentView; savePreferences(); startPreview(selected, true); }
  }
  upper.addEventListener('click', function () { updateView({mode: 'upper'}); });
  full.addEventListener('click', function () { updateView({mode: 'full'}); });
  extent.addEventListener('input', function () { updateView({extent: Number(extent.value)}); });
  cropTop.addEventListener('input', function () { updateView({top: Number(cropTop.value)}); });
  document.getElementById('background').addEventListener('change', function (event) { stage.dataset.background = event.target.value; });
  function restoreApp() {
    sourceDocument.body.insertBefore(app, sourceDocument.getElementById('floatingNotice'));
    sourceDocument.body.dataset.floating = 'false'; pipWindow = null;
    floatButton.textContent = '浮動置頂'; setTimeout(fitCanvas, 0);
  }
  async function toggleFloat() {
    if (pipWindow && !pipWindow.closed) { pipWindow.close(); return; }
    if (!window.documentPictureInPicture) { showNotice('目前瀏覽器不支援浮動置頂，請改用支援此功能的 Edge 或 Chrome；一般預覽仍可使用。'); return; }
    try {
      var available = window.screen;
      var floating = await window.documentPictureInPicture.requestWindow({
        width: Math.min(960, Math.max(420, Math.floor(available.availWidth * 0.75))),
        height: Math.min(720, Math.max(400, Math.floor(available.availHeight * 0.8)))
      });
      pipWindow = floating; floating.document.title = 'JIMA 立繪預覽';
      var style = floating.document.createElement('style');
      style.textContent = sourceDocument.getElementById('appStyles').textContent;
      floating.document.head.appendChild(style); floating.document.documentElement.lang = 'zh-Hant';
      floating.document.body.appendChild(app); sourceDocument.body.dataset.floating = 'true';
      floatButton.textContent = '返回一般視窗';
      floating.addEventListener('pagehide', restoreApp, {once: true});
      floating.addEventListener('resize', fitCanvas); setTimeout(fitCanvas, 0);
    } catch (error) {
      if (pipWindow && !pipWindow.closed) pipWindow.close();
      showNotice('無法開啟浮動置頂：' + error.message + '\n可先使用目前視窗預覽。');
    }
  }
  floatButton.addEventListener('click', toggleFloat);
  document.getElementById('return').addEventListener('click', function () { if (pipWindow && !pipWindow.closed) pipWindow.close(); });
  if (!window.documentPictureInPicture) floatButton.title = '目前瀏覽器不支援浮動置頂，請使用支援此功能的 Edge 或 Chrome。';
  if (window.ResizeObserver) new ResizeObserver(fitCanvas).observe(stage);
  window.addEventListener('resize', fitCanvas);
  function useProject(project) {
    registrySignature = JSON.stringify(project);
    pictures = project.pictures; cache.clear();
    var warnings = project.warnings.slice();
    if (!project.enabled) warnings.unshift('Jima_StandingPicture 目前在專案中關閉；仍可預覽已登錄圖片。');
    showNotice(warnings.join('\n')); renderList();
    var previous = selected && pictures.find(function (picture) { return picture.id === selected.id; });
    selected = null;
    if (previous || pictures[0]) selectPicture(previous || pictures[0], true);
    else {
      cancelPreview(); copyButton.disabled = true; output.value = ''; heading.textContent = '尚未登錄立繪';
      meta.textContent = '請在 MZ 的「立繪個別樣式」登錄圖片，逐層按確定後儲存專案。';
      clearCanvas('目前已儲存的登錄清單沒有立繪。'); controls();
    }
    if (syncMode && latestSync) { lastSequence = -1; applySync(latestSync); }
  }
  function projectFailure(error) {
    loadRevision++; registrySignature = '';
    pictures = []; selected = null; cancelPreview(); cache.clear(); renderList();
    copyButton.disabled = true; output.value = '';
    heading.textContent = '無法讀取專案'; meta.textContent = '請確認解壓位置，並在 MZ 儲存專案。';
    showNotice(error.message);
    clearCanvas('請將 tools 資料夾放在專案根目錄，與 js、img 資料夾同層。');
  }
  function fileProject() {
    return new Promise(function(resolve, reject) {
      var script = sourceDocument.createElement('script');
      var url = new URL('../../js/plugins.js', baseUrl);
      url.searchParams.set('jima_preview', String(Date.now()));
      window.$plugins = undefined;
      script.onload = function() {
        script.remove();
        try { resolve(C.readProject(window.$plugins)); } catch (error) { reject(error); }
      };
      script.onerror = function() {
        script.remove();
        reject(new Error('讀不到 js/plugins.js，請使用專案根目錄的預覽啟動器開啟。'));
      };
      script.src = url.href;
      sourceDocument.head.appendChild(script);
    });
  }
  async function refreshProject(force) {
    if (projectBusy) { if (force) projectAgain = true; return; }
    projectBusy = true;
    refreshButton.disabled = true; refreshButton.textContent = '讀取中…';
    var controller = new AbortController(), timeout = null;
    try {
      var project;
      if (syncMode) {
        timeout = setTimeout(function() { controller.abort(); }, 3000);
        var url = new URL('../../js/plugins.js', baseUrl);
        url.searchParams.set('jima_preview', String(Date.now()));
        var response = await window.fetch(url.href, {cache:'no-store', credentials:'same-origin', signal:controller.signal});
        if (!response.ok) throw new Error('無法讀取已儲存清單：HTTP ' + response.status);
        project = C.readProject(C.parsePlugins(await response.text()));
      } else project = await fileProject();
      if (!syncStopped && (force || JSON.stringify(project) !== registrySignature)) {
        loadRevision++; useProject(project);
      }
    } catch (error) {
      if (!syncStopped) projectFailure(error);
    } finally {
      clearTimeout(timeout);
      projectBusy = false; refreshButton.disabled = false; refreshButton.textContent = '重新整理';
      if (projectAgain && !syncStopped) { projectAgain = false; refreshProject(true); }
    }
  }
  refreshButton.addEventListener('click', function() { refreshProject(true); });
  async function watchProject() {
    if (syncStopped) return;
    await refreshProject(false);
    if (!syncStopped) projectTimer = setTimeout(watchProject, 1200);
  }
  function applySync(state) {
    if (!following || state.configError || !state.pid || !state.hovering || state.sequence === lastSequence) return;
    var picture = C.resolveHoverId(pictures, state.id);
    if (!picture) {
      syncStatus.textContent = 'MZ 指到 ' + state.id + '，但預覽清單還沒有這個 ID。請先儲存 MZ，再按「重新整理」。';
      return;
    }
    lastSequence = state.sequence;
    selectPicture(picture, true);
  }
  function renderSync(state) {
    latestSync = state;
    syncBind.disabled = state.countdown > 0;
    syncBind.textContent = state.countdown > 0 ? '綁定倒數 ' + state.countdown + ' 秒' : '綁定 MZ（8 秒）';
    syncStatus.textContent = state.configError ? '無法讀取登錄清單：' + state.configError
      : !following ? '已暫停跟隨。可手動選擇左側 ID 預覽。' : state.hint;
    syncDetails.textContent = state.pid
      ? '綁定：' + state.process + '（' + state.pid + '）　｜　已登錄 ' + state.registered + ' 張立繪'
        + (state.source ? '　｜　' + state.source : '')
        + (state.observed ? '　｜　偵測：' + state.observed : '')
        + (state.probeAge > 4 ? '　｜　讀取回應較慢，請先把滑鼠移到選單項目。' : '')
      : '倒數結束時，滑鼠必須停在 MZ 視窗內。此功能正在測試 Windows 對 MZ 選單的支援。';
    applySync(state);
  }
  async function pollSync() {
    if (syncStopped) return;
    var controller = new AbortController(), timeout = setTimeout(function () { controller.abort(); }, 3000);
    try {
      var response = await window.fetch(new URL('/__jima_sync/state.json', baseUrl).href, {
        cache: 'no-store', credentials: 'same-origin', signal: controller.signal
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      renderSync(await response.json());
    } catch (_) {
      syncStatus.textContent = '同步連線中斷。請確認同步程式的黑色視窗仍開著；若已關閉，請重新執行 Sync.cmd。';
      syncDetails.textContent = '手動預覽可開啟 tools/JIMA_StandingPicturePreview/index.html。';
      syncBind.disabled = false;
    } finally {
      clearTimeout(timeout);
      if (!syncStopped) setTimeout(pollSync, 250);
    }
  }
  syncBind.addEventListener('click', async function () {
    syncBind.disabled = true;
    try {
      var response = await window.fetch(new URL('/__jima_sync/bind', baseUrl).href, {
        method: 'POST', credentials: 'same-origin', headers: {'X-Jima-Action': 'bind'}
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      following = true; syncFollow.textContent = '跟隨：開'; syncFollow.setAttribute('aria-pressed', 'true');
      lastSequence = -1;
      syncStatus.textContent = '請在 8 秒內切回 MZ，打開立繪 ID 選單，並將滑鼠留在其中一個 ID 上。';
    } catch (_) {
      syncStatus.textContent = '無法開始綁定。請重新執行 JIMA_StandingPicturePreview_Sync.cmd。';
      syncBind.disabled = false;
    }
  });
  syncFollow.addEventListener('click', function () {
    following = !following; syncFollow.textContent = following ? '跟隨：開' : '跟隨：關';
    syncFollow.setAttribute('aria-pressed', String(following));
    if (following) lastSequence = -1;
    if (latestSync) renderSync(latestSync);
  });
  if (syncMode) {
    syncBar.hidden = false; pollSync();
    window.addEventListener('pagehide', function () { syncStopped = true; clearTimeout(projectTimer); cancelPreview(); });
  }
  controls();
  if (syncMode) watchProject();
  else refreshProject(true);
})();
