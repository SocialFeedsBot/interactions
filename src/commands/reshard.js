const Command = require('../framework/Command');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'reshard',
      isDeveloper: true,
      description: 'Reshard the shards service'
    });
  }

  async run ({ user, id: intID, token }) {
    this.core.gatewayClient.action('reshard', { name: 'shards', id: 'all' });
    return new Command.InteractionResponse()
      .setContent(':white_check_mark: Resharding');
  }

};
