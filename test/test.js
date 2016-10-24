var expect = require('chai').expect,
    JSEncoder = require('../index.js');

describe("JSEncoder", function() {

    function Foo() {
        this.value = "bar";
        this._value = "baz";
    }

    function Empty() {
    }

    function Unregistered() {
    }

    function WithProperty() {
    }

    var Anonymous = function() {

    };

    var encoder = new JSEncoder({types: [ Foo ]});
    encoder.registerTypes(Empty);

    describe("configuration", function() {
        it("should be able to register type when constructor.name is not supported", function() {
            var foo = {
                // make it look like a custom type
                constructor: Function,
                toString: function() {
                    return "function Foo() {}";
                }
            };

            new JSEncoder({types: [foo]});
        });

        it("should not be able to register anonymous type", function() {
            expect(function(){
                new JSEncoder({types: [function(){}]});
            }).to.throw();
        });
    });

    describe("encoding", function() {

        it("should encode null", function() {
            expect(encoder.encode(null)).to.equal("n");
        });

        it("should encode String", function() {
            expect(encoder.encode("")).to.equal("0:");
            expect(encoder.encode("foo")).to.equal("3:foo");
            expect(encoder.encode("\x20")).to.equal("1: ");
        });

        it("should encode Number", function() {
            expect(encoder.encode(42)).to.equal("(42)");
            expect(encoder.encode(1.41)).to.equal("(1.41)");
            expect(encoder.encode(1e100)).to.equal("(1e+100)");
        });

        it("should encode Boolean", function() {
            expect(encoder.encode(true)).to.equal("t");
            expect(encoder.encode(false)).to.equal("f");
        });

        it("should encode Array", function() {
            expect(encoder.encode([])).to.equal("[]");
            expect(encoder.encode([123, "foo", true, { value: "bar"}])).to.equal("[(123)3:foot{5:value3:bar}]");
        });

        it("should encode dictionaries", function() {
            expect(encoder.encode({})).to.equal("{}");
            expect(encoder.encode({foo: "bar"})).to.equal("{3:foo3:bar}");
            expect(encoder.encode({foo: 123})).to.equal("{3:foo(123)}");
            expect(encoder.encode({foo: true})).to.equal("{3:foot}");
            expect(encoder.encode({foo: [123]})).to.equal("{3:foo[(123)]}");
            expect(encoder.encode({_foo: 123})).to.equal("{4:_foo(123)}")
        });

        it("should encode objects", function() {
            expect(encoder.encode(new Empty())).to.equal("<5:Empty>");
            expect(encoder.encode(new Foo())).to.equal("<3:Foo5:value3:bar>");
        });

        it("should encode properties in dictionaries defined by Object.defineProperty", function() {
            var person = { firstName: 'Gene', lastName: 'Trog' };
            Object.defineProperty(
                person,
                'fullName',
                {
                    enumerable: false,
                    get: function() {
                        return this.firstName + ' ' + this.lastName;
                    }
                }
            );

            expect(encoder.encode(person)).to.equal("{9:firstName4:Gene8:lastName4:Trog8:fullName9:Gene Trog}");
        });

        it("should encode properties in objects defined by Object.defineProperty", function() {
            Object.defineProperty(
                WithProperty.prototype,
                'value',
                {
                    enumerable: true,
                    get: function() {
                        return "foo";
                    }
                }
            );

            var instance = new WithProperty();
            expect(instance.value).to.equal("foo");
            expect(encoder.encode(instance)).to.equal("<12:WithProperty5:value3:foo>");
        });

        it("should encode objects whose type is not registered", function() {
            expect(encoder.encode(new Unregistered())).to.equal("<12:Unregistered>");
        });

        it("should not encode anonymous objects", function() {
            expect(function(){
                encoder.encode(new Anonymous());
            }).to.throw();
        });

        it("should not encode function directly", function() {
            var func = function() {};
            expect(function() {
                encoder.encode(func);
            }).to.throw();
        });

        it("should not encode functions", function() {
            var func = function() {};
            var foo = {
                bar: func
            };
            expect(encoder.encode(foo)).to.equal("{}");
            expect(encoder.encode([func])).to.equal("[]");
        });
    });

    describe("decoding", function() {

        it("should decode null", function() {
            expect(encoder.decode("n")).to.equal(null);
        });

        it("should decode String", function() {
            expect(encoder.decode("0:")).to.equal("");
            expect(encoder.decode("3:foo")).to.equal("foo");
            expect(encoder.decode("1:\x20")).to.equal(" ");
        });

        it("should decode Number", function() {
            expect(encoder.decode("(42)")).to.equal(42);
            expect(encoder.decode("(1.41)")).to.equal(1.41);
            expect(encoder.decode("(1e+100)")).to.equal(1e+100);
        });

        it("should decode Boolean", function() {
            expect(encoder.decode("t")).to.equal(true);
            expect(encoder.decode("f")).to.equal(false);
        });

        it("should decode Array", function() {
            expect(encoder.decode("[]")).to.deep.equal([]);
            expect(encoder.decode("[(123)3:foot{5:value3:bar}]")).to.deep.equal([123, "foo", true, { value: "bar"}]);
        });

        it("should decode dictionaries", function() {
            expect(encoder.decode("{}")).to.deep.equal({});
            expect(encoder.decode("{3:foo3:bar}")).to.deep.equal({foo: "bar"});
            expect(encoder.decode("{3:foo(123)}")).to.deep.equal({foo: 123});
            expect(encoder.decode("{3:foot}")).to.deep.equal({foo: true});
            expect(encoder.decode("{3:foo[(123)]}")).to.deep.equal({foo: [123]});
            expect(encoder.decode("{4:_foo(123)}")).to.deep.equal({_foo: 123});
        });

        it("should decode objects", function() {
            var empty = encoder.decode("<5:Empty>");
            var foo = encoder.decode("<3:Foo5:value3:bar6:_value3:qux>");

            expect(empty).to.deep.equal(new Empty());
            expect(empty.constructor.name).to.equal("Empty");

            expect(foo).to.deep.equal(new Foo());
            expect(foo.constructor.name).to.equal("Foo");
        });

        it("should not decode objects whose type is not registered", function() {
            expect(function() {
                encoder.decode("<12:Unregistered>");
            }).to.throw();
        });

        it("should not decode extra input", function() {
            expect(function() {
                encoder.decode("nn");
            }).to.throw();

            expect(function() {
                encoder.decode("tf");
            }).to.throw();

            expect(function() {
                encoder.decode("(123)(456)");
            }).to.throw();

            expect(function() {
                encoder.decode("3:foo3:bar");
            }).to.throw();

            expect(function() {
                encoder.decode("[][]");
            }).to.throw();

            expect(function() {
                encoder.decode("{}{}");
            }).to.throw();

            expect(function() {
                encoder.decode("<3:Foo><3:Foo>");
            }).to.throw();
        });

        it("should not decode unclosed values", function() {
            expect(function() {
                encoder.decode("(123");
            }).to.throw();

            expect(function() {
                encoder.decode("4:foo");
            }).to.throw();

            expect(function() {
                encoder.decode("[3:foo");
            }).to.throw();

            expect(function() {
                encoder.decode("{3:foo3:bar");
            }).to.throw();

            expect(function() {
                encoder.decode("<3:Foo");
            }).to.throw();
        });
    });

    describe("polyfill", function() {
        it("should be able to determine type when constructor.name is not supported", function() {
            var foo = {};

            Object.defineProperty(foo, 'constructor', {
                get: function() {
                    return {
                        // make it look like a custom type
                        constructor: Function,
                        toString: function() {
                            return "function Foo() {}";
                        }
                    };
                }
            });

            expect(foo.constructor.name).to.equal(undefined);
            expect(encoder.encode(foo)).to.equal("<3:Foo>");
        });
    });
});