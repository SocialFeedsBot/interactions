class Command {

  constructor (core, options = {}) {
    this._core = core;
    this.name = options.name;
    this.type = options.type;
    this.description = options.description;
    this.options = options.options || [];
  }

  get core () {
    return this._core;
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      description: this.description,
      options: this.options
    };
  }

}

module.exports = Command;

/**
 * @type {InteractionResponse}
 */
module.exports.InteractionResponse = require('../structures/InteractionResponse');

/**
 * @type {InteractionEmbedResponse}
 */
module.exports.InteractionEmbedResponse = require('../structures/InteractionEmbedResponse');

