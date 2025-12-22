/* ==========================================================
   WannaSmile | Reports Loader (SRS)
   Purpose-built for Suggestions / Reports / Bugs
   ========================================================== */
(() => {
  "use strict";

  /* ---------------------------
     Utilities
  --------------------------- */
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  const clamp = (v, a = 0, b = 100) => Math.min(b, Math.max(a, v));
  const safeStr = (v) => (v == null ? "" : String(v).trim());

  const DAY_MS = 24 * 60 * 60 * 1000;
  const MAX_REPORTS = 250;
  const EXPIRE_DAYS = 7;

  /* ---------------------------
     Config
  --------------------------- */
  const config = {
    sheetUrl:
      "https://script.google.com/a/macros/fpsmail.org/s/AKfycbz5Q3pyjrdM-qxNsvGinRFv-pCMwevhMEYaniAJu00bIYeqNB5iF4eCNS6nBOmfZKBVFA/exec",
  };

  /* ---------------------------
     DOM Init
  --------------------------- */
  function initElements() {
    const $ = (id) => document.getElementById(id);

    window.dom = {
      reports: $("reports"),
      preloader: $("preloader"),
      loaderText: $("loaderText") || $("counter"),
      progressFill: document.querySelector(".load-progress-fill"),
      loaderImage: $("loaderImage"),
      loadedImage: $("loadedImage"),
    };
  }

  /* ---------------------------
     Preloader (minimal)
  --------------------------- */
  function initPreloader() {
    const { preloader } = dom;
    if (!preloader) return;

    window.updateProgress = (p) => {
      const v = clamp(Math.round(p), 0, 100);
      if (dom.progressFill) dom.progressFill.style.width = `${v}%`;
      if (dom.loaderText) dom.loaderText.textContent = `${v}%`;
    };

    window.showLoading = (text) => {
      if (dom.loaderText) dom.loaderText.textContent = text;
    };

    window.hidePreloader = () => {
      preloader.style.transition = "opacity .4s ease";
      preloader.style.opacity = "0";
      setTimeout(() => (preloader.style.display = "none"), 450);
    };

    window.showLoadedState = async () => {
      if (dom.loaderImage) dom.loaderImage.style.opacity = "0";
      if (dom.loadedImage) dom.loadedImage.style.opacity = "1";
      await delay(900);
    };
  }

  /* ---------------------------
     Time Helpers
  --------------------------- */
  function daysSince(dateStr) {
    const t = Date.parse(dateStr);
    if (isNaN(t)) return Infinity;
    return Math.floor((Date.now() - t) / DAY_MS);
  }

  /* ---------------------------
     Report Filtering Rules
  --------------------------- */
  function normalizeReports(rows) {
    return rows
      .map((r) => ({
        title: safeStr(r.title),
        paragraph: safeStr(r.paragraph),
        created: safeStr(r.created),
        since: safeStr(r.since),
        reply: safeStr(r.reply),
        type: safeStr(r.type).toLowerCase(),
        status: safeStr(r.status).toLowerCase(),
        id: safeStr(r.ID),
      }))
      .filter(
        (r) =>
          r.id &&
          r.title &&
          daysSince(r.created) <= EXPIRE_DAYS
      )
      .sort(
        (a, b) => Date.parse(b.created) - Date.parse(a.created)
      )
      .slice(0, MAX_REPORTS);
  }

  /* ---------------------------
     Render Reports
  --------------------------- */
  function renderReports(reports) {
    const { reports: mount } = dom;
    if (!mount) return;

    mount.innerHTML = "";

    if (!reports.length) {
      mount.innerHTML =
        "<p style='text-align:center;color:#aaa;'>No active reports.</p>";
      return;
    }

    const frag = document.createDocumentFragment();

    for (const r of reports) {
      const card = document.createElement("div");
      card.className = `report-card status-${r.status} type-${r.type}`;

      card.innerHTML = `
        <div class="report-header">
          <span class="report-type">${r.type || "report"}</span>
          <span class="report-status">${r.status || "open"}</span>
          <span class="report-id">#${r.id}</span>
        </div>

        <h3 class="report-title">${r.title}</h3>
        <p class="report-body">${r.paragraph}</p>

        <div class="report-meta">
          <span>Created: ${r.created}</span>
          <span>${r.since || ""}</span>
        </div>

        ${
          r.reply
            ? `<div class="report-reply">
                 <strong>Reply:</strong>
                 <p>${r.reply}</p>
               </div>`
            : ""
        }
      `;

      frag.appendChild(card);
    }

    mount.appendChild(frag);
  }

  /* ---------------------------
     Loader
  --------------------------- */
  async function loadReports() {
    try {
      showLoading("Loading reports...");
      updateProgress(5);

      const res = await fetch(config.sheetUrl, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch reports");

      updateProgress(30);

      const raw = await res.json();
      if (!Array.isArray(raw)) throw new Error("Invalid data");

      updateProgress(55);

      const reports = normalizeReports(raw);

      updateProgress(75);
      renderReports(reports);

      updateProgress(100);
      await delay(120);
      await showLoadedState();
      hidePreloader();
    } catch (err) {
      console.error("Reports load failed:", err);
      showLoading("⚠ Failed to load reports");
      hidePreloader();
    }
  }

  /* ---------------------------
     Bootstrap
  --------------------------- */
  document.addEventListener("DOMContentLoaded", async () => {
    initElements();
    initPreloader();
    await loadReports();
    console.log("✅ Reports system ready");
  });
})();
