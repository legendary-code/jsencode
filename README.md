# jsencode
An implementation for encoding typed JavaScript objects, similar to BEncode

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
`dictionary := '{' <string-value-pairs> '}'`

`string-value-pairs := (string-value-pair)*`

`string-value-pair := <string><any>`

#### Object (Object with registered constructor Function)
`object := '<' <ype><string-value-pairs> '>'`

`type := <string>`

`string-value-pairs := (string-value-pair)*`

`string-value-pair := <string><any>`
