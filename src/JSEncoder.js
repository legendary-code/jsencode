class DecodeStream {
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
        if (!this.isEof()) {
            throw "expected end of input";
        }
    }

    expectNotEof() {
        if (this.isEof()) {
            throw "unexpected end of input";
        }
    }

    isEof() {
        return this._index >= this._text.length;
    }
}

export default class JSEncoder {
    constructor(opts) {
        this._types = {};

        if (!opts) {
            return;
        }

        if (opts.types) {
            this.registerTypes(...opts.types);
        }
    }

    registerTypes(...types) {
        for (let type of types) {
            if (type.constructor !== Function) {
                throw "type" + type + " must be a Function";
            }

            let name = this._getTypeName(type);

            if (!name) {
                throw "anonymous type cannot be registered";
            }

            if (this._types.hasOwnProperty(name)) {
                throw "type " + name + " already registered";
            }

            this._types[name] = type;
        }
    }

    encode(value) {
        return this._encodeAny(value);
    }

    _getTypeName(ctor) {
        let typeName = ctor.name;

        if (typeName === undefined) {
            return this._guessTypeName(ctor);
        }

        // coerce empty string to null
        return typeName || null;
    }

    // This is to support IE 9+, which doesn't support constructor.name
    _guessTypeName(ctor) {
        let regex = /function\s([^(]{1,})\(/;
        let results = regex.exec(ctor.toString());
        return (results && results.length > 1) ? results[1].trim() : null;
    }

    _canEncode(value) {
        if (value == null) {
            return true;
        }

        switch (value.constructor) {
            case String:
            case Number:
            case Boolean:
            case Array:
            case Object:
                return true;

            case Function:
                return false;
        }

        return value.constructor.constructor === Function;
    }

    _encodeAny(value) {
        if (value === null) {
            return this._encodeNull();
        }

        switch (value.constructor) {
            case String:
                return this._encodeString(value);

            case Number:
                return this._encodeNumber(value);

            case Boolean:
                return this._encodeBoolean(value);

            case Array:
                return this._encodeArray(value);

            case Object:
                return this._encodeDictionary(value);

            case Function:
                throw "cannot encode Function";
        }

        if (value.constructor.constructor === Function) {
            return this._encodeObject(value);
        }

        throw "unable to encode unsupported type " + value.constructor.name;
    }

    _encodeNull() {
        return "n";
    }

    _encodeString(value) {
        return value.length + ":" + value;
    }

    _encodeNumber(value) {
        return "(" + value + ")";
    }

    _encodeBoolean(value) {
        return value ? "t" : "f";
    }

    _encodeArray(values) {
        let encoded = "[";

        for (let value of values) {
            if (!this._canEncode(value)) {
                continue;
            }
            encoded += this._encodeAny(value);
        }

        return encoded + "]";
    }

    _encodeDictionary(value) {
        let encoded = "{";

        for (let key in value) {
            if (value.hasOwnProperty(key) && this._canEncode(value[key])) {
                encoded += this._encodeString(key);
                encoded += this._encodeAny(value[key]);
            }
        }

        return encoded + "}";
    }

    _encodeObject(value) {
        let typeName = this._getTypeName(value.constructor);

        if (!typeName) {
            throw "could not determine type for value " + value;
        }

        let encoded = "<" + this._encodeString(typeName);

        for (let key in value) {
            if (value.hasOwnProperty(key) && this._canEncode(value[key])) {
                encoded += this._encodeString(key);
                encoded += this._encodeAny(value[key]);
            }
        }

        return encoded + ">";
    }

    decode(value) {
        let stream = new DecodeStream(value);
        let result = this._decodeAny(stream);
        stream.expectEof();
        return result;
    }

    _decodeAny(stream) {
        stream.expectNotEof();

        switch (stream.peek()) {
            case "n":
                return this._decodeNull(stream);

            case "(":
                return this._decodeNumber(stream);

            case "t":
            case "f":
                return this._decodeBoolean(stream);

            case "[":
                return this._decodeArray(stream);

            case "{":
                return this._decodeDictionary(stream);

            case "<":
                return this._decodeObject(stream);
        }

        return this._decodeString(stream);
    }

    _decodeNull(stream) {
        stream.expect("n");
        return null;
    }

    _decodeString(stream) {
        let lengthString = "";
        let value = "";

        while (!stream.isEof() && this._isNumber(stream.peek())) {
            lengthString += stream.next();
        }

        let length = Number(lengthString);

        if (Math.floor(length) !== length || length < 0) {
            throw lengthString + " is not a valid length value for string";
        }

        stream.expect(":");

        for (let i = 0; i < length; ++i) {
            stream.expectNotEof();
            value += stream.next();
        }

        return value;
    }

    _decodeNumber(stream) {
        let value = "";
        stream.expect("(");
        while (!stream.isEof() && stream.peek() != ")") {
            value += stream.next();
        }
        stream.expect(")");

        let num = Number(value);

        if (isNaN(num)) {
            throw value + " is not a valid Number value";
        }

        return num;
    }

    _decodeBoolean(stream) {
        stream.expectNotEof();
        if (stream.peek("t") || stream.peek("f")) {
            return stream.next() === "t";
        }

        throw stream.peek() + " is not a valid Boolean value";
    }

    _decodeArray(stream) {
        let value = [];

        stream.expect("[");
        while (!stream.isEof() && stream.peek() != "]") {
            value.push(this._decodeAny(stream));
        }
        stream.expect("]");

        return value;
    }

    _decodeDictionary(stream) {
        let value = {};

        stream.expect("{");
        while (!stream.isEof() && stream.peek() != "}") {
            let key = this._decodeString(stream);
            value[key] = this._decodeAny(stream);
        }
        stream.expect("}");

        return value;
    }

    _decodeObject(stream) {
        stream.expect("<");

        let typeString = this._decodeString(stream);

        if (!this._types.hasOwnProperty(typeString)) {
            throw typeString + " is not a known registered type";
        }

        let TValue = this._types[typeString];
        let value = new TValue();

        while (!stream.isEof() && stream.peek() != ">") {
            let key = this._decodeString(stream);
            value[key] = this._decodeAny(stream);
        }
        stream.expect(">");

        return value;
    }

    _isNumber(char) {
        return !isNaN(Number(char));
    }
}