document.addEventListener('DOMContentLoaded', () => 
{
    console.log('Portfolio canvas loaded and ready!');
    
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
        // Track when the cursor enters the grid
        heroGrid.addEventListener('mouseenter', () => {
            isInsideGrid = true;
        });

        // Track when the cursor leaves the grid
        heroGrid.addEventListener('mouseleave', () => {
            isInsideGrid = false;
        });

        // Track movement while inside the grid
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
    let revealTimer;
    let isAnimating = false;
    let sequenceCompleted = false; 
    let scrollAccumulator = 0;

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

    // Browser engine code for footer
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

    // Visitor count logic (wrapped safely)
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

    // Local time for footer script
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

    // --- Nav bar Works button highlight upon works section active ---
    window.addEventListener('scroll', () => {
    const firstProjectCard = document.getElementById('selected-work');
    const worksBtnWrapper = document.querySelector('.btn-wrapper[data-target="works"]');

    if (!firstProjectCard || !worksBtnWrapper) return;

    const rect = firstProjectCard.getBoundingClientRect();
    
    // Triggered only when Selected-work section scrolls deep into the upper-middle view area
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
        
        // Always jumps/scrolls to exactly 650px from the absolute top of the page
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



});