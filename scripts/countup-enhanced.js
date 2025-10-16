// Enhanced CountUp Animation with Error Handling

// Configuration
const ANIMATION_CONFIG = {
    duration: 2000,
    fps: 60,
    get frameDuration() { return 1000 / this.fps; },
    get totalFrames() { return Math.round(this.duration / this.frameDuration); }
};

// Easing functions
const easingFunctions = {
    easeOutQuad: t => t * (2 - t),
    easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    linear: t => t
};

// Enhanced animation function
const animateCountUp = (el, options = {}) => {
    try {
        if (!el || !el.innerHTML) {
            console.warn('Invalid element for countup animation:', el);
            return;
        }

        const config = { ...ANIMATION_CONFIG, ...options };
        const easing = easingFunctions[options.easing] || easingFunctions.easeOutQuad;
        
        let frame = 0;
        const startValue = options.startValue || 0;
        const endValue = parseInt(el.dataset.target || el.innerHTML, 10);
        
        if (isNaN(endValue)) {
            console.warn('Invalid target value for countup:', el.innerHTML);
            return;
        }

        el.dataset.originalValue = endValue;
        el.innerHTML = startValue;

        const counter = setInterval(() => {
            try {
                frame++;
                const progress = easing(frame / config.totalFrames);
                const currentCount = Math.round(startValue + (endValue - startValue) * progress);

                if (parseInt(el.innerHTML, 10) !== currentCount) {
                    el.innerHTML = currentCount.toLocaleString();
                }

                if (frame >= config.totalFrames) {
                    el.innerHTML = endValue.toLocaleString();
                    clearInterval(counter);
                }
            } catch (error) {
                console.error('Error in countup animation frame:', error);
                clearInterval(counter);
            }
        }, config.frameDuration);

        el.dataset.countupInterval = counter;
        
    } catch (error) {
        console.error('Error initializing countup animation:', error);
    }
};

// Enhanced run animations function
const runAnimations = (selector = '.countup', options = {}) => {
    try {
        const countupEls = document.querySelectorAll(selector);
        
        if (countupEls.length === 0) {
            console.info('No countup elements found');
            return;
        }

        countupEls.forEach((el, index) => {
            setTimeout(() => {
                animateCountUp(el, options);
            }, index * 100);
        });
        
    } catch (error) {
        console.error('Error running countup animations:', error);
    }
};

// Stop all animations
const stopAnimations = (selector = '.countup') => {
    try {
        const countupEls = document.querySelectorAll(selector);
        countupEls.forEach(el => {
            const intervalId = el.dataset.countupInterval;
            if (intervalId) {
                clearInterval(intervalId);
                delete el.dataset.countupInterval;
            }
        });
    } catch (error) {
        console.error('Error stopping countup animations:', error);
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => runAnimations());
} else {
    runAnimations();
}

// Export functions
window.runAnimations = runAnimations;
window.stopAnimations = stopAnimations;