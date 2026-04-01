// Input Handler - Keyboard and Touch

const Input = {
    keys: {},
    jumpPressed: false,
    jumpReleased: true,

    init() {
        // Keyboard events
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Touch events for mobile
        const canvas = document.getElementById('game-canvas');
        canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
        canvas.addEventListener('touchend', (e) => this.onTouchEnd(e));

        // Mouse click as alternative
        canvas.addEventListener('mousedown', () => this.onTouchStart());
        canvas.addEventListener('mouseup', () => this.onTouchEnd());
    },

    onKeyDown(e) {
        this.keys[e.code] = true;

        // Prevent scrolling with space/arrows
        if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
            e.preventDefault();
        }

        // Track jump press for single jump logic
        if ((e.code === 'Space' || e.code === 'ArrowUp') && this.jumpReleased) {
            this.jumpPressed = true;
            this.jumpReleased = false;
        }
    },

    onKeyUp(e) {
        this.keys[e.code] = false;

        if (e.code === 'Space' || e.code === 'ArrowUp') {
            this.jumpReleased = true;
        }
    },

    onTouchStart(e) {
        if (e) e.preventDefault();
        if (this.jumpReleased) {
            this.jumpPressed = true;
            this.jumpReleased = false;
        }
    },

    onTouchEnd(e) {
        if (e) e.preventDefault();
        this.jumpReleased = true;
    },

    // Check if jump was just pressed (consume the input)
    consumeJump() {
        if (this.jumpPressed) {
            this.jumpPressed = false;
            return true;
        }
        return false;
    },

    // Reset all inputs
    reset() {
        this.keys = {};
        this.jumpPressed = false;
        this.jumpReleased = true;
    }
};
