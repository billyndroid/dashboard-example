
// Enhanced CountUp Animation with Error Handling

// Configuration
const ANIMATION_CONFIG = {
    duration: 2000, // Animation duration in ms
    fps: 60, // Frames per second
    get frameDuration() { return 1000 / this.fps; },
    get totalFrames() { return Math.round(this.duration / this.frameDuration); }
};
// Easing functions
const easingFunctions = {
    easeOutQuad: t => t * (2 - t),
    easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    linear: t => t
};

// The animation function, which takes an Element
const animateCountUp = el => {
let frame = 0;
const countTo = parseInt( el.innerHTML, 10 );
// Start the animation running 60 times per second
const counter = setInterval( () => {
frame++;
// Calculate our progress as a value between 0 and 1
// Pass that value to our easing function to get our
// progress on a curve
const progress = easeOutQuad( frame / totalFrames );
// Use the progress value to calculate the current count
const currentCount = Math.round( countTo * progress );

// If the current count has changed, update the element
if ( parseInt( el.innerHTML, 10 ) !== currentCount ) {
  el.innerHTML = currentCount;
}

// If we’ve reached our last frame, stop the animation
if ( frame === totalFrames ) {
  clearInterval( counter );
}
}, frameDuration );
};

// Run the animation on all elements with a class of ‘countup’
const runAnimations = () => {
const countupEls = document.querySelectorAll( '.countup' );
countupEls.forEach( animateCountUp );
};

