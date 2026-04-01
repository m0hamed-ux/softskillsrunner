// UI Manager - Handles screens, HUD, and game state display

const UI = {
    elements: {
        startScreen: null,
        instructionsScreen: null,
        gameoverScreen: null,
        winScreen: null,
        hud: null,
        coinFrame: null,
        coinSlots: [],
        gameoverCoins: null,
        skillPopup: null,
        skillPopupText: null,
        countdown: null,
        countdownNumber: null
    },

    // Skill names (French)
    skillNames: [
        'Communication interpersonnelle',
        'Résolution de problèmes',
        'Efficacité professionnelle',
        'Leadership & Management',
        'Connaissance de soi',
        'Attitudes & bien-être',
        'Gestion des conflits',
        'Aisance relationnelle'
    ],

    init() {
        // Cache DOM elements
        this.elements.startScreen = document.getElementById('start-screen');
        this.elements.instructionsScreen = document.getElementById('instructions-screen');
        this.elements.gameoverScreen = document.getElementById('gameover-screen');
        this.elements.winScreen = document.getElementById('win-screen');
        this.elements.hud = document.getElementById('hud');
        this.elements.coinFrame = document.getElementById('coin-frame');
        this.elements.coinSlots = document.querySelectorAll('.coin-slot');
        this.elements.gameoverCoins = document.getElementById('gameover-coins');
        this.elements.skillPopup = document.getElementById('skill-popup');
        this.elements.skillPopupText = document.getElementById('skill-popup-text');
        this.elements.countdown = document.getElementById('countdown');
        this.elements.countdownNumber = document.getElementById('countdown-number');

        // Set up button handlers
        document.getElementById('start-btn').addEventListener('click', () => {
            this.playButtonSound();
            this.showScreen('instructions');
        });

        document.getElementById('play-btn').addEventListener('click', () => {
            this.playButtonSound();
            if (typeof Game !== 'undefined') Game.start();
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.playButtonSound();
            if (typeof Game !== 'undefined') Game.restart();
        });

        document.getElementById('playagain-btn').addEventListener('click', () => {
            this.playButtonSound();
            if (typeof Game !== 'undefined') Game.restart();
        });

        // Allow space/enter to start from screens
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                if (!this.elements.startScreen.classList.contains('hidden')) {
                    this.playButtonSound();
                    if (typeof Game !== 'undefined') Game.start();
                } else if (!this.elements.gameoverScreen.classList.contains('hidden') ||
                           !this.elements.winScreen.classList.contains('hidden')) {
                    this.playButtonSound();
                    if (typeof Game !== 'undefined') Game.restart();
                }
            }
        });
    },

    playButtonSound() {
        // Optional: Add button click sound
    },

    showScreen(screenName) {
        // Hide all screens
        this.elements.startScreen.classList.add('hidden');
        this.elements.instructionsScreen.classList.add('hidden');
        this.elements.gameoverScreen.classList.add('hidden');
        this.elements.winScreen.classList.add('hidden');
        this.elements.hud.classList.add('hidden');

        // Show requested screen
        switch (screenName) {
            case 'start':
                this.elements.startScreen.classList.remove('hidden');
                break;
            case 'instructions':
                this.elements.instructionsScreen.classList.remove('hidden');
                break;
            case 'gameover':
                this.elements.gameoverScreen.classList.remove('hidden');
                break;
            case 'win':
                this.elements.winScreen.classList.remove('hidden');
                this.createWinParticles();
                break;
            case 'game':
                this.elements.hud.classList.remove('hidden');
                break;
        }
    },

    // Show countdown number
    showCountdown(value) {
        if (!this.elements.countdown || !this.elements.countdownNumber) return;

        // Set text
        this.elements.countdownNumber.textContent = value;

        // Add special class for "GO!"
        if (value === 'GO!') {
            this.elements.countdownNumber.classList.add('go');
        } else {
            this.elements.countdownNumber.classList.remove('go');
        }

        // Show countdown
        this.elements.countdown.classList.remove('hidden');

        // Reset animation
        this.elements.countdownNumber.style.animation = 'none';
        this.elements.countdownNumber.offsetHeight; // Trigger reflow
        this.elements.countdownNumber.style.animation = 'countdownPulse 1s ease-out forwards';
    },

    // Hide countdown
    hideCountdown() {
        if (this.elements.countdown) {
            this.elements.countdown.classList.add('hidden');
        }
    },

    // Show skill name popup when collected
    showSkillPopup(skillIndex, skillName) {
        if (!this.elements.skillPopup || !this.elements.skillPopupText) return;

        // Use provided name or default
        const displayName = skillName || this.skillNames[skillIndex] || `Skill ${skillIndex + 1}`;

        // Set text
        this.elements.skillPopupText.textContent = displayName;

        // Show popup
        this.elements.skillPopup.classList.remove('hidden');

        // Reset animation
        this.elements.skillPopupText.style.animation = 'none';
        this.elements.skillPopupText.offsetHeight; // Trigger reflow
        this.elements.skillPopupText.style.animation = 'skillPopupAnim 1.5s ease-out forwards';

        // Hide after animation
        setTimeout(() => {
            this.elements.skillPopup.classList.add('hidden');
        }, 2000);
    },

    // Fill specific skill slot by index
    fillSkillSlot(skillIndex) {
        const slot = this.elements.coinSlots[skillIndex];
        if (slot && !slot.classList.contains('filled')) {
            slot.classList.add('filled');
            this.createCoinParticles(slot);
        }
    },

    updateSkillSlots(collectedSkills) {
        // Reset all slots first
        this.elements.coinSlots.forEach(slot => {
            slot.classList.remove('filled');
        });

        // Fill collected skill slots
        collectedSkills.forEach(skillIndex => {
            this.fillSkillSlot(skillIndex);
        });

        // Update frame state
        const collected = collectedSkills.length;
        const total = 8;

        if (this.elements.coinFrame) {
            this.elements.coinFrame.classList.remove('almost-complete', 'complete');

            if (collected >= total) {
                this.elements.coinFrame.classList.add('complete');
            } else if (collected >= total - 2) {
                this.elements.coinFrame.classList.add('almost-complete');
            }
        }
    },

    updateCoinCounter(collected, total) {
        // For backward compatibility - now handled by updateSkillSlots
        if (this.elements.coinFrame) {
            this.elements.coinFrame.classList.remove('almost-complete', 'complete');

            if (collected >= total) {
                this.elements.coinFrame.classList.add('complete');
            } else if (collected >= total - 2) {
                this.elements.coinFrame.classList.add('almost-complete');
            }
        }
    },

    createCoinParticles(slot) {
        const rect = slot.getBoundingClientRect();
        const container = this.elements.hud;

        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'coin-particle';

            // Random direction
            const angle = (Math.PI * 2 * i) / 8;
            const distance = 20 + Math.random() * 30;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance - 20;

            particle.style.cssText = `
                left: ${rect.left - container.getBoundingClientRect().left + rect.width / 2}px;
                top: ${rect.top - container.getBoundingClientRect().top + rect.height / 2}px;
                --tx: ${tx}px;
                --ty: ${ty}px;
                background: ${Math.random() > 0.5 ? '#ffd93d' : '#ffe066'};
                width: ${4 + Math.random() * 6}px;
                height: ${4 + Math.random() * 6}px;
            `;

            container.appendChild(particle);

            // Remove particle after animation
            setTimeout(() => particle.remove(), 600);
        }
    },

    createWinParticles() {
        const container = document.getElementById('game-container');
        const colors = ['#ffd93d', '#4ecdc4', '#ff6b6b', '#6c63ff', '#ffe066'];

        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: absolute;
                    width: ${5 + Math.random() * 10}px;
                    height: ${5 + Math.random() * 10}px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                    left: ${Math.random() * 100}%;
                    top: -20px;
                    z-index: 15;
                    pointer-events: none;
                    animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
                `;

                container.appendChild(particle);
                setTimeout(() => particle.remove(), 4000);
            }, i * 50);
        }

        // Add confetti animation if not exists
        if (!document.getElementById('confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = `
                @keyframes confettiFall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(650px) rotate(${360 + Math.random() * 360}deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    },

    resetCoinSlots() {
        // Clear all coin slots
        this.elements.coinSlots.forEach(slot => {
            slot.classList.remove('filled');
        });

        // Reset frame state
        if (this.elements.coinFrame) {
            this.elements.coinFrame.classList.remove('almost-complete', 'complete');
        }

        // Hide skill popup
        if (this.elements.skillPopup) {
            this.elements.skillPopup.classList.add('hidden');
        }
    },

    showGameOver(coinsCollected, totalCoins) {
        if (this.elements.gameoverCoins) {
            this.elements.gameoverCoins.textContent = `Compétences : ${coinsCollected}/${totalCoins}`;
        }
        this.showScreen('gameover');
        this.screenShake();
    },

    screenShake() {
        const container = document.getElementById('game-container');
        container.style.animation = 'none';
        container.offsetHeight; // Trigger reflow
        container.style.animation = 'containerShake 0.4s ease-out';

        // Add shake animation if not exists
        if (!document.getElementById('shake-style')) {
            const style = document.createElement('style');
            style.id = 'shake-style';
            style.textContent = `
                @keyframes containerShake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-8px); }
                    40% { transform: translateX(8px); }
                    60% { transform: translateX(-4px); }
                    80% { transform: translateX(4px); }
                }
            `;
            document.head.appendChild(style);
        }
    },

    showWin() {
        this.showScreen('win');
    }
};
