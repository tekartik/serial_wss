library test_menu;

//import 'package:biowyse_mmtest_app/api/api_client.dart';
import 'package:tekartik_serial_wss/serial_wss.dart';
import 'package:tekartik_test_menu/test_menu_mdl_browser.dart';

/*
AsyncOnceRunner serialWssImportRunner = new AsyncOnceRunner(() async {
  try {
    print('before');
    serialWssExport = await tekartik_require(
        //    join("packages", "tekartik_serial_wss", "js", "serial.js")
        join(".", "packages", "tekartik_serial_wss", "js",
            "serial_wss_export.js")
        //join("..", "..", "..", "lib", "js", "serial_wss.js")
        );
    print('after');
    write("require_done");
  } catch (e) {
    write(e);
  }
});

_init() async {
  await serialWssImportRunner.run();
}

*/
main() async {
  await initTestMenuBrowser(); //js: ['test_menu.js']);

  menu('global', () {
    item("version", () {
      write('version: ${version}');
    });
  });
  menu('main', () {
    item('serialWssInit', () {
      write('serialWssInit: ${init()}');
    });
    item('require()', () async {
      try {
        init();
        await dumpDevices();
      } catch (e) {
        write(e);
      }
    });
    item('dump_devices()', () async {
      try {
        init();
        await dumpDevices();
      } catch (e) {
        write(e);
      }
    });

    /*
    SerialWebSockerServerImpl impl;
    item('init_server_impl()', () async {
      try {
        await _init();
        write("1");
        impl = await serialWssExport.initServer(8988);
        write("2");
      } catch (e) {
        write(e);
      }
    });

    item('close_server_impl()', () async {
      if (impl != null) {
        try {
          await _init();
          //await serialWssExport.tekartik_wss_close(impl);
          await impl.close();
        } catch (e) {
          write(e);
        }
      }
    });
    */

    SerialWebSockerServer server;
    item('init_server()', () async {
      try {
        //await _init();
        write("1");
        SerialWebSockerServer _server = initServer(8988);
        write("2");

        new Future.value().then((_) async {
          try {
            write("waiting for ready");
            await _server.ready;
            server = _server;
            write("ready");
          } catch (e) {
            write("ready.error");
            write(e);
          }
        });
      } catch (e) {
        write(e);
      }
    });

    item('close_server()', () async {
      if (server != null) {
        try {
          write("waiting for close");
          await server.close();
          write("close");
        } catch (e) {
          write(e);
        }
      }
    });
  });
}
