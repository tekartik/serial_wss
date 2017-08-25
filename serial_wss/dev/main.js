var SerialWebSocketServer = require("../lib/js/serial_wss.js");

global._tekartik_serial_wss = undefined;

//SerialWebSocketServer.debug = true;

function _addOutput(msg) {
    let output = document.getElementById("output");
    output.textContent = msg + "\n" + output.textContent
}

async function tekartik_serial_start(port) {
    /*
    try {
        await tekartik_serial_stop();
    } catch (e) {
        console.error(e);
    }
    */
    console.log("starting");
    _addOutput("starting on " + port)
    let _wss;
    try {
        _wss  = new SerialWebSocketServer(port);
        console.log("waiting for ready");
        await _wss.ready;
        global._tekartik_serial_wss = _wss;
        _addOutput("listening on " + port)
    } catch (e) {
        _addOutput("web socket server failed " + e);
        if (_wss !== undefined) {
            await _wss.close();
        }
        throw e;
    }
    console.log("ready");
}

async function tekartik_serial_stop() {
    console.log("stopping: " + global._tekartik_serial_wss);
    if (global._tekartik_serial_wss !== undefined) {
        await global._tekartik_serial_wss.close();
        global._tekartik_serial_wss = undefined;
    }
    console.log("stopped");
}

async function tekartik_serial_dump_devices() {
    _addOutput(await SerialWebSocketServer.debugGetDevicesText());
}

async function main() {

    _addOutput("version: " + SerialWebSocketServer.version);
    _addOutput(await SerialWebSocketServer.debugGetDevicesText());

    let port = 8988;
    tekartik_serial_start(port);

    /*
    console.log(process);
    await SerialWebSocketServer.dumpDevices();


    console.log("before");
    _addOutput("starting on " + port)
    wss = new SerialWebSocketServer(port);
    console.log("after");
    try {
        await wss.ready;
        _addOutput("listening on " + port)
    } catch (error) {
        _addOutput("web socket server failed " + error);
        console.log("web socket server failed " + error);
    }
    console.log("after await");
    */
    //await getDevices();

}

main();