const { ComponentType } = require('../constants/Types');
const MessageComponent = require('./MessageComponent');

class SelectComponent extends MessageComponent {

  constructor(data) {
    super();
    this.type = ComponentType.SelectMenu;
    this.custom_id = data.id || undefined;
    this.placeholder = data.placeholder || undefined;
    this.min_values = data.minValues || 1;
    this.max_values = data.maxValues || 1;
    this.disabled = data.disabled || false;

    this.options = data.options || [];
  }

  toJSON () {
    return {
      type: this.type,
      custom_id: this.custom_id,
      placeholder: this.placeholder,
      min_values: this.min_values,
      max_values: this.max_values,
      disabled: this.disabled,
      options: this.options
    };
  }

}

module.exports = SelectComponent;
