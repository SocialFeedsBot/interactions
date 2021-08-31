const Command = require('../framework/Command');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'invite',
      description: 'Respond with a link to add these commands to your own server.'
    });
  }

  run () {
    return new Command.InteractionResponse()
      .setContent('You can add me to your server via <https://socialfeeds.app/invite>! Then the next time you type `/` in your server my commands will appear.');
  }

};
