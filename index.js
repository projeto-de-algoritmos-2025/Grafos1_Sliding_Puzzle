import { Game } from "./structures/game.js"

const image = document.getElementById("gameImage");
image.width = 600;
image.height = 600;

/**@type {HTMLCanvasElement} */
const canvas = document.getElementById("myCanvas");
canvas.width = 600;
canvas.height = 600;

const ctx = canvas.getContext("2d");
const game = new Game([
    [0, 1, 8],
    [3, 4, 2],
    [6, 7, 5]
]);

function adjustCanvasSize() {
    if (window.innerWidth > 1400) {
        canvas.width = 600;
        canvas.height = 600;
        gameImage.width = 600;
        gameImage.height = 600;
    } else {
        const size = Math.min(Math.min(window.innerHeight, window.innerWidth) * 0.9, 400);
        canvas.width = size;
        canvas.height = size;
        gameImage.width = size;
        gameImage.height = size;
    }
}

async function animate() {
    adjustCanvasSize();
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = 'orange'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    game.draw(ctx, image, 10, 10, canvas.width-20, canvas.height-20);
}
animate();

/**@type {HTMLButtonElement} */
const randomizeButton = document.getElementById("randomizeButton");
randomizeButton.addEventListener("click", () => {
    game.randomize();
});
/**@type {HTMLButtonElement} */
const solveButton = document.getElementById("solveButton");
solveButton.addEventListener("click", () => {
    game.solve();
});
document.addEventListener("gameAnimateStart", () => {
    randomizeButton.disabled = true;
    solveButton.disabled = true;
});
document.addEventListener("gameAnimateEnd", () => {
    randomizeButton.disabled = false;
    solveButton.disabled = false;
});

function updateMousePos(x, y) {
    const rect = canvas.getBoundingClientRect();
    if (game.isAnimating) {
        ctx.mousePos = {
            x: -1,
            y: -1,
        }
    } else {
        ctx.mousePos = {
            x: x - rect.left,
            y: y - rect.top,
        }
    }
}

// Mouse Events
canvas.addEventListener("mousedown", (e) => {
    updateMousePos(e.clientX, e.clientY);
    ctx.mouseClick = true;
});
canvas.addEventListener("mouseup", () => {
    ctx.mouseClick = false;
});
canvas.addEventListener("mousemove", (e) => {
    updateMousePos(e.clientX, e.clientY);
});

// Touch Events
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    updateMousePos(touch.clientX, touch.clientY);
    ctx.mouseClick = true;
}, { passive: false });
canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    ctx.mouseClick = false;
}, { passive: false });
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    updateMousePos(touch.clientX, touch.clientY);
}, { passive: false });
