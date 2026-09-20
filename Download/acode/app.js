/* ============================================================
   SOURCE GETTER — APP.JS
   Modular JavaScript — semua logika di sini
   ============================================================ */

(function () {
  'use strict';

  // ============================================================
  // KONFIGURASI
  // ============================================================
  var CONFIG = {
    SUPABASE_URL: "https://woiuualtsfiynfonaygm.supabase.co",
    SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvaXV1YWx0c2ZpeW5mb25heWdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwOTIxMDMsImV4cCI6MjEwMDY2ODEwM30.LKWgixQSEAdxWjW-7oXNj27FAVS-_nJaKPVDLmWGBf4",
    MAX_LINES: 4000,
    DAILY_FREE: 40,
    ETA_SECONDS: 8,
    STEPS: [
      "Connecting to remote server",
      "Downloading HTML source",
      "Fetching linked stylesheets",
      "Fetching external JavaScript",
      "Extracting inline style blocks",
      "Extracting inline script blocks",
      "Verifying code integrity",
      "Finalizing capture"
    ]
  };
  CONFIG.FETCH_URL = CONFIG.SUPABASE_URL + "/functions/v1/fetch-source";

  // ============================================================
  // HELPERS
  // ============================================================
  function $(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function formatBytes(n) {
    if (n == null) return "—";
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    return (n / (1024 * 1024)).toFixed(2) + " MB";
  }

  function tagClass(kind) {
    if (kind === "html") return "tag-html";
    if (kind === "css" || kind === "inline-css") return "tag-css";
    return "tag-js";
  }

  function tagLabel(kind) {
    var map = {
      html: "HTML", css: "CSS", js: "JS",
      "inline-css": "INLINE CSS", "inline-js": "INLINE JS"
    };
    return map[kind] || String(kind).toUpperCase();
  }

  function isValidUrl(str) {
    if (!str || !str.trim()) return false;
    var s = str.trim();
    if (/\s/.test(s)) return false;
    if (s.indexOf(".") === -1) return false;
    return true;
  }

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  // ============================================================
  // STATE
  // ============================================================
  var state = {
    currentResult: null,
    activeFileId: null,
    previewBlobUrl: null,
    fileFilterQuery: "",
    codeZoom: 0,
    codeWrap: false,
    codeExpanded: false,
    abortController: null,
    genCancelled: false,
    urlDebounceTimer: null,
    previewMode: "rebuilt",
    genTimer: null,
    stepTimer: null,
    etaTimer: null,
    tokens: 0,
    history: []
  };

  // Load history dari localStorage
  try {
    state.history = JSON.parse(localStorage.getItem("sg_history") || "[]");
  } catch (e) {
    state.history = [];
  }

  // ============================================================
  // DOM REFERENCES (di-cache sekali)
  // ============================================================
  var dom = {};
  function cacheDom() {
    var ids = [
      "loader", "loaderFill", "loaderPct", "toasts",
      "tokenPill", "tokenCount", "resetInfo",
      "inputCard", "urlForm", "urlInput", "btnGenerate",
      "errorBox", "lockNotice",
      "genCard", "genUrl", "genEta", "genPct", "genBar", "genSteps", "btnCancel",
      "emptyState", "errState", "statsRow",
      "fileViewer", "fvTag", "fvName", "fvMeta", "fvCode",
      "btnZoomOut", "btnZoomIn", "btnWrap", "btnExpand", "btnCopy", "btnDownload",
      "filesCard", "filesList", "fileSearch", "btnCopyAll", "btnDownloadAll",
      "btnPreview",
      "historyList", "historyCount", "btnClearHistory", "btnExportHistory",
      "previewOverlay", "previewTitle", "previewFrame", "previewLoading",
      "previewInfo", "btnClosePreview", "btnRefreshPreview", "btnRebuildPreview", "btnOpenTab",
      "qrModal", "btnConfirmPay", "btnCloseQr",
      "confetti"
    ];
    ids.forEach(function (id) { dom[id] = $(id); });
  }

  // ============================================================
  // TOAST
  // ============================================================
  function toast(msg, type, duration) {
    type = type || "info";
    duration = duration || 2600;
    if (!dom.toasts) return;

    var el = document.createElement("div");
    el.className = "toast " + type;
    var icons = { success: "✓", error: "✕", info: "ℹ" };
    el.innerHTML = '<span style="font-weight:700">' + (icons[type] || "ℹ") + '</span><span>' + escapeHtml(msg) + '</span>';
    dom.toasts.appendChild(el);

    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 300);
    }, duration);
  }

  // ============================================================
  // TOKEN
  // ============================================================
  function loadTokens() {
    var key = todayKey();
    var savedDay = localStorage.getItem("sg_free_day");
    var left = parseInt(localStorage.getItem("sg_free_left") || "0", 10);
    if (savedDay !== key) {
      left = CONFIG.DAILY_FREE;
      localStorage.setItem("sg_free_day", key);
      localStorage.setItem("sg_free_left", String(left));
    }
    return left;
  }

  function saveTokens() {
    localStorage.setItem("sg_free_left", String(state.tokens));
    localStorage.setItem("sg_free_day", todayKey());
    if (dom.tokenCount) dom.tokenCount.textContent = state.tokens;
    if (dom.tokenPill) dom.tokenPill.classList.toggle("warn", state.tokens <= 5);
    updateLockState();
  }

  function updateLockState() {
    var locked = state.tokens <= 0;
    if (dom.inputCard) dom.inputCard.classList.toggle("locked", locked);
    if (dom.lockNotice) dom.lockNotice.classList.toggle("hidden", !locked);
    if (dom.btnGenerate) dom.btnGenerate.disabled = locked;
    if (dom.urlInput) dom.urlInput.disabled = locked;
  }

  function pulseToken() {
    if (!dom.tokenPill) return;
    dom.tokenPill.classList.remove("pulse");
    void dom.tokenPill.offsetWidth;
    dom.tokenPill.classList.add("pulse");
  }

  function updateResetInfo() {
    if (!dom.resetInfo) return;
    var now = new Date();
    var tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    var diff = tomorrow - now;
    var h = Math.floor(diff / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    dom.resetInfo.textContent = "reset dalam " + h + "j " + m + "m";
  }

  // ============================================================
  // ERROR / LOCK
  // ============================================================
  function showError(msg) {
    if (!dom.errorBox) return;
    dom.errorBox.textContent = msg;
    dom.errorBox.classList.remove("hidden");
  }

  function clearError() {
    if (!dom.errorBox) return;
    dom.errorBox.classList.add("hidden");
    dom.errorBox.textContent = "";
  }

  // ============================================================
  // HISTORY
  // ============================================================
  function saveHistory() {
    localStorage.setItem("sg_history", JSON.stringify(state.history.slice(0, 30)));
    renderHistory();
  }

  function renderHistory() {
    if (!dom.historyList) return;
    if (dom.historyCount) dom.historyCount.textContent = state.history.length;

    if (!state.history.length) {
      dom.historyList.innerHTML = '<div class="history-empty">Belum ada history extract</div>';
      return;
    }

    var html = "";
    state.history.forEach(function (h, i) {
      var t = new Date(h.time);
      var timeStr = t.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }) + " " +
        t.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      html += '<div class="history-item" data-idx="' + i + '">' +
        '<div class="h-icon">📄</div>' +
        '<div class="h-info">' +
        '<div class="h-url">' + escapeHtml(h.url) + '</div>' +
        '<div class="h-meta">' + timeStr + ' · ' + (h.fileCount || 0) + ' files · ' + formatBytes(h.totalLength || 0) + '</div>' +
        '</div>' +
        '<button type="button" class="h-del" data-del="' + i + '" title="Hapus">✕</button>' +
        '</div>';
    });
    dom.historyList.innerHTML = html;
  }

  // ============================================================
  // PREVIEW — build HTML dengan inline CSS/JS + base
  // ============================================================
  function resolveUrl(href, base) {
    if (!href) return "";
    try { return new URL(href, base).href; } catch (e) { return href; }
  }

  function normalizeUrl(u) {
    if (!u) return "";
    try {
      var url = new URL(u);
      url.hash = "";
      var s = url.href;
      if (s.charAt(s.length - 1) === "/" && url.pathname !== "/") s = s.slice(0, -1);
      return s;
    } catch (e) { return String(u); }
  }

  function findFileByUrl(files, url) {
    if (!url) return null;
    var norm = normalizeUrl(url);
    var i;
    for (i = 0; i < files.length; i++) {
      if (files[i].url && normalizeUrl(files[i].url) === norm) return files[i];
    }
    try {
      var target = new URL(url);
      var targetPath = target.origin + target.pathname;
      for (i = 0; i < files.length; i++) {
        if (!files[i].url) continue;
        try {
          var u = new URL(files[i].url);
          if ((u.origin + u.pathname) === targetPath) return files[i];
        } catch (e) { }
      }
    } catch (e) { }
    try {
      var t2 = new URL(url);
      var baseName = t2.pathname.split("/").pop();
      if (baseName) {
        for (i = 0; i < files.length; i++) {
          if (!files[i].url) continue;
          try {
            if (new URL(files[i].url).pathname.split("/").pop() === baseName) return files[i];
          } catch (e) { }
        }
      }
    } catch (e) { }
    return null;
  }

  function buildPreviewHtml() {
    if (!state.currentResult) return null;
    var files = state.currentResult.files;
    var htmlFile = null;
    var i;
    for (i = 0; i < files.length; i++) {
      if (files[i].kind === "html") { htmlFile = files[i]; break; }
    }
    if (!htmlFile) htmlFile = files[0];
    if (!htmlFile || !htmlFile.content) return null;

    var html = htmlFile.content;
    var baseUrl = state.currentResult.url || htmlFile.url || "";

    html = html.replace(/<base\b[^>]*>/gi, "");

    var headInject = '<meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      '<base href="' + escapeAttr(baseUrl) + '">';

    if (/<head\b[^>]*>/i.test(html)) {
      html = html.replace(/<head\b[^>]*>/i, function (m) { return m + headInject; });
    } else if (/<html\b[^>]*>/i.test(html)) {
      html = html.replace(/<html\b[^>]*>/i, function (m) { return m + '<head>' + headInject + '</head>'; });
    } else {
      html = '<head>' + headInject + '</head>' + html;
    }

    html = html.replace(/<link\b[^>]*>/gi, function (tag) {
      if (!/rel\s*=\s*["']?stylesheet/i.test(tag)) return tag;
      var m = tag.match(/href\s*=\s*["']([^"']+)["']/i);
      if (!m) return tag;
      var resolved = resolveUrl(m[1], baseUrl);
      var f = findFileByUrl(files, resolved);
      if (!f || !f.content) return tag;
      var safe = f.content.replace(/<\/style/gi, "<\\/style");
      return '<style data-inlined-from="' + escapeAttr(resolved) + '">\n' + safe + '\n</style>';
    });

    html = html.replace(/<script\b([^>]*)\bsrc\s*=\s*["']([^"']+)["']([^>]*)>([\s\S]*?)<\/script>/gi,
      function (full, before, src, after) {
        var resolved = resolveUrl(src, baseUrl);
        var f = findFileByUrl(files, resolved);
        if (!f || !f.content) return full;
        var attrs = (before + " " + after)
          .replace(/\bsrc\s*=\s*["'][^"']*["']/gi, "")
          .replace(/\s+/g, " ").trim();
        var safe = f.content.replace(/<\/script/gi, "<\\/script");
        return '<script' + (attrs ? " " + attrs : "") +
          ' data-inlined-from="' + escapeAttr(resolved) + '">\n' + safe + '\n</script>';
      });

    var runtime = '<script>' +
      '(function(){' +
      'window.addEventListener("error",function(e){console.warn("[Preview]",e.message||e.filename);},true);' +
      'if(!window.matchMedia){window.matchMedia=function(q){return{matches:false,media:q,addListener:function(){},removeListener:function(){},addEventListener:function(){},removeEventListener:function(){},dispatchEvent:function(){return false;}};};}' +
      'if(!window.IntersectionObserver){window.IntersectionObserver=function(){this.observe=function(){};this.unobserve=function(){};this.disconnect=function(){};};}' +
      'if(!window.ResizeObserver){window.ResizeObserver=function(){this.observe=function(){};this.unobserve=function(){};this.disconnect=function(){};};}' +
      'document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href]");if(!a)return;var h=a.getAttribute("href")||"";if(h.indexOf("javascript:")===0||h.charAt(0)==="#")return;a.setAttribute("target","_blank");a.setAttribute("rel","noopener");},true);' +
      'try{if(window.parent&&window.parent!==window)window.parent.postMessage({type:"preview-ready"},"*");}catch(_){}' +
      '})();' +
      '<\/script>';

    if (/<head\b[^>]*>/i.test(html)) {
      html = html.replace(/<head\b[^>]*>/i, function (m) { return m + runtime; });
    } else {
      html = runtime + html;
    }

    return html;
  }

  function showPreviewLoading(text) {
    if (dom.previewLoading) dom.previewLoading.classList.remove("hidden");
  }

  function hidePreviewLoading() {
    if (dom.previewLoading) dom.previewLoading.classList.add("hidden");
  }

  function loadPreview() {
    if (!state.currentResult) return;
    showPreviewLoading("Menyiapkan preview…");

    if (state.previewMode === "direct") {
      if (dom.previewTitle) dom.previewTitle.textContent = state.currentResult.url || "Preview";
      if (dom.previewInfo) dom.previewInfo.textContent = "Direct URL";
      if (dom.previewFrame) dom.previewFrame.src = state.currentResult.url;
    } else {
      var built = buildPreviewHtml();
      if (!built) {
        hidePreviewLoading();
        toast("Tidak ada HTML untuk di-preview", "error");
        return;
      }
      if (state.previewBlobUrl) URL.revokeObjectURL(state.previewBlobUrl);
      var blob = new Blob([built], { type: "text/html;charset=utf-8" });
      state.previewBlobUrl = URL.createObjectURL(blob);
      if (dom.previewTitle) dom.previewTitle.textContent = state.currentResult.url || "Preview";
      var cssN = 0, jsN = 0;
      state.currentResult.files.forEach(function (f) {
        if (f.kind === "css" || f.kind === "inline-css") cssN++;
        if (f.kind === "js" || f.kind === "inline-js") jsN++;
      });
      if (dom.previewInfo) dom.previewInfo.textContent = "Rebuilt — " + cssN + " CSS + " + jsN + " JS";
      if (dom.previewFrame) dom.previewFrame.src = state.previewBlobUrl;
    }
  }

  function openPreview() {
    if (!state.currentResult) return;
    if (dom.previewOverlay) dom.previewOverlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    loadPreview();
  }

  function closePreview() {
    if (dom.previewOverlay) dom.previewOverlay.classList.add("hidden");
    if (dom.previewFrame) dom.previewFrame.src = "about:blank";
    document.body.style.overflow = "";
    hidePreviewLoading();
    if (state.previewBlobUrl) {
      URL.revokeObjectURL(state.previewBlobUrl);
      state.previewBlobUrl = null;
    }
  }

  // ============================================================
  // RENDER — file list, viewer, stats
  // ============================================================
  function renderFileList(files) {
    if (!dom.filesList) return;
    var q = state.fileFilterQuery.toLowerCase().trim();
    var filtered = files;
    if (q) {
      filtered = files.filter(function (f) {
        return (f.name || "").toLowerCase().indexOf(q) >= 0 ||
          (f.kind || "").toLowerCase().indexOf(q) >= 0;
      });
    }
    if (!filtered.length) {
      dom.filesList.innerHTML = '<div class="file-no-result">Tidak ada file cocok</div>';
      return;
    }
    var order = ["html", "css", "inline-css", "js", "inline-js"];
    var labels = {
      html: "HTML", css: "External CSS", "inline-css": "Inline CSS",
      js: "External JavaScript", "inline-js": "Inline JavaScript"
    };
    var html = "";
    order.forEach(function (kind) {
      var items = filtered.filter(function (f) { return f.kind === kind; });
      if (!items.length) return;
      html += '<div class="file-group-label">' + (labels[kind] || kind) + '</div>';
      items.forEach(function (f) {
        var active = f.id === state.activeFileId ? " active" : "";
        var lines = f.content ? f.content.split("\n").length : 0;
        var sub = f.error ? "failed" :
          lines.toLocaleString() + " lines · " + formatBytes(f.contentLength || (f.content ? f.content.length : 0));
        html += '<button type="button" class="file-item' + active + '" data-id="' + f.id + '">' +
          '<span class="tag ' + tagClass(f.kind) + '">' + tagLabel(f.kind) + '</span>' +
          '<span style="min-width:0;flex:1">' +
          '<div class="name">' + escapeHtml(f.name || f.kind) + '</div>' +
          '<div class="sub">' + sub + '</div>' +
          '</span>' +
          '</button>';
      });
    });
    dom.filesList.innerHTML = html;
  }

  function highlight(code, kind) {
    var s = escapeHtml(code);
    if (kind === "html") {
      s = s.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="tok-comment">$1</span>');
      s = s.replace(/(&lt;\/?)([a-zA-Z][\w-]*)/g, '$1<span class="tok-tag">$2</span>');
      s = s.replace(/("[^"]*"|'[^']*')/g, '<span class="tok-str">$1</span>');
    } else if (kind && kind.indexOf("css") >= 0) {
      s = s.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="tok-comment">$1</span>');
      s = s.replace(/([.#]?[a-zA-Z][\w-]*)(\s*\{)/g, '<span class="tok-tag">$1</span>$2');
      s = s.replace(/([\w-]+)(\s*:)/g, '<span class="tok-prop">$1</span>$2');
    } else {
      s = s.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, '<span class="tok-comment">$1</span>');
      s = s.replace(/("[^"]*"|'[^']*'|`[^`]*`)/g, '<span class="tok-str">$1</span>');
      s = s.replace(/\b(function|const|let|var|return|if|else|for|while|class|new|this|async|await|try|catch)\b/g,
        '<span class="tok-kw">$1</span>');
      s = s.replace(/\b(\d+)\b/g, '<span class="tok-num">$1</span>');
    }
    return s;
  }

  function renderFileViewer(file) {
    if (!dom.fileViewer || !dom.fvCode) return;
    dom.fileViewer.classList.remove("hidden");
    if (dom.emptyState) dom.emptyState.classList.add("hidden");

    if (dom.fvTag) {
      dom.fvTag.className = "tag " + tagClass(file.kind);
      dom.fvTag.textContent = tagLabel(file.kind);
    }
    if (dom.fvName) dom.fvName.textContent = file.name || file.kind;

    var lines = (file.content || "").split("\n");
    var status = file.error ? "error" : (file.status == null ? "inline" : "HTTP " + file.status);

    if (dom.fvMeta) {
      dom.fvMeta.innerHTML =
        '<span>' + status + '</span>' +
        '<span>' + lines.length.toLocaleString() + ' lines</span>' +
        '<span>' + formatBytes(file.contentLength || (file.content ? file.content.length : 0)) + '</span>' +
        (file.url ? '<a href="' + escapeAttr(file.url) + '" target="_blank" rel="noopener">' + escapeHtml(file.url) + '</a>' : "");
    }

    if (file.error) {
      dom.fvCode.innerHTML = '<div class="empty"><p>Couldn\'t fetch this file</p><small>' + escapeHtml(file.error) + '</small></div>';
      return;
    }

    var shown = lines.slice(0, CONFIG.MAX_LINES);
    var rows = "";
    for (var i = 0; i < shown.length; i++) {
      var raw = shown[i] === "" ? " " : shown[i];
      rows += '<tr><td class="ln">' + (i + 1) + '</td><td class="lc">' + highlight(raw, file.kind) + '</td></tr>';
    }

    var extra = "";
    if (lines.length > CONFIG.MAX_LINES) {
      extra = '<div style="padding:0.7rem;border-top:1px solid var(--border);font-size:0.68rem;color:var(--dim);text-align:center">Showing first ' + CONFIG.MAX_LINES.toLocaleString() + ' lines</div>';
    }

    var cls = "code-table";
    if (state.codeWrap) cls += " wrap";
    if (state.codeZoom > 0) cls += " zoom-" + state.codeZoom;
    else if (state.codeZoom < 0) cls += " zoom--1";

    dom.fvCode.innerHTML = '<table class="' + cls + '"><tbody>' + rows + '</tbody></table>' + extra;
    dom.fvCode.classList.toggle("expanded", state.codeExpanded);
  }

  function refreshViewer() {
    if (!state.currentResult) return;
    var f = null;
    for (var i = 0; i < state.currentResult.files.length; i++) {
      if (state.currentResult.files[i].id === state.activeFileId) {
        f = state.currentResult.files[i];
        break;
      }
    }
    if (f) renderFileViewer(f);
  }

  function renderStats() {
    if (!state.currentResult || !dom.statsRow) return;
    var files = state.currentResult.files;
    var cssN = 0, jsN = 0;
    files.forEach(function (x) {
      if (x.kind === "css" || x.kind === "inline-css") cssN++;
      if (x.kind === "js" || x.kind === "inline-js") jsN++;
    });
    dom.statsRow.classList.remove("hidden");
    dom.statsRow.innerHTML =
      '<div class="stat-box"><label>Files</label><strong>' + state.currentResult.fileCount + '</strong></div>' +
      '<div class="stat-box"><label>Total size</label><strong>' + formatBytes(state.currentResult.totalLength) + '</strong></div>' +
      '<div class="stat-box"><label>CSS</label><strong>' + cssN + '</strong></div>' +
      '<div class="stat-box"><label>JS</label><strong>' + jsN + '</strong></div>';
  }

  function renderResult() {
    if (!state.currentResult) return;
    var files = state.currentResult.files;
    if (dom.filesCard) dom.filesCard.classList.remove("hidden");
    if (dom.btnPreview) dom.btnPreview.classList.remove("hidden");
    renderFileList(files);

    var active = null;
    for (var i = 0; i < files.length; i++) {
      if (files[i].id === state.activeFileId) { active = files[i]; break; }
    }
    if (!active && files.length) active = files[0];
    if (active) renderFileViewer(active);
    renderStats();
  }

  // ============================================================
  // GENERATE UI (progress animation)
  // ============================================================
  function startGenUI(url) {
    if (!dom.genCard) return;
    dom.genCard.classList.remove("hidden");
    if (dom.emptyState) dom.emptyState.classList.add("hidden");
    if (dom.fileViewer) dom.fileViewer.classList.add("hidden");
    if (dom.errState) dom.errState.classList.add("hidden");
    if (dom.filesCard) dom.filesCard.classList.add("hidden");
    if (dom.statsRow) dom.statsRow.classList.add("hidden");

    if (dom.genUrl) dom.genUrl.textContent = url;
    if (dom.genBar) dom.genBar.style.width = "0%";
    if (dom.genPct) dom.genPct.textContent = "0%";
    if (dom.genEta) dom.genEta.textContent = "Menangkap setiap baris seperti di browser.";

    if (dom.genSteps) {
      var sh = "";
      for (var i = 0; i < CONFIG.STEPS.length; i++) {
        sh += '<li class="' + (i === 0 ? "active" : "pending") + '" data-i="' + i + '">' +
          '<span class="step-ico">' + (i === 0 ? "…" : i + 1) + '</span>' +
          '<span>' + CONFIG.STEPS[i] + '</span>' +
          '</li>';
      }
      dom.genSteps.innerHTML = sh;
    }

    var start = performance.now();
    var duration = 8000;
    function tick(now) {
      if (state.genCancelled) return;
      var p = Math.min(0.92, (now - start) / duration);
      if (dom.genBar) dom.genBar.style.width = Math.round(p * 100) + "%";
      if (dom.genPct) dom.genPct.textContent = Math.round(p * 100) + "%";
      if (p < 0.92) state.genTimer = requestAnimationFrame(tick);
    }
    state.genTimer = requestAnimationFrame(tick);

    var step = 0;
    state.stepTimer = setInterval(function () {
      if (state.genCancelled) return;
      if (!dom.genSteps) return;
      if (step >= CONFIG.STEPS.length - 1) return;
      var prev = dom.genSteps.querySelector('[data-i="' + step + '"]');
      if (prev) {
        prev.className = "done";
        var ico = prev.querySelector(".step-ico");
        if (ico) ico.textContent = "✓";
      }
      step++;
      var cur = dom.genSteps.querySelector('[data-i="' + step + '"]');
      if (cur) {
        cur.className = "active";
        var ico2 = cur.querySelector(".step-ico");
        if (ico2) ico2.textContent = "…";
      }
    }, 900);

    var etaSec = CONFIG.ETA_SECONDS;
    state.etaTimer = setInterval(function () {
      if (state.genCancelled) return;
      etaSec = Math.max(0, etaSec - 1);
      if (dom.genEta) {
        dom.genEta.textContent = etaSec > 0 ?
          "Estimasi selesai dalam ~" + etaSec + "s" : "Menyelesaikan...";
      }
    }, 1000);
  }

  function finishGenUI() {
    if (state.genTimer) cancelAnimationFrame(state.genTimer);
    if (state.stepTimer) clearInterval(state.stepTimer);
    if (state.etaTimer) clearInterval(state.etaTimer);
    if (dom.genBar) dom.genBar.style.width = "100%";
    if (dom.genPct) dom.genPct.textContent = "100%";
    if (dom.genSteps) {
      for (var i = 0; i < CONFIG.STEPS.length; i++) {
        var el = dom.genSteps.querySelector('[data-i="' + i + '"]');
        if (el) {
          el.className = "done";
          var ico = el.querySelector(".step-ico");
          if (ico) ico.textContent = "✓";
        }
      }
    }
  }

  // ============================================================
  // FETCH
  // ============================================================
  function startFetch(raw) {
    console.log("[SourceGetter] startFetch:", raw);

    if (state.tokens <= 0) {
      toast("Token hari ini habis.", "error");
      showError("Token hari ini habis. Coba lagi besok.");
      return;
    }

    var url = (raw || "").trim();
    if (!url) return;
    if (!isValidUrl(url)) {
      if (dom.urlInput) dom.urlInput.classList.add("invalid");
      toast("URL tidak valid", "error");
      return;
    }
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;

    clearError();
    state.genCancelled = false;
    state.abortController = new AbortController();

    if (dom.btnGenerate) {
      dom.btnGenerate.disabled = true;
      dom.btnGenerate.textContent = "Generating…";
    }
    if (dom.urlInput) dom.urlInput.disabled = true;

    startGenUI(url);

    fetch(CONFIG.FETCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + CONFIG.SUPABASE_KEY
      },
      body: JSON.stringify({ url: url }),
      signal: state.abortController.signal
    })
      .then(function (res) {
        console.log("[SourceGetter] Response status:", res.status);
        return res.json().then(function (data) {
          return { ok: res.ok, status: res.status, data: data };
        });
      })
      .then(function (result) {
        if (state.genCancelled) return;
        finishGenUI();
        var data = result.data;
        console.log("[SourceGetter] Data:", data);

        if (!result.ok || (data && data.error)) {
          showError((data && data.error) || ("Request failed (" + result.status + ")"));
          if (dom.genCard) dom.genCard.classList.add("hidden");
          if (dom.errState) dom.errState.classList.remove("hidden");
          toast("Gagal mengambil source", "error");
          return;
        }

        state.tokens = Math.max(0, state.tokens - 1);
        saveTokens();
        pulseToken();
        if (state.tokens <= 5 && state.tokens > 0) toast("Token tersisa " + state.tokens, "info");
        if (state.tokens === 0) toast("Token habis untuk hari ini", "error");

        state.currentResult = {
          url: data.url,
          files: data.files || [],
          totalLength: data.totalLength || 0,
          fileCount: data.fileCount || 0
        };
        state.activeFileId = state.currentResult.files[0] ? state.currentResult.files[0].id : null;
        state.fileFilterQuery = "";
        if (dom.fileSearch) dom.fileSearch.value = "";

        state.history.unshift({
          url: data.url || url,
          time: Date.now(),
          fileCount: state.currentResult.fileCount,
          totalLength: state.currentResult.totalLength
        });
        saveHistory();

        setTimeout(function () {
          if (state.genCancelled) return;
          if (dom.genCard) dom.genCard.classList.add("hidden");
          renderResult();
          toast("Berhasil: " + state.currentResult.fileCount + " files", "success");
        }, 300);
      })
      .catch(function (err) {
        console.error("[SourceGetter] Fetch error:", err);
        if (err && err.name === "AbortError") return;
        finishGenUI();
        showError(err && err.message ? err.message : "Network error");
        if (dom.genCard) dom.genCard.classList.add("hidden");
        if (dom.errState) dom.errState.classList.remove("hidden");
        toast("Network error", "error");
      })
      .then(function () {
        if (!state.genCancelled) {
          if (dom.btnGenerate) {
            dom.btnGenerate.disabled = state.tokens <= 0;
            dom.btnGenerate.textContent = "Generate";
          }
          if (dom.urlInput) dom.urlInput.disabled = state.tokens <= 0;
        }
        state.abortController = null;
      });
  }

  // ============================================================
  // EVENT LISTENERS
  // ============================================================
  function bindEvents() {
    // FORM SUBMIT
    if (dom.urlForm) {
      dom.urlForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!dom.btnGenerate || !dom.btnGenerate.disabled) {
          startFetch(dom.urlInput ? dom.urlInput.value : "");
        }
      });
    }

    // URL INPUT
    if (dom.urlInput) {
      dom.urlInput.addEventListener("input", function () {
        clearTimeout(state.urlDebounceTimer);
        var v = dom.urlInput.value.trim();
        dom.urlInput.classList.remove("invalid");
        state.urlDebounceTimer = setTimeout(function () {
          if (v && !isValidUrl(v)) dom.urlInput.classList.add("invalid");
          else dom.urlInput.classList.remove("invalid");
        }, 400);
      });
      dom.urlInput.addEventListener("keydown", function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          if (dom.btnGenerate && !dom.btnGenerate.disabled) {
            startFetch(dom.urlInput.value);
          }
        }
      });
    }

    // BUTTON RIPPLE
    if (dom.btnGenerate) {
      dom.btnGenerate.addEventListener("click", function (e) {
        var rect = dom.btnGenerate.getBoundingClientRect();
        var ripple = document.createElement("span");
        ripple.className = "ripple";
        var size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
        ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
        dom.btnGenerate.appendChild(ripple);
        setTimeout(function () { ripple.remove(); }, 600);
      });
    }

    // CANCEL
    if (dom.btnCancel) {
      dom.btnCancel.addEventListener("click", function () {
        state.genCancelled = true;
        if (state.abortController) state.abortController.abort();
        finishGenUI();
        if (dom.genCard) dom.genCard.classList.add("hidden");
        if (dom.emptyState) dom.emptyState.classList.remove("hidden");
        if (dom.btnGenerate) {
          dom.btnGenerate.disabled = state.tokens <= 0;
          dom.btnGenerate.textContent = "Generate";
        }
        if (dom.urlInput) dom.urlInput.disabled = state.tokens <= 0;
        toast("Generate dibatalkan", "info");
      });
    }

    // HISTORY
    if (dom.historyList) {
      dom.historyList.addEventListener("click", function (e) {
        var delBtn = e.target.closest("[data-del]");
        if (delBtn) {
          e.stopPropagation();
          var idx = parseInt(delBtn.getAttribute("data-del"), 10);
          state.history.splice(idx, 1);
          saveHistory();
          toast("History dihapus", "info", 1500);
          return;
        }
        var item = e.target.closest(".history-item");
        if (item && state.tokens > 0) {
          var idx2 = parseInt(item.getAttribute("data-idx"), 10);
          var h = state.history[idx2];
          if (h) {
            if (dom.urlInput) dom.urlInput.value = h.url;
            startFetch(h.url);
          }
        }
      });
    }

    if (dom.btnClearHistory) {
      dom.btnClearHistory.addEventListener("click", function () {
        if (!state.history.length) return;
        if (confirm("Hapus semua history?")) {
          state.history = [];
          saveHistory();
          toast("History dibersihkan", "success");
        }
      });
    }

    if (dom.btnExportHistory) {
      dom.btnExportHistory.addEventListener("click", function () {
        if (!state.history.length) {
          toast("History kosong", "error");
          return;
        }
        var blob = new Blob([JSON.stringify(state.history, null, 2)], { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "source-getter-history.json";
        a.click();
        URL.revokeObjectURL(a.href);
        toast("History diexport", "success");
      });
    }

    // FILE SEARCH
    if (dom.fileSearch) {
      dom.fileSearch.addEventListener("input", function () {
        state.fileFilterQuery = dom.fileSearch.value;
        if (state.currentResult) renderFileList(state.currentResult.files);
      });
    }

    // FILE LIST CLICK
    if (dom.filesList) {
      dom.filesList.addEventListener("click", function (e) {
        var btn = e.target.closest(".file-item");
        if (!btn || !state.currentResult) return;
        state.activeFileId = btn.getAttribute("data-id");
        var f = null;
        for (var i = 0; i < state.currentResult.files.length; i++) {
          if (state.currentResult.files[i].id === state.activeFileId) {
            f = state.currentResult.files[i];
            break;
          }
        }
        if (f) {
          renderFileList(state.currentResult.files);
          renderFileViewer(f);
        }
      });
    }

    // ZOOM / WRAP / EXPAND
    if (dom.btnZoomIn) dom.btnZoomIn.addEventListener("click", function () {
      state.codeZoom = Math.min(2, state.codeZoom + 1);
      refreshViewer();
    });
    if (dom.btnZoomOut) dom.btnZoomOut.addEventListener("click", function () {
      state.codeZoom = Math.max(-1, state.codeZoom - 1);
      refreshViewer();
    });
    if (dom.btnWrap) dom.btnWrap.addEventListener("click", function () {
      state.codeWrap = !state.codeWrap;
      dom.btnWrap.classList.toggle("active", state.codeWrap);
      refreshViewer();
    });
    if (dom.btnExpand) dom.btnExpand.addEventListener("click", function () {
      state.codeExpanded = !state.codeExpanded;
      dom.btnExpand.classList.toggle("active", state.codeExpanded);
      if (dom.fvCode) dom.fvCode.classList.toggle("expanded", state.codeExpanded);
    });

    // COPY / DOWNLOAD
    if (dom.btnCopy) {
      dom.btnCopy.addEventListener("click", function () {
        if (!state.currentResult) return;
        var f = null;
        for (var i = 0; i < state.currentResult.files.length; i++) {
          if (state.currentResult.files[i].id === state.activeFileId) {
            f = state.currentResult.files[i];
            break;
          }
        }
        if (!f) return;
        navigator.clipboard.writeText(f.content || "").then(function () {
          toast("File dicopy", "success", 1400);
        }, function () {
          toast("Gagal copy", "error");
        });
      });
    }

    if (dom.btnDownload) {
      dom.btnDownload.addEventListener("click", function () {
        if (!state.currentResult) return;
        var f = null;
        for (var i = 0; i < state.currentResult.files.length; i++) {
          if (state.currentResult.files[i].id === state.activeFileId) {
            f = state.currentResult.files[i];
            break;
          }
        }
        if (!f) return;
        var ext = f.kind === "html" ? "html" : (f.kind.indexOf("css") >= 0 ? "css" : "js");
        var blob = new Blob([f.content || ""], { type: "text/plain;charset=utf-8" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = f.name || ("source." + ext);
        a.click();
        URL.revokeObjectURL(a.href);
        toast("File didownload", "success", 1400);
      });
    }

    if (dom.btnCopyAll) {
      dom.btnCopyAll.addEventListener("click", function () {
        if (!state.currentResult || !state.currentResult.files.length) return;
        var parts = state.currentResult.files.map(function (f) {
          return "// ===== " + (f.name || f.kind) + " (" + f.kind + ") =====\n" + (f.content || "");
        }).join("\n\n");
        navigator.clipboard.writeText(parts).then(function () {
          toast("Semua file dicopy", "success");
        }, function () {
          toast("Gagal copy", "error");
        });
      });
    }

    if (dom.btnDownloadAll) {
      dom.btnDownloadAll.addEventListener("click", function () {
        if (!state.currentResult || !state.currentResult.files.length) return;
        var files = state.currentResult.files;
        toast("Downloading " + files.length + " files...", "info");
        files.forEach(function (f, i) {
          setTimeout(function () {
            var ext = f.kind === "html" ? "html" : (f.kind.indexOf("css") >= 0 ? "css" : "js");
            var blob = new Blob([f.content || ""], { type: "text/plain;charset=utf-8" });
            var a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = f.name || ("source-" + i + "." + ext);
            a.click();
            URL.revokeObjectURL(a.href);
          }, i * 300);
        });
      });
    }

    // PREVIEW
    if (dom.btnPreview) dom.btnPreview.addEventListener("click", openPreview);
    if (dom.btnClosePreview) dom.btnClosePreview.addEventListener("click", closePreview);

    // VIEWPORT TOGGLE
    document.querySelectorAll("[data-vp]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll("[data-vp]").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var vp = btn.getAttribute("data-vp");
        if (!dom.previewFrame) return;
        dom.previewFrame.classList.remove("mobile", "tablet");
        if (vp === "mobile") dom.previewFrame.classList.add("mobile");
        else if (vp === "tablet") dom.previewFrame.classList.add("tablet");
      });
    });

    if (dom.btnRefreshPreview) {
      dom.btnRefreshPreview.addEventListener("click", function () {
        if (!state.currentResult) return;
        showPreviewLoading("Refresh…");
        if (state.previewMode === "direct") {
          if (dom.previewFrame) dom.previewFrame.src = state.currentResult.url;
        } else if (state.previewBlobUrl) {
          if (dom.previewFrame) {
            dom.previewFrame.src = "about:blank";
            setTimeout(function () {
              if (dom.previewFrame) dom.previewFrame.src = state.previewBlobUrl;
            }, 60);
          }
        } else {
          loadPreview();
        }
        toast("Preview di-refresh", "info", 1200);
      });
    }

    if (dom.btnRebuildPreview) {
      dom.btnRebuildPreview.addEventListener("click", function () {
        if (!state.currentResult) return;
        state.previewMode = "rebuilt";
        document.querySelectorAll('input[name="previewMode"]').forEach(function (r) {
          if (r.value === "rebuilt") r.checked = true;
        });
        loadPreview();
        toast("Rebuild selesai", "success", 1400);
      });
    }

    if (dom.btnOpenTab) {
      dom.btnOpenTab.addEventListener("click", function () {
        if (!state.currentResult) return;
        if (state.previewMode === "direct") {
          window.open(state.currentResult.url, "_blank");
        } else {
          var built = buildPreviewHtml();
          if (!built) return;
          var blob = new Blob([built], { type: "text/html;charset=utf-8" });
          var url = URL.createObjectURL(blob);
          window.open(url, "_blank");
          setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
        }
      });
    }

    document.querySelectorAll('input[name="previewMode"]').forEach(function (radio) {
      radio.addEventListener("change", function (e) {
        state.previewMode = e.target.value;
        if (dom.previewOverlay && !dom.previewOverlay.classList.contains("hidden")) {
          loadPreview();
        }
      });
    });

    window.addEventListener("message", function (e) {
      if (e.data && e.data.type === "preview-ready") {
        hidePreviewLoading();
      }
    });

    if (dom.previewFrame) {
      dom.previewFrame.addEventListener("load", function () {
        hidePreviewLoading();
      });
    }

    // QR
    if (dom.btnCloseQr) dom.btnCloseQr.addEventListener("click", function () {
      if (dom.qrModal) dom.qrModal.classList.add("hidden");
    });
    if (dom.qrModal) dom.qrModal.addEventListener("click", function (e) {
      if (e.target === dom.qrModal) dom.qrModal.classList.add("hidden");
    });
  }

  // ============================================================
  // INITIAL LOADER
  // ============================================================
  function runInitialLoader() {
    var loader = $("loader");
    var fill = $("loaderFill");
    var pct = $("loaderPct");
    if (!loader || !fill || !pct) return;

    var duration = 2200;
    var startTime = performance.now();

    function tick(now) {
      var progress = Math.min(100, ((now - startTime) / duration) * 100);
      fill.style.width = progress + "%";
      pct.textContent = Math.round(progress) + "%";
      if (progress < 100) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(function () {
          loader.classList.add("hide");
          setTimeout(function () { loader.style.display = "none"; }, 800);
        }, 300);
      }
    }
    requestAnimationFrame(tick);
  }

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    console.log("[SourceGetter] Initializing...");
    cacheDom();
    console.log("[SourceGetter] DOM cached:", {
      urlForm: !!dom.urlForm,
      urlInput: !!dom.urlInput,
      btnGenerate: !!dom.btnGenerate,
      previewFrame: !!dom.previewFrame
    });

    state.tokens = loadTokens();
    bindEvents();
    saveTokens();
    renderHistory();
    updateResetInfo();
    setInterval(updateResetInfo, 60000);
    runInitialLoader();

    console.log("[SourceGetter] App initialized OK.");
  }

  // Jalankan setelah DOM siap
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();