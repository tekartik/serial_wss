import 'dart:async';
import 'dart:html';

//import 'package:biowyse_mmtest_app/app_layout_service.dart';
import 'package:synchronized/synchronized.dart';
import 'package:tekartik_common_utils/int_utils.dart';
import 'package:tekartik_io_utils/io_utils_import.dart';
import 'package:tekartik_serial_wss_ui/app_constant.dart';
import 'package:tekartik_serial_wss_ui/splash/splash.dart';
import 'package:tekartik_serial_wss/serial_wss.dart';
import 'package:angular2/angular2.dart';
import 'package:tekartik_app_utils/app_host_target.dart';
import 'package:tekartik_app_utils/app_host_target_browser.dart';
import 'package:event_bus/event_bus.dart';
import 'package:web_socket_channel/html.dart';
import 'package:tekartik_serial_wss_client/serial_wss_client.dart';

AppService appService;

class LoginChangeEvent {}

@Injectable()
class AppService {
  bool _uiReady;

  // only in NWJS
  bool canBeServer;
  SerialWebSockerServer server;
  Serial serial;

  bool get clientConnected => serial != null;

  set uiReady(bool uiReady) {
    if (_uiReady != uiReady) {
      if (uiReady) {
        splash.hide();
      }
    }
    _uiReady = uiReady;
  }

  //AppLayoutService appLayoutService;

  AppService() {
    // Ensure it is a singleton
    assert(appService == null);
    print('Creating AppService');
    appService = this;
    canBeServer = init();
  }

  String getPrefKey(String key) {
    return '${defs.package}:${key}';
  }

  String prefsGet(String key) {
    String prefKey = getPrefKey(key);
    return window.localStorage[prefKey];
  }

  prefsSetPort(int port) {
    return parseInt(prefsSet("port", port?.toString()));
  }

  int prefsGetPort() {
    return parseInt(prefsGet("port"));
  }

  prefsSet(String key, String value) {
    String prefKey = getPrefKey(key);
    if (value == null) {
      window.localStorage.remove(prefKey);
    } else {
      window.localStorage[prefKey] = value;
    }
  }

  EventBus loginEventBus = new EventBus();
  AppDefs defs = appDefs;

  var _startLock = new SynchronizedLock();

  Version _gotServerVersion;
  Version get serverVersion {
    if (canBeServer) {
      return version;
    }
    return _gotServerVersion;
  }

  Future serverInit() async {
    await _startLock.synchronized(() async {
      if (canBeServer) {
        int port = prefsGetPort();
        if (server == null) {} else if (server.port != port) {
          await serverClose();
        }

        if (server == null) {
          server = initServer(port);
        }
        await server.ready;
      }
    });
  }

  Future clientInit() async {
    int port;
    if (canBeServer) {
      port = server.port;
    } else {
      port = prefsGetPort();
    }
    String url = "ws://localhost:$port";
    print("connecting $url");
    HtmlWebSocketChannel channel = new HtmlWebSocketChannel.connect(url);
    /*
      channel.stream.listen((message) {
        write('message $message');
      }, onError: (e) => write("error $e"), onDone: () => write("done"));
      */
    serial = new Serial(channel, onError: (error) {
      print('error: $error');
    }, onDone: () {
      print('done');
      serial = null;
    });
    bool connected = await serial.connected;
    // copy
    _gotServerVersion = serial.serverVersion;
    print("connected $connected");
  }

  Future clientClose() async {
    if (serial != null) {
      await serial.close();
      serial = null;
    }
  }

  bool get isServerStarted {
    return server != null;
  }

  var closeLock = new SynchronizedLock();

  Future serverClose() async {
    if (server != null) {
      await closeLock.synchronized(() async {
        if (server != null) {
          await server.close();
        }
        server = null;
      });
    }
  }
}

AppDefs _appDefs;

AppDefs get appDefs =>
    _appDefs ??
    () {
      _appDefs = new AppDefs(locationInfo);
      return _appDefs;
    }();

class AppDefs {
  LocationInfo locationInfo;
  AppHostTarget target;
  String package;

  AppDefs(this.locationInfo) {
    if (locationInfo != null) {
      target = AppHostTarget.fromArguments(locationInfo.arguments);
      if (target == null) {
        // If local detected in location, set to dev by default
        target =
            AppHostTarget.fromHostAndPath(locationInfo.host, locationInfo.path);
        if (target == AppHostTarget.local) {
          target = AppHostTarget.dev;
        }
      }
    }

    target = target ?? AppHostTarget.prod;

    package = "${appPackage}-${target}";

    /*
    if (target == AppHostTarget.local) {
      firebaseOptions = firebaseOptionsDev;
      apiRootUrl = apiRootUrlLocal;
    } else if (target == AppHostTarget.dev) {
      firebaseOptions = firebaseOptionsDev;
      apiRootUrl = apiRootUrlDev;
    } else if (target == AppHostTarget.staging) {
      firebaseOptions = firebaseOptionsStaging;
      apiRootUrl = apiRootUrlStaging;
    } else {
      firebaseOptions = firebaseOptionsProd;
      apiRootUrl = apiRootUrlProd;
    }
    */
  }

  Map toMap() {
    Map map = {
      'target': "$target",
    };
    return map;
  }

  @override
  String toString() => toMap().toString();
}
