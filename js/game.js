// Main Game Controller

const Game = {
    // Canvas
    canvas: null,
    ctx: null,
    width: 800,
    height: 600,

    // Game objects
    background: null,
    player: null,
    obstacleManager: null,
    skillManager: null,

    // Game state
    state: 'menu', // 'menu', 'countdown', 'playing', 'winning', 'gameover', 'win'
    gameSpeed: 6,
    baseSpeed: 6,
    speedIncrement: 0.0005,

    // Countdown
    countdownValue: 3,
    countdownTimer: 0,

    // Win delay
    winTimer: 0,
    winDelay: 2000, // 2 seconds before showing win screen

    // Timing
    lastTime: 0,
    deltaTime: 0,

    // Audio
    sounds: {
        jump: null,
        skillCollect: null,
        hit: null,
        win: null,
        bgMusic: null
    },
    soundsEnabled: true,

    init() {
        // Get canvas
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Initialize input
        Input.init();

        // Initialize UI
        UI.init();

        // Load sounds
        this.loadSounds();

        // Create game objects
        this.createGameObjects();

        // Show start screen
        UI.showScreen('start');

        // Start game loop (but paused)
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    },

    loadSounds() {
        const soundFiles = {
            jump: 'assets/sounds/jump.wav',
            skillCollect: 'assets/sounds/coin_collect.wav',
            hit: 'assets/sounds/hit.wav',
            win: 'assets/sounds/win.wav',
            bgMusic: 'assets/sounds/background_music.mp3'
        };

        for (const [name, path] of Object.entries(soundFiles)) {
            const audio = new Audio();
            audio.src = path;

            if (name === 'bgMusic') {
                audio.loop = true;
                audio.volume = 0.3;
            } else {
                audio.volume = 0.5;
            }

            this.sounds[name] = audio;
        }
    },

    playSound(soundName) {
        if (!this.soundsEnabled || !this.sounds[soundName]) return;

        const sound = this.sounds[soundName];

        // For short sounds, clone and play to allow overlapping
        if (soundName !== 'bgMusic') {
            sound.currentTime = 0;
        }

        sound.play().catch(() => {
            // Audio play failed (likely no user interaction yet)
        });
    },

    stopSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].pause();
            this.sounds[soundName].currentTime = 0;
        }
    },

    createGameObjects() {
        const groundY = 500;

        this.background = new Background(this.ctx, this.width, this.height);
        this.player = new Player(this.ctx, groundY);
        this.obstacleManager = new ObstacleManager(this.ctx, groundY, this.width);
        this.skillManager = new SkillManager(this.ctx, groundY, this.width);
    },

    start() {
        // Start countdown first
        this.state = 'countdown';
        this.countdownValue = 3;
        this.countdownTimer = 0;
        this.gameSpeed = 0; // No movement during countdown

        // Reset game objects
        this.player.reset();
        this.obstacleManager.reset();
        this.skillManager.reset();
        Input.reset();

        // Reset UI
        UI.resetCoinSlots();

        // Show HUD and start countdown
        UI.showScreen('game');
        UI.showCountdown(this.countdownValue);
    },

    startPlaying() {
        this.state = 'playing';
        this.gameSpeed = this.baseSpeed;

        // Start background music
        this.playSound('bgMusic');
    },

    restart() {
        this.start();
    },

    gameOver() {
        this.state = 'gameover';
        this.stopSound('bgMusic');
        this.playSound('hit');

        UI.showGameOver(
            this.skillManager.getCollectedCount(),
            this.skillManager.getTotalSkills()
        );
    },

    win() {
        this.state = 'win';
        this.stopSound('bgMusic');
        this.playSound('win');

        UI.showWin();
    },

    gameLoop(currentTime) {
        // Calculate delta time
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Cap delta time to prevent huge jumps
        if (this.deltaTime > 100) this.deltaTime = 100;

        // Update and render based on state
        if (this.state === 'countdown') {
            this.updateCountdown();
        } else if (this.state === 'playing') {
            this.update();
        } else if (this.state === 'winning') {
            this.updateWinning();
        }

        this.render();

        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    },

    update() {
        // Handle jump input
        if (Input.consumeJump()) {
            if (this.player.jump()) {
                this.playSound('jump');
            }
        }

        // Gradually increase speed
        this.gameSpeed += this.speedIncrement * this.deltaTime;

        // Update game objects
        this.background.update(this.gameSpeed);
        this.player.update(this.deltaTime);
        this.obstacleManager.update(this.deltaTime, this.gameSpeed);
        this.skillManager.update(this.deltaTime, this.gameSpeed);

        // Check obstacle collision
        if (this.obstacleManager.checkCollision(this.player)) {
            this.gameOver();
            return;
        }

        // Check skill collection
        const result = this.skillManager.checkCollision(this.player);
        if (result.collected) {
            this.playSound('skillCollect');

            // Show skill name popup
            UI.showSkillPopup(result.skillIndex, result.skillName);

            // Fill the specific skill slot
            UI.fillSkillSlot(result.skillIndex);

            // Update frame state
            UI.updateSkillSlots(this.skillManager.getCollectedSkills());
        }

        // Check win condition
        if (this.skillManager.hasWon()) {
            this.state = 'winning';
            this.winTimer = 0;
        }
    },

    updateWinning() {
        // Keep the game running for a moment
        this.background.update(this.gameSpeed);
        this.player.update(this.deltaTime);

        this.winTimer += this.deltaTime;
        if (this.winTimer >= this.winDelay) {
            this.win();
        }
    },

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw game objects (back to front)
        this.background.draw();

        if (this.state === 'playing' || this.state === 'gameover' || this.state === 'win' || this.state === 'countdown' || this.state === 'winning') {
            this.skillManager.draw();
            this.obstacleManager.draw();
            this.player.draw();
        }
    },

    updateCountdown() {
        this.countdownTimer += this.deltaTime;

        // Each countdown step is 1 second
        if (this.countdownTimer >= 1000) {
            this.countdownTimer = 0;
            this.countdownValue--;

            if (this.countdownValue > 0) {
                UI.showCountdown(this.countdownValue);
            } else if (this.countdownValue === 0) {
                UI.showCountdown('GO!');
            } else {
                // Countdown finished, start the game
                UI.hideCountdown();
                this.startPlaying();
            }
        }

        // Update background during countdown (slow movement)
        this.background.update(1);
    }
};

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
