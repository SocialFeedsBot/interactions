const { InteractionResponseType, MessageFlags, ComponentType, ComponentButtonStyle } = require('../constants/Types');
const { resolveEmoji } = require('../constants/Emojis');

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
   * Set the type to ack and edit response later
   * @returns {InteractionResponse}
   */
  ack () {
    this.type = InteractionResponseType.AcknowledgeWithSource;
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
   * Add an action row component
   * @returns {InteractionResponse}
   */
  addActionRow () {
    this.components.push({
      type: ComponentType.ActionRow,
      components: []
    });

    return this;
  }

  /**
   * Add a select menu.
   * @param {SelectMenu} selectMenu Options for select menu
   * @returns {InteractionResponse}
   */
  addSelectMenu (selectMenu) {
    if (!this.components.length) {
      this.addActionRow();
    }

    selectMenu = { ...selectMenu, type: ComponentType.SelectMenu };
    this.components[this.components.length - 1].components.push(selectMenu);

    return this;
  }

  /**
   * Create a select menu.
   * @param {Button} button Options for the button
   * @returns {InteractionResponse}
   */
  addButton (button) {
    if (!this.components.length) {
      this.addActionRow();
    }

    if (button.url) {
      button.style = ComponentButtonStyle.Link;
    } else {
      button.style = ComponentButtonStyle[button.style] || button.style || ComponentButtonStyle.Blurple;
    }

    button = {
      ...button,
      type: ComponentType.Button
    };
    this.components[this.components.length - 1].components.push(button);

    return this;
  }

  toJSON () {
    const result = {
      type: this.type,
      data: {
        components: this.components.map(c => c.toJSON ? c.toJSON() : c)
      }
    };
    if (this.flags) result.data.flags = this.flags;
    if (this.content) result.data.content = this.content;
    return result;
  }

}

module.exports = InteractionResponse;
