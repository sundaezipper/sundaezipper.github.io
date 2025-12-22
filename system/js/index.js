// ---- index.js ----
// Safe global UI logic (popup, dashboard, scroll-to-top, profile pic)
// Designed to coexist with reports, assets, and special pages

document.addEventListener("DOMContentLoaded", () => {
  /* ---------------------------
     Page Context Detection
  --------------------------- */
  const PAGE = {
    hasReports: !!document.getElementById("reports"),
    hasAssets: !!document.querySelector(".asset-card"),
  };

  /* ---------------------------
     Cached DOM elements
  --------------------------- */
  const popup = document.getElementById("updatePopup");
  const video = document.getElementById("updateVideo");
  const closeBtn = document.getElementById("closeUpdateBtn");
  const viewUpdateBtn = document.getElementById("viewUpdateBtn");
  const viewInfoBtn = document.getElementById("viewUpdateInfoBtn");
  const dontShowBtn = document.getElementById("dontShowBtn");

  const dashboardMenu = document.getElementById("dashboardMenu");
  const dashboardBtn = document.getElementById("dashboardBtn");

  const toTopBtn = document.getElementById("toTopBtn");
  const pfp = document.getElementById("pfp");

  /* ---------------------------
     UPDATE POPUP (safe)
  --------------------------- */
  if (popup) {
    const currentVersion = "v0.8";
    const storedVersion = localStorage.getItem("dismissedUpdateVersion");

    const stopVideo = () => {
      if (!video) return;
      const src = video.src;
      video.src = "";
      video.src = src;
    };

    const closePopup = () => {
      popup.classList.remove("show");
      sessionStorage.setItem("updatePopupClosed", "true");
      stopVideo();
    };

    const showPopup = () => {
      if (
        storedVersion === currentVersion ||
        sessionStorage.getItem("updatePopupClosed")
      )
        return;

      setTimeout(() => popup.classList.add("show"), 1500);
    };

    closeBtn?.addEventListener("click", closePopup);

    dontShowBtn?.addEventListener("click", () => {
      localStorage.setItem("dismissedUpdateVersion", currentVersion);
      closePopup();
    });

    viewUpdateBtn?.addEventListener("click", () =>
      window.open("system/pages/updates.html", "_blank")
    );

    viewInfoBtn?.addEventListener("click", () =>
      window.open("system/pages/update-info.html", "_blank")
    );

    showPopup();
  }

  /* ---------------------------
     DASHBOARD TOGGLE (isolated)
  --------------------------- */
  if (dashboardBtn && dashboardMenu) {
    dashboardMenu.style.display = "none";
    dashboardMenu.style.opacity = "0";
    dashboardMenu.style.transition = "opacity 0.3s ease";

    const openDashboard = () => {
      dashboardMenu.style.display = "block";
      dashboardMenu.setAttribute("aria-hidden", "false");
      dashboardBtn.setAttribute("aria-expanded", "true");
      requestAnimationFrame(() => (dashboardMenu.style.opacity = "1"));
    };

    const closeDashboard = () => {
      dashboardMenu.style.opacity = "0";
      dashboardBtn.setAttribute("aria-expanded", "false");
      dashboardMenu.setAttribute("aria-hidden", "true");
      setTimeout(() => (dashboardMenu.style.display = "none"), 300);
    };

    dashboardBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = dashboardMenu.style.display === "block";
      open ? closeDashboard() : openDashboard();
    });

    document.addEventListener("click", (e) => {
      if (
        dashboardMenu.style.display === "block" &&
        !dashboardMenu.contains(e.target) &&
        e.target !== dashboardBtn
      ) {
        closeDashboard();
      }
    });
  }

  /* ---------------------------
     SCROLL TO TOP (passive)
  --------------------------- */
  if (toTopBtn) {
    const updateVisibility = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      toTopBtn.style.display = y > 200 ? "block" : "none";
    };

    window.addEventListener("scroll", updateVisibility, { passive: true });

    toTopBtn.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );

    toTopBtn.addEventListener("dblclick", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );

    updateVisibility();
  }

  /* ---------------------------
     PROFILE PICTURE (local-only)
  --------------------------- */
  if (pfp) {
    const savedPic = localStorage.getItem("profilePic");
    if (savedPic) pfp.src = savedPic;
  }

  console.log(
    "✅ index.js ready",
    PAGE.hasReports ? "(reports page)" : ""
  );
});
