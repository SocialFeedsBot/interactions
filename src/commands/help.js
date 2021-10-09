const { ComponentButtonStyle } = require('../constants/Types');
const Command = require('../framework/Command');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'help',
      description: 'View some useful information on how to use this bot.'
    });
  }

  run ({ user }) {
    return new Command.InteractionEmbedResponse()
      .setTitle('SocialFeeds')
      .setDescription([
        `Hello, **${user.username}**! I am a Discord bot to send feeds to your server!`,
        'To invite me to your server, type `/invite` or click the invite button.',
        'You can manage your feeds via the online dashboard with the button below.',
        '', 'Here are some of the feeds I can post to your server:',
        ':white_small_square: Reddit',
        ':white_small_square: RSS',
        ':white_small_square: Twitter',
        ':white_small_square: Twitch',
        ':white_small_square: YouTube',
        ':white_small_square: Status pages ([example](https://discordstatus.com))',
        '', 'Get started by typing `/add` and following on with the type of feed you would like to add!'
      ].join('\n'))
      .setColour('orange')
      .addButton({ label: 'Invite me', url: 'https://socialfeeds.app/invite' })
      .addButton({ label: 'Support server', url: 'https://socialfeeds.app/support' })
      .addButton({ style: ComponentButtonStyle.Link, label: 'View Dashboard', url: 'https://socialfeeds.app/dashboard' });
  }

};
