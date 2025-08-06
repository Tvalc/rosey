// All game assets defined as data URIs or procedural data
// No external files - only base64 or generated shapes/colors

const Assets = {
    // Player sprites (as colored rectangles with bike)
    playerSprites: {
        up: { color: "#1a8cff", wheelColor: "#333" },
        left: { color: "#1565c0", wheelColor: "#222" },
        right: { color: "#1976d2", wheelColor: "#222" }
    },
    // Newspaper: as a small white rectangle
    newspaper: { color: "#fff", border: "#bbb" },
    // Mailbox: as a colored rectangle
    mailbox: { color: "#388e3c", flag: "#e53935" },
    // House: as a rectangle with a triangle roof
    house: { wall: "#ffd54f", roof: "#b71c1c", door: "#795548" },
    // Obstacles: car, dog, pedestrian
    car: { body: "#e53935", window: "#fff", wheel: "#333" },
    dog: { body: "#a1887f", ear: "#6d4c41" },
    pedestrian: { body: "#4caf50", head: "#ffe082" },
    // Collectibles: extra newspaper, powerup
    extraPaper: { color: "#fffde7", border: "#bdbdbd" },
    // Simple sound effects (short beep patterns)
    sounds: {
        throw: [200, 0.05, 240, 0.05],
        deliver: [440, 0.07, 880, 0.03],
        crash: [180, 0.1, 120, 0.1, 60, 0.05],
        pickup: [640, 0.05, 1000, 0.05],
        powerup: [523, 0.06, 659, 0.08, 784, 0.08]
    }
};
window.Assets = Assets;