document.addEventListener('DOMContentLoaded', () => {
    const categories = document.querySelectorAll('.category-item');
    const bgPreview = document.getElementById('bg-preview');

    // Placeholder images for hover effect
    // In a real scenario, these would be actual paths to user images
    const images = {
        street: 'https://images.unsplash.com/photo-1476994230281-1448088947db?q=80&w=2000&auto=format&fit=crop',
        travel: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000&auto=format&fit=crop',
        portraiture: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=2000&auto=format&fit=crop',
        commissioned: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2000&auto=format&fit=crop'
    };

    const featureImg = document.getElementById('feature-img');

    let activeCategory = null;
    let currentImageIndex = 1;

    // Configuration: How many images per category?
    // You should update this based on your actual file count
    const categoryConfig = {
        'flora': 2, // Updated with actual images
        'lingering_suburbs': 4, // Updated with street images
        'street': 5,
        'travel': 5,
        'portraiture': 5,
        'commissioned': 5
    };

    // Photo data for each category (columns layout - no size classes needed)
    // Photo data loaded from gallery_data.js
    // Fallback to empty if not found
    const photoData = (typeof GALLERY_DATA !== 'undefined') ? GALLERY_DATA : { ritratti: [], paesaggio: [] };

    // Set dynamic images (Homepage & About)
    if (featureImg && photoData && photoData.homepage) {
        featureImg.src = photoData.homepage;
    }

    const aboutImg = document.getElementById('about-profile-img');
    if (aboutImg && photoData && photoData.about) {
        aboutImg.src = photoData.about;
    }

    const photoGrid = document.getElementById('photo-grid');

    async function populatePhotoGrid(category) {
        // 1. Hide grid immediately for smooth transition
        photoGrid.classList.add('hidden');

        // Short delay to allow fade-out if visible (optional)
        // await new Promise(r => setTimeout(r, 100));

        // Clear existing photos
        photoGrid.innerHTML = '';

        // Get photos for this category
        const photos = photoData[category] || [];

        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();

        // Track image loading
        const imagePromises = [];

        // Create photo items
        photos.forEach((photo, index) => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';
            // No size classes needed - columns handle layout

            const img = document.createElement('img');
            img.src = photo.src;
            img.alt = `${category} ${index + 1}`;

            // Optimization: Load top images eagerly to minimize white flash
            if (index < 6) {
                img.loading = 'eager';
            } else {
                img.loading = 'lazy';
            }
            img.decoding = 'async';

            // Create promise for loading (for top items mainly)
            if (index < 6) {
                const p = new Promise(resolve => {
                    if (img.complete) {
                        img.classList.add('loaded');
                        resolve();
                    } else {
                        img.onload = () => {
                            img.classList.add('loaded');
                            resolve();
                        };
                        img.onerror = resolve; // Don't block on error
                    }
                });
                imagePromises.push(p);
            } else {
                // Lazy loaded images also need the class
                img.onload = () => img.classList.add('loaded');
            }

            // Click to open lightbox with index context
            photoItem.addEventListener('click', () => {
                currentLightboxIndex = index;
                currentLightboxContext = photos; // Update context to current category
                openLightbox(photo.src);
            });

            photoItem.appendChild(img);
            fragment.appendChild(photoItem);
        });

        // Append all photos at once
        photoGrid.appendChild(fragment);

        // Wait for top images to load (max 500ms to avoid blocking)
        const timeout = new Promise(r => setTimeout(r, 500));
        await Promise.race([Promise.all(imagePromises), timeout]);

        // Show grid with fade-in
        requestAnimationFrame(() => {
            photoGrid.classList.remove('hidden');
        });
    }

    // Lightbox Logic
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeLightbox = document.getElementById('close-lightbox');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    // State for navigation
    let currentLightboxContext = [];
    let currentLightboxIndex = 0;

    function openLightbox(src) {
        lightboxImg.src = ''; // Clear previous image first
        lightbox.classList.add('active');
        // Set new image after a tiny delay to ensure clearing happens
        setTimeout(() => {
            lightboxImg.src = src;
        }, 10);
    }

    function showNextImage() {
        if (!currentLightboxContext.length) return;
        currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxContext.length;
        const nextSrc = currentLightboxContext[currentLightboxIndex].src;
        // Optimization: Prepend "assets/images/" if stored as relative, but our data has full path
        updateLightboxImage(nextSrc);
    }

    function showPrevImage() {
        if (!currentLightboxContext.length) return;
        currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxContext.length) % currentLightboxContext.length;
        const prevSrc = currentLightboxContext[currentLightboxIndex].src;
        updateLightboxImage(prevSrc);
    }

    function updateLightboxImage(src) {
        // Professional fade transition
        // 1. Fade out completely
        lightboxImg.style.opacity = '0';
        lightboxImg.style.transform = 'scale(0.96)'; // Subtle shrink effect

        setTimeout(() => {
            // 2. Change source after fade out matches CSS transition (300ms)
            lightboxImg.src = src;

            // 3. Wait for load before fading in
            lightboxImg.onload = () => {
                lightboxImg.style.opacity = '1';
                lightboxImg.style.transform = 'scale(1)';
            };

            // Handle cached images immediately
            if (lightboxImg.complete) {
                lightboxImg.style.opacity = '1';
                lightboxImg.style.transform = 'scale(1)';
            }
        }, 300); // Matches CSS opacity transition
    }

    closeLightbox.addEventListener('click', () => {
        lightbox.classList.remove('active');
    });

    // Navigation Click Listeners
    if (nextBtn) nextBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent closing lightbox
        showNextImage();
    });

    if (prevBtn) prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrevImage();
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
        }
    });

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') {
            lightbox.classList.remove('active');
        } else if (e.key === 'ArrowRight') {
            showNextImage();
        } else if (e.key === 'ArrowLeft') {
            showPrevImage();
        }
    });

    // Touch Support for Swipe
    let touchStartX = 0;
    let touchEndX = 0;
    let isMultiTouch = false;

    lightbox.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            isMultiTouch = true;
            return;
        }
        isMultiTouch = false; // Reset on fresh single touch
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchmove', (e) => {
        if (e.touches.length > 1) {
            isMultiTouch = true;
        }
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        if (isMultiTouch) return; // Ignore if it was a zoom/pinch

        if (e.changedTouches.length > 0) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50; // Minimum distance for a swipe
        const diff = touchEndX - touchStartX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff < 0) {
                // Swiped left -> Next image
                showNextImage();
            } else {
                // Swiped right -> Previous image
                showPrevImage();
            }
        }
    }

    // Adjust arrow on window resize
    window.addEventListener('resize', () => {
        // No action needed here after removing adjustLeftArrow
    });

    // Header hide on scroll
    let lastScrollY = window.scrollY;
    let ticking = false;
    const header = document.querySelector('.site-header');
    const horizontalLine = document.querySelector('.horizontal-line');

    function updateHeaderVisibility() {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;

        // Velocity-based detection for ultra-smooth feel
        if (scrollDelta > 2 && currentScrollY > 30) {
            // Gentle scroll down with low threshold
            header.classList.add('hidden-header');
            if (horizontalLine) {
                horizontalLine.style.opacity = '0';
            }
        } else if (scrollDelta < -2) {
            // Any upward scroll brings it back
            header.classList.remove('hidden-header');
            if (horizontalLine) {
                horizontalLine.style.opacity = '0.8';
            }
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateHeaderVisibility);
            ticking = true;
        }
    });

    // Inject SVG Lines for Crisp Rendering (Fixes sub-pixel blur)
    const navLinksForSvg = document.querySelectorAll('.site-nav a');
    navLinksForSvg.forEach(link => {
        // Create SVG namespace
        const ns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, "svg");
        svg.classList.add("nav-lines");
        // shape-rendering="crispEdges" forces no anti-aliasing
        svg.setAttribute("shape-rendering", "crispEdges");

        // Left Line
        const lineLeft = document.createElementNS(ns, "line");
        lineLeft.classList.add("line-left");
        lineLeft.setAttribute("x1", "0"); // Align to left edge
        lineLeft.setAttribute("y1", "0");
        lineLeft.setAttribute("x2", "0");
        lineLeft.setAttribute("y2", "100%"); // Full height (scaled to 0 by CSS initially)

        // Right Line
        const lineRight = document.createElementNS(ns, "line");
        lineRight.classList.add("line-right");
        lineRight.setAttribute("x1", "100%"); // Align to right edge
        lineRight.setAttribute("y1", "0");
        lineRight.setAttribute("x2", "100%");
        lineRight.setAttribute("y2", "100%"); // Full height (scaled to 0 by CSS initially)

        // Bottom Line
        const lineBottom = document.createElementNS(ns, "line");
        lineBottom.classList.add("line-bottom");
        lineBottom.setAttribute("x1", "0");
        lineBottom.setAttribute("y1", "100%"); // Align to bottom edge
        lineBottom.setAttribute("x2", "100%"); // Full width (scaled to 0 by CSS initially)
        lineBottom.setAttribute("y2", "100%");

        svg.appendChild(lineLeft);
        svg.appendChild(lineRight);
        svg.appendChild(lineBottom);

        link.appendChild(svg);
    });
    // Navigation Active State Logic
    const navLinks = document.querySelectorAll('.site-nav a');
    let selectedContext = null; // 'ritratti' or 'paesaggio'

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Only handle hash links internally
            if (href.startsWith('#')) {
                e.preventDefault(); // Prevent anchor jump for internal sections

                // Remove active class from all
                navLinks.forEach(l => l.classList.remove('active'));
                // Add to clicked
                link.classList.add('active');

                // Determine context based on href
                if (href === '#ritratti') {
                    selectedContext = 'ritratti';
                    populatePhotoGrid('ritratti');
                    // Hide homepage image
                    const featureWrapper = document.querySelector('.feature-image-wrapper');
                    if (featureWrapper) featureWrapper.style.display = 'none';
                } else if (href === '#paesaggio') {
                    selectedContext = 'paesaggio';
                    populatePhotoGrid('paesaggio');
                    // Hide homepage image
                    const featureWrapper = document.querySelector('.feature-image-wrapper');
                    if (featureWrapper) featureWrapper.style.display = 'none';
                }
            }
            // For real pages (like about.html), let the link work normally
        });
    });

    // Logo Click to Return Home
    const logoContainer = document.querySelector('.logo-container');
    if (logoContainer) {
        logoContainer.style.cursor = 'pointer';
        logoContainer.addEventListener('click', () => {
            // Show homepage feature image
            const featureWrapper = document.querySelector('.feature-image-wrapper');
            if (featureWrapper) featureWrapper.style.display = 'flex';

            // Hide photo grid
            if (photoGrid) photoGrid.classList.add('hidden');

            // Reset nav links
            navLinks.forEach(l => l.classList.remove('active'));
        });
    }


});
