class House {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 70;
        this.hit = false;
        this.mailbox = {
            x: x + 65,
            y: y + 50,
            w: 18,
            h: 22,
            delivered: false
        };
    }

    checkDelivery(paper) {
        // Paper hits mailbox
        if (
            paper.x < this.mailbox.x + this.mailbox.w &&
            paper.x + paper.w > this.mailbox.x &&
            paper.y < this.mailbox.y + this.mailbox.h &&
            paper.y + paper.h > this.mailbox.y
        ) {
            this.mailbox.delivered = true;
            return true;
        }
        return false;
    }

    draw(ctx) {
        const Assets = window.Assets || {};
        const house = Assets.house || { wall: "#ffd54f", roof: "#b71c1c", door: "#795548" };
        ctx.save();
        // Draw house
        ctx.fillStyle = house.wall;
        ctx.fillRect(this.x, this.y + 20, this.width, this.height - 20);
        // Roof
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + 20);
        ctx.lineTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + 20);
        ctx.closePath();
        ctx.fillStyle = house.roof;
        ctx.fill();
        // Door
        ctx.fillStyle = house.door;
        ctx.fillRect(this.x + this.width / 2 - 8, this.y + this.height - 22, 16, 22);
        // Mailbox
        this.drawMailbox(ctx);
        ctx.restore();
    }

    drawMailbox(ctx) {
        const Assets = window.Assets || {};
        const box = Assets.mailbox || { color: "#388e3c", flag: "#e53935" };
        ctx.save();
        // Box
        ctx.fillStyle = this.mailbox.delivered ? "#e8f5e9" : box.color;
        ctx.fillRect(this.mailbox.x, this.mailbox.y, this.mailbox.w, this.mailbox.h - 8);
        // Flag
        ctx.fillStyle = box.flag;
        ctx.fillRect(this.mailbox.x + this.mailbox.w - 5, this.mailbox.y - 6, 5, 10);
        ctx.restore();
    }
}

class Level {
    constructor() {
        this.houses = [];
        this.scrollY = 0;
        this.roadY = 0;
        this.roadSpeed = 2.5;
        this.houseSpacing = 170;
        this.routeLength = 12;
        this.generate();
    }

    generate() {
        // Place houses along right side (alternating top/bottom)
        this.houses = [];
        let offset = 60;
        for (let i = 0; i < this.routeLength; i++) {
            let y = 130 + i * this.houseSpacing;
            this.houses.push(new House(630, y - this.scrollY));
        }
    }

    update(delta) {
        this.scrollY += this.roadSpeed;
        // Move houses up
        for (const h of this.houses) {
            h.y -= this.roadSpeed;
            if (h.mailbox) h.mailbox.y -= this.roadSpeed;
        }
        // Remove houses above screen
        this.houses = this.houses.filter(h => h.y < 600);
    }

    draw(ctx) {
        // Draw road
        ctx.save();
        ctx.fillStyle = "#bbb";
        ctx.fillRect(100, 0, 800-200, 600);
        // Lane lines
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 5;
        for (let y = 0; y < 600; y += 40) {
            ctx.beginPath();
            ctx.moveTo(400, y + (this.scrollY % 40));
            ctx.lineTo(400, y + 25 + (this.scrollY % 40));
            ctx.stroke();
        }
        ctx.restore();
        // Draw houses
        for (const h of this.houses) {
            h.draw(ctx);
        }
    }
}

window.Level = Level;
window.House = House;