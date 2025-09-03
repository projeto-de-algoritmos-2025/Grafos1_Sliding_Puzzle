import { Game } from "./structures/game.js"

const image = document.getElementById("gameImage");
image.width = 600;
image.height = 600;

const canvas = document.getElementById("myCanvas");
canvas.width = 600;
canvas.height = 600;

const ctx = canvas.getContext("2d");
const game = new Game([
    [8, 1, 2],
    [0, 3, 5],
    [6, 4, 7]
]);
game.draw(ctx, image, 0, 0, canvas.width, canvas.height);
