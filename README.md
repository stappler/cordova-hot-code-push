# [CHCP Plugin](https://github.com/nordnet/cordova-hot-code-push) with Current Hash History Path Preservation

This fork preserves the current application path on reloads triggered by CHCP code updates. This only works for applications using hash history i.e. relative paths within the application are implemented as fragments of the current URL.

Additionally, the plugin was updated to work with Cordova CLI 9 (support for all older versions was removed).

**Note**: apart from the above changes, this plugin works in the exactly same way as the original. For any additional information (e.g. configuration options) please consult the original [wiki](https://github.com/nordnet/cordova-hot-code-push/wiki).