// Obstacle Class - Rocks, Crates, Barrels

class Obstacle {
    constructor(ctx, groundY, canvasWidth, type = null) {
        this.ctx = ctx;
        this.groundY = groundY;
        this.canvasWidth = canvasWidth;

        // Random obstacle type if not specified
        this.types = ['rock', 'crate', 'barrel'];
        this.type = type || this.types[Math.floor(Math.random() * this.types.length)];

        // Set size based on type
        this.setDimensions();

        // Start off-screen to the right
        this.x = canvasWidth + 50;
        this.y = groundY - this.height;

        // Load sprite
        this.sprite = new Image();
        this.sprite.src = `assets/images/obstacles/${this.type}.png`;
        this.spriteLoaded = false;
        this.sprite.onload = () => { this.spriteLoaded = true; };
    }

    setDimensions() {
        switch (this.type) {
            case 'rock':
                this.width = 64;
                this.height = 50;
                break;
            case 'crate':
                this.width = 60;
                this.height = 55;
                break;
            case 'barrel':
                this.width = 50;
                this.height = 65;
                break;
            default:
                this.width = 60;
                this.height = 55;
        }
    }

    update(gameSpeed) {
        this.x -= gameSpeed;
    }

    draw() {
        const ctx = this.ctx;

        if (this.spriteLoaded) {
            ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        } else {
            // Fallback drawings
            this.drawFallback();
        }
    }

    drawFallback() {
        const ctx = this.ctx;
        const x = this.x;
        const y = this.y;
        const w = this.width;
        const h = this.height;

        switch (this.type) {
            case 'rock':
                // Gray rock with highlights
                ctx.fillStyle = '#708090';
                ctx.beginPath();
                ctx.moveTo(x + 10, y + h);
                ctx.lineTo(x, y + h - 15);
                ctx.lineTo(x + 5, y + 10);
                ctx.lineTo(x + w / 2, y);
                ctx.lineTo(x + w - 5, y + 8);
                ctx.lineTo(x + w, y + h - 10);
                ctx.lineTo(x + w - 10, y + h);
                ctx.closePath();
                ctx.fill();

                // Highlight
                ctx.fillStyle = '#A9A9A9';
                ctx.beginPath();
                ctx.moveTo(x + 15, y + 15);
                ctx.lineTo(x + w / 2, y + 5);
                ctx.lineTo(x + w / 2 + 10, y + 20);
                ctx.closePath();
                ctx.fill();
                break;

            case 'crate':
                // Wooden crate
                ctx.fillStyle = '#DEB887';
                ctx.fillRect(x, y, w, h);

                // Darker planks
                ctx.fillStyle = '#CD853F';
                ctx.fillRect(x, y, w, 5);
                ctx.fillRect(x, y + h - 5, w, 5);
                ctx.fillRect(x, y + h / 2 - 2, w, 4);

                // Vertical lines
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x + w / 3, y);
                ctx.lineTo(x + w / 3, y + h);
                ctx.moveTo(x + (2 * w) / 3, y);
                ctx.lineTo(x + (2 * w) / 3, y + h);
                ctx.stroke();

                // Border
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 3;
                ctx.strokeRect(x, y, w, h);
                break;

            case 'barrel':
                // Red/brown barrel
                ctx.fillStyle = '#8B0000';
                ctx.beginPath();
                ctx.ellipse(x + w / 2, y + 10, w / 2, 10, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#A52A2A';
                ctx.fillRect(x, y + 10, w, h - 20);

                ctx.fillStyle = '#8B0000';
                ctx.beginPath();
                ctx.ellipse(x + w / 2, y + h - 10, w / 2, 10, 0, 0, Math.PI * 2);
                ctx.fill();

                // Metal bands
                ctx.fillStyle = '#4A4A4A';
                ctx.fillRect(x - 2, y + 15, w + 4, 6);
                ctx.fillRect(x - 2, y + h - 21, w + 4, 6);
                break;
        }
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }

    getCollisionBox() {
        return {
            x: this.x + 5,
            y: this.y + 5,
            width: this.width - 10,
            height: this.height - 5
        };
    }
}

// Obstacle Manager
class ObstacleManager {
    constructor(ctx, groundY, canvasWidth) {
        this.ctx = ctx;
        this.groundY = groundY;
        this.canvasWidth = canvasWidth;
        this.obstacles = [];

        // Spawn settings
        this.spawnTimer = 0;
        this.minSpawnInterval = 1500; // ms
        this.maxSpawnInterval = 3000; // ms
        this.nextSpawnTime = this.getRandomSpawnTime();
    }

    getRandomSpawnTime() {
        return this.minSpawnInterval + Math.random() * (this.maxSpawnInterval - this.minSpawnInterval);
    }

    update(deltaTime, gameSpeed) {
        // Update spawn timer
        this.spawnTimer += deltaTime;

        if (this.spawnTimer >= this.nextSpawnTime) {
            this.spawn();
            this.spawnTimer = 0;
            this.nextSpawnTime = this.getRandomSpawnTime();
        }

        // Update obstacles
        this.obstacles.forEach(obstacle => obstacle.update(gameSpeed));

        // Remove off-screen obstacles
        this.obstacles = this.obstacles.filter(obstacle => !obstacle.isOffScreen());
    }

    spawn() {
        const obstacle = new Obstacle(this.ctx, this.groundY, this.canvasWidth);
        this.obstacles.push(obstacle);
    }

    draw() {
        this.obstacles.forEach(obstacle => obstacle.draw());
    }

    checkCollision(player) {
        for (const obstacle of this.obstacles) {
            if (Collision.checkEntityCollision(player, obstacle, 12, 8)) {
                return true;
            }
        }
        return false;
    }

    reset() {
        this.obstacles = [];
        this.spawnTimer = 0;
        this.nextSpawnTime = this.getRandomSpawnTime();
    }
}
