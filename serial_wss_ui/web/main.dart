// Copyright (c) 2017, alex. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

import 'package:angular/angular.dart';

import 'package:tekartik_serial_wss_ui/app_component.dart';
import 'package:tekartik_serial_wss_ui/app_provider.dart';
import 'dart:html';
import 'dart:js';

main() async {
  await bootstrap(AppComponent, await appProvider);
  //print(process.versions);
  print("hi");

  window.console.error("Error example");
  //print(process.versions);
  print(context['process']);
}
