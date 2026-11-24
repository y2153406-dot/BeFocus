
(() => {
    "use strict";

    // ========================================
    // 1. DOM Elements
    // ========================================

    const root = document.documentElement;

    const appContainer = document.querySelector(".app-container");

    const wallpaperScreen = document.getElementById("wallpaper-screen");

    const gallery = document.getElementById("wallpaper-gallery");

    const openWallpaperButton = document.getElementById("open-wallpaper-btn");

    const backToHomeButton = document.getElementById("back-to-home-btn");

    const filterButtons = document.querySelectorAll(".wallpaper-filter");

    const randomButton = document.getElementById("random-wallpaper-btn");


    // ========================================
    // 2. Wallpaper State
    // ========================================

    let wallpapers = [];

    let selectedWallpaper = null;

    let activeCategory = "all";

    const STORAGE_KEY = "beFocus:selectedWallpaper";


    // ========================================
    // 3. Screen Navigation
    // ========================================

    function openWallpaperScreen() {

        appContainer.hidden = true;

        wallpaperScreen.hidden = false;

        window.scrollTo(0, 0);
    }


    function returnToHomeScreen() {

        wallpaperScreen.hidden = true;

        appContainer.hidden = false;

        window.scrollTo(0, 0);
    }


    // Navigation Events

    openWallpaperButton.addEventListener(
        "click",
        openWallpaperScreen
    );

    backToHomeButton.addEventListener(
        "click",
        returnToHomeScreen
    );


    // ========================================
    // 4. Categorize Wallpapers
    // ========================================

    function getWallpaperCategory(wallpaper) {

        const name = wallpaper.name.toLowerCase();

        // Cyberpunk Category

        if (
            name.includes("cyberpunk") ||
            name.includes("neon") ||
            name.includes("cityscape") ||
            name.includes("katana")
        ) {
            return "cyberpunk";
        }

        // Anime Category

        if (
            name.includes("anime") ||
            name.includes("cherry blossom") ||
            name.includes("warrior") ||
            name.includes("lantern") ||
            name.includes("samurai")
        ) {
            return "anime";
        }

        // Default Category

        return "nature";
    }


    // ========================================
    // 5. Change Wallpaper
    // ========================================

    function changeWallpaper(wallpaper) {

        if (!wallpaper) {

            console.error("Wallpaper not found.");

            return;
        }

        const image = new Image();

        const imageURL = new URL(
            wallpaper.src,
            document.baseURI
        ).href;


        image.onload = () => {

            // Update Background

            root.style.setProperty(
                "--wallpaper-image",
                `linear-gradient(
                    rgba(0, 0, 0, 0.25),
                    rgba(0, 0, 0, 0.25)
                ), url("${imageURL}")`
            );


            // Restart Fade Animation

            document.body.classList.remove("wallpaper-fade");

            void document.body.offsetWidth;

            document.body.classList.add("wallpaper-fade");


            // Update Selected Wallpaper

            selectedWallpaper = wallpaper;


            // Save Selected Wallpaper

            try {

                localStorage.setItem(
                    STORAGE_KEY,
                    wallpaper.id
                );

            } catch (error) {

                console.error(
                    "Unable to save selected wallpaper:",
                    error
                );

            }


            updateSelectedWallpaper();


            console.log(
                "Wallpaper changed successfully:",
                wallpaper.name
            );


            // Return to Main Screen

            returnToHomeScreen();

        };


        image.onerror = () => {

            console.error(
                "Wallpaper failed to load:",
                imageURL
            );

        };


        image.src = imageURL;
    }


    // ========================================
    // 6. Update Selected Wallpaper
    // ========================================

    function updateSelectedWallpaper() {

        const cards = gallery.querySelectorAll(".wallpaper-card");

        cards.forEach((card) => {

            card.classList.toggle(
                "active",
                card.dataset.wallpaperId === selectedWallpaper?.id
            );

        });

    }


    // ========================================
    // 7. Create Wallpaper Card
    // ========================================

    function createWallpaperCard(wallpaper) {

        const card = document.createElement("button");

        card.type = "button";

        card.className = "wallpaper-card";

        card.dataset.wallpaperId = wallpaper.id;

        card.setAttribute(
            "aria-label",
            `Select wallpaper ${wallpaper.name}`
        );


        // Wallpaper Image

        const image = document.createElement("img");

        image.src = wallpaper.src;

        image.alt = wallpaper.name;

        image.loading = "lazy";


        // Wallpaper Name

        const name = document.createElement("div");

        name.className = "wallpaper-card-name";

        name.textContent = wallpaper.name;


        card.appendChild(image);

        card.appendChild(name);


        // Select Wallpaper

        card.addEventListener("click", () => {

            changeWallpaper(wallpaper);

        });


        return card;
    }


    // ========================================
    // 8. Render Wallpaper Gallery
    // ========================================

    function renderGallery() {

        gallery.innerHTML = "";


        const filteredWallpapers = wallpapers.filter((wallpaper) => {

            if (activeCategory === "all") {

                return true;

            }

            return wallpaper.category === activeCategory;

        });


        filteredWallpapers.forEach((wallpaper) => {

            const card = createWallpaperCard(wallpaper);

            gallery.appendChild(card);

        });


        updateSelectedWallpaper();


        if (filteredWallpapers.length === 0) {

            gallery.textContent = "No wallpapers found.";

        }

    }


    // ========================================
    // 9. Category Filter Events
    // ========================================

    filterButtons.forEach((button) => {

        button.addEventListener("click", () => {

            activeCategory = button.dataset.category;


            filterButtons.forEach((filter) => {

                filter.classList.toggle(
                    "active",
                    filter === button
                );

            });


            renderGallery();

        });

    });


    // ========================================
    // 10. Random Wallpaper
    // ========================================

    randomButton.addEventListener("click", () => {

        if (wallpapers.length === 0) {

            return;

        }


        const availableWallpapers = wallpapers.filter(
            (wallpaper) => wallpaper.id !== selectedWallpaper?.id
        );


        const randomIndex = Math.floor(
            Math.random() * availableWallpapers.length
        );


        const randomWallpaper = availableWallpapers.length
            ? availableWallpapers[randomIndex]
            : wallpapers[0];


        changeWallpaper(randomWallpaper);

    });


    // ========================================
    // 11. Load Wallpapers (Electron + PWA)
    // ========================================

    async function loadWallpapers() {

        try {

            // Electron Environment

            if (window.beFocus?.getWallpapers) {

                wallpapers = await window.beFocus.getWallpapers();

            }

            // Browser / PWA Environment

            else {

                const response = await fetch(
                    "./assets/wallpapers.json"
                );

                if (!response.ok) {

                    throw new Error(
                        `Failed to load wallpapers.json: ${response.status}`
                    );

                }

                wallpapers = await response.json();

            }


            // Validate Wallpaper Data

            if (!Array.isArray(wallpapers) || wallpapers.length === 0) {

                gallery.textContent = "No wallpapers available.";

                console.warn("No wallpapers found.");

                return;

            }


            // Assign Categories

            wallpapers = wallpapers.map((wallpaper) => ({

                ...wallpaper,

                category: getWallpaperCategory(wallpaper)

            }));


            // Render Gallery

            renderGallery();


            // Get Previously Selected Wallpaper

            let savedWallpaperId = null;

            try {

                savedWallpaperId = localStorage.getItem(STORAGE_KEY);

            } catch (error) {

                console.error(
                    "Unable to read saved wallpaper:",
                    error
                );

            }


            // Restore Saved Wallpaper

            const savedWallpaper = wallpapers.find(
                (wallpaper) => wallpaper.id === savedWallpaperId
            );


            // Fallback to Default Wallpaper

            const defaultWallpaper = wallpapers.find(
                (wallpaper) =>
                    wallpaper.name.toLowerCase() === "mountain"
            ) || wallpapers[0];


            // Select Saved Wallpaper or Default Wallpaper

            const wallpaperToLoad = savedWallpaper || defaultWallpaper;

            changeWallpaper(wallpaperToLoad);


            console.log(
                "Total wallpapers loaded:",
                wallpapers.length
            );


            if (savedWallpaper) {

                console.log(
                    "Previous wallpaper restored:",
                    savedWallpaper.name
                );

            } else {

                console.log(
                    "Default wallpaper loaded:",
                    defaultWallpaper.name
                );

            }


        } catch (error) {

            console.error(
                "Unable to load wallpapers:",
                error
            );

            gallery.textContent = "Unable to load wallpapers.";

        }

    }


    // ========================================
    // 12. Initialize Wallpaper System
    // ========================================

    loadWallpapers();

})();
