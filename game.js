// Defensive dependency checks
window.addEventListener('DOMContentLoaded', function initGame() {
    if (!window.Player || !window.Level || !window.Obstacle || !window.UI) {
        setTimeout(initGame, 60); // Wait for all scripts
        return;
    }
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    let player, level, ui, projectiles, obstacles, powerups;
    let input = { left: false, right: false, space: false };
    let lastTime = performance.now();
    let spawnObstacleTimer = 0;
    let spawnPowerupTimer = 0;
    let gameState = 'menu';

    // --- SOUND SYSTEM ---
    function playSound(type) {
        const Assets = window.Assets || {};
        if (!Assets.sounds || !Assets.sounds[type]) return;
        try {
            const ctxAudio = window.AudioContext ? new window.AudioContext() : null;
            if (!ctxAudio) return;
            let now = ctxAudio.currentTime;
            const arr = Assets.sounds[type];
            for (let i = 0; i < arr.length; i += 2) {
                let osc = ctxAudio.createOscillator();
                osc.type = "square";
                osc.frequency.setValueAtTime(arr[i], now);
                osc.connect(ctxAudio.destination);
                osc.start(now);
                osc.stop(now + arr[i+1]);
                now += arr[i+1];
            }
        } catch (e) {}
    }

    function resetGame() {
        player = new window.Player(180, 320);
        level = new window.Level();
        ui = new window.UI();
        projectiles = [];
        obstacles = [];
        powerups = [];
        input = { left: false, right: false, space: false };
        spawnObstacleTimer = 0;
        spawnPowerupTimer = 0;
        gameState = 'playing';
        ui.setState('playing');
    }

    function handleInput(e, down) {
        if (e.repeat) return;
        if (e.code === 'ArrowLeft') input.left = down;
        if (e.code === 'ArrowRight') input.right = down;
        if (e.code === 'Space') input.space = down;
        if (gameState === 'gameover' && down) {
            resetGame();
        }
    }

    document.addEventListener('keydown', e => handleInput(e, true));
    document.addEventListener('keyup', e => handleInput(e, false));

    // Main game loop
    function gameLoop(now) {
        let delta = now - lastTime;
        lastTime = now;

        // Game state handling
        if (!ui) ui = new window.UI();
        if (ui.state === 'menu') {
            ctx.clearRect(0, 0, 800, 600);
            level = new window.Level();
            level.draw(ctx);
            ui.updateOverlay();
            requestAnimationFrame(gameLoop);
            return;
        }
        if (ui.state === 'gameover') {
            ctx.clearRect(0, 0, 800, 600);
            level.draw(ctx);
            ui.updateOverlay();
            requestAnimationFrame(gameLoop);
            return;
        }
        if (ui.state === 'playing' && gameState !== 'playing') {
            resetGame();
        }

        // --- UPDATE ---
        // Player
        player.update(input, delta, 600);
        // Level (scrolls houses/road)
        level.update(delta);

        // Obstacles
        spawnObstacleTimer -= delta;
        if (spawnObstacleTimer <= 0) {
            let r = Math.random();
            if (r < 0.5) {
                // Car on road
                let laneX = 160 + Math.random() * (800-320-70);
                obstacles.push(new window.Obstacle('car', laneX, -38, 2.4 + Math.random()*1.4));
            } else if (r < 0.8) {
                // Dog
                let dogX = 180 + Math.random() * (800-240-36);
                obstacles.push(new window.Obstacle('dog', dogX, -32, 2 + Math.random()*1.5));
            } else {
                // Pedestrian
                let px = 150 + Math.random()* (800-300-30);
                obstacles.push(new window.Obstacle('pedestrian', px, -32, 2 + Math.random()*0.7));
            }
            spawnObstacleTimer = 900 + Math.random()*700;
        }
        // Update and remove offscreen
        for (let ob of obstacles) ob.update(delta);
        obstacles = obstacles.filter(ob => ob.y < 600 && ob.x > 0 && ob.x < 800 && !ob.removed);

        // Powerups (extra papers)
        spawnPowerupTimer -= delta;
        if (spawnPowerupTimer <= 0) {
            let x = 200 + Math.random()*(800-400);
            powerups.push(new window.Powerup(x, -22, 'extraPaper'));
            spawnPowerupTimer = 4000 + Math.random()*4000;
        }
        for (let p of powerups) p.update(delta);
        powerups = powerups.filter(p => p.y < 600 && !p.removed);

        // Projectiles (newspapers)
        for (let p of projectiles) {
            p.x += p.vx;
            p.y += p.vy + level.roadSpeed;
        }
        projectiles = projectiles.filter(p => p.x > 0 && p.x < 800 && p.y > -30 && p.y < 600);

        // --- COLLISIONS ---
        // Player-obstacle
        for (let ob of obstacles) {
            if (
                !player.isCrashed &&
                ob.crashable &&
                player.x < ob.x + ob.width &&
                player.x + player.width > ob.x &&
                player.y < ob.y + ob.height &&
                player.y + player.height > ob.y
            ) {
                player.crash();
                playSound('crash');
                ui.setState('gameover');
                ui.setScore(player.score);
                ui.setHighScore(player.score);
                gameState = 'gameover';
            }
        }
        // Player-powerup
        for (let pu of powerups) {
            if (
                player.x < pu.x + pu.width &&
                player.x + player.width > pu.x &&
                player.y < pu.y + pu.height &&
                player.y + player.height > pu.y
            ) {
                player.collectPaper();
                playSound('pickup');
                pu.removed = true;
            }
        }

        // Projectiles-houses (mailboxes)
        for (let p of projectiles) {
            for (let h of level.houses) {
                if (!h.mailbox.delivered && h.checkDelivery(p)) {
                    p.x = -999; // Remove projectile
                    player.score += 300;
                    playSound('deliver');
                }
            }
        }
        // Projectiles-obstacles
        for (let p of projectiles) {
            for (let ob of obstacles) {
                if (
                    ob.crashable &&
                    p.x < ob.x + ob.width &&
                    p.x + p.w > ob.x &&
                    p.y < ob.y + ob.height &&
                    p.y + p.h > ob.y
                ) {
                    ob.removed = true;
                    p.x = -999;
                    player.score += 150;
                }
            }
        }

        // Player input: throw
        if (input.space) {
            let thrown = player.throwNewspaper(projectiles);
            if (thrown) playSound('throw');
            input.space = false;
        }

        // Win condition: all mailboxes delivered or reached end
        let delivered = 0;
        for (const h of level.houses) if (h.mailbox.delivered) delivered++;
        if (delivered >= level.routeLength) {
            ui.setState('gameover');
            ui.setScore(player.score);
            ui.setHighScore(player.score);
            playSound('powerup');
            gameState = 'gameover';
        }

        // Lose: run out of newspapers and none left on screen
        if (player.newspapers === 0 && powerups.length === 0 && projectiles.length === 0) {
            ui.setState('gameover');
            ui.setScore(player.score);
            ui.setHighScore(player.score);
            playSound('crash');
            gameState = 'gameover';
        }

        // --- RENDER ---
        ctx.clearRect(0, 0, 800, 600);
        level.draw(ctx);
        for (let h of level.houses) h.draw(ctx);

        // Draw powerups, obstacles, player, projectiles
        for (let pu of powerups) pu.draw(ctx);
        for (let ob of obstacles) ob.draw(ctx);
        for (let p of projectiles) drawNewspaper(ctx, p);
        player.draw(ctx);

        // UI
        ui.drawIngame(ctx, player, level);

        requestAnimationFrame(gameLoop);
    }

    function drawNewspaper(ctx, p) {
        const Assets = window.Assets || {};
        const np = Assets.newspaper || { color: "#fff", border: "#bbb" };
        ctx.save();
        ctx.fillStyle = np.color;
        ctx.strokeStyle = np.border;
        ctx.lineWidth = 2;
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeRect(p.x, p.y, p.w, p.h);
        ctx.restore();
    }

    // Show menu on load
    ui = new window.UI();
    ui.setState('menu');

    // Start the game loop
    requestAnimationFrame(gameLoop);
});