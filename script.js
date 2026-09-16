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

        // Hero grid Explode animation & nav bar hide & reveal
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

                let delta = getSafeDelta(e);
                scrollAccumulator += delta;

                if (e.deltaY < 0) {
                    scrollAccumulator = 0;
                }

                if (scrollAccumulator > 15 && !isAnimating) {
                    isAnimating = true;
                    e.preventDefault(); 
                    
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
                
                e.preventDefault(); 
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

        // Nav bar scroll reveal
        const navBar = document.getElementById('nav-bar');
        window.addEventListener('scroll', () => {
            if (navBar && document.body.classList.contains('reveal-ui')) {
                if (window.scrollY > window.innerHeight) {
                    navBar.classList.add('nav-scrolled');
                } else {
                    navBar.classList.remove('nav-scrolled');
                }
            }
        });

        // Window-container image cursor animation
        const windowContainer = document.querySelector('.window-container');
        if (windowContainer) {
            const windowImg = windowContainer.querySelector('img');

            windowContainer.addEventListener('mousemove', (e) => {
                const rect = windowContainer.getBoundingClientRect();
                const centerX = rect.left + (rect.width / 2);
                const centerY = rect.top + (rect.height / 2);
                const mouseX = e.clientX - centerX;
                const mouseY = e.clientY - centerY;
                const maxMove = 10;
                const moveX = (mouseX / (rect.width / 2)) * maxMove;
                const moveY = (mouseY / (rect.height / 2)) * maxMove;

                if (windowImg) {
                    windowImg.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
                }
            });

            windowContainer.addEventListener('mouseleave', () => {
                if (windowImg) {
                    windowImg.style.transform = `translate(0px, 0px) scale(1)`;
                }
            });
        }



        // Reveal sections wrapper on scroll
        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY;
            if (scrollPosition > 60) {
                document.body.classList.add('scrolled');
            } else {
                document.body.classList.remove('scrolled');
            }
        });

        // Project card magnetic animation
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(projectCard => {
            const projectContainer = projectCard.closest('[id^="project-card-"]'); 
            if (!projectContainer) return;

            const siblings = projectContainer.querySelectorAll(':scope > div');

            projectCard.addEventListener('mousemove', (e) => {
                const rect = projectCard.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const mouseX = e.clientX - centerX;
                const mouseY = e.clientY - centerY;
                
                const rotateX = (-mouseY / (rect.height / 2)) * 5; 
                const rotateY = (mouseX / (rect.width / 2)) * 5;

                siblings.forEach(sibling => {
                    sibling.style.transition = 'none';
                    sibling.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                });
            });

            projectCard.addEventListener('mouseleave', () => {
                siblings.forEach(sibling => {
                    sibling.style.transition = 'transform 0.5s ease-in-out';
                    sibling.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                });
            });
        });

        // Unified Card Shrinking & Blueprint Translation Logic
        window.addEventListener('scroll', () => {
            const cardWrappers = [
                document.getElementById('project-card-1'),
                document.getElementById('project-card-2'),
                document.getElementById('project-card-3'),
                document.getElementById('project-card-4')
            ];

            const blueprint = document.getElementById('design-blueprint');
            let targetTranslateY = 0;
            
            if (blueprint) {
                const blueprintRect = blueprint.getBoundingClientRect();
                if (blueprintRect.top < window.innerHeight) {
                    targetTranslateY = Math.max(0, window.innerHeight - blueprintRect.top);
                } else {
                    targetTranslateY = 0;
                }
            }

            cardWrappers.forEach((card, index) => {
                if (!card) return;

                let cumulativeShrink = 0;
                const scrollRange = 300;

                for (let j = index + 1; j < cardWrappers.length; j++) {
                    const nextCard = cardWrappers[j];
                    const nextStickyTop = 100 + (j * 50);
                    const nextRect = nextCard.getBoundingClientRect();
                    const distanceToSticky = nextRect.top - nextStickyTop;

                    if (distanceToSticky <= 0) {
                        cumulativeShrink += 0.07; 
                    } else if (distanceToSticky <= scrollRange) {
                        const progress = 1 - (distanceToSticky / scrollRange);
                        cumulativeShrink += (0.07 * progress);
                    }
                }

                const currentScale = Math.max(0.7, 1 - cumulativeShrink);

                card.style.transform = `translateY(${-targetTranslateY}px) scale(${currentScale})`;
                card.style.transformOrigin = 'top center';
                card.style.transition = 'none'; 
            });
        });

        // --- Nav bar Works button highlight upon works section active ---
        window.addEventListener('scroll', () => {
            const firstProjectCard = document.getElementById('selected-work');
            const worksBtnWrapper = document.querySelector('.btn-wrapper[data-target="works"]');

            if (!firstProjectCard || !worksBtnWrapper) return;

            const rect = firstProjectCard.getBoundingClientRect();
            
            if (rect.top <= window.innerHeight * 0.6 && rect.bottom >= 0) {
                worksBtnWrapper.classList.add('active');
            } else {
                worksBtnWrapper.classList.remove('active');
            }
        });

        // --- ABSOLUTE FIXED-POSITION SCROLL FOR WORKS BUTTON ---
        const worksButton = document.querySelector('.works-btn');

        if (worksButton) {
            worksButton.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 650, 
                    behavior: 'smooth'
                });
            });
        }

        // --- RESET SCROLL TO TOP ON NAME CLICK ---
        const nameElement = document.querySelector('.name');

        if (nameElement) {
            nameElement.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0, 
                    behavior: 'smooth'
                });
            });
        }


    } // End of isHomePage guard


    // Standalone logic: Make .section-title follow the exact same targetTranslateY movement as the project cards
    const blueprint = document.getElementById('design-blueprint');
    const sectionTitle = document.querySelector('.section-title');

    if (blueprint && sectionTitle) {
        window.addEventListener('scroll', () => {
            const blueprintRect = blueprint.getBoundingClientRect();
            let targetTranslateY = 0;
            
            if (blueprintRect.top < window.innerHeight) {
                targetTranslateY = Math.max(0, window.innerHeight - blueprintRect.top);
            } else {
                targetTranslateY = 0;
            }

            sectionTitle.style.transform = `translateY(${-targetTranslateY}px)`;
            sectionTitle.style.transition = 'none';
        });
    }

    // ====================================================== Links to projects ============================================================= //
    const card1 = document.getElementById('Haati-project-card');
    if (card1) {
        card1.style.cursor = 'pointer';
        card1.addEventListener('click', () => {
            window.location.href = 'Project-1.html';
        });
    }

    const card2 = document.getElementById('Earth-project-card');
    if (card2) {
        card2.style.cursor = 'pointer';
        card2.addEventListener('click', () => {
            window.location.href = 'Project-2.html';
        });
    }

    const card3 = document.getElementById('Vivid-project-card');
    if (card3) {
        card3.style.cursor = 'pointer';
        card3.addEventListener('click', () => {
            window.location.href = 'Project-3.html';
        });
    }

    const card4 = document.getElementById('Thread-project-card');
    if (card4) {
        card4.style.cursor = 'pointer';
        card4.addEventListener('click', () => {
            window.location.href = 'Project-4.html';
        });
    }

    // Footer section
    // Browser engine code for footer (Runs globally)
    function detectEngine() {
        const ua = navigator.userAgent;
        let engine = "Chromium"; 

        if (ua.includes("Firefox")) {
            engine = "Gecko";
        } else if (ua.includes("Safari") && !ua.includes("Chrome") && !ua.includes("Edg")) {
            engine = "WebKit";
        } else if (ua.includes("Chrome") || ua.includes("Edg") || ua.includes("Brave") || ua.includes("OPR")) {
            engine = "Chromium";
        }

        const engineElement = document.getElementById("engine-value");
        if (engineElement) {
            engineElement.textContent = engine;
        }
    }
    detectEngine();

    // Visitor count logic (Runs globally)
    async function updateVisitorCount() {
        try {
            const response = await fetch('https://api.countapi.xyz/hit/your-portfolio-namespace/visits');
            if (!response.ok) throw new Error('API offline');
            const data = await response.json();
            const element = document.getElementById('visitor-count');
            if (element) element.textContent = data.value.toLocaleString();
        } catch (error) {
            const element = document.getElementById('visitor-count');
            if (element) element.textContent = "17,709";
        }
    }
    updateVisitorCount();

    // Local time for footer script (Runs globally)
    function updateLocalTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        const timeElement = document.getElementById('local-time');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }
    updateLocalTime();
    setInterval(updateLocalTime, 1000);


    // ================================================= Playground section ================================================== //
    // ==================================================== Empty Squares Cursor Repel (Debugged) ============================================================ //
    const emptySquares = document.querySelectorAll('.empty-square');
    console.log("Empty squares found by script:", emptySquares.length); // Check your F12 console for this number!

    if (emptySquares.length > 0) {
    window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        emptySquares.forEach(square => {
            const rect = square.getBoundingClientRect();
            
            // Skip if the element isn't rendered or has zero dimensions
            if (rect.width === 0 || rect.height === 0) return;

            const squareCenterX = rect.left + (rect.width / 2);
            const squareCenterY = rect.top + (rect.height / 2);

            const distanceX = squareCenterX - mouseX;
            const distanceY = squareCenterY - mouseY;
            let distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));

            if (distance === 0) distance = 1;

            // Increased detection radius to 50px around the square so it's easy to trigger
            const triggerDistance = 50; 

            if (distance < triggerDistance) {
                // Calculates push angle and caps the movement at exactly 10px max
                const power = (1 - (distance / triggerDistance));
                const pushX = (distanceX / distance) * (power * 10);
                const pushY = (distanceY / distance) * (power * 10);

                square.style.transform = `translate(${pushX}px, ${pushY}px)`;
            } else {
                square.style.transform = `translate(0px, 0px)`;
            }
        });
    });
    }
    

    // Window container image animation for pages other than landing page
    const windowContainer = document.querySelector('.window-container-plg');
    if (windowContainer) {
        const windowImg = windowContainer.querySelector('img');

        windowContainer.addEventListener('mousemove', (e) => {
            const rect = windowContainer.getBoundingClientRect();
            const centerX = rect.left + (rect.width / 2);
            const centerY = rect.top + (rect.height / 2);
            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;
            const maxMove = 10;
            const moveX = (mouseX / (rect.width / 2)) * maxMove;
            const moveY = (mouseY / (rect.height / 2)) * maxMove;

            if (windowImg) {
                windowImg.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
            }
        });

        windowContainer.addEventListener('mouseleave', () => {
            if (windowImg) {
                windowImg.style.transform = `translate(0px, 0px) scale(1)`;
            }
        });
    }

    

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



    // Scale down & translate up effect to reveal footer on scroll
    window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    
    // Adjust '400' to control how long the animation takes as you scroll down
    const maxScroll = 400; 
    let scrollProgress = Math.min(scrollTop / maxScroll, 1);
    
    // 1. Calculate scale (shrinking down to 60% size, tweak as needed)
    const minScale = 0.6;
    const currentScale = 1 - (scrollProgress * (1 - minScale));
    
    // 2. Calculate upward movement in pixels (e.g., moves up by up to 180px total)
    const maxUpwardShift = 280;
    const currentYOffset = scrollProgress * maxUpwardShift;

    // Update both CSS variables on the root
    document.documentElement.style.setProperty('--scroll-scale', currentScale);
    document.documentElement.style.setProperty('--scroll-y', `${currentYOffset}px`);
    });

    
    // Force browser to stop remembering scroll position on refresh
    if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
    }

    // Instantly jump back to the top on page load/refresh
    window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
    });

    window.addEventListener('load', () => {
    window.scrollTo(0, 0);
    });




});