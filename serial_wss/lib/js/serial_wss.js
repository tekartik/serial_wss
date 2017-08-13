'use strict';

const ws = require('ws');
const Serial = require('./serial.js');
const utils = require('./utils.js');


const statusPending = "pending";
const statusClosed = "closed";

const errorCodeFailed = 1;

const version = '0.3.0';

let _extra_debug = true;


class Message {
    toMap() {
        return {'jsonrpc': "2.0"};
    }

    /// @param {map}
    static parseMap(map) {
        if (map['jsonrpc'] !== "2.0") {
            throw "missing jsonrpc";
        }
        var id = map['id'];
        if (id !== undefined) {
            var method = map['method'];
            if (method !== undefined) {
                return new Request(id, method, map['params']);
            }
        }
        throw 'format not parsed yet: ' + map;

    }
}

class Request extends Message {
    /// @param {String|int} id
    /// @param {String} method
    /// @param {dynamic} params
    constructor(id, method, params) {
        super();
        this.id = id;
        this.method = method;
        this.params = params;
    }

    toMap() {
        var map = super.toMap();
        map['id'] = this.id;
        map['method'] = this.method;
        if (this.params != null) {
            map['params'] = this.params;
        }
        return map;
    }
}

class Response extends Message {
    /// @param {String|int} id
    /// @param {dynamic} result
    constructor(id, result) {
        super();
        this.id = id;
        this.result = result;
    }

    toMap() {
        var map = super.toMap();
        map['id'] = this.id;
        map['result'] = this.result;
        return map;
    }
}

class ErrorObject {
    constructor(code, message, data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    toMap() {
        var map = {
            'code': this.code,
            'message': this.message
        };
        if (this.data !== null && this.data !== undefined) {
            map['data'] = this.data;
        }
        return map;
    }
}

class ErrorResponse extends Message {
    /// @param {String|int} id
    /// @param {dynamic} error
    constructor(id, error) {
        super();
        this.id = id;
        this.error = error;
    }

    toMap() {
        let map = super.toMap();
        map['id'] = this.id;
        map['error'] = this.error.toMap();
        return map;
    }
}

class Notification extends Message {
    /// @param {String} method
    /// @param {dynamic} params
    constructor(method, params) {
        super();
        this.method = method;
        this.params = params;
    }

    toMap() {
        let map = super.toMap();
        map['method'] = this.method;
        if (this.params !== null && this.params !== undefined) {
            map['params'] = this.params;
        }
        return map;
    }
}

class SerialWebSocket {
    /// @param {WebSocket} ws
    /// @param {int} wss connection id
    constructor(ws, id) {
        this.ws = ws;
        this.id = id;
        this.status = statusPending;
        this.initReceived = false;
        this.connectionIds = [];

        // Set when receiving
        this.receiving = false;
        this.receiveBuffer = undefined;

        ws.on('message', (message) => this._onMessage(message));
        ws.on('close', () => {
            console.log('onClose wss ' + this.id);
            this._onClose();
        });
        ws.on('disconnect', () => {
            // does not seem to get called
            console.log('onDisconnect wss ' + this.id);
        });

        var info = new Notification("info", {
            'package': 'com.tekartik.serial_wss',
            'version': version
        });
        // notify client
        this._sendMessage(info);
        //ws.send(JSON.stringify(info.toMap()));
        //console.log('done sending');
    }

    async _sendRevcData(connectionId, data) {
        //console.log("sending: " + connectionId + " " + utils.buf2hex(data));
        var info = new Notification("recv", {
            'connectionId': connectionId,
            'data': utils.buf2hex(data)
        });
        await this._sendMessage(info);

    }

    async onReceive(connectionId, data) {
        if (this.receiveBuffer !== undefined) {
            this.receiveBuffer = utils.bufferCat(this.receiveBuffer, data);
        } else {
            this.receiveBuffer = utils.bufferClone(data);
        }
        // notify client
        if (!this.receiving) {
        //    console.log("concat: " + utils.buf2hex(data));
        //} else {
        //    console.log("sending: " + utils.buf2hex(data));
            this.receiving = true;
            while (this.receiveBuffer !== undefined) {
                // Send current buffer and clear it
                var recvData = utils.bufferClone(this.receiveBuffer);
                this.receiveBuffer = undefined;
                try {
                    await this._sendRevcData(connectionId, recvData);
                } catch (e) {}
            }
            this.receiving = false;

        }
    }

    async _sendMessage(message) {
        return new Promise((resolve, reject) => {
            let data = JSON.stringify(message.toMap());
            this.ws.send(data, function () {
                resolve(true);
            });
        });
    }

    async _handleInit(request) {
        this.initReceived = true;
        let response = new Response(request.id, true);

        await this._sendMessage(response);

    }

    async _handleGetDevicesRequest(request) {
        let devices = await Serial.getDevices();
        console.log(JSON.stringify(devices));
        let list = [];
        // [{"displayName":"FT232R_USB_UART","path":"/dev/ttyUSB0","productId":24577,"vendorId":1027}]
        for (let device of devices) {
            var item = {'path': device['path']};
            item['vendorId'] = device['vendorId'];
            item['productId'] = device['productId'];
            item['displayName'] = device['displayName'];
            list.push(item);
        }
        let response = new Response(request.id, list);

        await this._sendMessage(response);
    }

    async _handleConnectRequest(request) {
        let path = request.params['path'];
        let connectionOptions = request.params['options'];

        let connectionInfo = await Serial.connect(path, connectionOptions);
        let result;

        // this happens for a failed connection
        if (connectionInfo === undefined) {
            let response = new ErrorResponse(request.id, new ErrorObject(errorCodeFailed, "fail to open '" + path + "'"));
            await this._sendMessage(response);
        } else {
            console.log(JSON.stringify(connectionInfo));
            // {"bitrate":9600,"bufferSize":4096,"connectionId":1,
            // ctsFlowControl":false,"dataBits":"eight","name":"","parityBit":"no",
            // "paused":false,"persistent":false,"receiveTimeout":0,"sendTimeout":0,"stopBits":"one"}
            result = {
                'connectionId': connectionInfo['connectionId'],
                'bitrate': connectionInfo['bitrate'],
                'bufferSize': connectionInfo['bufferSize'],
                'ctsFlowControl': connectionInfo['ctsFlowControl'],
                'dataBits': connectionInfo['dataBits'],
                'name': connectionInfo['name'],
                'parityBit': connectionInfo['parityBit'],
                'paused': connectionInfo['paused'],
                'persistent': connectionInfo['persistent'],
                'receiveTimeout': connectionInfo['receiveTimeout'],
                'sendTimeout': connectionInfo['sendTimeout'],
                'stopBits': connectionInfo['stopBits'],
            };

            let connectionId = connectionInfo['connectionId'];

            // Add to global map and current connection list
            SerialWebSocketServer._connectionIdMap[connectionId] = this;
            this.connectionIds.push(connectionId);
            console.log("onConnect wss " + this.id + " connections " + JSON.stringify(this.connectionIds));

            let response = new Response(request.id, result);
            await this._sendMessage(response);
        }
    }

    async _handleSendRequest(request) {
        let connectionId = request.params['connectionId'];
        let data = request.params['data'];


        console.log(JSON.stringify(data));
        console.log(data);
        console.log(typeof(data));
        /*
        if (typeof(data) == "string") {

        }
        */
        var buffer;
        if (typeof(data) === "string") {
            buffer = utils.hexStringToArrayBuffer(data);
        } else {
            buffer = new ArrayBuffer(data);
        }
        let sendInfo = await Serial.send(connectionId, buffer);

        //console.log(sendInfo);
        console.log(JSON.stringify(sendInfo));
        // "{"bytesSent":0,"error":"pending"}",
        var result = {"bytesSent": sendInfo["bytesSent"], "error": "pending"};
        let response = new Response(request.id, result);

        await this._sendMessage(response);
    }

    async _handleFlushRequest(request) {
        let connectionId = request.params['connectionId'];
        let success = await Serial.flush(connectionId);
        var result = success === true;

        let response = new Response(request.id, result);

        await this._sendMessage(response);
    }

    async _handleDisconnectRequest(request) {
        let connectionId = request.params['connectionId'];
        let success = await this._disconnect(connectionId);
        console.log(JSON.stringify(success));
        var result = success === true;

        let response = new Response(request.id, result);

        await this._sendMessage(response);
    }

    async _disconnect(connectionId) {
        let result = await Serial.disconnect(connectionId);
        console.log("Serial.disconnect: " + JSON.stringify(result));
        var index = this.connectionIds.indexOf(connectionId);
        if (index > -1) {
            this.connectionIds.splice(index, 1);
        }
        SerialWebSocketServer._connectionIdMap[connectionId] = undefined;
        return result;
    }

    async _handleOthers(request) {
        let responseError = new ErrorResponse(request.id, new ErrorObject(errorCodeFailed, "method '" + request.method + "' not supported"));
        await this._sendMessage(response);
    }

    _onMessage(messageData) {
        //console.log('_onMessage: ' + messageData + " type " + typeof(messageData));
        let obj = JSON.parse(messageData);

        let message;
        try {
            message = Message.parseMap(obj);
        } catch (e) {
            if (_extra_debug) {
                console.error(e);
                console.log('_onMessage: ' + messageData + " type " + typeof(messageData));
            }
        }
        if (message instanceof Request) {
            if (!this.initReceived) {
                if (message.method === "init") {
                    this._handleInit(message);
                } else {
                    this._handleOthers(message);
                }
            } else {
                /*
               string	path
    The device's system path. This should be passed as the path argument to chrome.serial.connect in order to connect to this device.
    
    integer	(optional) vendorId
    A PCI or USB vendor ID if one can be determined for the underlying device.
    
    integer	(optional) productId
    A USB product ID if one can be determined for the underlying device.
    
    string	(optional) displayName
    A human-readable display name for the underlying device if one can be queried from the host driver.
                */
                if (message.method === "getDevices") {
                    this._handleGetDevicesRequest(message);
                } else if (message.method === "connect") {
                    this._handleConnectRequest(message);
                } else if (message.method === "flush") {
                    this._handleFlushRequest(message);
                } else if (message.method === "send") {
                    this._handleSendRequest(message);
                } else if (message.method === "disconnect") {
                    this._handleDisconnectRequest(message);
                } else {
                    this._handleOthers(message);
                }
            }
        }

        /*
        var id = obj['id'];
        var cmd = obj['cmd'];
        console.log('cmd: ' + cmd);
        if (cmd === 'list') {

            var devices = await Serial.getDevices();
            var list = [];
            var response = {"id": id, "cmd": cmd, "list": list}
            for (let device of devices) {
                var item = {'path': device['path']};
                item['vendorId'] = device['vendorId'];
                item['productId'] = device['productId'];
                item['displayName'] = device['displayName'];
                list.push(item);
            }
            this.ws.send(JSON.stringify(response));
        }
        */
    }

    async _onClose() {
        var connectionIds = this.connectionIds.splice(0);
        console.log('onClose wss ' + this.id + " connections " + JSON.stringify(connectionIds));
        for (var i = 0; i < connectionIds.length; i++) {
            await this._disconnect(connectionIds[i]);
        }

        this.status = statusClosed;
        /*
        if (this.closeCb) {
            this.closeCb();
        }
        */
    }

    /*
    onClose(cb) {
        this.closeCb = cb;
    }
    */
}


class SerialWebSocketServer {

    static _initSerial() {
        if (!SerialWebSocketServer._serialInited) {
            Serial.onReceive(function (info) {
                // integer	connectionId        The connection identifier.
                // ArrayBuffer	data            The data received.
                //console.log("serial receive " + info)
                let connectionId = info["connectionId"];
                let data = info['data'];
                let connection = SerialWebSocketServer._connectionIdMap[connectionId];
                if (connection) {
                    connection.onReceive(connectionId, data);
                }
            });
            SerialWebSocketServer._serialInited = true;
        }
    }

    static async dumpDevices() {
        var devices = await Serial.getDevices();
        for (let device of devices) {
            console.log('path: ' + device.path);
        }
        console.log(devices.length + " device(s) found");
    }

    static async debugGetDevicesText() {
        let text = '';
        var devices = await Serial.getDevices();
        for (let device of devices) {
            text += 'path: ' + device.path + '\n';
        }
        text += devices.length + " device(s) found" + '\n';
        return text;
    }

    /*
     * @param {string} port

     call await ready;
     */
    constructor(port) {
        SerialWebSocketServer._initSerial();

        this.port = port || 8988;
        this._listening = false;
        this._wsLastId = 0;
        this._serialSockets = [];
        this.ready = new Promise((resolve, reject) => {
            this.wss = new ws.Server({port: this.port}, function () {
                this._listening = true;
                resolve(true);
            });
            this.wss.on('error', function (error) {
                console.error('SWSS_error: ' + error);
                if (!this._listening) {
                    reject(error);
                }
            });
            this.wss.on('connection', (ws) => this._onConnection(ws));
        });

    }

    /// @param {WebSocket} ws
    _onConnection(ws) {
        let wsId = ++this._wsLastId;
        console.log('new wss: ' + wsId);
        let serialSocket = new SerialWebSocket(ws, wsId);
        this._serialSockets.push(serialSocket);
        /*
        swssc.onClose(() => {
            console.log('loosing wss: ' + wsId);
            // Find and remove item from an array
            let i = this._connections.indexOf(swssc);
            if (i !== -1) {
                this._connections.splice(i, 1);
                console.log('remove connection: ' + wsId);
            }
        });
        */


    }

    async close() {
        await new Promise((resolve, reject) => {
            if (this.wss !== undefined) {
                this.wss.close((_) => {
                    console.log("closed: " + _)
                    this._listening = false;
                    this.wss = undefined;
                    resolve(null);
                });
            }
        });

    }


}

// Map to id to connection
SerialWebSocketServer._connectionIdMap = {};
SerialWebSocketServer._serialInited = false;
SerialWebSocketServer.version = version;

module.exports = SerialWebSocketServer;


/*
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    ws.send('something');
});
*/