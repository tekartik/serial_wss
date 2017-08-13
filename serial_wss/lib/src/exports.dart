@JS()
library tekartik_serial_wss_src;

import 'package:js/js.dart';
import 'package:tekartik_serial_wss/src/nw_js.dart';

@JS()
@anonymous
abstract class SerialWebSockerServerImpl {
  @JS()
  JsPromise close();

  @JS()
  external JsPromise get ready;
}

@JS()
@anonymous
abstract class SerialWssExport {
  //external tekartik_wss_dump_devices();

  //@JS("dumpDevices")
  external JsPromise dumpDevices();

  //@JS("version")
  external String get version;

  //@JS("initServer")
  external SerialWebSockerServerImpl initServer(int port);
}

SerialWssExport _serialWssExport;
set serialWssExport(SerialWssExport serialWssExport) =>
    _serialWssExport = serialWssExport;

SerialWssExport get serialWssExport {
  if (_serialWssExport != null) {
    return _serialWssExport;
  }
  return _serialWssExport;
}
