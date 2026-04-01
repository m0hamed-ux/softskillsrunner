// Parallax Scrolling Background - Space Theme

class Background {
    constructor(ctx, canvasWidth, canvasHeight) {
        this.ctx = ctx;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Only ground layer needed
        this.groundY = 500;
        this.groundScrollX = 0;

        // Stars data
        this.stars = [];
        this.generateStars();

        // Shooting stars
        this.shootingStars = [];
        this.shootingStarTimer = 0;

        // Nebula/galaxy positions
        this.nebulas = [
            { x: 150, y: 120, radius: 100, color1: 'rgba(138, 43, 226, 0.12)', color2: 'rgba(75, 0, 130, 0.05)' },
            { x: 500, y: 200, radius: 80, color1: 'rgba(65, 105, 225, 0.1)', color2: 'rgba(30, 60, 150, 0.04)' },
            { x: 700, y: 80, radius: 70, color1: 'rgba(255, 105, 180, 0.08)', color2: 'rgba(150, 50, 100, 0.03)' }
        ];

        // Distant planets
        this.planets = [
            { x: 650, y: 150, radius: 25, color: '#4a4a6a', ringColor: 'rgba(150, 150, 180, 0.3)', hasRing: true },
            { x: 120, y: 200, radius: 15, color: '#6a4a5a', ringColor: null, hasRing: false }
        ];

        // Floating space particles
        this.particles = [];
        this.generateParticles();
    }

    generateStars() {
        // Background stars (small, static)
        for (let i = 0; i < 150; i++) {
            this.stars.push({
                x: Math.random() * this.canvasWidth,
                y: Math.random() * (this.groundY - 20),
                size: Math.random() * 2 + 0.3,
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.01 + Math.random() * 0.03,
                color: this.getStarColor()
            });
        }
    }

    getStarColor() {
        const colors = ['#ffffff', '#fffafa', '#f0f8ff', '#e6e6fa', '#fff8dc'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    generateParticles() {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * this.canvasWidth,
                y: Math.random() * (this.groundY - 50),
                size: Math.random() * 1.5 + 0.5,
                speed: 0.2 + Math.random() * 0.5,
                alpha: 0.2 + Math.random() * 0.3
            });
        }
    }

    update(gameSpeed) {
        // Update ground scroll
        this.groundScrollX -= gameSpeed;
        if (this.groundScrollX <= -this.canvasWidth) {
            this.groundScrollX = 0;
        }

        // Update star twinkle
        this.stars.forEach(star => {
            star.twinkle += star.twinkleSpeed;
        });

        // Update floating particles
        this.particles.forEach(particle => {
            particle.x -= gameSpeed * particle.speed;
            if (particle.x < -10) {
                particle.x = this.canvasWidth + 10;
                particle.y = Math.random() * (this.groundY - 50);
            }
        });

        // Shooting star logic
        this.shootingStarTimer += 16; // ~60fps
        if (this.shootingStarTimer > 3000 && Math.random() < 0.01) {
            this.createShootingStar();
            this.shootingStarTimer = 0;
        }

        // Update shooting stars
        this.shootingStars = this.shootingStars.filter(star => {
            star.x += star.vx;
            star.y += star.vy;
            star.life -= 0.02;
            return star.life > 0;
        });
    }

    createShootingStar() {
        this.shootingStars.push({
            x: Math.random() * this.canvasWidth * 0.5 + this.canvasWidth * 0.25,
            y: Math.random() * 100 + 20,
            vx: 8 + Math.random() * 4,
            vy: 3 + Math.random() * 2,
            length: 40 + Math.random() * 30,
            life: 1
        });
    }

    draw() {
        const ctx = this.ctx;

        // Draw deep space gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        skyGradient.addColorStop(0, '#0a0a1a');      // Near black at top
        skyGradient.addColorStop(0.3, '#12122a');    // Very dark blue
        skyGradient.addColorStop(0.6, '#1a1a3a');    // Dark purple-blue
        skyGradient.addColorStop(0.85, '#22224a');   // Slightly lighter
        skyGradient.addColorStop(1, '#2a2a5a');      // Purple-blue at horizon
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Draw nebulas
        this.drawNebulas();

        // Draw distant planets
        this.drawPlanets();

        // Draw stars
        this.drawStars();

        // Draw shooting stars
        this.drawShootingStars();

        // Draw floating particles
        this.drawParticles();

        // Draw ground (space platform style)
        this.drawGround();
    }

    drawNebulas() {
        const ctx = this.ctx;

        this.nebulas.forEach(nebula => {
            const gradient = ctx.createRadialGradient(
                nebula.x, nebula.y, 0,
                nebula.x, nebula.y, nebula.radius
            );
            gradient.addColorStop(0, nebula.color1);
            gradient.addColorStop(0.6, nebula.color2);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Add subtle galaxy swirl
        ctx.save();
        ctx.globalAlpha = 0.06;
        ctx.fillStyle = '#8060c0';
        ctx.beginPath();
        ctx.ellipse(350, 150, 120, 35, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawPlanets() {
        const ctx = this.ctx;

        this.planets.forEach(planet => {
            // Planet glow
            const glowGradient = ctx.createRadialGradient(
                planet.x, planet.y, planet.radius * 0.5,
                planet.x, planet.y, planet.radius * 2
            );
            glowGradient.addColorStop(0, 'rgba(100, 100, 150, 0.15)');
            glowGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(planet.x, planet.y, planet.radius * 2, 0, Math.PI * 2);
            ctx.fill();

            // Ring (if has ring, draw behind planet)
            if (planet.hasRing) {
                ctx.save();
                ctx.strokeStyle = planet.ringColor;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.ellipse(planet.x, planet.y, planet.radius * 1.8, planet.radius * 0.4, 0.3, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            // Planet body
            const planetGradient = ctx.createRadialGradient(
                planet.x - planet.radius * 0.3, planet.y - planet.radius * 0.3, 0,
                planet.x, planet.y, planet.radius
            );
            planetGradient.addColorStop(0, planet.color);
            planetGradient.addColorStop(1, '#1a1a2a');
            ctx.fillStyle = planetGradient;
            ctx.beginPath();
            ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawStars() {
        const ctx = this.ctx;

        this.stars.forEach(star => {
            const twinkleAlpha = 0.3 + Math.sin(star.twinkle) * 0.5;

            ctx.save();
            ctx.globalAlpha = Math.max(0.1, twinkleAlpha);
            ctx.fillStyle = star.color;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();

            // Glow for larger stars
            if (star.size > 1.5) {
                ctx.globalAlpha = twinkleAlpha * 0.2;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });
    }

    drawShootingStars() {
        const ctx = this.ctx;

        this.shootingStars.forEach(star => {
            ctx.save();
            ctx.globalAlpha = star.life;

            // Shooting star gradient trail
            const gradient = ctx.createLinearGradient(
                star.x, star.y,
                star.x - star.vx * (star.length / 10), star.y - star.vy * (star.length / 10)
            );
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.3, 'rgba(200, 220, 255, 0.8)');
            gradient.addColorStop(1, 'transparent');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(star.x - star.vx * (star.length / 10), star.y - star.vy * (star.length / 10));
            ctx.stroke();

            // Bright head
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    }

    drawParticles() {
        const ctx = this.ctx;

        this.particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = '#6060a0';
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    drawGround() {
        const ctx = this.ctx;
        const y = this.groundY;
        const height = this.canvasHeight - y;

        // Main ground (dark space platform)
        const groundGradient = ctx.createLinearGradient(0, y, 0, y + height);
        groundGradient.addColorStop(0, '#1a1a2e');
        groundGradient.addColorStop(0.3, '#141428');
        groundGradient.addColorStop(1, '#0a0a18');
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, y, this.canvasWidth, height);

        // Glowing top edge
        ctx.fillStyle = '#4a4a8a';
        ctx.fillRect(0, y, this.canvasWidth, 2);

        // Subtle glow above ground
        const glowGradient = ctx.createLinearGradient(0, y - 20, 0, y);
        glowGradient.addColorStop(0, 'transparent');
        glowGradient.addColorStop(1, 'rgba(74, 74, 138, 0.15)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, y - 20, this.canvasWidth, 20);

        // Scrolling ground pattern (tech lines)
        ctx.strokeStyle = 'rgba(80, 80, 140, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 25; i++) {
            const xPos = ((i * 40) + this.groundScrollX) % (this.canvasWidth + 40) - 20;
            ctx.beginPath();
            ctx.moveTo(xPos, y + 10);
            ctx.lineTo(xPos + 20, y + 10);
            ctx.stroke();
        }

        // Glowing dots on ground
        ctx.fillStyle = 'rgba(100, 100, 200, 0.5)';
        for (let i = 0; i < 15; i++) {
            const xPos = ((i * 60 + 30) + this.groundScrollX * 1.5) % (this.canvasWidth + 60) - 30;
            ctx.beginPath();
            ctx.arc(xPos, y + 50, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    getGroundY() {
        return this.groundY;
    }
}
