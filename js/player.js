// Player Class - Character with animations and physics

class Player {
    constructor(ctx, groundY) {
        this.ctx = ctx;
        this.groundY = groundY;

        // Position and size
        this.width = 80;
        this.height = 80;
        this.x = 100;
        this.y = groundY - this.height;

        // Physics
        this.velocityY = 0;
        this.gravity = 0.8;
        this.jumpForce = -16;
        this.isGrounded = true;
        this.isJumping = false;

        // Double jump
        this.maxJumps = 2;
        this.jumpsRemaining = this.maxJumps;
        this.doubleJumpForce = -14;

        // Neon trail
        this.trail = [];
        this.maxTrailLength = 12;
        this.trailColors = ['#ff6b6b', '#ff8e8e', '#ffb4b4', '#ffd4d4'];

        // Animation
        this.currentState = 'idle';
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.frameInterval = 100; // ms per frame

        // Animation frames configuration
        this.animations = {
            idle: { frames: 4, speed: 150 },
            run: { frames: 6, speed: 80 },
            jump: { frames: 4, speed: 100 }
        };

        // Sprite images
        this.sprites = {
            idle: [],
            run: [],
            jump: []
        };

        this.spritesLoaded = false;
        this.loadSprites();
    }

    loadSprites() {
        const states = ['idle', 'run', 'jump'];
        let loadedCount = 0;
        const totalImages = 4 + 6 + 4; // idle + run + jump frames

        states.forEach(state => {
            const frameCount = this.animations[state].frames;
            for (let i = 1; i <= frameCount; i++) {
                const img = new Image();
                const paddedNum = String(i).padStart(2, '0');
                img.src = `assets/images/player/${state}/${state}_${paddedNum}.png`;

                img.onload = () => {
                    loadedCount++;
                    if (loadedCount === totalImages) {
                        this.spritesLoaded = true;
                    }
                };

                img.onerror = () => {
                    // Image failed to load, will use fallback
                    loadedCount++;
                };

                this.sprites[state].push(img);
            }
        });
    }

    jump() {
        if (this.jumpsRemaining > 0) {
            // First jump or double jump
            if (this.isGrounded) {
                this.velocityY = this.jumpForce;
                this.isGrounded = false;
            } else {
                // Double jump - slightly weaker
                this.velocityY = this.doubleJumpForce;
            }

            this.jumpsRemaining--;
            this.isJumping = true;
            this.currentState = 'jump';
            this.frameIndex = 0;
            return true; // Jump successful (for sound)
        }
        return false;
    }

    update(deltaTime) {
        // Store position for trail
        this.trail.unshift({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            alpha: 1
        });

        // Limit trail length
        if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
        }

        // Fade trail
        this.trail.forEach((point, index) => {
            point.alpha = 1 - (index / this.maxTrailLength);
        });

        // Apply gravity
        if (!this.isGrounded) {
            this.velocityY += this.gravity;
            this.y += this.velocityY;

            // Check ground collision
            if (this.y >= this.groundY - this.height) {
                this.y = this.groundY - this.height;
                this.velocityY = 0;
                this.isGrounded = true;
                this.isJumping = false;
                this.jumpsRemaining = this.maxJumps; // Reset jumps on landing
            }
        }

        // Update animation state
        if (this.isJumping || !this.isGrounded) {
            this.currentState = 'jump';
        } else if (this.isGrounded) {
            this.currentState = 'run'; // Always running in endless runner
        }

        // Update animation frame
        this.frameTimer += deltaTime;
        const anim = this.animations[this.currentState];

        if (this.frameTimer >= anim.speed) {
            this.frameTimer = 0;
            this.frameIndex = (this.frameIndex + 1) % anim.frames;
        }
    }

    draw() {
        const ctx = this.ctx;

        // Draw neon trail first (behind player)
        this.drawTrail();

        const sprites = this.sprites[this.currentState];

        // Check if sprite is loaded
        if (sprites[this.frameIndex] && sprites[this.frameIndex].complete && sprites[this.frameIndex].naturalWidth > 0) {
            ctx.drawImage(sprites[this.frameIndex], this.x, this.y, this.width, this.height);
        } else {
            // Fallback: Draw cartoon character
            this.drawFallbackCharacter();
        }
    }

    drawTrail() {
        const ctx = this.ctx;

        // Draw trail behind the player (to the left, simulating movement)
        for (let i = this.trail.length - 1; i >= 0; i--) {
            const point = this.trail[i];
            const progress = i / this.maxTrailLength;
            const size = (1 - progress) * 20;

            // Position trail to the left (behind player) with slight wave
            const offsetX = -i * 8; // Spread horizontally to the left
            const waveY = Math.sin(i * 0.5 + Date.now() * 0.005) * 3; // Subtle wave motion
            const drawX = this.x + 20 + offsetX;
            const drawY = point.y + waveY;

            const colorIndex = Math.min(i, this.trailColors.length - 1);

            ctx.save();
            ctx.globalAlpha = point.alpha * 0.7;

            // Neon glow effect
            const gradient = ctx.createRadialGradient(
                drawX, drawY, 0,
                drawX, drawY, size
            );
            gradient.addColorStop(0, this.trailColors[0]);
            gradient.addColorStop(0.5, this.trailColors[colorIndex]);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(drawX, drawY, size, 0, Math.PI * 2);
            ctx.fill();

            // Inner bright core for first few points
            if (i < 4) {
                ctx.globalAlpha = point.alpha * 0.9;
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(drawX, drawY, size * 0.25, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    drawFallbackCharacter() {
        const ctx = this.ctx;
        const x = this.x;
        const y = this.y;
        const w = this.width;
        const h = this.height;

        // Neon glow around character
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.shadowColor = '#ff6b6b';
        ctx.shadowBlur = 20;

        // Body (rounded rectangle)
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.roundRect(x + 15, y + 25, w - 30, h - 35, 10);
        ctx.fill();
        ctx.restore();

        // Body without glow
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.roundRect(x + 15, y + 25, w - 30, h - 35, 10);
        ctx.fill();

        // Head
        ctx.fillStyle = '#FFE4C4';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + 20, 18, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x + w / 2 - 6, y + 18, 4, 0, Math.PI * 2);
        ctx.arc(x + w / 2 + 6, y + 18, 4, 0, Math.PI * 2);
        ctx.fill();

        // Smile
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + w / 2, y + 22, 8, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // Legs animation
        const legOffset = this.isJumping ? 10 : Math.sin(this.frameIndex * 1.5) * 8;
        ctx.fillStyle = '#4A90D9';
        ctx.fillRect(x + 20, y + h - 20, 12, 15 + legOffset);
        ctx.fillRect(x + w - 32, y + h - 20, 12, 15 - legOffset);

        // Shoes
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 18, y + h - 8 + legOffset, 16, 8);
        ctx.fillRect(x + w - 34, y + h - 8 - legOffset, 16, 8);

        // Arms
        ctx.fillStyle = '#FFE4C4';
        const armSwing = this.isJumping ? -20 : Math.sin(this.frameIndex * 1.5) * 15;
        ctx.save();
        ctx.translate(x + 15, y + 35);
        ctx.rotate((armSwing * Math.PI) / 180);
        ctx.fillRect(-5, 0, 10, 25);
        ctx.restore();

        ctx.save();
        ctx.translate(x + w - 15, y + 35);
        ctx.rotate((-armSwing * Math.PI) / 180);
        ctx.fillRect(-5, 0, 10, 25);
        ctx.restore();

        // Double jump indicator (show remaining jumps)
        if (!this.isGrounded && this.jumpsRemaining > 0) {
            ctx.save();
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = '#4ecdc4';
            for (let i = 0; i < this.jumpsRemaining; i++) {
                ctx.beginPath();
                ctx.arc(x + w / 2 - 8 + i * 16, y - 10, 5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    reset() {
        this.y = this.groundY - this.height;
        this.velocityY = 0;
        this.isGrounded = true;
        this.isJumping = false;
        this.jumpsRemaining = this.maxJumps;
        this.currentState = 'idle';
        this.frameIndex = 0;
        this.trail = [];
    }

    getCollisionBox() {
        // Slightly smaller hitbox for fairness
        return {
            x: this.x + 15,
            y: this.y + 10,
            width: this.width - 30,
            height: this.height - 15
        };
    }
}
