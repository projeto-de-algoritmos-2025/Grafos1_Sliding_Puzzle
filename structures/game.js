/**
 * @typedef {[[number, number, number], [number, number, number], [number, number, number]]} GameBoard
 */

export class Game {
    /**@type {GameBoard} */
    #board;
    /**@type {number} */
    #emptyPieceI;
    /**@type {number} */
    #emptyPieceJ;

    /**
     * @param {GameBoard} array 
     */
    constructor(array) {
        this.#board = array;
        for(let i = 0; i < 3; i++) {
            for(let j = 0; j < 3; j++) {
                if(array[i][j] == 8) {
                    this.#emptyPieceI = i;
                    this.#emptyPieceJ = j;
                }
            }
        }
    }

    draw(ctx, image, x, y, width, height) {
        const padding = 3;
        width = width - padding * 2;
        height = height - padding * 2;

        const pieceWidth = width / 3;
        const pieceHeight = height / 3;
        const imgPieceWidht = image.naturalWidth / 3;
        const imgPieceHeight = image.naturalHeight / 3;

        this.#board.forEach((line, i) => {
            line.forEach((boardPiece, j) => {
                const pieceX = j * (pieceWidth + padding) + x;
                const pieceY = i * (pieceHeight + padding) + y;

                const pieceOriginalI = Math.floor(boardPiece / 3);
                const pieceOriginalJ = boardPiece % 3;

                const imgX = Math.floor(image.naturalWidth / 3 * (pieceOriginalJ));
                const imgY = Math.floor(image.naturalHeight / 3 * (pieceOriginalI));

                if (boardPiece != 8) {
                    ctx.drawImage(
                        image,
                        imgX,
                        imgY,
                        imgPieceWidht,
                        imgPieceHeight,

                        pieceX,
                        pieceY,
                        pieceWidth,
                        pieceHeight
                    );
                }
            });
        });
    }
}
