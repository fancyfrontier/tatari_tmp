/* JIMA Standing Picture Preview v0.4.0 — saved registered styles and filename IDs. */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JimaPreviewCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function object(value) {
    if (typeof value === 'string') value = JSON.parse(value);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('資料格式不正確');
    return value;
  }
  function parsePlugins(text) {
    var match = /\b(?:var|let|const)\s+\$plugins\s*=\s*(\[[\s\S]*\])\s*;?\s*$/.exec(text);
    if (!match) throw new Error('js/plugins.js 格式不正確，請回 MZ 儲存專案後重試。');
    var plugins = JSON.parse(match[1]);
    if (!Array.isArray(plugins)) throw new Error('插件設定必須是清單。');
    return plugins;
  }
  function normalizeImageName(value) {
    var name = String(value == null ? '' : value);
    if (name.indexOf('jima-image:') === 0) name = decodeURIComponent(name.slice(11));
    name = name.replace(/\\/g, '/');
    if (!name) return '';
    if (name.indexOf('img/pictures/') === 0) name = name.slice(13);
    if (/[\u0000-\u001f\u007f:]/.test(name) || name[0] === '/'
      || name.split('/').some(function(part) { return !part || part === '.' || part === '..'; })) {
      throw new Error('立繪圖片名稱無效，請回 MZ 從 jima_tool 重新選圖。');
    }
    return name.indexOf('jima_tool/') === 0 ? name : 'jima_tool/' + name;
  }
  function readProject(plugins) {
    if (!Array.isArray(plugins)) throw new Error('無法讀取 js/plugins.js，請確認工具已解壓至遊戲專案根目錄。');
    var plugin = plugins.find(function (entry) { return entry && (entry.name === 'Jima_StandingPicture' || entry.name === 'LL_StandingPicture'); });
    if (!plugin) throw new Error('專案尚未登錄 Jima_StandingPicture，請先在 MZ 插件管理器加入插件並儲存。');
    var params = object(plugin.parameters || {});
    var rows = typeof params.sPictures === 'string' ? JSON.parse(params.sPictures || '[]') : params.sPictures || [];
    if (!Array.isArray(rows)) throw new Error('立繪登錄清單格式不正確，請回 MZ 確認並儲存設定。');
    var seen = new Set(), pictures = [], warnings = [];
    rows.forEach(function (raw, index) {
      try {
        if (raw == null || raw === '') return;
        var row = object(raw), imageName = normalizeImageName(row.imageName);
        if (!imageName) return;
        var id = imageName.split('/').pop();
        if (seen.has(id)) throw new Error('重複 ID「' + id + '」，依插件行為採用第一筆');
        seen.add(id);
        var safeName = null, problem = '';
        try { safeName = imagePath(imageName); } catch (error) { problem = error.message; }
        pictures.push({id: id, imageName: imageName, imagePath: safeName, problem: problem});
      } catch (error) { warnings.push('清單第 ' + (index + 1) + ' 筆：' + error.message); }
    });
    return {pictures: pictures, warnings: warnings, enabled: plugin.status !== false};
  }
  function resolveHoverId(pictures, value) {
    var id = String(value == null ? '' : value);
    if (id.indexOf('jima-id:') === 0) {
      try { id = decodeURIComponent(id.slice(8)); } catch (_) { return null; }
    }
    return pictures.find(function(picture) { return picture.id === id; }) || null;
  }
  function imagePath(name) {
    if (typeof name !== 'string' || !name || /[\u0000-\u001f\\:]/.test(name) || name[0] === '/') {
      throw new Error('立繪圖片欄位為空或路徑不正確，請回 MZ 選取圖片。');
    }
    var parts = name.split('/');
    if (parts.some(function (part) { return !part || part === '.' || part === '..'; })) {
      throw new Error('圖片路徑必須位於專案的 img/pictures 資料夾內。');
    }
    // ImageManager.loadPicture appends .png; keep exactly the game's lookup rule.
    return 'img/pictures/' + parts.map(encodeURIComponent).join('/') + '.png';
  }
  function clamp(value, min, max, fallback) {
    value = Number(value);
    if (!Number.isFinite(value)) value = fallback;
    return Math.min(max, Math.max(min, value));
  }
  function normalizeView(value) {
    value = value && typeof value === 'object' ? value : {};
    var extent = Math.round(clamp(value.extent, 35, 100, 58));
    return {mode: value.mode === 'full' ? 'full' : 'upper',
      extent: extent, top: Math.round(clamp(value.top, 0, 100 - extent, 0))};
  }
  function geometry(width, height, view) {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      throw new Error('圖片尺寸不正確。');
    }
    view = normalizeView(view);
    var cropHeight = view.mode === 'full' ? height : Math.max(1, Math.round(height * view.extent / 100));
    var top = view.mode === 'full' ? 0 : Math.min(height - cropHeight, Math.round(height * view.top / 100));
    var scale = Math.min(1, 816 / width, 624 / cropHeight);
    return {sx: 0, sy: top, sw: width, sh: cropHeight,
      width: Math.max(1, Math.floor(width * scale)),
      height: Math.max(1, Math.floor(cropHeight * scale))};
  }
  function filter(pictures, query) {
    query = String(query || '').trim().toLocaleLowerCase();
    return pictures.filter(function (picture) {
      return (picture.id + '\n' + picture.imageName).toLocaleLowerCase().includes(query);
    });
  }
  function cacheKey(picture, view) {
    return JSON.stringify([picture.id, picture.imageName, normalizeView(view)]);
  }
  function LruCache(maxBytes) {
    this.maxBytes = maxBytes || 16 * 1024 * 1024;
    this.bytes = 0;
    this.entries = new Map();
  }
  LruCache.prototype.get = function (key) {
    var entry = this.entries.get(key);
    if (!entry) return null;
    this.entries.delete(key); this.entries.set(key, entry);
    return entry.value;
  };
  LruCache.prototype.set = function (key, value, bytes) {
    var prior = this.entries.get(key);
    if (prior) { this.bytes -= prior.bytes; this.entries.delete(key); }
    if (bytes > this.maxBytes) return;
    this.entries.set(key, {value: value, bytes: bytes}); this.bytes += bytes;
    while (this.bytes > this.maxBytes) {
      var oldest = this.entries.keys().next().value;
      this.bytes -= this.entries.get(oldest).bytes; this.entries.delete(oldest);
    }
  };
  LruCache.prototype.clear = function () { this.entries.clear(); this.bytes = 0; };
  return {parsePlugins: parsePlugins, normalizeImageName: normalizeImageName,
    readProject: readProject, resolveHoverId: resolveHoverId, imagePath: imagePath, normalizeView: normalizeView,
    geometry: geometry, filter: filter, cacheKey: cacheKey, LruCache: LruCache};
});
