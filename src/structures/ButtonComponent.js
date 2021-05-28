const { ComponentType } = require('../constants/Types');
const MessageComponent = require('./MessageComponent');

class ButtonComponent extends MessageComponent {

  constructor(data) {
    super();
    this.type = ComponentType.Button;
    this.style = data.style || undefined;
    this.label = data.label || undefined;
    this.emoji = data.emoji || undefined;
    this.custom_id = data.id || undefined;
    this.url = data.url || undefined;
    this.disabled = !!data.disabled;
  }

  toJSON () {
    return {
      type: this.type,
      style: this.style,
      label: this.label,
      emoji: this.emoji,
      custom_id: this.custom_id,
      url: this.url,
      disabled: this.disabled
    };
  }

}

module.exports = ButtonComponent;
