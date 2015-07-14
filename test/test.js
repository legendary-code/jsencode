var expect = require('chai').expect,
    JSEncoder = require('../index.js'),
    encoder = new JSEncoder();

describe("JSEncoder", function() {
    describe("encoding", function() {
        it("should encode null", function() {
            expect(encoder.encode(null)).to.equal("n");
        })
    });
});