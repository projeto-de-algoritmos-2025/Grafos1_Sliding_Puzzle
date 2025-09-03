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
    [0, 2, 1],
    [3, 4, 5],
    [6, 8, 7]
]);

async function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    game.draw(ctx, image, 0, 0, canvas.width, canvas.height);
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
