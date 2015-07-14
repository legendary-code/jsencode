export { JSEncoder } from './JSEncoder';

import { JSEncoder}  from './JSEncoder';

class Foo {
    constructor() {
        this._value = "foo";
    }
}

let encoder = new JSEncoder({types: [Foo]});

let encoded =
    encoder.encode(
        {
            number: 123,
            float: 123.456,
            scientific: 1e10,
            str: "foo",
            array: [123, 123.456, 1e10, "foo"],
            truthiness: true,
            falsity: false,
            dict: {
                number: 123,
                string: "bar"
            },
            foo: new Foo()
        }
    );

console.log(encoded);

let decoded = encoder.decode(encoded);

console.log(JSON.stringify(decoded));