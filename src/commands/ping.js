const Command = require('../framework/Command');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'ping',
      description: 'Reply with a pong to see if I am working!'
    });
  }

  run () {
    return new Command.InteractionResponse()
      .setContent('Pong!')
      .setEmoji('check');
  }

};
