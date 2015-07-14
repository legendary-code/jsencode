var expect = require('chai').expect,
    JSEncoder = require('../index.js'),
    encoder = new JSEncoder();

describe("JSEncoder", function() {

    describe("encoding", function() {

        it("should encode null", function() {
            expect(encoder.encode(null)).to.equal("n");
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
    });
});