document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio canvas loaded and ready!');
    
    // Future interactivity (animations, scroll effects, mobile menus) will go here
});

// Nav bar animation
window.addEventListener('scroll', () => {
    // Grab the nav bar from the HTML
    const navBar = document.getElementById('nav-bar');
    
    // window.innerHeight gets the exact pixel height of the user's visible screen (100vh)
    // window.scrollY gets how far down the user has scrolled
    if (window.scrollY > window.innerHeight) {
        // If they scrolled past the first page height, shrink it!
        navBar.classList.add('nav-scrolled');
    } else {
        // If they scroll back up to the top, expand it!
        navBar.classList.remove('nav-scrolled');
    }
});

// Play & Design text
document.addEventListener('DOMContentLoaded', () => {
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
});

// Hero Grid array
const gridContainer = document.querySelector('.hero-grid');

// 12x12 grid = 144 squares
for (let i = 0; i < 144; i++) {
    const square = document.createElement('div');
    square.classList.add('tiny-square');
    
    // 1. Calculate the current Row (0-11) and Column (0-11)
    let col = i % 12;
    let row = Math.floor(i / 12);
    
    // 2. The exact center of a 12x12 grid is at coordinate (5.5, 5.5)
    // We use the Pythagorean theorem to find the distance from the center!
    let distFromCenter = Math.pow(col - 5.5, 2) + Math.pow(row - 5.5, 2);
    
    // 3. The Mask: If the distance is greater than our radius threshold (38), hide it!
    if (distFromCenter > 38) {
        // visibility: hidden keeps the physical space in the CSS Grid intact, 
        // it just makes the square completely transparent.
        square.style.visibility = 'hidden'; 
    }
    
    gridContainer.appendChild(square);
    square.style.animationDelay = `${distFromCenter * 0.05}s`;
    // square.style.animationDuration = `${3 + (distFromCenter * 0.1)}s`;
    // square.style.animationDelay = `${Math.random() * 3}s`;
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

// Cursor text animation
// // 1. The text (added a bullet and space for a clean loop)
// const textString = "Play & Design • "; 
// const container = document.getElementById('cursor-revolve-text');

// // 2. The size of the orbit (Distance from the cursor in pixels)
// const radius = 20; 

// // 3. Create the circular layout
// textString.split('').forEach((char, index) => {
//     const span = document.createElement('span');
//     span.textContent = char;
//     span.className = 'revolve-letter';
    
//     // Math: Divide 360 degrees by the number of letters to get the angle spacing
//     const angle = (360 / textString.length) * index;
    
//     // Rotate the letter to its angle, then push it outward by the radius distance
//     span.style.transform = `rotate(${angle}deg) translateY(-${radius}px)`;
    
//     container.appendChild(span);
// });

// // 4. Track the mouse position
// let mouseX = 0;
// let mouseY = 0;

// window.addEventListener('mousemove', (e) => {
//     mouseX = e.clientX;
//     mouseY = e.clientY;
// });

// // 5. The Animation Loop
// let currentRotation = 0;

// function animateRevolve() {
//     // Controls the spin speed (higher = faster)
//     currentRotation += 1; 
    
//     // Move the center point to the cursor, and spin the entire container
//     container.style.transform = `translate(${mouseX}px, ${mouseY}px) rotate(${currentRotation}deg)`;

//     // Request the next frame for an endless loop
//     requestAnimationFrame(animateRevolve);
// }

// // Start the animation
// animateRevolve();