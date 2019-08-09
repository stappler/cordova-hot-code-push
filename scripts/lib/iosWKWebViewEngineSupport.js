/*
Helper class to work with Swift.
Mainly, it has only two method: to activate and to deactivate swift support in the project.
*/

var path = require('path');
var fs = require('fs');
var strFormat = require('util').format;
var xcode = require('xcode');
var rootConfig = require('./rootConfigXmlReader');
var COMMENT_KEY = /_comment$/;
var WKWEBVIEW_PLUGIN_NAME = 'cordova-plugin-wkwebview-engine';
var WKWEBVIEW_MACRO = 'WK_WEBVIEW_ENGINE_IS_USED';
var isWkWebViewEngineUsed = 0;
var projectRoot;
var projectName;
var iosPlatformPath;

module.exports = {
  setWKWebViewEngineMacro: setWKWebViewEngineMacro
};

/**
 * Define preprocessor macro for WKWebViewEngine.
 *
 * @param {Object} cordovaContext - cordova context
 */
function setWKWebViewEngineMacro(cordovaContext) {
  init(cordovaContext);

  // injecting options in project file
  var projectFile = loadProjectFile();
  setMacro(projectFile.xcode);
  projectFile.write();
}

// region General private methods

/**
 * Initialize before execution.
 *
 * @param {Object} ctx - cordova context instance
 */
function init(ctx) {
  projectRoot = ctx.opts.projectRoot;
  projectName = rootConfig.readProjectName(ctx);
  iosPlatformPath = path.join(projectRoot, 'platforms', 'ios');

  var wkWebViewPluginPath = path.join(projectRoot, 'plugins', WKWEBVIEW_PLUGIN_NAME);
  isWkWebViewEngineUsed = isDirectoryExists(wkWebViewPluginPath) ? 1 : 0;
}

function isDirectoryExists(dir) {
  var exists = false;
  try {
    fs.accessSync(dir, fs.F_OK);
    exists = true;
  } catch(err) {
  }

  return exists;
}

/**
 * Load iOS project file from platform specific folder.
 *
 * @return {Object} projectFile - project file information
 */
function loadProjectFile() {
  try {
    var pbxPath = path.join(iosPlatformPath, projectName + '.xcodeproj', 'project.pbxproj');
    var xcodeproj = xcode.project(pbxPath);
    xcodeproj.parseSync();

    var saveProj = function() {
      fs.writeFileSync(pbxPath, xcodeproj.writeSync());
    };

    return {
      xcode: xcodeproj,
      write: saveProj
    };
  } catch(e) {
    console.log(e);
    throw new Error('Failed to load iOS project file.');
  }
}

/**
 * Remove comments from the file.
 *
 * @param {Object} obj - file object
 * @return {Object} file object without comments
 */
function nonComments(obj) {
  var keys = Object.keys(obj);
  var newObj = {};

  for (var i = 0, len = keys.length; i < len; i++) {
    if (!COMMENT_KEY.test(keys[i])) {
      newObj[keys[i]] = obj[keys[i]];
    }
  }

  return newObj;
}

// endregion

// region Macros injection

/**
 * Inject WKWebView macro into project configuration file.
 *
 * @param {Object} xcodeProject - xcode project file instance
 */
function setMacro(xcodeProject) {
  var configurations = nonComments(xcodeProject.pbxXCBuildConfigurationSection());
  var config;
  var buildSettings;

  for (config in configurations) {
    buildSettings = configurations[config].buildSettings;
    var preprocessorDefs = buildSettings['GCC_PREPROCESSOR_DEFINITIONS'] ? buildSettings['GCC_PREPROCESSOR_DEFINITIONS'] : [];
    if (!preprocessorDefs.length && !isWkWebViewEngineUsed) {
      continue;
    }

    if (!Array.isArray(preprocessorDefs)) {
      preprocessorDefs = [preprocessorDefs];
    }

    var isModified = false;
    var injectedDefinition = strFormat('"%s=%d"', WKWEBVIEW_MACRO, isWkWebViewEngineUsed);
    preprocessorDefs.forEach(function(item, idx) {
      if (item.indexOf(WKWEBVIEW_MACRO) !== -1) {
        preprocessorDefs[idx] = injectedDefinition;
        isModified = true;
      }
    });

    if (!isModified) {
      preprocessorDefs.push(injectedDefinition);
    }

    if (preprocessorDefs.length === 1) {
      buildSettings['GCC_PREPROCESSOR_DEFINITIONS'] = preprocessorDefs[0];
    } else {
      buildSettings['GCC_PREPROCESSOR_DEFINITIONS'] = preprocessorDefs;
    }
  }
}

// endregion
