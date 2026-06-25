/* =========================================================
   CCCWA — dynamic content rendering
   Fetches JSON managed by the CMS and renders news / events.
   Buildless: the CMS edits content/*.json, this renders it.
   ========================================================= */
(function () {
  "use strict";

  var lang = function () { return (window.CCCWA && window.CCCWA.lang()) || "zh"; };
  var T = {
    readMore: { zh: "阅读全文 →", en: "Read more →" },
    upcoming: { zh: "近期活动", en: "Upcoming Events" },
    none: { zh: "暂无内容，敬请期待。", en: "No items yet — please check back soon." },
    loadErr: { zh: "内容加载失败，请稍后重试。", en: "Failed to load content. Please try again later." }
  };
  var MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

  function pick(item, base) {
    var l = lang();
    return item[base + "_" + l] || item[base + "_zh"] || item[base + "_en"] || "";
  }

  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return { d: "", m: "", full: iso || "" };
    var full = lang() === "en"
      ? d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : d.getFullYear() + " 年 " + (d.getMonth() + 1) + " 月 " + d.getDate() + " 日";
    return { d: d.getDate(), m: MONTHS[d.getMonth()], full: full };
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function getJSON(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  }

  /* ---------- News ---------- */
  function renderNews(container, items, limit) {
    if (!items.length) { container.innerHTML = emptyHTML(); return; }
    items = items.slice().sort(byDateDesc);
    if (limit) items = items.slice(0, limit);
    container.innerHTML = items.map(function (it) {
      var title = pick(it, "title"), summary = pick(it, "summary");
      var date = fmtDate(it.date);
      var media = it.image
        ? '<div class="post-card__media"><img src="' + esc(it.image) + '" alt="' + esc(title) + '" loading="lazy"></div>'
        : '<div class="post-card__media post-card__media--ph">📰</div>';
      var cat = pick(it, "category");
      return '<article class="post-card reveal is-visible">' + media +
        '<div class="post-card__body">' +
          '<div class="post-card__meta">' + (cat ? '<span class="tag">' + esc(cat) + '</span>' : '') +
            '<span>' + esc(date.full) + '</span></div>' +
          '<h3>' + esc(title) + '</h3>' +
          '<p class="post-card__excerpt">' + esc(summary) + '</p>' +
          (it.link ? '<a class="post-card__more" href="' + esc(it.link) + '" target="_blank" rel="noopener">' + T.readMore[lang()] + '</a>' : '') +
        '</div></article>';
    }).join("");
  }

  /* ---------- Events ---------- */
  function renderEvents(container, items, opts) {
    opts = opts || {};
    if (!items.length) { container.innerHTML = emptyHTML(); return; }
    var now = new Date(); now.setHours(0, 0, 0, 0);
    var list = items.slice();
    if (opts.upcomingOnly) list = list.filter(function (it) { return new Date(it.date) >= now; });
    list.sort(opts.upcomingOnly ? byDateAsc : byDateDesc);
    if (opts.limit) list = list.slice(0, opts.limit);
    if (!list.length) { container.innerHTML = emptyHTML(); return; }
    container.innerHTML = list.map(function (it) {
      var title = pick(it, "title"), desc = pick(it, "desc"), where = pick(it, "location");
      var date = fmtDate(it.date);
      return '<article class="event-row reveal is-visible">' +
        '<div class="event-date"><div class="d">' + esc(date.d) + '</div><div class="m">' + esc(date.m) + '</div></div>' +
        '<div class="event-info"><h3>' + esc(title) + '</h3>' +
          (desc ? '<p>' + esc(desc) + '</p>' : '') +
          (where ? '<div class="where">📍 ' + esc(where) + '</div>' : '') +
        '</div></article>';
    }).join("");
  }

  function byDateDesc(a, b) { return new Date(b.date) - new Date(a.date); }
  function byDateAsc(a, b) { return new Date(a.date) - new Date(b.date); }
  function emptyHTML() { return '<p class="empty-state">' + T.none[lang()] + '</p>'; }

  /* ---------- Boot ---------- */
  function mount() {
    var newsEls = document.querySelectorAll("[data-news]");
    var eventEls = document.querySelectorAll("[data-events]");
    if (!newsEls.length && !eventEls.length) return;

    var cache = {};
    function load(file) {
      if (!cache[file]) cache[file] = getJSON(file);
      return cache[file];
    }

    function paintAll() {
      newsEls.forEach(function (el) {
        load("content/news.json").then(function (data) {
          renderNews(el, data.items || [], parseInt(el.getAttribute("data-limit"), 10) || 0);
        }).catch(function () { el.innerHTML = '<p class="empty-state">' + T.loadErr[lang()] + '</p>'; });
      });
      eventEls.forEach(function (el) {
        load("content/events.json").then(function (data) {
          renderEvents(el, data.items || [], {
            upcomingOnly: el.hasAttribute("data-upcoming"),
            limit: parseInt(el.getAttribute("data-limit"), 10) || 0
          });
        }).catch(function () { el.innerHTML = '<p class="empty-state">' + T.loadErr[lang()] + '</p>'; });
      });
    }

    paintAll();
    document.addEventListener("langchange", paintAll);
  }

  /* ---------- Site images (managed via CMS: content/site.json) ---------- */
  function applySiteImages() {
    var els = document.querySelectorAll("[data-site-img]");
    if (!els.length) return;
    getJSON("content/site.json").then(function (map) {
      els.forEach(function (el) {
        var url = map[el.getAttribute("data-site-img")];
        if (!url) return; // leave placeholder when empty
        if (el.classList.contains("qr-ph")) {
          el.style.background = 'center/cover no-repeat url("' + url + '")';
        } else {
          // fill a .media-ph (or similar) with the uploaded photo
          el.style.background = "none";
          el.style.overflow = "hidden";
          el.innerHTML = '<img src="' + esc(url) + '" alt="" ' +
            'style="width:100%;height:100%;object-fit:cover;display:block">';
        }
      });
    }).catch(function () { /* keep placeholders on error */ });
  }

  document.addEventListener("DOMContentLoaded", mount);
  document.addEventListener("DOMContentLoaded", applySiteImages);
})();
