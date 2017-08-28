# Protocol

## Initialization

The WebSocket server is running by default on localhost port 8898.
 Upon connection, the server send the following notification
 
````
{
  "jsonrpc": "2.0",
  "method": "info",
  "params": {
    "package": "com.tekartik.serial_wss",
    "version": "0.5.0"
  }
}
````

This informs the client about the server. Before sending any other command the client should send
an init request

````
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "init"
}
````

The server should respond

````
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": true
}
````

## Serial API

From there any of the following API can used. The API is based on the [chrome.serial API](https://developer.chrome.com/apps/serial) defined for Chrome Apps and 
implemented in NW.js

### getDevices

Returns information about available serial devices on the system. The list is regenerated each time this method is called.

Query:

````
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "getDevices"
}
````

Response:

````
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": [
    {
      "path": "\/dev\/ttyUSB0",
      "vendorId": 1027,
      "productId": 24577,
      "displayName": "FT232R_USB_UART"
    }
  ]
}
````

### connect

Connects to a given serial port.

Query:

````
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "connect",
  "params": {
    "path": "\/dev\/ttyUSB0",
    "options": {
      "bitrate": 115200
    }
  }
}
````

Response:

````
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "connectionId": 5,
    "bitrate": 115200,
    "bufferSize": 4096,
    "ctsFlowControl": false,
    "dataBits": "eight",
    "name": "",
    "parityBit": "no",
    "paused": false,
    "persistent": false,
    "receiveTimeout": 0,
    "sendTimeout": 0,
    "stopBits": "one"
  }
}
````

### send

Send data to device. Data must be encoded in hex format

Query:

````
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "send",
  "params": {
    "connectionId": 5,
    "data": "68656C6C6F0D"
  }
}
````

Response:

````
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "bytesSent": 6,
    "error": "pending"
  }
}
````

### Receiving data

The server will send the following notification:

````
{
  "jsonrpc": "2.0",
  "method": "recv",
  "params": {
    "connectionId": 5,
    "data": "68656C6C6F0D"
  }
}
````

