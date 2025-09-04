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

async function animate() {
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
document.addEventListener("gameAnimateStart", () => {
    randomizeButton.disabled = true;
});
document.addEventListener("gameAnimateEnd", () => {
    randomizeButton.disabled = false;
});

canvas.addEventListener("mousedown", () => {
    ctx.mouseClick = true;
});
canvas.addEventListener("mouseup", () => {
    ctx.mouseClick = false;
});
canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    if (game.isAnimating) {
        ctx.mousePos = {
            x: -1,
            y: -1,
        }
    } else {
        ctx.mousePos = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        }
    }
});
