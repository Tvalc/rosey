class UI {
    constructor() {
        this.state = 'menu'; // menu, playing, paused, gameover
        this.score = 0;
        this.highScore = 0;
        this.tutorialShown = false;
        this.overlay = document.getElementById('ui-overlay');
        this.overlay.innerHTML = '';
        this.overlay.style.display = 'none';
    }

    setState(state) {
        this.state = state;
        this.updateOverlay();
    }

    setScore(score) {
        this.score = score;
        this.updateOverlay();
    }

    setHighScore(score) {
        if (score > this.highScore) this.highScore = score;
        this.updateOverlay();
    }

    showTutorial() {
        if (this.tutorialShown) return;
        this.overlay.style.display = 'block';
        this.overlay.innerHTML =
            `<div class="ui-box">
                <h2>How to Play</h2>
                <ul>
                  <li>←/→: Steer left/right</li>
                  <li>Space: Throw newspaper at mailbox</li>
                  <li>Avoid cars, dogs, pedestrians</li>
                  <li>Collect extra newspapers</li>
                  <li>Deliver to mailboxes for points</li>
                </ul>
                <button id="close-tut-btn">Start Game</button>
            </div>`;
        document.getElementById('close-tut-btn').onclick = () => {
            this.overlay.style.display = 'none';
            this.tutorialShown = true;
            this.setState('playing');
        };
    }

    updateOverlay() {
        if (this.state === 'menu') {
            this.overlay.style.display = 'block';
            this.overlay.innerHTML =
                `<div class="ui-box">
                    <h1>Paperboy SNIB</h1>
                    <button id="start-btn">Start</button>
                    <br><br>
                    <span>High Score: ${this.highScore}</span>
                </div>`;
            const btn = document.getElementById('start-btn');
            if (btn) btn.onclick = () => this.showTutorial();
        } else if (this.state === 'gameover') {
            this.overlay.style.display = 'block';
            this.overlay.innerHTML =
                `<div class="ui-box">
                    <h2>Game Over</h2>
                    <p>Score: ${this.score}</p>
                    <p>High Score: ${this.highScore}</p>
                    <button id="restart-btn">Restart</button>
                </div>`;
            const btn = document.getElementById('restart-btn');
            if (btn) btn.onclick = () => this.setState('playing');
        } else {
            this.overlay.style.display = 'none';
        }
    }

    drawIngame(ctx, player, level) {
        // Top bar: Score, Newspapers
        ctx.save();
        ctx.font = "20px monospace";
        ctx.fillStyle = "#222";
        ctx.globalAlpha = 0.85;
        ctx.fillRect(0, 0, 800, 38);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#fff";
        ctx.textAlign = "left";
        ctx.fillText(`Score: ${player.score}`, 16, 28);
        ctx.fillText(`Newspapers: ${player.newspapers}`, 180, 28);
        let delivered = 0;
        for (const h of level.houses) if (h.mailbox.delivered) delivered++;
        ctx.fillText(`Delivered: ${delivered}/${level.routeLength}`, 370, 28);
        ctx.restore();
    }
}
window.UI = UI;