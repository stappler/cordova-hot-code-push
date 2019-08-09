/*
Helper class to read options from the config.xml.
*/

var xmlHelper = require('./xmlHelper.js');
var cordova_util = require('cordova-lib/src/cordova/util');
var ConfigParser = require('cordova-common').ConfigParser;

module.exports = {
  readChcpOptions: readChcpOptions,
  readProjectName: readProjectName
};

// region Public API

/**
 * Read CHCP plugin options from config.xml.
 * If none is specified - default options are returned.
 *
 * @param {Object} ctx - cordova context object
 * @return {Object} plugin preferences
 */
function readChcpOptions(ctx) {
  var configFilePath = rootConfigXmlPath(ctx);
  var configXmlContent = xmlHelper.readXmlAsJson(configFilePath, true);

  if (!configXmlContent || !configXmlContent.chcp) {
    return {};
  } else {
    return configXmlContent.chcp;
  }
}

/**
 * Read name of the current project.
 *
 * @param {Object} ctx - cordova context instance
 * @return {String} name of the project
 */
function readProjectName(ctx) {
  var configFilePath = rootConfigXmlPath(ctx);
  return new ConfigParser(configFilePath).name();
}

// endregion

// region Private API

/**
 * Get root config.xml file path.
 *
 * @param {Object} ctx - cordova context instance
 * @return {String} root config.xml file path
 */
function rootConfigXmlPath(ctx) {
  return cordova_util.projectConfig(ctx.opts.projectRoot);
}

// endregion
