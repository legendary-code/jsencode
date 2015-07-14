# jsencode
An extended implementation of BEncode for encoding typed JavaScript objects

### Encoding

#### Any
`any := <string> | <number> | <boolean> | <dictionary> | <object> | <array> | <null>`

#### Null
`null := n`

#### String
`string := <length>:<value>`
`length = integer >= 0`
`value = any utf-8 encoded string value`

#### Number
`number := '(' <value> ')'`
`value = any valid number value`

#### Boolean
`boolean := t | f`

#### Array
`array := '[' <values> ']'`
`values := (<any>)*`

#### Dictionary (Object with constructor Object)
`'{' <string-value-pairs> '}'`
`string-value-pairs := (string-value-pair)*`
`string-value-pair := <string><any>`

#### Object (Object with registered constructor function)
`'<' <ype><string-value-pairs> '>'`
`type := <string>`
`string-value-pairs := (string-value-pair)*`
`string-value-pair := <string><any>`
