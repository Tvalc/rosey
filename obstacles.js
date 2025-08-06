class Obstacle {
    constructor(type, x, y, speed) {
        this.type = type; // 'car', 'dog', 'pedestrian'
        this.x = x;
        this.y = y;
        this.width = (type === 'car') ? 70 : 36;
        this.height = (type === 'car') ? 36 : 36;
        this.speed = speed;
        this.crashable = true;
        this.removed = false;
        this.direction = (Math.random() < 0.5) ? 1 : -1; // left/right
        if (type === 'pedestrian') this.direction = 0; // up/down
    }

    update(delta) {
        if (this.type === 'car') {
            this.x += this.speed * this.direction;
            if (this.x < 80 || this.x > 800 - 80 - this.width) this.direction *= -1;
        } else if (this.type === 'dog') {
            this.x += this.speed * this.direction * 0.7;
            if (this.x < 110 || this.x > 800 - 110 - this.width) this.direction *= -1;
        } else if (this.type === 'pedestrian') {
            this.y += this.speed * (Math.random() > 0.5 ? 1 : -1) * 0.6;
        }
    }

    draw(ctx) {
        const Assets = window.Assets || {};
        if (this.type === 'car') {
            const car = Assets.car || { body: "#d32f2f", window: "#fff", wheel: "#333" };
            ctx.save();
            ctx.fillStyle = car.body;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = car.window;
            ctx.fillRect(this.x + 10, this.y + 7, this.width - 20, this.height / 2 - 4);
            ctx.fillStyle = car.wheel;
            ctx.beginPath();
            ctx.arc(this.x + 14, this.y + this.height - 6, 7, 0, 2 * Math.PI);
            ctx.arc(this.x + this.width - 14, this.y + this.height - 6, 7, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        } else if (this.type === 'dog') {
            const dog = Assets.dog || { body: "#a1887f", ear: "#6d4c41" };
            ctx.save();
            ctx.fillStyle = dog.body;
            ctx.fillRect(this.x, this.y + 12, 27, 18);
            ctx.beginPath();
            ctx.arc(this.x + 14, this.y + 12, 12, Math.PI, 2 * Math.PI);
            ctx.fillStyle = dog.ear;
            ctx.fillRect(this.x + 10, this.y + 2, 7, 9);
            ctx.restore();
        } else if (this.type === 'pedestrian') {
            const ped = Assets.pedestrian || { body: "#4caf50", head: "#ffe082" };
            ctx.save();
            ctx.fillStyle = ped.body;
            ctx.fillRect(this.x + 8, this.y + 20, 20, 16);
            ctx.beginPath();
            ctx.arc(this.x + 18, this.y + 12, 12, 0, 2 * Math.PI);
            ctx.fillStyle = ped.head;
            ctx.fill();
            ctx.restore();
        }
    }
}

class Powerup {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'extraPaper'
        this.width = 20;
        this.height = 20;
        this.removed = false;
    }

    update(delta) {
        // They scroll up (move down rel. to player)
        this.y += 2.4;
    }

    draw(ctx) {
        const Assets = window.Assets || {};
        if (this.type === 'extraPaper') {
            const p = Assets.extraPaper || { color: "#fffde7", border: "#bdbdbd" };
            ctx.save();
            ctx.fillStyle = p.color;
            ctx.strokeStyle = p.border;
            ctx.lineWidth = 2;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.beginPath();
            ctx.moveTo(this.x + 5, this.y + 5);
            ctx.lineTo(this.x + 15, this.y + 15);
            ctx.moveTo(this.x + 15, this.y + 5);
            ctx.lineTo(this.x + 5, this.y + 15);
            ctx.stroke();
            ctx.restore();
        }
    }
}

window.Obstacle = Obstacle;
window.Powerup = Powerup;