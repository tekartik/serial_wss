import 'package:tekartik_browser_utils/browser_utils_import.dart';

Splash splash = new Splash();

class Splash {
  Stopwatch sw;

  Splash() {
    sw = new Stopwatch()..start();

    var loadEl = document.getElementById('splash');
    if (loadEl != null) {
      loadEl.on['transitionend'].listen((_) {
        loadEl.remove();
      });
    }
  }

  hide() async {
    int elapsed = sw.elapsedMilliseconds;
    const int delayMin = 1500;
    if (elapsed < delayMin) {
      await sleep(delayMin - elapsed);
    }
    document.body.classes.remove('app-loading');
  }
}
