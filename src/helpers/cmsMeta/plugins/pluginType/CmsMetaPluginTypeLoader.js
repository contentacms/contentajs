// @flow

const { PluginTypeLoaderBase } = require('plugnplay');

class CmsMetaPluginTypeLoader extends PluginTypeLoaderBase {
  /**
   * Returns the properties a plugin of this type exports.
   *
   * @return {string[]}
   *   The names of the properties exported.
   */
  definePluginProperties(): Array<string> {
    return ['fetch'];
  }
}

module.exports = CmsMetaPluginTypeLoader;
