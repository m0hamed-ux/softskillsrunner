// Skill Class - Collectible skills (replaces coins)

class Skill {
    constructor(ctx, groundY, canvasWidth, skillIndex) {
        this.ctx = ctx;
        this.groundY = groundY;
        this.canvasWidth = canvasWidth;

        // Skill identity
        this.skillIndex = skillIndex;
        this.skillNames = [
            'Communication interpersonnelle',
            'Résolution de problèmes',
            'Efficacité professionnelle',
            'Leadership & Management',
            'Connaissance de soi',
            'Attitudes & bien-être',
            'Gestion des conflits',
            'Aisance relationnelle'
        ];
        this.skillName = this.skillNames[skillIndex] || `Skill ${skillIndex + 1}`;

        // Size
        this.width = 50;
        this.height = 50;

        // Position
        this.x = canvasWidth + 50;

        // Random height: ground level or jump height
        const heights = [
            groundY - this.height - 10, // Ground level
            groundY - this.height - 80, // Low jump
            groundY - this.height - 140 // High jump
        ];
        this.y = heights[Math.floor(Math.random() * heights.length)];

        // Animation
        this.floatPhase = Math.random() * Math.PI * 2;
        this.rotationPhase = 0;

        // Sprite
        this.sprite = new Image();
        this.spriteLoaded = false;
        const paddedNum = String(skillIndex + 1).padStart(2, '0');
        this.sprite.src = `assets/images/coins/skill_${paddedNum}.png`;
        this.sprite.onload = () => { this.spriteLoaded = true; };

        // State
        this.collected = false;
        this.missed = false;

        // Glow effect
        this.glowPhase = Math.random() * Math.PI * 2;

        // Colors for fallback (each skill has unique color)
        this.colors = [
            { primary: '#FF6B6B', secondary: '#C0392B' }, // Skill 1 - Red
            { primary: '#4ECDC4', secondary: '#1ABC9C' }, // Skill 2 - Teal
            { primary: '#FFD93D', secondary: '#F39C12' }, // Skill 3 - Yellow
            { primary: '#6C63FF', secondary: '#4834D4' }, // Skill 4 - Purple
            { primary: '#FF9FF3', secondary: '#F368E0' }, // Skill 5 - Pink
            { primary: '#54A0FF', secondary: '#2E86DE' }, // Skill 6 - Blue
            { primary: '#5CD859', secondary: '#27AE60' }, // Skill 7 - Green
            { primary: '#FF9F43', secondary: '#E67E22' }  // Skill 8 - Orange
        ];
        this.color = this.colors[skillIndex] || this.colors[0];
    }

    update(deltaTime, gameSpeed) {
        // Move left
        this.x -= gameSpeed;

        // Floating animation
        this.floatPhase += deltaTime * 0.004;
        this.rotationPhase += deltaTime * 0.002;

        // Update glow phase
        this.glowPhase += deltaTime * 0.005;
    }

    draw() {
        if (this.collected) return;

        const ctx = this.ctx;
        const floatOffset = Math.sin(this.floatPhase) * 5;
        const drawY = this.y + floatOffset;

        // Draw glow effect
        const glowIntensity = 0.4 + Math.sin(this.glowPhase) * 0.2;
        ctx.save();
        ctx.globalAlpha = glowIntensity;
        const gradient = ctx.createRadialGradient(
            this.x + this.width / 2, drawY + this.height / 2, 0,
            this.x + this.width / 2, drawY + this.height / 2, this.width
        );
        gradient.addColorStop(0, this.color.primary);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, drawY + this.height / 2, this.width, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw skill
        if (this.spriteLoaded && this.sprite.complete && this.sprite.naturalWidth > 0) {
            ctx.drawImage(this.sprite, this.x, drawY, this.width, this.height);
        } else {
            this.drawFallback(drawY);
        }
    }

    drawFallback(drawY) {
        const ctx = this.ctx;
        const centerX = this.x + this.width / 2;
        const centerY = drawY + this.height / 2;
        const radius = this.width / 2 - 2;

        ctx.save();

        // Outer circle with gradient
        const gradient = ctx.createRadialGradient(
            centerX - radius * 0.3, centerY - radius * 0.3, 0,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, this.color.primary);
        gradient.addColorStop(1, this.color.secondary);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Skill number
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 18px Fredoka One, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.skillIndex + 1, centerX, centerY);

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(centerX - 8, centerY - 8, radius / 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }

    getCollisionBox() {
        return {
            x: this.x + 5,
            y: this.y + 5,
            width: this.width - 10,
            height: this.height - 10
        };
    }
}

// Skill Manager (replaces CoinManager)
class SkillManager {
    constructor(ctx, groundY, canvasWidth) {
        this.ctx = ctx;
        this.groundY = groundY;
        this.canvasWidth = canvasWidth;
        this.skills = [];

        // Skills configuration
        this.skillNames = [
            'Communication interpersonnelle',
            'Résolution de problèmes',
            'Efficacité professionnelle',
            'Leadership & Management',
            'Connaissance de soi',
            'Attitudes & bien-être',
            'Gestion des conflits',
            'Aisance relationnelle'
        ];

        // Collection tracking
        this.skillsCollected = [];
        this.totalSkills = 8;

        // Spawn queue (skills spawn in random order)
        this.spawnQueue = [];
        this.initSpawnQueue();

        // Spawn settings
        this.spawnTimer = 0;
        this.baseSpawnInterval = 2500; // ms
        this.spawnVariance = 1500; // ms
        this.nextSpawnTime = this.getRandomSpawnTime();

        // Current skill being spawned
        this.currentSkillIndex = 0;
    }

    initSpawnQueue() {
        // Create array of skill indices and shuffle
        this.spawnQueue = [...Array(this.totalSkills).keys()];
        this.shuffleArray(this.spawnQueue);
        this.currentSkillIndex = 0;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    getRandomSpawnTime() {
        return this.baseSpawnInterval + Math.random() * this.spawnVariance;
    }

    update(deltaTime, gameSpeed) {
        // Update spawn timer
        this.spawnTimer += deltaTime;

        if (this.spawnTimer >= this.nextSpawnTime && this.skillsCollected.length < this.totalSkills) {
            this.spawn();
            this.spawnTimer = 0;
            this.nextSpawnTime = this.getRandomSpawnTime();
        }

        // Update skills
        this.skills.forEach(skill => skill.update(deltaTime, gameSpeed));

        // Check for missed skills and respawn
        this.skills.forEach(skill => {
            if (skill.isOffScreen() && !skill.collected) {
                skill.missed = true;
            }
        });

        // Respawn missed skills
        const missedSkills = this.skills.filter(s => s.missed && !s.collected);
        missedSkills.forEach(skill => {
            // Reset position to spawn again
            skill.x = this.canvasWidth + 50 + Math.random() * 200;
            skill.missed = false;
        });

        // Remove collected skills
        this.skills = this.skills.filter(skill => !skill.collected);
    }

    spawn() {
        // Get next skill from queue
        if (this.currentSkillIndex >= this.spawnQueue.length) {
            return; // All skills spawned
        }

        const skillIndex = this.spawnQueue[this.currentSkillIndex];

        // Check if this skill is already collected
        if (this.skillsCollected.includes(skillIndex)) {
            this.currentSkillIndex++;
            return;
        }

        // Check if skill is already on screen
        const existingSkill = this.skills.find(s => s.skillIndex === skillIndex);
        if (existingSkill) {
            return;
        }

        const skill = new Skill(this.ctx, this.groundY, this.canvasWidth, skillIndex);
        this.skills.push(skill);
        this.currentSkillIndex++;
    }

    draw() {
        this.skills.forEach(skill => skill.draw());
    }

    checkCollision(player) {
        for (const skill of this.skills) {
            if (!skill.collected && Collision.checkEntityCollision(player, skill, 10, 5)) {
                skill.collected = true;
                this.skillsCollected.push(skill.skillIndex);
                return {
                    collected: true,
                    skillIndex: skill.skillIndex,
                    skillName: skill.skillName
                };
            }
        }
        return { collected: false };
    }

    hasWon() {
        return this.skillsCollected.length >= this.totalSkills;
    }

    getCollectedCount() {
        return this.skillsCollected.length;
    }

    getCollectedSkills() {
        return this.skillsCollected;
    }

    getTotalSkills() {
        return this.totalSkills;
    }

    getSkillName(index) {
        return this.skillNames[index] || `Skill ${index + 1}`;
    }

    reset() {
        this.skills = [];
        this.skillsCollected = [];
        this.spawnTimer = 0;
        this.initSpawnQueue();
        this.nextSpawnTime = this.getRandomSpawnTime();
    }
}

// Backward compatibility aliases
const Coin = Skill;
const CoinManager = SkillManager;
