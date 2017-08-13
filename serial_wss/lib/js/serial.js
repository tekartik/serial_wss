// quick debugging of data
var _debug = false;
var _data_debug = _debug && true;
class Serial {

    // function
    static getDevices() {
        return new Promise((resolve, reject) => {
            chrome.serial.getDevices(function (ports) {
                /*
                for (let i = 0; i < ports.length; i++) {
                    let port = ports[i];
                    console.log(" port: " + port.path);
                }
                */
                resolve(ports);
            });
        });

    }

    static connect(path, options) {
        return new Promise((resolve, reject) => {
            try {
                if (_debug) {
                    console.log("connecting: " + path + (options !== undefined ? ' (' + JSON.stringify(options) + ')' : ''));
                }
                chrome.serial.connect(path, options, function (connectionInfo) {
                    if (_debug) {
                        console.log("connect: " + JSON.stringify(connectionInfo));
                    }
                    resolve(connectionInfo);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    static buf2hex(buffer) { // buffer is an ArrayBuffer
        return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    }

    static onReceive(cb) {
        chrome.serial.onReceive.addListener(function (data) {
            if (_data_debug) {
                // t{"connectionId":1,"data":{}}"
                console.log("recv conn:" + data['connectionId']);
                console.log("receive:" + Serial.buf2hex(data['data']));
                //console.log("receive:" + data.constructor.name + JSON.stringify(data));
            }
            cb(data);
        });
    }

    /// @param {int} connectionId
    /// @param {ArrayBuffer} data
    static send(connectionId, data) {
        return new Promise((resolve, reject) => {
            chrome.serial.send(connectionId, data, function (sendInfo) {
                //console.log("chrome.serial.send.done");
                resolve(sendInfo);
            });
            //console.log("chrome.serial.send.called");
        });
    }

    /// @param {int} connectionId
    static flush(connectionId) {
        return new Promise((resolve, reject) => {
            chrome.serial.flush(connectionId, function (result) {
                resolve(result);
            });
        });
    }

    /// @param {int} connectionId
    static disconnect(connectionId) {
        return new Promise((resolve, reject) => {
            chrome.serial.disconnect(connectionId, function (success) {
                console.log("disconnect.done");
                console.log(success);
                resolve(success);
            });
        });
    }

}

module.exports = Serial;