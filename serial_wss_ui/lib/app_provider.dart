import 'package:angular2/core.dart';
import 'package:angular2/platform/common.dart';
import 'package:angular2/router.dart';

import 'package:tekartik_app_utils/iron_flex_layout/loader.dart';
import 'package:tekartik_app_utils/material_asset/loader.dart';
import 'package:tekartik_app_utils/flexboxgrid/loader.dart';
import 'dart:async';
import 'package:tekartik_browser_utils/css_utils.dart';
import 'package:tekartik_serial_wss_ui/app_service.dart';

get appProvider async {
  //initApis();
  /*
  StringBuffer sb = new StringBuffer();
  sb.write(window.location);
  sb.write('#');
  String baseHref = sb.toString();
  */

  StylesheetLoader appCssLoader =
      new StylesheetLoader('packages/tekartik_serial_wss_ui/css/app_style.css');
  await Future.wait([
    () async {
      await loadIronFlexLayoutCss();
    }(),
    () async {
      await loadFlexBoxGridCss();
    }(),
    () async {
      await loadMaterialIconCss();
    }()
  ]); //textBrowserPackageRoot);
  await appCssLoader.load();
/*
  devPrint(baseHref);
  devPrint(locationInfo.host);
  // handle using local server
  if (locationInfo.host.contains(".gl-biocontrol.com") || locationInfo.host == "localhost") {
    StringBuffer sb = new StringBuffer();
    sb.write(window.location.href);
    sb.write(window.location.pathname);
    sb.write(window.location);
    if (locationInfo.host == "localhost") {
      baseHref = "http://localhost/web/devx/git/bitbucket.org/tekartik/glbiocontrol/app/build/deploy/web";
    }
    devPrint(baseHref);
    return [AppService, ROUTER_PROVIDERS, provide(APP_BASE_HREF, useValue: baseHref), const Provider(LocationStrategy, useClass: PathLocationStrategy)];
  } else {
  */
  return _getProvider();
}

_getProvider() {
  String baseHref = '/';
  return [
    //FirebaseService,
    //AppRouteService,
    AppService,

    ROUTER_PROVIDERS,
    provide(APP_BASE_HREF, useValue: baseHref),
    const Provider(LocationStrategy, useClass: HashLocationStrategy)
  ];
}
