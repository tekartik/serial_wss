class Utils {

    static buf2hex(buffer) { // buffer is an ArrayBuffer
        return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    }

    static arrayBufferToHexString(buffer) { // buffer is an ArrayBuffer
        return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    }

    static hexStringToArrayBuffer(text) {
        if (text) {
            var typedArray = new Uint8Array(text.match(/[\da-f]{2}/gi).map(function (h) {
                return parseInt(h, 16)
            }));

            //console.log(typedArray);
            var buffer = typedArray.buffer
            //console.log(Utils.arrayBufferToHexString(buffer));
            return buffer;
        } else {
            return new ArrayBuffer();
        }
    }

    /**
     * Creates a new Uint8Array based on two different ArrayBuffers
     *
     * @private
     * @param {ArrayBuffer} buffer1 The first buffer.
     * @param {ArrayBuffer} buffer2 The second buffer.
     * @return {ArrayBuffer} The new ArrayBuffer created out of the two.
     */
    static bufferCat(buffer1, buffer2) {
        var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
        tmp.set(new Uint8Array(buffer1), 0);
        tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
        return tmp.buffer;
    };
    static bufferClone(src) {
        var dst = new ArrayBuffer(src.byteLength);
        new Uint8Array(dst).set(new Uint8Array(src));
        return dst;
    };
}

module.exports = Utils;