document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio canvas loaded and ready!');
    
    // Check if we are on the Home Page vs Playground Page
    const isHomePage = document.querySelector('.hero-grid') !== null;

    if (isHomePage) {
        // Global variables for animation control states
        let revealTimer;
        let isAnimating = false;
        let sequenceCompleted = false; 
        let scrollAccumulator = 0;

        // --- CHECK IF WE SHOULD SKIP INTRO ANIMATION COMPLETELY ---
        const skipAction = sessionStorage.getItem('skipAction');
        if (skipAction) {
            sessionStorage.removeItem('skipAction');
            
            // 1. Instantly kill all CSS transitions/animations so nothing plays on load
            const styleBlock = document.createElement('style');
            styleBlock.id = 'skip-anim-style';
            styleBlock.innerHTML = `* { transition: none !important; animation: none !important; }`;
            document.head.appendChild(styleBlock);
            
            // 2. Set all states to mimic a completed intro sequence
            sequenceCompleted = true;
            document.body.classList.add('hero-zoomed', 'reveal-ui');
            
            const heroGrid = document.querySelector('.hero-grid');
            if (heroGrid) heroGrid.classList.add('exploded');
            
            const scrollHint = document.querySelector('.Scroll-hint');
            if (scrollHint) scrollHint.classList.add('vanished');

            const landingContainer = document.querySelector('.landing');
            if (landingContainer) {
                if (skipAction === 'works') {
                    landingContainer.classList.add('layout-transformed');
                } else {
                    landingContainer.classList.remove('layout-transformed');
                }
            }

            const navBar = document.getElementById('nav-bar');
            if (navBar) {
                if (skipAction === 'works') {
                    navBar.classList.add('nav-scrolled');
                } else {
                    navBar.classList.remove('nav-scrolled');
                }
            }
            
            // 3. Jump straight to the requested position
            if (skipAction === 'works') {
                window.scrollTo(0, 650);
            } else {
                window.scrollTo(0, 0);
            }
            
            // 4. Remove the transition blocker right after so interactive mouse animations work normally
            setTimeout(() => {
                const tempStyle = document.getElementById('skip-anim-style');
                if (tempStyle) tempStyle.remove();
            }, 100);
        }

        // Global helper to clamp wheel/trackpad delta values safely across the project
        function getSafeDelta(event) {
            let safeDelta = Math.min(Math.abs(event.deltaY), 20);
            if (event.deltaY < 0) safeDelta = -safeDelta;
            return safeDelta;
        }

        // Grid interaction animation sound
        const popSound = new Audio('Assets/pop-sound.wav');
        const heroGrid = document.querySelector('.hero-grid');

        let isInsideGrid = false;
        let lastMoveTime = 0;
        const playInterval = 150; // Controls how fast the sound repeats while moving (in milliseconds)

        // Generate hero grid of tiny squares
        if (heroGrid) {
            heroGrid.addEventListener('mouseenter', () => { isInsideGrid = true; });
            heroGrid.addEventListener('mouseleave', () => { isInsideGrid = false; });

            heroGrid.addEventListener('mousemove', () => {
                if (!isInsideGrid) return;

                const isExploded = heroGrid.classList.contains('exploded');
                const isZoomed = document.body.classList.contains('hero-zoomed');
                const landingEl = document.querySelector('.landing');
                const isTransformed = landingEl && landingEl.classList.contains('layout-transformed');

                if (isExploded || isZoomed || isTransformed) return;

                const now = Date.now();
                if (now - lastMoveTime > playInterval) {
                    popSound.currentTime = 0;
                    popSound.play().catch(e => console.log("Audio blocked:", e));
                    lastMoveTime = now;
                }
            });
        }

        // Play & Design text arc formatting
        const textContainer = document.querySelector('.play-design-cont p');
        if (textContainer) {
            const textString = textContainer.textContent.trim();
            textContainer.textContent = '';
            const arcSpread = 90; 
            
            const angleStep = arcSpread / (textString.length - 1);
            const startAngle = (arcSpread / 2); 

            textString.split('').forEach((char, i) => {
                const span = document.createElement('span');
                span.innerHTML = char === ' ' ? '&nbsp;' : char;
                span.className = 'char-span';
                
                const currentAngle = startAngle - (i * angleStep); 
                span.style.transform = `rotate(${currentAngle}deg)`;
                
                textContainer.appendChild(span);
            });
        }

        // Hero Grid array generation
        const gridContainer = document.querySelector('.hero-grid');
        if (gridContainer) {
            for (let i = 0; i < 144; i++) {
                const square = document.createElement('div');
                square.classList.add('tiny-square');
                
                let col = i % 12;
                let row = Math.floor(i / 12);
                
                let deltaX = col - 5.5;
                let deltaY = row - 5.5;
                let distFromCenter = Math.pow(deltaX, 2) + Math.pow(deltaY, 2);
                
                if (distFromCenter > 38) {
                    square.style.visibility = 'hidden'; 
                } else {
                    square.style.animationDelay = `${distFromCenter * 0.05}s`; 
                    square.style.setProperty('--explode-x', `${deltaX * 30}px`);
                    square.style.setProperty('--explode-y', `${deltaY * 30}px`);
                    square.style.setProperty('--explode-delay', `${distFromCenter * 0.015}s`);
                }
                gridContainer.appendChild(square);
            } 
        }

        // Hero grid cursor repel animation
        setTimeout(() => {
            const squares = document.querySelectorAll('.tiny-square');
            if (squares.length === 0) return;

            window.addEventListener('mousemove', (e) => {
                const mouseX = e.clientX;
                const mouseY = e.clientY;

                squares.forEach(square => {
                    const rect = square.getBoundingClientRect();
                    const squareCenterX = rect.left + (rect.width / 2);
                    const squareCenterY = rect.top + (rect.height / 2);
                    const distanceX = squareCenterX - mouseX;
                    const distanceY = squareCenterY - mouseY;
                    let distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));
                    if (distance === 0) distance = 1; 
                    
                    if (distance < 75) {
                        const pushX = (distanceX / distance) * 20;
                        const pushY = (distanceY / distance) * 20;

                        square.style.setProperty('--repel-x', `${pushX}px`);
                        square.style.setProperty('--repel-y', `${pushY}px`);
                    } else {
                        square.style.setProperty('--repel-x', `0px`);
                        square.style.setProperty('--repel-y', `0px`);
                    }
                });
            });
        }, 100);

        // Hero grid Explode animation & nav bar hide & reveal (Instant single-scroll trigger)
        window.addEventListener('wheel', (e) => {
            const gridContainer = document.querySelector('.hero-grid');
            const landingContainer = document.querySelector('.landing');
            const scrollHint = document.querySelector('.Scroll-hint');
            if (scrollHint) {
                scrollHint.classList.add('vanished');
            }
            if (!gridContainer) return;

            if (!sequenceCompleted) {
                window.scrollTo(0, 0);
                e.preventDefault(); 

                // Normalize delta so both mouse wheels and touchpads register smoothly
                let normalizedDelta = Math.min(Math.abs(e.deltaY), 20);
                scrollAccumulator += normalizedDelta;

                // Lowered threshold to 10 so a single mouse tick or quick touchpad flick triggers it instantly
                if (scrollAccumulator > 10 && !isAnimating) {
                    isAnimating = true;
                    
                    gridContainer.classList.add('exploded');
                    window.scrollTo(0, 0);

                    setTimeout(() => {
                        document.body.classList.add('hero-zoomed');
                        window.scrollTo(0, 0);
                    }, 1200); 

                    clearTimeout(revealTimer);
                    revealTimer = setTimeout(() => {
                        document.body.classList.add('reveal-ui');
                        isAnimating = false;
                        sequenceCompleted = true; 
                        scrollAccumulator = 0;
                    }, 1500); 
                } 
                
                return; 
            }

            if (landingContainer) {
                if (window.scrollY > 50) {
                    landingContainer.classList.add('layout-transformed');
                } else {
                    landingContainer.classList.remove('layout-transformed');
                }
            }
        }, { passive: false });

        window.addEventListener('scroll', () => {
            if (!sequenceCompleted) return;
            const landingContainer = document.querySelector('.landing');
            if (!landingContainer) return;

            if (window.scrollY > 50) {
                landingContainer.classList.add('layout-transformed');
            } else {
                landingContainer.classList.remove('layout-transformed');
            }
        });

        // Reveal sections wrapper on scroll
        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY;
            if (scrollPosition > 60) {
                document.body.classList.add('scrolled');
            } else {
                document.body.classList.remove('scrolled');
            }
        });
    } // End of isHomePage guard

    

    // ==================================================== Page Load & Navigation Preloader ============================================================ //

    // Define the exact duration of 1 full loop (matches your 1.5s CSS animation)
    const loopDuration = 1500; 
    const preloaderStartTime = Date.now();

    // 1. Handle initial page load completion
    window.addEventListener('load', () => {
        const elapsedTime = Date.now() - preloaderStartTime;
        // Calculate how much time is left to guarantee 1 full loop completes
        const remainingTime = Math.max(0, loopDuration - elapsedTime);

        // Hide only after the page is ready AND at least 1 full loop has played
        setTimeout(() => {
            const loader = document.querySelector('#page-loader');
            if (loader) {
                loader.classList.add('loader-hidden');
                setTimeout(() => loader.remove(), 500); // Matches CSS fade transition
            }
        }, remainingTime);
    });

    // 2. Intercept internal page clicks to show the preloader and guarantee 1 loop before navigating
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        
        if (
            link &&
            link.href &&
            link.href.startsWith(window.location.origin) &&
            !link.getAttribute('target') &&
            !link.getAttribute('download') &&
            link.getAttribute('href') !== '#' &&
            !link.getAttribute('href').startsWith('mailto:') &&
            !link.getAttribute('href').startsWith('tel:')
        ) {
            e.preventDefault(); // Stop instant navigation
            const targetUrl = link.href;

            // Recreate the preloader on the fly if it was removed on the previous page
            let loader = document.querySelector('#page-loader');
            if (!loader) {
                loader = document.createElement('div');
                loader.id = 'page-loader';
                loader.innerHTML = `
                    <div class="loader-logo">
                        <svg width="49" height="42" viewBox="0 0 49 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M37.8105 0.149414H37.8115C40.7072 0.217377 43.6615 1.23684 45.8086 3.26758L45.8096 3.26855C47.7432 5.0746 48.8826 7.93473 48.8467 10.6475C48.8107 13.3556 47.6054 15.8945 44.876 17.1016H44.875C43.2108 17.8381 41.4211 17.6912 39.5635 17.4336C37.7194 17.1779 35.8023 16.8111 33.9512 17.1602H33.9502C31.3433 17.6687 29.3218 19.4906 27.7861 21.7656C26.2502 24.041 25.1881 26.787 24.5029 29.1816C23.3659 33.0371 23.0484 36.9552 22.5791 40.9053C22.5088 40.2392 22.4883 39.5395 22.4883 38.832C22.4883 37.7466 22.5367 36.6197 22.5205 35.6094C22.4961 33.9613 22.4718 32.3119 22.4199 30.6475L22.3584 28.9775C22.1633 24.1342 22.0344 18.5291 23.1514 13.5068C24.2676 8.48783 26.6231 4.07144 31.3818 1.5752L31.3809 1.57422C33.3732 0.556172 35.5917 0.0815266 37.8105 0.149414Z" stroke="#F655A6" stroke-width="1.5" class="svg-elem-1"></path>
                            <path d="M10.6006 30.749C13.4185 30.749 16.1102 31.9319 18.0986 34.0312V34.0322C19.5747 35.6251 20.5708 37.6256 20.9883 39.7627C21.2006 40.8531 20.4401 41.8506 19.4443 41.8506H1.75684C0.761081 41.8506 0.000592454 40.8531 0.212891 39.7627L0.213867 39.7598C0.598827 37.5914 1.62497 35.5919 3.10059 34.0332C5.08921 31.9328 7.8195 30.749 10.6006 30.749Z" stroke="#F655A6" stroke-width="1.5" class="svg-elem-2"></path>
                        </svg>
                    </div>`;
                document.body.prepend(loader);
            }

            // Force it visible instantly
            loader.classList.remove('loader-hidden');

            // Delay page transition to guarantee the animation runs for at least 1 full loop (1500ms)
            setTimeout(() => {
                window.location.href = targetUrl;
            }, loopDuration);
        }
    });

    // =================================================== Game Star bounce animation logic ========================================================== //
    const star = document.querySelector('.Game-star');

    star.style.position = 'fixed';
    star.style.zIndex = '5';
    star.style.pointerEvents = 'auto'; // Ensures it catches mouse hover events

    let starWidth = star.clientWidth || 60;
    let starHeight = star.clientHeight || 60;

    let posX = Math.random() * (window.innerWidth - starWidth);
    let posY = Math.random() * (window.innerHeight - starHeight);

    let baseSpeed = 1.5;
    let angle = Math.random() * Math.PI * 2;
    let velocityX = Math.cos(angle) * baseSpeed;
    let velocityY = Math.sin(angle) * baseSpeed;

    // Instantly deflects and changes direction when the cursor touches the star
    star.addEventListener('mouseenter', () => {
        let newAngle = Math.random() * Math.PI * 2;
        let burstSpeed = 2.5; // Gives it a fun little speed boost when nudged by the mouse!
        velocityX = Math.cos(newAngle) * burstSpeed;
        velocityY = Math.sin(newAngle) * burstSpeed;
    });

    function updateRandomPhysics() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        posX += velocityX;
        posY += velocityY;

        let hitWall = false;
        let wallType = '';

        if (posX + starWidth >= screenWidth) {
            posX = screenWidth - starWidth;
            hitWall = true;
            wallType = 'right';
        } else if (posX <= 0) {
            posX = 0;
            hitWall = true;
            wallType = 'left';
        }

        if (posY + starHeight >= screenHeight) {
            posY = screenHeight - starHeight;
            hitWall = true;
            wallType = 'bottom';
        } else if (posY <= 0) {
            posY = 0;
            hitWall = true;
            wallType = 'top';
        }

        if (hitWall) {
            let newAngle;
            if (wallType === 'right') {
                newAngle = Math.PI + (Math.random() * Math.PI - Math.PI / 2);
            } else if (wallType === 'left') {
                newAngle = Math.random() * Math.PI - Math.PI / 2;
            } else if (wallType === 'bottom') {
                newAngle = -Math.PI / 2 + (Math.random() * Math.PI - Math.PI / 2);
            } else if (wallType === 'top') {
                newAngle = Math.PI / 2 + (Math.random() * Math.PI - Math.PI / 2);
            }

            velocityX = Math.cos(newAngle) * baseSpeed;
            velocityY = Math.sin(newAngle) * baseSpeed;
        }

        star.style.left = `${posX}px`;
        star.style.top = `${posY}px`;

        requestAnimationFrame(updateRandomPhysics);
    }

    requestAnimationFrame(updateRandomPhysics);
    // =================================================== Game Star bounce animation logic ========================================================== //


    // ================================================ Profile Star repel and rotate logic ========================================================== //
   const profileStars = document.querySelectorAll('.Profile-star-1, .Profile-star-2');

profileStars.forEach((star) => {
    // Each star gets its own independent state
    let currentAngle = star.classList.contains('Profile-star-2') ? 180 : 25; // Optional: different starting angle for star 2 if desired
    let currentSelfRot = 0;
    
    const radius = 107; // Matches your 107px ring radius
    const arcShiftDeg = (20 / radius) * (180 / Math.PI); // ~10.7° shift for 20px arc
    const spinAmount = 90;

    star.addEventListener('mousemove', (e) => {
        const rect = star.getBoundingClientRect();
        
        const starCenterX = rect.left + rect.width / 2;
        const starCenterY = rect.top + rect.height / 2;
        
        const distX = e.clientX - starCenterX;
        const distY = e.clientY - starCenterY;
        const distance = Math.hypot(distX, distY);
        
        // Trigger if cursor is within the star or within 5px radial distance
        if (distance <= (rect.width / 2 + 5)) {
            if (distY < 0) {
                // Cursor near top -> Clockwise orbit & spin
                currentAngle += arcShiftDeg;
                currentSelfRot += spinAmount;
            } else {
                // Cursor near bottom -> Counter-clockwise orbit & reverse spin
                currentAngle -= arcShiftDeg;
                currentSelfRot -= spinAmount;
            }
            
            // Apply properties to the specific star being interacted with
            star.style.setProperty('--angle', `${currentAngle}deg`);
            star.style.setProperty('--self-rot', `${currentSelfRot}deg`);
        }
    });
});



});