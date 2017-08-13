var SerialWebSocketServer = require("./serial_wss");

exports.dumpDevices = async function() {
    await SerialWebSocketServer.dumpDevices();
}

exports.version = SerialWebSocketServer.version;

exports.initServer = function(port) {
    /*
    try {
        await tekartik_serial_stop();
    } catch (e) {
        console.error(e);
    }
    */
    console.log("starting");

    let _wss;
    try {
        _wss  = new SerialWebSocketServer(port);

        //global._tekartik_serial_wss = _wss;
    } catch (e) {
        throw e;
    }
    console.log("ready");
    return _wss;
}

/*
exports.tekartik_wss_ready = async function(_wss) {
    console.log("waiting for ready");
    await _wss.ready;
}


exports.tekartik_wss_close = async function(_wss) {
    console.log("stopping: " + _wss);
    if (_wss !== undefined) {
        await _wss.close();
    }
    console.log("stopped");
}
*/
