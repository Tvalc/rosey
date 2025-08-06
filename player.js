class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 34;
        this.height = 34;
        this.velY = 0;
        this.velX = 0;
        this.speed = 5;
        this.direction = 'up';
        this.isCrashed = false;
        this.crashTimer = 0;
        this.newspapers = 10;
        this.maxNewspapers = 10;
        this.throwCooldown = 0;
        this.score = 0;
    }

    update(input, delta, gameHeight) {
        if (this.isCrashed) {
            this.crashTimer -= delta;
            if (this.crashTimer <= 0) {
                this.isCrashed = false;
            }
            return;
        }
        // Movement
        if (input.left) {
            this.x -= this.speed;
            this.direction = 'left';
        } else if (input.right) {
            this.x += this.speed;
            this.direction = 'right';
        } else {
            this.direction = 'up';
        }
        // Stay in bounds (road)
        this.x = Math.max(100, Math.min(this.x, 800 - 100 - this.width));
        // Y doesn't change (auto scroll)
        if (this.throwCooldown > 0) this.throwCooldown -= delta;
    }

    throwNewspaper(projectiles) {
        if (this.throwCooldown > 0 || this.newspapers <= 0 || this.isCrashed) return false;
        let vx = 8;
        let vy = 0;
        if (this.direction === 'left') vx = -8;
        if (this.direction === 'up') { vx = 0; vy = -8; }
        projectiles.push({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            vx: vx,
            vy: vy,
            w: 14,
            h: 7
        });
        this.newspapers--;
        this.throwCooldown = 240; // ms
        return true;
    }

    crash() {
        this.isCrashed = true;
        this.crashTimer = 1200; // ms
    }

    collectPaper() {
        this.newspapers = Math.min(this.newspapers + 3, this.maxNewspapers);
    }

    draw(ctx) {
        const Assets = window.Assets || {};
        const sprite = (Assets.playerSprites && Assets.playerSprites[this.direction]) || { color: "#1a8cff", wheelColor: "#222" };
        // Main body
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        if (this.direction === 'left') ctx.rotate(-0.15);
        if (this.direction === 'right') ctx.rotate(0.15);
        ctx.globalAlpha = this.isCrashed ? 0.5 : 1;
        ctx.fillStyle = sprite.color;
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height-6);
        // Wheels
        ctx.fillStyle = sprite.wheelColor;
        ctx.beginPath();
        ctx.arc(-this.width/3, this.height/2 - 7, 6, 0, 2 * Math.PI);
        ctx.arc(this.width/3, this.height/2 - 7, 6, 0, 2 * Math.PI);
        ctx.fill();
        // Head (helmet)
        ctx.beginPath();
        ctx.fillStyle = "#fffde7";
        ctx.arc(0, -this.height/3, 9, 0, 2*Math.PI);
        ctx.fill();
        ctx.restore();
    }
}
window.Player = Player;