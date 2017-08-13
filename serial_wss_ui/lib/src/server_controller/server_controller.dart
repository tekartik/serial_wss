import 'package:angular2/angular2.dart';
import 'package:angular2/core.dart';
import 'package:angular_components/angular_components.dart';
import 'package:tekartik_browser_utils/browser_utils_import.dart';
import 'package:tekartik_common_utils/int_utils.dart';
import 'package:tekartik_serial_wss_client/serial_wss_client.dart';
import 'package:tekartik_serial_wss_ui/app_service.dart';
import 'package:tekartik_serial_wss_client/constant.dart';
import 'package:tekartik_serial_wss_ui/src/app_page/app_page.dart';

@Component(
  selector: 'server-controller',
  templateUrl: 'server_controller.html',
  styleUrls: const <String>['server_controller.css'],
  directives: const [
    CORE_DIRECTIVES,
    materialDirectives,
    AppPageComponent,
  ],
  providers: const [materialProviders],
)
class ServerControllerComponent implements OnInit {
  final AppService appService;
  String newPort = '';

  Version version;
  String _outputMessage;
  set outputMessage(String outputMessage) {
    _outputMessage = outputMessage;
  }

  String get outputMessage => _outputMessage;

  @ViewChild("output")
  ElementRef preOutputRef;

  @ViewChild("port")
  MaterialInputComponent portInput;

  PreElement get outputElement => (preOutputRef.nativeElement);

  @ViewChild("start")
  MaterialButtonComponent startButton;

  @ViewChild("stop")
  MaterialButtonComponent stopButton;

  void setPort() {}
  ServerControllerComponent(this.appService);

  @override
  void ngOnInit() {
    // App ready
    appService.uiReady = true;

    startButton.disabled = true;
    stopButton.disabled = true;
    portInput.disabled = true;

    if (appService.isServerStarted) {
      stopButton.disabled = false;
      portInput.disabled = false;
      return;
    }

    bool autoStart = false;
    int port = appService.prefsGetPort();
    if (port == null) {
      port = serialWssPortDefault;
      outputMessage =
          "Press START to start the server at localhost:$port.\nMake sure to accept the needed system permissions";
    } else {
      autoStart = true;
    }
    newPort = port.toString();

    if (autoStart) {
      onStart();
    } else {
      startButton.disabled = false;
    }

    version = appService.serverVersion;
  }

  onStart() async {
    print("onStart");
    outputMessage =
        "Starting server at localhost:$newPort.\nMake sure to accept the needed system permissions";
    startButton.disabled = true;
    stopButton.disabled = true;

    try {
      appService.prefsSetPort(parseInt(newPort));
      stopButton.disabled = false;
      startButton.disabled = true;
      await appService.serverInit();
    } catch (e) {
      outputMessage =
          "failed to start server at localhost:$newPort.\nIf error persits, try to change port ($e)";
      print(e);
      await _onStop();
      startButton.disabled = false;
      return;
    }

    try {
      // try connection
      await appService.clientInit();
    } catch (e) {
      outputMessage =
          "failed to connect server at localhost:$newPort.\nIf error persits, try to change port ($e)";
      await _onStop();
      return;
    }

    // update version if got from server in client mode
    version = appService.serverVersion;

    portInput.disabled = true;
    String msg = "Server running at localhost:$newPort";
    outputMessage = msg;
    _refreshDevices();
  }

  _refreshDevices() async {
    if (appService.clientConnected) {
      String msg = "Server running at localhost:$newPort";
      print('getting devices');
      List<DeviceInfo> deviceInfos = await appService.serial.getDevices();
      print(deviceInfos);
      if (deviceInfos.length == 0) {
        outputMessage = "$msg\nNo serial devices available";
      } else {
        StringBuffer sb = new StringBuffer(msg);
        sb.write("\n${deviceInfos.length} serial device(s) found:");
        for (DeviceInfo deviceInfo in deviceInfos) {
          sb.write("\n- ${deviceInfo.displayName}");
          if (deviceInfo.displayName != deviceInfo.path) {
            sb.write(" (${deviceInfo.path})");
          }
        }
        outputMessage = "$sb";
      }
      await sleep(5000);
      // redo forever
      _refreshDevices();
    } else {
      print('not connected');
    }
  }

  _onStop() async {
    stopButton.disabled = true;
    await appService.clientClose();
    print("onStop");
    try {
      stopButton.disabled = true;
      await appService.serverClose();
      startButton.disabled = false;
    } catch (e) {
      //stopButton.disabled = false;
      print(e);
    }
    stopButton.disabled = false;
    portInput.disabled = false;
  }

  onStop() async {
    await _onStop();
    outputMessage = "";
  }
}
