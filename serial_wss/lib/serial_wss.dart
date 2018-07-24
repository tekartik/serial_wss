@JS()
library tekartik_serial_wss;

import 'dart:async';
import 'package:js/js.dart';
import 'package:path/path.dart';
import 'package:tekartik_common_utils/version_utils.dart';
import 'package:tekartik_serial_wss/src/exports.dart';
import 'package:tekartik_serial_wss/src/nw_js.dart';

//@JS("tekartik_wss_dump_devices")
//external dumpDevices();

// Dump device infos in the console
dumpDevices() async {
  _init();
  //await jsPromiseToFuture(serialWssExport.tekartik_wss_dump_devices());
  await jsPromiseToFuture(serialWssExport.dumpDevices());
}

// If it throws exception catch it
bool init() {
  try {
    _init();
    return true;
  } catch (e) {
    print("serialWssInit failed $e");
    return false;
  }
}

SerialWebSockerServer initServer(int port) {
  _init();
  SerialWebSockerServerImpl impl = serialWssExport.initServer(port);
  SerialWebSockerServer server = new SerialWebSockerServer._(impl, port);
  return server;
}

Version get version {
  _init();
  return parseVersion(serialWssExport.version);
}

class SerialWebSockerServer {
  SerialWebSockerServerImpl impl;
  SerialWebSockerServer._(this.impl, this.port);

  final int port;
  Future get ready => jsPromiseToFuture(impl.ready);

  Future close() => jsPromiseToFuture(impl.close());
}

_init() {
  if (serialWssExport == null) {
    serialWssExport = tekartik_require(
        //    join("packages", "tekartik_serial_wss", "js", "serial.js")
        join(".", "packages", "tekartik_serial_wss", "js",
            "serial_wss_export.js")
        //join("..", "..", "..", "lib", "js", "serial_wss.js")
        ) as SerialWssExport;
  }
}
