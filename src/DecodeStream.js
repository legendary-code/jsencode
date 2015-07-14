export class DecodeStream {
    constructor(text) {
        this._text = text;
        this._index = 0;
    }

    reset() {
        this._index = 0;
    }

    peek() {
        return this._index < this._text.length ? this._text[this._index] : null;
    }

    next() {
        return this._index < this._text.length ? this._text[this._index++] : null;
    }

    expect(value) {
        this.expectNotEof();
        this._expect(value, this.next());
    }

    _expect(given, actual) {
        if (actual !== given) {
            throw "expected '" + given + "' at offset " + this._index;
        }
    }

    expectEof() {
        if (this._index < this._text.length) {
            throw "expected end of input";
        }
    }

    expectNotEof() {
        if (this._index >= this._text.length) {
            throw "unexpected end of input";
        }
    }
}