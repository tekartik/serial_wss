@JS()
library tekart_serial_wss.nw_js;

/// Creates Dart `Future` which completes when [promise] is resolved or
/// rejected.
///
/// See also:
///   - [futureToJsPromise]

import 'dart:async';

import 'package:js/js.dart';

@JS('Promise')
abstract class JsPromise {
  external factory JsPromise(executor(Function resolve, Function reject));
  external JsPromise then(Function onFulfilled, [Function onRejected]);
}

@JS('require')
external dynamic tekartik_require(String id);

/*
@JS()
external dynamic require(String id);
*/

Future jsPromiseToFuture(JsPromise promise) {
  var completer = new Completer();
  promise.then(allowInterop((value) {
    completer.complete(value);
  }), allowInterop((error) {
    completer.completeError(error);
  }));
  return completer.future;
}

/// Creates JS `Promise` which is resolved when [future] completes.
///
/// See also:
/// - [jsPromiseToFuture]
dynamic futureToJsPromise(Future future) {
  return new JsPromise(allowInterop((Function resolve, Function reject) {
    future.then(resolve, onError: reject);
  }));
}
