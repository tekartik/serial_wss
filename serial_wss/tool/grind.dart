import 'package:grinder/grinder.dart';
import 'package:path/path.dart';
import 'package:tekartik_pub/io.dart';
import 'dart:io';
import 'package:tekartik_build_utils/cmd_run.dart';

//import 'package:process_run/cmd_run.dart';

main(List<String> args) => grind(args);

@Task()
test() => new TestRunner().testAsync();

@DefaultTask()
@Depends(test)
build() {
  Pub.build();
}

@Task()
clean() => defaultClean();

@Task()
test_js() async {
  await nodeCmd([join('test', 'node_test.js')]);
}

ProcessCmd nodeCmd(List<String> args) {
  return new ProcessCmd("node", args);
}

ProcessCmd nwCmd(String folder) {
  return new ProcessCmd("nw", [folder]);
}

nwStart(String folder) async {
  await runCmd(nwCmd(folder));
}

String nw_dart = join('example', 'nw_dart');
String nw_es6 = join('example', 'nw_es6_build');
String nw_es6_full = join('example', 'nw_es6_build_full');

@Task()
nw_test_dart() async {
  await nwStart(join("build", nw_dart));
}

@Task()
nw_run_dart() async {
  PubPackage pkg = new PubPackage(Directory.current.path);

  // Run all tests
  ProcessResult result = await runCmd(
      pkg.pubCmd(
          pubBuildArgs(mode: BuildMode.DEBUG, directories: [nw_dart]).toList()),
      verbose: true);
  print('exitCode: ${result.exitCode}');
  await nw_test_dart();
}

@Task()
nw_test_es6() async {
  await nwStart(join("build", nw_es6));
}

@Task()
nw_test_es6_basic() async {
  await nwStart(join("example", "nw_es6"));
}

@Task()
nw() async {
  await nwStart(join("dev"));
}

@Task()
npm_install() async {
  await runCmd(
      processCmd("npm", ["install"])..workingDirectory = join("lib", "js"));
}

@Task()
nw_test_es6_full() async {
  await nwStart(join("example", "nw_es6_full"));
}

@Task()
test_es6() async {
  PubPackage pkg = new PubPackage(Directory.current.path);

  // Run all tests
  ProcessResult result = await runCmd(
      pkg.pubCmd(
          pubBuildArgs(mode: BuildMode.DEBUG, directories: [nw_es6]).toList()),
      verbose: true);
  print('exitCode: ${result.exitCode}');
  await nw_test_es6();
}
