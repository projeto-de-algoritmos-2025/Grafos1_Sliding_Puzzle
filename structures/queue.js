/** @template I */
export class Queue {
    /**@type {I[]} */
    #data;
    /**@type {number} */
    #head;
    /**@type {number} */
    #tail;
    /**@type {number} */
    #size;
    /**@type {number} */
    #capacity;

    constructor(capacity = 1000) {
        this.#data = new Array(capacity);
        this.#head = 0;
        this.#tail = 0;
        this.#size = 0;
        this.#capacity = capacity;
    }

    /** @param {I} value  */
    push(value) {
        if (this.#size === this.#capacity) {
            const newArray = new Array(this.#capacity*2);
            for (let i = 0; i < this.#size; i++) {
                newArray[i] = this.#data[(this.#head + i) % this.#capacity];
            }

            this.#capacity *= 2;
            this.#data = newArray;
            this.#head = 0;
            this.#tail = this.#size;
        }
        
        this.#data[this.#tail] = value;
        this.#tail = (this.#tail + 1) % this.#capacity;
        this.#size++;
    }

    /**
     * 
     * @returns {I}
     */
    pop() {
        if (this.#size === 0) return null;
        const value = this.#data[this.#head];
        this.#head = (this.#head + 1) % this.#capacity;
        this.#size--;

        return value;
    }

    isEmpty() {
        return this.#size === 0;
    }
}