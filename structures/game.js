import { Queue } from './queue.js'

/**@type {[number, number][]} */
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

    get isAnimating() {
        return this.#isAnimating;
    }

    #isValidCoordinate(i, j) {
        return i >= 0 && i < 3 && j >= 0 && j < 3;
    }

    #moveTo(i, j) {
        this.#board[this.#emptyPieceI][this.#emptyPieceJ] = this.#board[i][j];
        this.#board[i][j] = 8;
        this.#emptyPieceI = i;
        this.#emptyPieceJ = j;
        return this;
    }

    /**@returns {[number, number][]} */
    #possibleMoves() {
        return movements.map(movement => {
            const newI = this.#emptyPieceI + movement[0];
            const newJ = this.#emptyPieceJ + movement[1];
            return [newI, newJ];
        })
        .filter(([i, j]) => this.#isValidCoordinate(i, j));
    }

    async randomize(qtd = 100, delay = 10) {
        if(this.#isAnimating) {
            return;
        }
        this.#isAnimating = true;
        document.dispatchEvent(new CustomEvent("gameAnimateStart"));

        for (let i = 0; i < qtd; i++) {
            const possibleMovements = this.#possibleMoves();
            const randomMove = possibleMovements[Math.floor(Math.random() * possibleMovements.length)];
            this.#moveTo(randomMove[0], randomMove[1]);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }

        this.#isAnimating = false;
        document.dispatchEvent(new CustomEvent("gameAnimateEnd"));
    }

    #copy() {
        return new Game(this.#board.map(row => row.map(piece => piece)));
    }

    #toInt() {
        let intValue = 0;
        let weight = 1;
        for(let i = 0; i< 3; i++) {
            for(let j = 0; j < 3; j++) {
                intValue += weight * this.#board[i][j];
                weight *= 9;
            }
        }
        return intValue;
    }

    /**
     * @param {number} boardInt 
     * @returns {[GameBoard, number, number]}
     */
    static #fromInt(boardInt) {
        const board = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        let emptyPieceI;
        let emptyPieceJ;

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const value = boardInt % 9;
                if (value == 8) {
                    emptyPieceI = i;
                    emptyPieceJ = j;
                }

                board[i][j] = value;
                boardInt = Math.floor(boardInt / 9);
            }
        }
        
        return [board, emptyPieceI, emptyPieceJ];
    }

    #isSolved() {
        return this.#toInt() === 381367044;
    }

    async solve(delay = 1000) {
        if(this.#isAnimating) {
            return;
        }
        this.#isAnimating = true;
        document.dispatchEvent(new CustomEvent("gameAnimateStart"));

        /** @type {Queue<Game>} */
        const queue = new Queue();
        /** @type {Set<number>} */
        const inQueue = new Set();
        /** @type {Map<number, number>} */
        const cameFrom = new Map();

        queue.push(this);
        inQueue.add(this.#toInt());

        while(!queue.isEmpty()) {
            const actualState = queue.pop();
            if(actualState.#isSolved()) {
                break;
            }
            const actualStateAsInt = actualState.#toInt();
            
            for(const [i, j] of actualState.#possibleMoves()) {
                const newState = actualState.#copy().#moveTo(i, j);
                const newStateAsInt = newState.#toInt();

                if(!inQueue.has(newStateAsInt)) {
                    queue.push(newState);
                    inQueue.add(newStateAsInt);
                    cameFrom.set(newStateAsInt, actualStateAsInt);
                }
            }
        }

        const path = [];
        let actualState = 381367044; // solved state
        while(cameFrom.get(actualState)) {
            path.push(actualState);
            actualState = cameFrom.get(actualState);;
        }

        for await (const state of path.reverse()) {
            await new Promise((resolve) => setTimeout(resolve, delay));
            [this.#board, this.#emptyPieceI, this.#emptyPieceJ] = Game.#fromInt(state);
        }
        this.#isAnimating = false;
        document.dispatchEvent(new CustomEvent("gameAnimateEnd"));
    }


    #isAdjacentToEmpty(i, j) {
        return Math.abs(i - this.#emptyPieceI) + Math.abs(j - this.#emptyPieceJ) === 1;
    }


    #prevSelectI = null;
    #prevSelectJ = null;
    /**
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {number} pieceWidth 
     * @param {number} pieceHeight 
     * @param {number} padding 
     * @returns {[boolean, number, number]}
     */
    #handleMouseEvent(ctx, x, y, width, height, pieceWidth, pieceHeight, padding) {
        if(!ctx.mouseClick || !ctx.mousePos) {
            this.#prevSelectI = null;
            this.#prevSelectJ = null;
            return [false, -1, -1];
        }
        
        const mousePos = ctx.mousePos;
        const mouseI = mousePos.x >= x && mousePos.x <= x+width ? Math.floor((mousePos.y - y)/(pieceWidth + padding)) : -1;
        const mouseJ = mousePos.y >= y && mousePos.y <= y+height ? Math.floor((mousePos.x - x)/(pieceHeight + padding)) : -1;

        const isMouseEventValid =
            this.#isValidCoordinate(mouseI, mouseJ) && this.#isAdjacentToEmpty(mouseI, mouseJ)
            || (mouseI === this.#emptyPieceI && mouseJ === this.#emptyPieceJ);

        if(!isMouseEventValid) {
            this.#prevSelectI = null;
            this.#prevSelectJ = null;
            return [false, mouseI, mouseJ];
        }
        
        if(
            this.#prevSelectI != null && this.#prevSelectJ != null 
            && (mouseI != this.#prevSelectI || mouseJ != this.#prevSelectJ)
            && (mouseI == this.#emptyPieceI && mouseJ == this.#emptyPieceJ)
        ) {
            this.#moveTo(this.#prevSelectI, this.#prevSelectJ);
        }
        this.#prevSelectI = mouseI;
        this.#prevSelectJ = mouseJ;

        return [true, mouseI, mouseJ];
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} pieceHeight 
     * @param {number} pieceWidth 
     * @param {number} pieceX 
     * @param {number} pieceY 
     * @param {'black' | 'white'} color 
     * @param {number} width 
     */
    #drawPieceLabel(ctx, boardPiece, pieceHeight, pieceWidth, pieceX, pieceY, width, innerColor, outerColor) {
        const minPieceMeasure = Math.min(pieceHeight, pieceWidth);
        const textPadding = minPieceMeasure * 0.05;
        const radius = minPieceMeasure * 0.1;

        const beforeLineWidth = ctx.lineWidth;
        const beforeStrokeColor = ctx.strokeStyle;
        const beforeFont = ctx.font = `${radius}px Arial`;
        const beforeTextAlign = ctx.textAlign = "center";
        const beforeTextBaseline = ctx.textBaseline = "middle";

        ctx.lineWidth = width + 1;
        ctx.strokeStyle = outerColor;
        ctx.beginPath();
        ctx.arc(
            pieceX + textPadding + radius,
            pieceY + textPadding + radius,
            radius,
            0,
            Math.PI * 2
        );
        ctx.stroke();

        ctx.lineWidth = width;
        ctx.strokeStyle = innerColor;
        ctx.beginPath();
        ctx.arc(
            pieceX + textPadding + radius,
            pieceY + textPadding + radius,
            radius,
            0,
            Math.PI * 2
        );
        ctx.stroke();


        ctx.font = `${radius*1.5}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = innerColor;
        ctx.strokeStyle = outerColor;

        ctx.beginPath();
        ctx.strokeText(
            (boardPiece + 1).toString(), pieceX + textPadding + radius, pieceY + textPadding + radius
        );
        ctx.fillText(
            (boardPiece + 1).toString(), pieceX + textPadding + radius, pieceY + textPadding + radius
        );

        ctx.lineWidth = beforeLineWidth;
        ctx.strokeStyle = beforeStrokeColor;
        ctx.font = beforeFont;
        ctx.textAlign = beforeTextAlign;
        ctx.textBaseline = beforeTextBaseline;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx
     * @param {HTMLImageElement} image
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     */
    draw(ctx, image, x, y, width, height) {
        const padding = 3;
        width = width - padding * 2;
        height = height - padding * 2;

        const pieceWidth = width / 3;
        const pieceHeight = height / 3;

        const imgRatio = image.naturalWidth/image.naturalHeight;
        const boardRatio = width/height;

        let imgXOffset = 0;
        let imgYOffset = 0;
        let imgPieceWidth = image.naturalWidth / 3;
        let imgPieceHeight = image.naturalHeight / 3;
        if(imgRatio < boardRatio) {
            const scale = width/image.naturalWidth;
            const scaledHeigth = image.naturalHeight*scale;
            imgYOffset = (scaledHeigth - height)/2/scale;
            imgPieceHeight = pieceHeight/scale;
            console.log({scale, scaledHeigth, height, imgPieceHeight, pieceHeight})
        } else {
            const scale = height/image.naturalHeight;
            const scaledWidth = image.naturalWidth*scale;
            imgXOffset = (scaledWidth - width)/2/scale;
            imgPieceWidth = pieceWidth/scale;
            console.log({iw: image.naturalWidth, imgXOffset, imgPieceWidth})
        }

        const [isMouseEventValid, mouseI, mouseJ] = this.#handleMouseEvent(
            ctx,
            x,
            y,
            width,
            height,
            pieceWidth,
            pieceHeight,
            padding
        );

        const emptyPieceX = this.#emptyPieceJ * (pieceWidth + padding) + x;
        const emptyPieceY = this.#emptyPieceI * (pieceWidth + padding) + y;

        this.#board.forEach((line, i) => {
            line.forEach((boardPiece, j) => {
                let pieceX = j * (pieceWidth + padding) + x;
                let pieceY = i * (pieceHeight + padding) + y;
                if(isMouseEventValid && j == mouseJ && mouseI == i) {
                    if(mouseI == this.#emptyPieceI) {
                        const minX = Math.min(emptyPieceX, pieceX);
                        const maxX = Math.max(emptyPieceX, pieceX);
                        pieceX = Math.min(Math.max(minX, ctx.mousePos.x - pieceWidth/2), maxX);
                    } else if(mouseJ == this.#emptyPieceJ) {
                        const minY = Math.min(emptyPieceY, pieceY);
                        const maxY = Math.max(emptyPieceY, pieceY);
                        pieceY = Math.min(Math.max(minY, ctx.mousePos.y - pieceHeight/2), maxY);
                    }
                }

                const pieceOriginalI = Math.floor(boardPiece / 3);
                const pieceOriginalJ = boardPiece % 3;

                const imgX = imgPieceWidth * (pieceOriginalJ);
                const imgY = imgPieceHeight * (pieceOriginalI);

                if (boardPiece != 8) {
                    ctx.drawImage(
                        image,
                        imgX + imgXOffset,
                        imgY + imgYOffset,
                        imgPieceWidth,
                        imgPieceHeight,

                        pieceX,
                        pieceY,
                        pieceWidth,
                        pieceHeight
                    );
                    this.#drawPieceLabel(
                        ctx, boardPiece, pieceHeight, pieceWidth,
                        pieceX, pieceY, 3, "black", "white"
                    )
                }
            });
        });
    }
}