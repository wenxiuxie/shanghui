/* =========================================================
   CCCWA — shared site behaviour
   - bilingual (zh/en) toggle with localStorage persistence
   - mobile nav
   - scroll reveal
   - footer year
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Language ---------- */
  var STORE_KEY = "cccwa-lang";
  var html = document.documentElement;

  function setLang(lang) {
    if (lang !== "en" && lang !== "zh") lang = "zh";
    html.setAttribute("data-lang", lang);
    html.setAttribute("lang", lang === "en" ? "en" : "zh-CN");
    try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}
    document.querySelectorAll("[data-lang-btn]").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-lang-btn") === lang);
      b.setAttribute("aria-pressed", b.getAttribute("data-lang-btn") === lang);
    });
    // let dynamic renderers know
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: lang } }));
  }

  function initLang() {
    var saved;
    try { saved = localStorage.getItem(STORE_KEY); } catch (e) {}
    // ?lang=en / ?lang=zh overrides the stored preference (shareable links)
    var q = (location.search.match(/[?&]lang=(en|zh)\b/) || [])[1];
    setLang(q || saved || html.getAttribute("data-lang") || "zh");
    document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
      btn.addEventListener("click", function () { setLang(btn.getAttribute("data-lang-btn")); });
    });
  }

  // expose current language for other scripts
  window.CCCWA = window.CCCWA || {};
  window.CCCWA.lang = function () { return html.getAttribute("data-lang") || "zh"; };

  /* ---------- Mobile nav ---------- */
  function initNav() {
    var toggle = document.querySelector(".nav__toggle");
    var links = document.querySelector(".nav__links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open);
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Active nav link ---------- */
  function initActiveLink() {
    var path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav__links a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) a.classList.add("is-active");
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLang();
    initNav();
    initActiveLink();
    initReveal();
    initYear();
  });
})();
