class Command {

  constructor (core, options = {}) {
    this._core = core;
    this.name = options.name;
    this.type = options.type;
    this.description = options.description;
    this.options = options.options || [];
    this.choices = options.choices || [];

    this.awaitingButtons = new Map();
    this.awaitingSelects = new Map();
  }

  get core () {
    return this._core;
  }

  onButtonClick (name, id, interaction) {
    const user = interaction.member ? interaction.member.user : interaction.user;

    if (this.awaitingButtons.get(`${name}.${id}`)) {
      const data = this.awaitingButtons.get(`${name}.${id}`);
      if (data.userID !== user.id) return null;

      if (data.deleteAfter) this.awaitingButtons.delete(`${name}.${id}`);
      return data.func(interaction);
    } else {
      return null;
    }
  }

  onSelect (name, id, interaction) {
    const user = interaction.member ? interaction.member.user : interaction.user;

    if (this.awaitingSelects.get(`${name}.${id}`)) {
      const data = this.awaitingSelects.get(`${name}.${id}`);
      if (data.userID !== user.id) return null;

      if (data.deleteAfter) this.awaitingSelects.delete(`${name}.${id}`);
      return data.func(interaction);
    } else {
      return null;
    }
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      description: this.description,
      options: this.options,
      choices: this.choices
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

/**
 * @type {InteractionComponentResponse}
 */
module.exports.InteractionComponentResponse = require('../structures/InteractionComponentResponse');
