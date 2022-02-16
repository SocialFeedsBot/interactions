const InteractionResponse = require('./InteractionResponse');
const { ComponentType } = require('../constants/Types');

class InteractionComponentResponse extends InteractionResponse {

  constructor() {
    super();
    this.components = [];
  }

  /**
   * Add a button component to the message.
   * @param {ComponentButtonStyle} style
   * @param {String?} id
   * @param {String?} emoji
   * @param {String?} label
   * @param {String?} url
   * @param {Object?} [options]
   * @param {Boolean?} [options.disabled]
   * @param {Boolean?} [options.separateRow]
   * @returns
   */
  addButton (style, id, emoji, label, url, options = { disabled: false, separateRow: false }) {
    // Push a row if there isn't one
    if (!this.components.length) this.components.push({ type: ComponentType.ActionRow, components: [] });

    // Allow adding more rows
    if (options.separateRow) this.components.push({ type: ComponentType.ActionRow, components: [] });

    // Always push to the last row
    this.components[this.components.length - 1].components.push({
      type: ComponentType.Button,
      custom_id: id,
      emoji,
      label,
      url,
      disabled: options.disabled,
      style
    });

    return this;
  }

   /**
   * Add a text input component to the message.
   * @param {TextInputStyle} style
   * @param {String?} id
   * @param {Boolean?} required
   * @param {String?} label
   * @param {String?} placeholder
   * @param {String?} value
   * @param {Object?} [options]
   * @param {Boolean?} [options.separateRow]
   * @returns
   */
  addTextInput (style, id, required, label, placeholder, value, options = { separateRow: false }) {
    // Push a row if there isn't one
    if (!this.components.length) this.components.push({ type: ComponentType.ActionRow, components: [] });
  
    // Allow adding more rows
    if (options.separateRow) this.components.push({ type: ComponentType.ActionRow, components: [] });

    // Always push to the last row
    this.components[this.components.length - 1].components.push({
      type: ComponentType.TextInput,
      custom_id: id,
      label,
      placeholder,
      style,
      value,
      required
    });
  
    return this;
  }
  

  toJSON () {
    const result = super.toJSON();
    result.data.components = this.components;
    return result;
  }

}

module.exports = InteractionComponentResponse;
