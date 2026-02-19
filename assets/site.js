/* GrarDolly Site JS
   - Right drawer (mobile slide-in, desktop collapsible)
   - Year injection
   - Accessibility: font scale persistence
*/

(function () {
    "use strict";

    const qs = (sel, root = document) => root.querySelector(sel);
    const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    // Year
    qsa("[data-gd-year]").forEach((el) => {
        el.textContent = String(new Date().getFullYear());
    });

    // Drawer
    const drawer = qs("[data-gd-drawer]");
    const overlay = qs("[data-gd-drawer-overlay]");
    const btnOpen = qs("[data-gd-drawer-open]");
    const btnClose = qs("[data-gd-drawer-close]");
    const btnCollapse = qs("[data-gd-drawer-collapse]");

    const isDesktop = () => window.matchMedia("(min-width: 980px)").matches;

    function setOverlayVisible(visible) {
        if (!overlay) return;
        overlay.hidden = !visible;
    }

    function openDrawer() {
        if (!drawer) return;
        drawer.setAttribute("data-gd-open", "true");
        if (btnOpen) btnOpen.setAttribute("aria-expanded", "true");
        if (!isDesktop()) setOverlayVisible(true);
    }

    function closeDrawer() {
        if (!drawer) return;

        // On desktop, drawer stays present; on mobile, it closes.
        if (isDesktop()) {
            setOverlayVisible(false);
            if (btnOpen) btnOpen.setAttribute("aria-expanded", "false");
            return;
        }

        drawer.setAttribute("data-gd-open", "false");
        if (btnOpen) btnOpen.setAttribute("aria-expanded", "false");
        setOverlayVisible(false);
    }

    function toggleCollapse() {
        if (!drawer) return;
        const collapsed = drawer.getAttribute("data-gd-collapsed") === "true";
        drawer.setAttribute("data-gd-collapsed", collapsed ? "false" : "true");
    }

    // Default behavior: desktop = open, mobile = closed
    function syncDrawerMode() {
        if (!drawer) return;

        if (isDesktop()) {
            drawer.setAttribute("data-gd-open", "true");
            setOverlayVisible(false);
        } else {
            drawer.setAttribute("data-gd-open", "false");
            drawer.setAttribute("data-gd-collapsed", "false");
            setOverlayVisible(false);
            if (btnOpen) btnOpen.setAttribute("aria-expanded", "false");
        }
    }

    if (btnOpen) btnOpen.addEventListener("click", openDrawer);
    if (btnClose) btnClose.addEventListener("click", closeDrawer);
    if (overlay) overlay.addEventListener("click", closeDrawer);
    if (btnCollapse) btnCollapse.addEventListener("click", toggleCollapse);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeDrawer();
    });

    window.addEventListener("resize", syncDrawerMode);
    syncDrawerMode();

    // Accessibility: font scaling (90–130)
    const shell = qs(".gd-shell");
    const a11yToggle = qs("[data-gd-a11y-toggle]");
    const a11yPanel = qs("[data-gd-a11y-panel]");
    const dec = qs("[data-gd-font-dec]");
    const inc = qs("[data-gd-font-inc]");
    const reset = qs("[data-gd-font-reset]");

    const KEY = "gd_fontscale_v1";
    const ALLOWED = ["90", "100", "110", "120", "130"];

    function applyScale(value) {
        if (!shell) return;
        const v = ALLOWED.includes(String(value)) ? String(value) : "100";
        shell.setAttribute("data-gd-fontscale", v);
        try { localStorage.setItem(KEY, v); } catch (_) { }
    }

    function readScale() {
        try {
            const v = localStorage.getItem(KEY);
            if (v && ALLOWED.includes(v)) return v;
        } catch (_) { }
        return "100";
    }

    function stepScale(dir) {
        const current = readScale();
        const idx = ALLOWED.indexOf(current);
        const nextIdx = Math.min(ALLOWED.length - 1, Math.max(0, idx + dir));
        applyScale(ALLOWED[nextIdx]);
    }

    applyScale(readScale());

    function toggleA11yPanel() {
        if (!a11yPanel) return;
        const isHidden = a11yPanel.hidden === true;
        a11yPanel.hidden = !isHidden;
    }

    if (a11yToggle) a11yToggle.addEventListener("click", toggleA11yPanel);
    if (dec) dec.addEventListener("click", () => stepScale(-1));
    if (inc) inc.addEventListener("click", () => stepScale(+1));
    if (reset) reset.addEventListener("click", () => applyScale("100"));

    // Close panel when clicking outside
    document.addEventListener("click", (e) => {
        if (!a11yPanel || a11yPanel.hidden) return;
        const inside = a11yPanel.contains(e.target) || (a11yToggle && a11yToggle.contains(e.target));
        if (!inside) a11yPanel.hidden = true;
    });
})();