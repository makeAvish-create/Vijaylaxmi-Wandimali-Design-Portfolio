document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio canvas loaded and ready!');

// // Nav bar animation
// window.addEventListener('scroll', () => {
//     // Grab the nav bar from the HTML
//     const navBar = document.getElementById('nav-bar');
    
//     // window.innerHeight gets the exact pixel height of the user's visible screen (100vh)
//     // window.scrollY gets how far down the user has scrolled
//     if (window.scrollY > window.innerHeight) {
//         // If they scrolled past the first page height, shrink it!
//         navBar.classList.add('nav-scrolled');
//     } else {
//         // If they scroll back up to the top, expand it!
//         navBar.classList.remove('nav-scrolled');
//     }
// });

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


// Hero grid Explode animation & nav bar hide & reveal
    let revealTimer; 
    const navBar = document.getElementById('nav-bar'); 
    let isAnimating = false; // Prevents triggering multiple times

    window.addEventListener('wheel', (e) => {
    const gridContainer = document.querySelector('.hero-grid');
    if (!gridContainer) return; 

    // Triggered on the first downward scroll
    if (e.deltaY > 0 && !isAnimating) {
        isAnimating = true;
        e.preventDefault(); 
        
        // --- STEP 1: Explode the grid immediately ---
        gridContainer.classList.add('exploded');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // --- STEP 2: After a 1-second delay, start the 500px growth and fade ---
        setTimeout(() => {
            document.body.classList.add('hero-zoomed');
        }, 1550); 

        // --- STEP 3: Reveal the navigation bar and UI elements after the growth finishes ---
        clearTimeout(revealTimer);
        revealTimer = setTimeout(() => {
            document.body.classList.add('reveal-ui');
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
}, { passive: false });

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



});