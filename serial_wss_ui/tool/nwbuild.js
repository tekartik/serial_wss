#!/usr/bin/env node
var optimist = require('optimist');
var NwBuilder = require('nw-builder');
var path = require('path');

var argv = optimist
    .usage('Usage: nwbuild [options] [path]')

    .alias('p', 'platforms')
    .default('p', 'osx32,osx64,win32,win64')
    .describe('p', 'Platforms to build, comma-sperated, can be: win32,win64,osx32,osx64,linux32,linux64')

    .alias('v', 'version')
    .default('v', 'latest')
    .describe('v', 'The nw version, eg. 0.8.4')

    .alias('r', 'run')
    .default('r', false)
    .describe('r', 'Runs NW.js for the current platform')
    .boolean('r')


    .alias('o', 'buildDir')
    .default('o', './build')
    .describe('o', 'The build folder')


    .alias('f', 'forceDownload')
    .default('f', false)
    .describe('f', 'Force download of NW.js')
    .boolean('f')

    .describe('cacheDir', 'The cache folder')

    .default('quiet', false)
    .describe('quiet', 'Disables logging')
    .boolean('quiet')

    // alex
    //.default('zip', null)
    .describe('zip', "zip the build - default is platform dependant")
    .boolean('zip')

    .argv;

// Howto Help
if (argv.h || argv.help) {
    optimist.showHelp();
    process.exit(0);
}

// Error if there are no files
var files = argv._[0];
if(!files) {
    optimist.showHelp();
    process.exit(1);
}

console.log("zip: " + (argv.zip ? "true" : "false"));
console.log("flavor: " + argv.flavor);
console.log("quiet: " + argv.quiet);
var options = {
    files: path.resolve(process.cwd(), files) + '/**/*',
    flavor: argv.flavor || 'sdk',
    platforms: argv.platforms.split(','),
    version: argv.version,
    macIcns: argv.macIcns || false,
    winIco: argv.winIco || false,
    cacheDir: argv.cacheDir ? path.resolve(process.cwd(), argv.cacheDir) : path.resolve(__dirname, '..', 'cache'),
    buildDir: path.resolve(process.cwd(), argv.buildDir),
    forceDownload: argv.forceDownload,
    // alex
    zip: argv.zip,
};

/*
alex
// If we are in run mode
if(argv.r) {
    var currentPlatform = detectCurrentPlatform();
    if(!options.platforms){
        options.platforms = [ currentPlatform ];
    }
    options.currentPlatform = currentPlatform;
}
*/


// Build App
var nw = new NwBuilder(options);

// Logging
if(!(argv.quiet || argv.quite)) {
    nw.on('log',  console.log);
}

// Build or run the app
var np = (argv.r ? nw.run() : nw.build());
np.then(function() {
    process.exit(0);
}).catch (function(error) {
    if (error) {
        console.error(error);
        process.exit(1);
    }
});