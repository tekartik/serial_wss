@JS()
library tekartik.nwjs;

import "package:js/js.dart";

@JS()
class Process {
  external Map<String, String> get versions;
}

external Process get process;
