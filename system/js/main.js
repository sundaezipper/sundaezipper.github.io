/* ==========================================================
   WannaSmile | main.js (Page-Aware Core Loader)
   - Handles assets pages
   - Safely skips reports pages
   ========================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  /* ---------------------------
     PAGE DETECTION
  --------------------------- */
  const PAGE = {
    reports: !!document.getElementById("reports"),
    assets: !!document.getElementById("container"),
  };

  /* ---------------------------
     CORE INIT (always safe)
  --------------------------- */
  try {
    if (typeof initElements === "function") initElements();
    if (typeof initPreloader === "function") initPreloader();
  } catch (err) {
    console.error("Core init failed:", err);
    return;
  }

  /* ---------------------------
     REPORTS PAGE → EXIT EARLY
  --------------------------- */
  if (PAGE.reports) {
    console.log("ℹ main.js: reports page detected — asset loader skipped");
    return;
  }

  /* ---------------------------
     ASSET PAGES ONLY
  --------------------------- */
  try {
    if (typeof initFavorites === "function") initFavorites();
    if (typeof initPaging === "function") initPaging();
    if (typeof initPlaceholders === "function") initPlaceholders();

    await startLoadingProcess();
  } catch (err) {
    console.error("Startup error:", err);

    if (typeof updateProgress === "function") updateProgress(100);
    if (typeof hidePreloader === "function") hidePreloader(true);
  }
});

/* ==========================================================
   ASSET LOADING PIPELINE
   (never runs on reports page)
   ========================================================== */

async function startLoadingProcess() {
  if (typeof updateProgress === "function") updateProgress(5);

  // Fetch assets from Google Sheets
  const allAssets = await loadAssetsFromSheets();
  if (typeof updateProgress === "function") updateProgress(60);

  // Build cards
  if (typeof createAssetCards === "function") {
    await createAssetCards(allAssets);
  }
  if (typeof updateProgress === "function") updateProgress(85);

  // Allow layout to settle
  await new Promise((r) => requestAnimationFrame(r));

  // Finish loader animation
  if (typeof cyclePreloaderGifs === "function") {
    await cyclePreloaderGifs(true);
  }

  if (typeof updateProgress === "function") updateProgress(100);
  if (typeof hidePreloader === "function") hidePreloader();

  /* ---------------------------
     PAGE RESTORE LOGIC
  --------------------------- */
  const savedPage = sessionStorage.getItem("currentPage");

  if (typeof goToPage === "function") {
    if (!savedPage) {
      goToPage(1);
    } else {
      goToPage(Number(savedPage));
    }
  }
}
