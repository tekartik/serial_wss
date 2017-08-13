import 'package:tekartik_serial_wss_client/serial_wss_client.dart';
import 'package:tekartik_serial_wss_ui/app_constant.dart';
import 'package:test/test.dart';

main() {
  group('version', () {
    test('minVersion', () {
      expect(minVersion, lessThanOrEqualTo(appVersion));
    });
  });
}
