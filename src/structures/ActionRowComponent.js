const { ComponentType } = require('../constants/Types');
const MessageComponent = require('./MessageComponent');
const ButtonComponent = require('./ButtonComponent');

class ActionRowComponent extends MessageComponent {

  constructor(components = []) {
    super();
    this.type = ComponentType.ActionRow;
    this.components = [];

    components.forEach(component => this.components.push(component));
  }

  /**
   * Add a button component.
   * @param {Object} options
   */
  addButton (data) {
    return new ButtonComponent(data);
  }

  toJSON() {
    return { type: ComponentType.ActionRow, components: this.components.map(c => c.toJSON()) };
  }

}

module.exports = ActionRowComponent;
