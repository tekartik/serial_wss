import 'package:grinder/grinder.dart';
import 'package:tekartik_build_utils/grind/grind_app.dart';
export 'package:tekartik_build_utils/grind/grind_app.dart';
export 'package:tekartik_build_utils/grind/dartium.dart';
export 'package:tekartik_build_utils/cmd_run.dart';
import 'package:tekartik_build_utils/common_import.dart';
import 'package:tekartik_pub/io.dart';
import 'package:tekartik_serial_wss_ui/app_constant.dart';

const String gsBase = "gs://gs.tk4k.ovh/activup";

ProcessCmd nwCmd(String folder) {
  return new ProcessCmd("nw", [folder]);
}

//win32,win64,osx32,osx64,linux32,linux64  [
const String nwPlatformLinux64 = "linux64";
const String nwPlatformLinux32 = "linux32";
const String nwPlatformWin64 = "win64";
const String nwPlatformWin32 = "win32";
const String nwPlatformOsx32 = "osx32";
const String nwPlatformOsx64 = "osx64";

const String nwFlavorNormal = "normal";
const String nwFlavorSdk = "sdk"; // default

ProcessCmd nwBuildCmd(String folder,
    {String flavor, bool zip, List<String> platforms, String cacheDir}) {
  List<String> args = [];

  if (flavor != null) {
    args.addAll(['--flavor', flavor]);
  }
  if (platforms != null) {
    args.addAll(['-p', platforms.join(",")]);
  }
  if (zip != null) {
    args.addAll(['--zip', "${zip}"]);
  }
  if (cacheDir != null) {
    args.addAll(['--cacheDir', cacheDir]);
  }
  args.add(folder);
  return new ProcessCmd("./tool/nwbuild.js", args);
  //return new ProcessCmd("nwbuild", args);
}

nwStart(String folder) async {
  await runCmd(nwCmd(folder));
}

class ActiveUpApp extends App {
  ActiveUpApp() {
    gsPath = gsBase;
  }
}

/*
Future<ProcessResult> runCmd(ProcessCmd cmd) {
  return process.runCmd(cmd, verbose: true);
}
*/

PubPackage pkg;

main(List<String> args) async {
  app = new ActiveUpApp();
  pkg = new PubPackage('.');
  //app.gsPath = gsDev;
  await grind(args);
}

String nw_dart = join('web');
String nw_es6 = join('example', 'nw_es6_build');
String nw_es6_full = join('example', 'nw_es6_build_full');

@Task()
nw_run_built() async {
  await nwStart(join("build", nw_dart));
}

@Task()
nw_run() async {
  await build();
  await nw_run_built();
}

@Task()
build() async {
  var pkg = new PubPackage(Directory.current.path);

  // Run all tests
  ProcessResult result = await runCmd(
      pkg.pubCmd(pubBuildArgs(mode: "release", directories: [nw_dart])),
      verbose: true);
  print('exitCode: ${result.exitCode}');
}

@Task()
nw_build() async {
  List<String> platforms = [
    nwPlatformLinux64,
    nwPlatformWin64,
    nwPlatformOsx64
  ];
  _buildAndZipPlatforms(platforms);
}

@Task()
nw_build_win64() async {
  List<String> platforms = [
    nwPlatformWin64,
  ];
  await runCmd(nwBuildCmd(join("build", "web"),
      flavor: nwFlavorNormal, platforms: platforms));
  for (String platform in platforms) {
    await runCmd(new ProcessCmd(
        "zip", ["-r", "serial_wss_${appVersion}_$platform.zip", platform],
        workingDirectory: join("build", "tekartik_serial_wss")));
  }
}

_zipPlatforms(List<String> platforms) async {
  for (String platform in platforms) {
    String srcDirname = join("build", "tekartik_serial_wss");
    String srcBasename = "serial_wss_${appVersion}_$platform.zip";
    await runCmd(new ProcessCmd("zip", ["-r", srcBasename, platform],
        workingDirectory: srcDirname));
    print(join(srcDirname, srcBasename));
  }
}

_buildPlatforms(List<String> platforms) async {
  await runCmd(nwBuildCmd(join("build", "web"),
      flavor: nwFlavorNormal,
      zip: false,
      platforms: platforms,
      cacheDir: "/usr/local/lib/node_modules/nw-builder/cache"));
}

_buildAndZipPlatforms(List<String> platforms) async {
  await _buildPlatforms(platforms);
  await _zipPlatforms(platforms);
}

@Task()
nw_build_linux64() async {
  _buildAndZipPlatforms([nwPlatformLinux64]);
}

@Task()
nw_build_osx64() async {
  List<String> platforms = [
    nwPlatformOsx64,
  ];
  await runCmd(nwBuildCmd(join("build", "web"),
      flavor: nwFlavorNormal, platforms: platforms));
  for (String platform in platforms) {
    await runCmd(new ProcessCmd(
        "zip", ["-r", "serial_wss_${appVersion}_$platform.zip", platform],
        workingDirectory: join("build", "tekartik_serial_wss")));
  }
}
