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
                if (_debug || Serial.debug) {
                    console.log("connecting: " + path + (options !== undefined ? ' (' + JSON.stringify(options) + ')' : ''));
                }
                chrome.serial.connect(path, options, function (connectionInfo) {
                    if (_debug || Serial.debug) {
                        console.log("connect: " + JSON.stringify(connectionInfo));
                    }
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }

                    resolve(connectionInfo);
                });
            } catch (e) {
                console.log("connect error: " + e);
                if (chrome.runtime.lastError) {
                    console.log(chrome.runtime.lastError.message);
                }
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

    static onReceiveError(cb) {
        /*
             An error code indicating what went wrong.
            disconnected
            The connection was disconnected.
            timeout
            No data has been received for receiveTimeout milliseconds.
            device_lost
            The device was most likely disconnected from the host.
            break
            The device detected a break condition.
            frame_error
            The device detected a framing error.
            overrun
            A character-buffer overrun has occurred. The next character is lost.
            buffer_overflow
            An input buffer overflow has occurred. There is either no room in the input buffer, or a character was received after the end-of-file (EOF) character.
            parity_error
            The device detected a parity error.
            system_error
            A system error occurred and the connection may be unrecoverable.
         */
        chrome.serial.onReceiveError.addListener(function (data) {
            if (_data_debug) {
                console.log("onReceiveError:" + data.constructor.name + JSON.stringify(data));
                // t{"connectionId":1,"data":{}}"
                //console.log("data:" + data);
                //console.log("recv conn:" + data['connectionId']);
                //console.log("receive:" + Serial.buf2hex(data['data']));

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
            if (_debug || Serial.debug) {
                console.log("disconnecting: " + connectionId);
            }
            try {
                chrome.serial.disconnect(connectionId, function (success) {
                    if (_debug || Serial.debug) {
                        console.log("disconnect " + connectionId + ": " + success);
                    }
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }
                    console.log("disconnect.done");
                    console.log(success);
                    resolve(success);
                });
            } catch (e) {
                console.log("disconnect error " + connectionId + ": " + e);
                if (chrome.runtime.lastError) {
                    console.log(chrome.runtime.lastError.message);
                }
                reject(e);
            }
        });
    }

}

Serial.debug = false;

module.exports = Serial;
