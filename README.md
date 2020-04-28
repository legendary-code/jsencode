# jsencode
![build](https://github.com/legendary-code/jsencode/workflows/build/badge.svg?branch=master) [![npm version](https://badge.fury.io/js/jsencode.svg)](http://badge.fury.io/js/jsencode)

An implementation for encoding typed JavaScript objects, similar to BEncode

### Example

```javascript
var JSEncoder = require('jsencode');
var Foo = require('foo');
var encoder = new JSEncoder({types:[Foo]});  // or, encoder.registerTypes(Foo, Bar, ...);

encoder.encode("foo"); // returns "3:foo"
encoder.encode({foo: "bar"}); // returns "{3:foo3:bar}"
encoder.encode(new Foo()); // returns "<3:Foo>"

encoder.decode("3:foo"); // returns "foo"
encoder.decode("{3:foo3:bar}"); // returns {foo: "bar"}
encoder.decode("<3:Foo>"); // returns Foo() instance
```

### Options
`types` - specify a list of type constructors to register for deserializing Objects

`includePrivateFields` - allows exclusion of fields that start with '_'

`ignoreUnregisteredTypes` - ignore unregistered types, deserializing it as a null value instead

### Encoding

#### Any
`any := <string> | <number> | <boolean> | <dictionary> | <object> | <array> | <null>`

#### Undefined
`undefined := 'u'`

#### Null
`null := 'n'`

#### String
`string := <length> ':' <value>`

`length = any valid Number value that is an integer >= 0`

`value = any utf-8 encoded string value`

#### Number
`number := '(' <value> ')'`

`value = any valid Number value`

#### Boolean
`boolean := 't' | 'f'`

#### Array
`array := '[' <values> ']'`

`values := (<any>)*`

#### Dictionary (Object with constructor Object)
`dictionary := '{' <string-value-pairs> '}'`

`string-value-pairs := (string-value-pair)*`

`string-value-pair := <string><any>`

#### Object (Object with registered constructor Function)
`object := '<' <type> <string-value-pairs> '>'`

`type := <string>`

`string-value-pairs := (string-value-pair)*`

`string-value-pair := <string><any>`
