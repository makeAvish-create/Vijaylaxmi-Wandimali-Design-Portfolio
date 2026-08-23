document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio canvas loaded and ready!');
    const popSound = new Audio('Assets/pop-sound.wav');
const heroGrid = document.querySelector('.hero-grid');

let isInsideGrid = false;
let lastMoveTime = 0;
const playInterval = 150; // Controls how fast the sound repeats while moving (in milliseconds)

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

        // --- CHECK IF ANIMATION OR SCREEN TRANSITION HAS TRIGGERED ---
        const isExploded = heroGrid.classList.contains('exploded');
        const isZoomed = document.body.classList.contains('hero-zoomed');
        const landingEl = document.querySelector('.landing');
        const isTransformed = landingEl && landingEl.classList.contains('layout-transformed');

        // If any state change has happened, block the sound completely
        if (isExploded || isZoomed || isTransformed) return;
        // -----------------------------------------------------------

        const now = Date.now();
        // If enough time has passed since the last sound, play again
        if (now - lastMoveTime > playInterval) {
            popSound.currentTime = 0;
            popSound.play().catch(e => console.log("Audio blocked:", e));
            lastMoveTime = now;
        }
    });
}

// Play & Design text
    const textContainer = document.querySelector('.play-design-cont p');
    if (!textContainer) return; 
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

// Hero Grid array
    const gridContainer = document.querySelector('.hero-grid');
    if (gridContainer) {
        for (let i = 0; i < 144; i++) {
            const square = document.createElement('div');
            square.classList.add('tiny-square');
            
            let col = i % 12;
            let row = Math.floor(i / 12);
            
            // Defined correctly!
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

// Hero grid cursor repel aimation
    setTimeout(() => {
    const squares = document.querySelectorAll('.tiny-square');
    if (squares.length === 0) {
        console.error("The repel script can't find the squares! Check your script order.");
        return;
    }

    window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        squares.forEach(square => {
            // Get precise square coordinates
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
                // Snap back
                square.style.setProperty('--repel-x', `0px`);
                square.style.setProperty('--repel-y', `0px`);
            }
        });
    });
}, 100); // 100ms delay ensures the grid is fully generated first


// Grid interaction animation sound

// Hero grid Explode animation & nav bar hide & reveal
let revealTimer;
let isAnimating = false;
let sequenceCompleted = false; // Tracks if the hero intro sequence is done

window.addEventListener('wheel', (e) => {
    const gridContainer = document.querySelector('.hero-grid');
    const landingContainer = document.querySelector('.landing');
    const scrollHint = document.querySelector('.Scroll-hint');
    if (scrollHint) {
        scrollHint.classList.add('vanished');}
    if (!gridContainer) return;

    // --- PHASE 1: HERO INTRO SEQUENCE (Locked at top) ---
    if (!sequenceCompleted) {
        // Triggered on the first downward scroll
        if (e.deltaY > 0 && !isAnimating) {
            isAnimating = true;
            e.preventDefault(); 
            
            // Step 1: Explode the grid immediately
            gridContainer.classList.add('exploded');
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Step 2: Growth and fade delay
            setTimeout(() => {
                document.body.classList.add('hero-zoomed');
            }, 1200); 

            // Step 3: Reveal UI and unlock normal scrolling
            clearTimeout(revealTimer);
            revealTimer = setTimeout(() => {
                document.body.classList.add('reveal-ui');
                isAnimating = false;
                sequenceCompleted = true; // Intro is finished, free up the scroll!
            }, 1500); 
        } 
        
        // Reset if scrolling back up at the top
        else if (e.deltaY < 0 && window.scrollY <= 10 && isAnimating) {
            e.preventDefault();
            isAnimating = false;
            gridContainer.classList.remove('exploded');
            document.body.classList.remove('hero-zoomed');
            document.body.classList.remove('reveal-ui');
            clearTimeout(revealTimer);
        }
        
        return; // Stop here until sequenceCompleted is true
    }

    // --- PHASE 2: NORMAL SCROLL & LANDING TRANSFORM ---
    // Once the hero intro is done, regular scrolling takes over.
    // We check scroll position here to toggle your layout transformation smoothly.
    if (landingContainer) {
        if (window.scrollY > 50) {
            landingContainer.classList.add('layout-transformed');
        } else {
            landingContainer.classList.remove('layout-transformed');
        }
    }
}, { passive: false });

// Fallback standard scroll listener just in case they use a trackpad scrollbar drag
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

// Nav bar show
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

    // When the mouse moves inside the container
    windowContainer.addEventListener('mousemove', (e) => {
        const rect = windowContainer.getBoundingClientRect();
        const centerX = rect.left + (rect.width / 2);
        const centerY = rect.top + (rect.height / 2);
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        const maxMove = 10; // Max movement in pixels
        const moveX = (mouseX / (rect.width / 2)) * maxMove;
        const moveY = (mouseY / (rect.height / 2)) * maxMove;
        
        // Apply the transform movement to the image
        if (windowImg) {
            windowImg.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`; 
            // Note: scale(1.05) prevents white edges from showing when it shifts!
        }
    });

    // When the mouse leaves the container, snap back to the center
    windowContainer.addEventListener('mouseleave', () => {
        if (windowImg) {
            windowImg.style.transform = `translate(0px, 0px) scale(1)`;
        }
    });
}

// --- Reveal sections wrapper on scroll ---
window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;

    if (scrollPosition > 30) {
        document.body.classList.add('scrolled');
    } else {
        document.body.classList.remove('scrolled');
    }
});





});