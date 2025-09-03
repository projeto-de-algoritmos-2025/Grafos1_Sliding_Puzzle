const movements = [
    [-1, 0], // CIMA
    [0, 1],  // DIREITA
    [1, 0],  // BAIXO
    [0, -1], // ESQUERDA
]

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

    #isAnimating = false;

    /**
     * @param {GameBoard} array 
     */
    constructor(array) {
        this.#board = array;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.#board[i][j] == 8) {
                    this.#emptyPieceI = i;
                    this.#emptyPieceJ = j;
                }
            }
        }
    }

    #isValidCoordinate(i, j) {
        return i >= 0 && i < 3 && j >= 0 && j < 3;
    }

    possibleMoves() {
        return movements.map(movement => {
            const newI = this.#emptyPieceI + movement[0];
            const newJ = this.#emptyPieceJ + movement[1];
            return [newI, newJ];
        })
            .filter(([i, j]) => this.#isValidCoordinate(i, j))
            .map(([i, j]) => {
                const boardCopy = this.#board.map(row => row.map(piece => piece));
                boardCopy[i][j] = 8;
                boardCopy[this.#emptyPieceI][this.#emptyPieceJ] = this.#board[i][j];
                return new Game(boardCopy);
            });
    }

    async randomize(qtd = 100, delay = 100) {
        if(this.#isAnimating) {
            return;
        }
        this.#isAnimating = true;
        document.dispatchEvent(new CustomEvent("gameAnimateStart"));

        for (let i = 0; i < qtd; i++) {
            const possibleStates = this.possibleMoves();
            const randomIndex = Math.floor(Math.random() * possibleStates.length);

            const randomState = possibleStates[randomIndex];

            await new Promise((resolve) => setTimeout(resolve, delay));
            this.#board = randomState.#board;
            this.#emptyPieceI = randomState.#emptyPieceI;
            this.#emptyPieceJ = randomState.#emptyPieceJ;
        }

        this.#isAnimating = false;
        document.dispatchEvent(new CustomEvent("gameAnimateEnd"));
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
