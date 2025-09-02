const image = document.getElementById("gameImage");
image.width = 600;
image.height = 600;

const canvas = document.getElementById("myCanvas");
canvas.width = 600;
canvas.height = 600;
const ctx = canvas.getContext("2d");

const padding = 3;
const width = canvas.width - padding * 2;
const height = canvas.height - padding * 2;

const pieceWidth = width / 3;
const pieceHeight = height / 3;
const imgWidht = image.naturalWidth / 3;
const imgHeight = image.naturalHeight / 3;

const board = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8]
];

board.forEach((line, i) => {
    line.forEach((boardPiece, j) => {
        let pieceX = j * (pieceWidth + padding);
        let pieceY = i * (pieceHeight + padding);

        const pieceOriginalI = Math.floor(boardPiece / 3);
        const pieceOriginalJ = boardPiece % 3;

        const imgX = Math.floor(image.naturalWidth / 3 * (pieceOriginalJ));
        const imgY = Math.floor(image.naturalHeight / 3 * (pieceOriginalI));

        if (boardPiece != 8) {
            ctx.drawImage(
                image,
                imgX,
                imgY,
                imgWidht,
                imgHeight,

                pieceX,
                pieceY,
                pieceWidth,
                pieceHeight
            );
        }
    });
});