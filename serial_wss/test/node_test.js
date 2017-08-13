const assert = require('assert');
const utils = require('../lib/js/utils');

function main() {
    console.log("stringify_tests");

    // stringify
    //console.log(JSON.stringify(undefined));
    assert.equal(JSON.stringify(undefined), undefined);
    assert.equal(JSON.stringify(null), "null");

    console.log("utils_tests");

    // clone
    let buffer = new Uint8Array([1, 2, 3, 4]).buffer;
    //let buffer = new ArrayBuffer([1, 2, 3, 4]);
    let bufferClone = utils.bufferClone(buffer);
    let view1 = new Uint8Array(buffer);
    let view2 = new Uint8Array(buffer);
    view1[0] = 5;
    assert.equal(view2[0], 5);
    view2 = new Uint8Array(bufferClone);
    assert.equal(view2[0], 1);

    // cat
    let buffer1 = new Uint8Array([1, 2, 3, 4]).buffer;
    let buffer2 = new Uint8Array([5, 6]).buffer;
    buffer = utils.bufferCat(buffer1, buffer2);
    assert.equal(buffer.byteLength, 6);
    let view = new Uint8Array(buffer);
    assert.equal(view[0], 1);
    assert.equal(view[5], 6);

    // hex
    function testHexString(text) {
        assert.equal(utils.arrayBufferToHexString(utils.hexStringToArrayBuffer(text)).toUpperCase(), text.toUpperCase());
        text = text.toUpperCase();
        assert.equal(utils.arrayBufferToHexString(utils.hexStringToArrayBuffer(text)).toUpperCase(), text);
    }
    testHexString("01");
    testHexString("0102");
    testHexString("");
    testHexString("00");
    testHexString("00FFABC81E");
    testHexString("0123456789abcdefABCDEF");

}

main();