document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    const body = document.body;
    const pageType = body.dataset.pageType || "";
    const isChapter = pageType === "chapter";
    const mobileQuery = window.matchMedia("(max-width: 760px)");

    /* ======================================================
       Helpers
    ====================================================== */

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const safeParse = (value) => {
        try {
            return JSON.parse(value);
        } catch (error) {
            return null;
        }
    };

    const setBodyOverlayState = () => {
        const anyOpen =
            document.querySelector(".chapter-drawer.is-open") ||
            document.querySelector(".reader-sheet.is-open") ||
            document.querySelector(".chapter-search.is-open") ||
            document.querySelector(".mobile-reader-menu.is-open");

        body.classList.toggle("is-overlay-open", Boolean(anyOpen));
    };

    const closeMobileControls = () => {
        body.classList.remove("reader-controls-visible");
    };

    /* ======================================================
       Theme
    ====================================================== */

    const themeToggles = document.querySelectorAll(".theme-toggle");
    const themeChoices = document.querySelectorAll("[data-theme-choice]");
    const themeMeta = document.querySelector('meta[name="theme-color"]');

    function getTheme() {
        return root.getAttribute("data-theme") || "light";
    }

    function updateThemeUI() {
        const theme = getTheme();

        themeToggles.forEach((toggle) => {
            const icon = toggle.querySelector(".theme-toggle-icon");
            if (icon) icon.textContent = theme === "dark" ? "☼" : "☾";
            toggle.setAttribute(
                "aria-label",
                theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            );
        });

        themeChoices.forEach((button) => {
            button.classList.toggle(
                "is-active",
                button.dataset.themeChoice === theme
            );
        });

        if (themeMeta) {
            themeMeta.setAttribute(
                "content",
                theme === "dark" ? "#141719" : "#f7f8f8"
            );
        }
    }

    function setTheme(theme) {
        root.setAttribute("data-theme", theme);
        localStorage.setItem("diamond-dust-theme", theme);
        updateThemeUI();
    }

    themeToggles.forEach((toggle) => {
        toggle.addEventListener("click", () => {
            setTheme(getTheme() === "dark" ? "light" : "dark");
        });
    });

    themeChoices.forEach((button) => {
        button.addEventListener("click", () => setTheme(button.dataset.themeChoice));
    });

    updateThemeUI();

    /* ======================================================
       Reader preferences
    ====================================================== */

    const fontChoices = document.querySelectorAll("[data-font-choice]");
    const fontSizeInput = document.querySelector("#reader-font-size");
    const fontSizeValue = document.querySelector("#reader-font-size-value");
    const lineHeightInput = document.querySelector("#reader-line-height");
    const lineHeightValue = document.querySelector("#reader-line-height-value");
    const resetReader = document.querySelector("[data-reader-reset]");

    const fontSizeOptions = [16, 18, 20, 22, 24, 26, 30, 34];

    const readerDefaults = {
        font: "source",
        size: 20,
        lineHeight: 1.6
    };

    const nearestFontSize = (value) => fontSizeOptions.reduce((closest, option) =>
        Math.abs(option - value) < Math.abs(closest - value) ? option : closest
    );

    function getReaderPrefs() {
        const stored = safeParse(localStorage.getItem("diamond-dust-reader-settings"));

        return {
            font: stored?.font || readerDefaults.font,
            size: nearestFontSize(Number(stored?.size) || readerDefaults.size),
            lineHeight: clamp(
                Number(stored?.lineHeight) || readerDefaults.lineHeight,
                1.4,
                1.8
            )
        };
    }

    function saveReaderPrefs(prefs) {
        localStorage.setItem(
            "diamond-dust-reader-settings",
            JSON.stringify(prefs)
        );
    }

    function applyReaderPrefs(prefs) {
        root.setAttribute("data-reader-font", prefs.font);
        root.style.setProperty("--reader-font-size", `${prefs.size}px`);
        root.style.setProperty("--reader-line-height", prefs.lineHeight);

        fontChoices.forEach((button) => {
            button.classList.toggle(
                "is-active",
                button.dataset.fontChoice === prefs.font
            );
        });

        if (fontSizeInput) {
            const sizeIndex = Math.max(0, fontSizeOptions.indexOf(prefs.size));
            fontSizeInput.value = sizeIndex;
            fontSizeInput.setAttribute("aria-valuetext", `${prefs.size} pixels`);
        }
        if (fontSizeValue) fontSizeValue.textContent = `${prefs.size}px`;
        if (lineHeightInput) lineHeightInput.value = prefs.lineHeight;
        if (lineHeightValue) {
            lineHeightValue.textContent = Number(prefs.lineHeight).toFixed(1);
        }
    }

    let readerPrefs = getReaderPrefs();
    applyReaderPrefs(readerPrefs);

    fontChoices.forEach((button) => {
        button.addEventListener("click", () => {
            readerPrefs.font = button.dataset.fontChoice;
            saveReaderPrefs(readerPrefs);
            applyReaderPrefs(readerPrefs);
        });
    });

    if (fontSizeInput) {
        fontSizeInput.addEventListener("input", () => {
            readerPrefs.size = fontSizeOptions[Number(fontSizeInput.value)] || readerDefaults.size;
            saveReaderPrefs(readerPrefs);
            applyReaderPrefs(readerPrefs);
        });
    }

    if (lineHeightInput) {
        lineHeightInput.addEventListener("input", () => {
            readerPrefs.lineHeight = Number(lineHeightInput.value);
            saveReaderPrefs(readerPrefs);
            applyReaderPrefs(readerPrefs);
        });
    }

    if (resetReader) {
        resetReader.addEventListener("click", () => {
            readerPrefs = { ...readerDefaults };
            saveReaderPrefs(readerPrefs);
            applyReaderPrefs(readerPrefs);
        });
    }

    /* ======================================================
       Mobile immersive controls
    ====================================================== */

    const mobileMenu = document.querySelector(".mobile-reader-menu");
    const mobileMenuTrigger = document.querySelector(".mobile-reader-menu-trigger");
    const mobileMenuBackdrop = document.querySelector(".mobile-menu-backdrop");
    const mobileMenuClosers = document.querySelectorAll("[data-mobile-menu-close]");
    const chapterArticle = document.querySelector(".chapter");

    const updateMobileNavPosition = () => {
    const banner = document.getElementById("site-update-banner");
    const nav = document.querySelector(".mobile-reader-controls");

    if (!nav || !isChapter || !mobileQuery.matches) return;

    if (!banner || banner.hidden) {
        nav.style.top = "0px";
        return;
    }

    const bannerBottom = banner.getBoundingClientRect().bottom;
    nav.style.top = `${Math.max(0, bannerBottom)}px`;
};

updateMobileNavPosition();

window.addEventListener("scroll", updateMobileNavPosition, { passive: true });
window.addEventListener("resize", updateMobileNavPosition);


    function showMobileControls() {
        if (!isChapter || !mobileQuery.matches) return;
        body.classList.add("reader-controls-visible");
        updateBackToTop?.();
    }

    function toggleMobileControls() {
        if (!isChapter || !mobileQuery.matches || body.classList.contains("is-overlay-open")) return;
        body.classList.toggle("reader-controls-visible");
        updateBackToTop?.();
    }

    function openMobileMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.add("is-open");
        mobileMenu.setAttribute("aria-hidden", "false");
        if (mobileMenuBackdrop) mobileMenuBackdrop.hidden = false;
        if (mobileMenuTrigger) mobileMenuTrigger.setAttribute("aria-expanded", "true");
        setBodyOverlayState();
        backToTop?.classList.remove("is-visible");
    }

    function closeMobileMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.remove("is-open");
        mobileMenu.setAttribute("aria-hidden", "true");
        if (mobileMenuBackdrop) mobileMenuBackdrop.hidden = true;
        if (mobileMenuTrigger) mobileMenuTrigger.setAttribute("aria-expanded", "false");
        setBodyOverlayState();
        updateBackToTop?.();
    }

    if (chapterArticle) {
        chapterArticle.addEventListener("click", (event) => {
            if (!mobileQuery.matches) return;
            if (event.target.closest("a, button, input, mark, .sticky-note")) return;
            toggleMobileControls();
        });
    }

    if (mobileMenuTrigger) {
        mobileMenuTrigger.addEventListener("click", (event) => {
            event.stopPropagation();
            openMobileMenu();
        });
    }

    mobileMenuClosers.forEach((button) => button.addEventListener("click", closeMobileMenu));

    /* ======================================================
       Chapter contents
    ====================================================== */

    const chapterDrawer = document.querySelector(".chapter-drawer");
    const drawerBackdrop = document.querySelector(".drawer-backdrop");
    const drawerTriggers = document.querySelectorAll(".chapter-drawer-trigger");
    const drawerClosers = document.querySelectorAll("[data-drawer-close]");

    function openDrawer() {
        if (!chapterDrawer) return;

        closeMobileMenu();
        closeReaderSheet();
        closeSearch();
        chapterDrawer.classList.add("is-open");
        chapterDrawer.setAttribute("aria-hidden", "false");
        if (drawerBackdrop) drawerBackdrop.hidden = false;
        drawerTriggers.forEach((button) => button.setAttribute("aria-expanded", "true"));
        setBodyOverlayState();

        const current = chapterDrawer.querySelector(".drawer-chapter-link.is-current");
        if (current) {
            requestAnimationFrame(() => current.scrollIntoView({ block: "center" }));
        }
    }

    function closeDrawer() {
        if (!chapterDrawer) return;

        chapterDrawer.classList.remove("is-open");
        chapterDrawer.setAttribute("aria-hidden", "true");
        if (drawerBackdrop) drawerBackdrop.hidden = true;
        drawerTriggers.forEach((button) => button.setAttribute("aria-expanded", "false"));
        setBodyOverlayState();
    }

    drawerTriggers.forEach((button) => button.addEventListener("click", openDrawer));
    drawerClosers.forEach((button) => button.addEventListener("click", closeDrawer));

    /* ======================================================
       Reader settings
    ====================================================== */

    const readerSheet = document.querySelector(".reader-sheet");
    const readerSheetBackdrop = document.querySelector(".reader-sheet-backdrop");
    const readerSheetTriggers = document.querySelectorAll(".reader-settings-trigger");
    const readerSheetClosers = document.querySelectorAll("[data-reader-sheet-close]");

    function openReaderSheet() {
        if (!readerSheet) return;

        closeMobileMenu();
        closeDrawer();
        closeSearch();
        readerSheet.classList.add("is-open");
        readerSheet.setAttribute("aria-hidden", "false");
        if (readerSheetBackdrop) readerSheetBackdrop.hidden = false;
        readerSheetTriggers.forEach((button) => button.setAttribute("aria-expanded", "true"));
        setBodyOverlayState();
    }

    function closeReaderSheet() {
        if (!readerSheet) return;

        readerSheet.classList.remove("is-open");
        readerSheet.setAttribute("aria-hidden", "true");
        if (readerSheetBackdrop) readerSheetBackdrop.hidden = true;
        readerSheetTriggers.forEach((button) => button.setAttribute("aria-expanded", "false"));
        setBodyOverlayState();
    }

    readerSheetTriggers.forEach((button) => button.addEventListener("click", openReaderSheet));
    readerSheetClosers.forEach((button) => button.addEventListener("click", closeReaderSheet));

    /* ======================================================
       Search current chapter
    ====================================================== */

    const searchSheet = document.querySelector(".chapter-search");
    const searchBackdrop = document.querySelector(".chapter-search-backdrop");
    const searchTriggers = document.querySelectorAll(".chapter-search-trigger");
    const searchClosers = document.querySelectorAll("[data-search-close]");
    const searchInput = document.querySelector("[data-chapter-search-input]");
    const searchCount = document.querySelector("[data-search-count]");
    const searchNav = document.querySelector(".chapter-search-nav");
    const searchPrev = document.querySelector("[data-search-prev]");
    const searchNext = document.querySelector("[data-search-next]");
    const chapterContent = document.querySelector(".chapter-content");

    let searchMarks = [];
    let activeSearchIndex = -1;

    function clearSearchHighlights() {
        document.querySelectorAll("mark.reader-search-match").forEach((mark) => {
            const parent = mark.parentNode;
            mark.replaceWith(document.createTextNode(mark.textContent));
            if (parent) parent.normalize();
        });
        searchMarks = [];
        activeSearchIndex = -1;
    }

    function setActiveSearchMatch(index) {
        if (!searchMarks.length) return;

        activeSearchIndex = (index + searchMarks.length) % searchMarks.length;
        searchMarks.forEach((mark, i) => {
            mark.classList.toggle("is-active", i === activeSearchIndex);
        });

        const active = searchMarks[activeSearchIndex];
        active.scrollIntoView({ behavior: "smooth", block: "center" });

        if (searchCount) {
            searchCount.textContent = `${activeSearchIndex + 1} of ${searchMarks.length} matches`;
        }
    }

    function runChapterSearch(query) {
        clearSearchHighlights();

        const term = query.trim();
        if (!term || !chapterContent) {
            if (searchCount) searchCount.textContent = "Type to search this chapter";
            if (searchNav) searchNav.hidden = true;
            return;
        }

        const walker = document.createTreeWalker(
            chapterContent,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                    if (node.parentElement?.closest("script, style, mark")) return NodeFilter.FILTER_REJECT;
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const nodes = [];
        let node;
        while ((node = walker.nextNode())) nodes.push(node);

        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escaped, "gi");

        nodes.forEach((textNode) => {
            const text = textNode.nodeValue;
            regex.lastIndex = 0;
            if (!regex.test(text)) return;
            regex.lastIndex = 0;

            const fragment = document.createDocumentFragment();
            let lastIndex = 0;
            let match;

            while ((match = regex.exec(text)) !== null) {
                fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
                const mark = document.createElement("mark");
                mark.className = "reader-search-match";
                mark.textContent = match[0];
                fragment.appendChild(mark);
                lastIndex = match.index + match[0].length;
                if (match[0].length === 0) regex.lastIndex += 1;
            }

            fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
            textNode.replaceWith(fragment);
        });

        searchMarks = Array.from(document.querySelectorAll("mark.reader-search-match"));

        if (!searchMarks.length) {
            if (searchCount) searchCount.textContent = "No matches";
            if (searchNav) searchNav.hidden = true;
            return;
        }

        if (searchNav) searchNav.hidden = false;
        setActiveSearchMatch(0);
    }

    function openSearch() {
        if (!searchSheet) return;

        closeMobileMenu();
        searchSheet.classList.add("is-open");
        searchSheet.setAttribute("aria-hidden", "false");
        if (searchBackdrop) searchBackdrop.hidden = false;
        searchTriggers.forEach((button) => button.setAttribute("aria-expanded", "true"));
        setBodyOverlayState();
        window.setTimeout(() => searchInput?.focus(), 180);
    }

    function closeSearch() {
        if (!searchSheet) return;

        searchSheet.classList.remove("is-open");
        searchSheet.setAttribute("aria-hidden", "true");
        if (searchBackdrop) searchBackdrop.hidden = true;
        searchTriggers.forEach((button) => button.setAttribute("aria-expanded", "false"));
        clearSearchHighlights();
        if (searchInput) searchInput.value = "";
        if (searchCount) searchCount.textContent = "Type to search this chapter";
        if (searchNav) searchNav.hidden = true;
        setBodyOverlayState();
    }

    searchTriggers.forEach((button) => button.addEventListener("click", openSearch));
    searchClosers.forEach((button) => button.addEventListener("click", closeSearch));

    if (searchInput) {
        searchInput.addEventListener("input", () => runChapterSearch(searchInput.value));
    }
    if (searchPrev) searchPrev.addEventListener("click", () => setActiveSearchMatch(activeSearchIndex - 1));
    if (searchNext) searchNext.addEventListener("click", () => setActiveSearchMatch(activeSearchIndex + 1));

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMobileMenu();
            closeDrawer();
            closeReaderSheet();
            closeSearch();
            return;
        }

        if (!isChapter || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
        if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
        if (body.classList.contains("is-overlay-open")) return;

        const target = event.target;
        const isEditing = target instanceof HTMLElement && (
            target.matches("input, textarea, select, button") ||
            target.isContentEditable
        );
        if (isEditing) return;

        const destination = event.key === "ArrowLeft"
            ? document.querySelector(".chapter-nav-previous")
            : document.querySelector(".chapter-nav-next");

        if (destination?.href) {
            event.preventDefault();
            window.location.assign(destination.href);
        }
    });

    /* ======================================================
       Mobile sheet drag-to-dismiss
    ====================================================== */

    function enableDragToDismiss(sheet, closeFn) {
        if (!sheet) return;

        const handle = sheet.querySelector("[data-sheet-drag-handle]");
        const interactiveSelector = "button, a, input, textarea, select, label";

        let startY = 0;
        let currentY = 0;
        let dragging = false;
        let pointerId = null;

        const resetInlineMotion = () => {
            sheet.style.removeProperty("transition");
            sheet.style.removeProperty("transform");
        };

        sheet.addEventListener("pointerdown", (event) => {
            if (!mobileQuery.matches || !sheet.classList.contains("is-open")) return;
            if (event.target.closest(interactiveSelector)) return;

            const sheetRect = sheet.getBoundingClientRect();
            const startedOnHandle = Boolean(
                handle && (event.target === handle || handle.contains(event.target))
            );
            const startedInTopZone = event.clientY <= sheetRect.top + 44;

            if (!startedOnHandle && !startedInTopZone) return;

            dragging = true;
            pointerId = event.pointerId;
            startY = event.clientY;
            currentY = startY;

            sheet.setPointerCapture?.(pointerId);
            sheet.style.transition = "none";
        });

        sheet.addEventListener("pointermove", (event) => {
            if (!dragging || event.pointerId !== pointerId) return;

            currentY = event.clientY;
            const distance = Math.max(0, currentY - startY);
            sheet.style.transform = `translateY(${distance}px)`;
            event.preventDefault();
        });

        const finishDrag = (event) => {
            if (!dragging || event.pointerId !== pointerId) return;

            dragging = false;
            sheet.releasePointerCapture?.(pointerId);
            pointerId = null;

            const distance = Math.max(0, currentY - startY);
            const shouldClose = distance > 72;
            sheet.style.transition = "transform 0.2s ease";

            if (shouldClose) {
                sheet.style.transform = "translateY(105%)";
                window.setTimeout(() => {
                    closeFn();
                    resetInlineMotion();
                }, 190);
            } else {
                sheet.style.transform = "translateY(0)";
                window.setTimeout(resetInlineMotion, 200);
            }
        };

        sheet.addEventListener("pointerup", finishDrag);
        sheet.addEventListener("pointercancel", finishDrag);
    }

    enableDragToDismiss(mobileMenu, closeMobileMenu);
    enableDragToDismiss(chapterDrawer, closeDrawer);
    enableDragToDismiss(readerSheet, closeReaderSheet);
    enableDragToDismiss(searchSheet, closeSearch);

    /* ======================================================
       Reading progress + saved position
    ====================================================== */

    const progressBar = document.querySelector(".reading-progress-bar");
    const backToTop = document.querySelector(".scroll-top-button");

    const chapterNumber = body.dataset.chapterNumber;
    const chapterTitle = body.dataset.chapterTitle;
    const chapterStorageKey = `diamond-dust-progress-${window.location.pathname}`;
    const savedPosition = Number(localStorage.getItem(chapterStorageKey)) || 0;

    let latestPercent = 0;
    let saveTimer = null;
    let lastScrollY = window.scrollY;

    function calculateProgress() {
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (documentHeight <= 0) return 0;
        return clamp((window.scrollY / documentHeight) * 100, 0, 100);
    }

    function updateProgress() {
        if (!progressBar) return;

        latestPercent = calculateProgress();

        if (mobileQuery.matches) {
            progressBar.style.height = `${latestPercent}%`;
            progressBar.style.width = "100%";
        } else {
            progressBar.style.width = `${latestPercent}%`;
            progressBar.style.height = "100%";
        }
    }

    function updateBackToTop() {
        if (!backToTop) return;

        const mobileControlsAllowIt = !mobileQuery.matches || body.classList.contains("reader-controls-visible");
        const shouldShow = window.scrollY > 650 &&
            !body.classList.contains("is-overlay-open") &&
            mobileControlsAllowIt;

        backToTop.classList.toggle("is-visible", shouldShow);
    }

    function saveReadingState() {
        if (!isChapter || !chapterNumber) return;

        if (window.scrollY > 120) {
            localStorage.setItem(chapterStorageKey, String(Math.round(window.scrollY)));
        }

        const state = {
            url: window.location.pathname,
            chapterNumber,
            title: chapterTitle || "",
            position: Math.round(window.scrollY),
            percent: Math.round(latestPercent),
            updatedAt: Date.now()
        };

        localStorage.setItem("diamond-dust-last-reading", JSON.stringify(state));
    }

    function scheduleSave() {
        window.clearTimeout(saveTimer);
        saveTimer = window.setTimeout(saveReadingState, 160);
    }

    if (backToTop) {
        backToTop.addEventListener("click", (event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    if (progressBar) {
        window.addEventListener(
            "scroll",
            () => {
                updateProgress();
                updateBackToTop();
                scheduleSave();

                if (mobileQuery.matches) {
                    if (window.scrollY <= 2 && lastScrollY > 2) {
                        // Returning to the top reveals the navigation beneath the announcement.
                        showMobileControls();
                    } else if (window.scrollY > 2 && Math.abs(window.scrollY - lastScrollY) > 8) {
                        closeMobileControls();
                        backToTop?.classList.remove("is-visible");
                    }
                }
                lastScrollY = window.scrollY;
            },
            { passive: true }
        );

        window.addEventListener("pagehide", saveReadingState);
        mobileQuery.addEventListener?.("change", updateProgress);
        updateProgress();
        updateBackToTop();
    }

    /* ======================================================
       Resume within a chapter
    ====================================================== */

    const resumePrompt = document.querySelector(".resume-reading");
    const resumeButton = document.querySelector("[data-resume-reading]");
    const dismissResume = document.querySelector("[data-dismiss-resume]");
    const resumeText = document.querySelector(".resume-reading-text");

    if (isChapter && savedPosition > 320 && resumePrompt) {
        const params = new URLSearchParams(window.location.search);
        const autoResume = params.get("resume") === "1";

        if (autoResume) {
            requestAnimationFrame(() => {
                window.scrollTo({ top: savedPosition, behavior: "auto" });
                updateProgress();
            });
        } else {
            if (resumeText) resumeText.textContent = "Continue where you left off?";
            resumePrompt.hidden = false;
        }
    }

    if (resumeButton && resumePrompt) {
        resumeButton.addEventListener("click", () => {
            window.scrollTo({ top: savedPosition, behavior: "smooth" });
            resumePrompt.hidden = true;
        });
    }

    if (dismissResume && resumePrompt) {
        dismissResume.addEventListener("click", () => {
            resumePrompt.hidden = true;
        });
    }

    /* ======================================================
       Intelligent homepage Start / Continue button
    ====================================================== */

    const startButton = document.querySelector(".start-reading-button");
    const startLabel = document.querySelector(".start-reading-label");
    const continueDetail = document.querySelector(".continue-reading-detail");
    const readingCtaKicker = document.querySelector("[data-reading-cta-kicker]");
    const lastReading = safeParse(localStorage.getItem("diamond-dust-last-reading"));

    if (pageType === "home" && startButton && lastReading?.url) {
        startButton.href = `${lastReading.url}?resume=1`;

        if (startLabel) startLabel.textContent = "Continue Reading";
        if (readingCtaKicker) readingCtaKicker.textContent = "Continue where you left off";

        if (continueDetail) {
            const title = lastReading.title ? ` · ${lastReading.title}` : "";
            continueDetail.textContent = `Chapter ${lastReading.chapterNumber}${title}`;
            continueDetail.hidden = false;
        }
    }

    if (isChapter && mobileQuery.matches) {
        showMobileControls();
    }
});
