const { InteractionResponseType, MessageFlags } = require('../constants/Types');
const { resolveEmoji } = require('../constants/Emojis');
const ActionRowComponent = require('./ActionRowComponent');

class InteractionResponse {

  constructor() {
    this.type = InteractionResponseType.ChannelMessageWithSource;
    this.flags = 0;
    this.content = null;
    this.components = [];
  }

  /**
   * Set the type to update a message [COMPONENTS ONLY]
   * @returns {InteractionResponse}
   */
  updateMessage () {
    this.type = InteractionResponseType.UpdateMessage;
    return this;
  }

  /**
   * Set the message content
   * @param {string} content
   * @returns {InteractionResponse}
   */
  setContent (content) {
    this.content = content;
    return this;
  }

  /**
   * Set this response as ephemeral
   * @returns {InteractionResponse}
   */
  setEphemeral () {
    this.flags |= MessageFlags.Ephemeral;
    return this;
  }

  /**
   * Set the emoji to place at the beginning of the content
   * This should be called after InteractionResponse.setContent()
   * @param {string} emoji
   * @returns {InteractionEmbedResponse}
   */
  setEmoji (emoji) {
    this.content = `${resolveEmoji(emoji)} ${this.content || ''}`;
    return this;
  }

  /**
   * Create an action row for components.
   * @param {*} components
   * @returns {InteractionResponse}
   */
  actionRow (...components) {
    const row = new ActionRowComponent(components);
    this.components.push(row);
    return this;
  }

  toJSON () {
    const result = {
      type: this.type,
      data: {
        components: this.components
      }
    };
    if (this.flags) result.data.flags = this.flags;
    if (this.content) result.data.content = this.content;
    return result;
  }

}

module.exports = InteractionResponse;
