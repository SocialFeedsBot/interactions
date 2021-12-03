const { ApplicationCommandOptionType } = require('../constants/Types');
const Command = require('../framework/Command');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'restart',
      isDeveloper: true,
      description: 'Restart services',
      options: [{
        type: ApplicationCommandOptionType.String,
        name: 'target',
        description: 'Type of service to restart',
        required: true
      }, {
        type: ApplicationCommandOptionType.String,
        name: 'id',
        description: 'Optional ID of specific service',
        required: false
      }]
    });
  }

  async run ({ args: { target, id }, user, id: intID, token }) {
    await this.core.rest.api.interactions(intID, token).callback.post(new Command.InteractionResponse()
      .setContent(`Restarting services with type **${target.value}** (ids: \`${id?.value ? id.value.split(',').join('` `') : 'all'}\`)`));

    this.core.gatewayClient.action('restart', { name: target.value, id: id?.value ? (id.value === 'all' ? id.value : id.value.split(',')) : undefined }, { restarter: user.id, panel: false });
  }

};
