const { ComponentButtonStyle } = require('../constants/Types');
const Command = require('../framework/Command');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'help',
      description: 'View some useful information on how to use this bot.'
    });
  }

  run ({ user, member }) {
    /*
      statuspage: `<:statuspage:809109311271600138> [Status Page: ${feed.url}](${feed.url})`,
      'roblox-group': `<:roblox:977963193836142602>
      */
    return new Command.InteractionEmbedResponse()
      .setTitle('SocialFeeds')
      .setDescription([
        `Hello, **${user ? user.username : member.user.username}**! I am a Discord bot to send feeds to your server!`,
        'To invite me to your server, type `/invite` or click the invite button.',
        'You can manage your feeds via the online dashboard with the button below.',
        '', 'Here are some of the feeds I can post to your server:',
        '<:reddit:648124175378284544> Reddit',
        '<:rss:644633161933914122> RSS',
        '<:twitter:644633161212624946> Twitter',
        '<:twitch:644633161401368577> Twitch',
        '<:youtube:644633161464020993> YouTube',
        '<:roblox:977963193836142602> Roblox Group Shouts',
        '<:statuspage:809109311271600138> Status pages ([view example](https://discordstatus.com))',
        '', 'Get started by typing `/add` and following on with the type of feed you would like to add!'
      ].join('\n'))
      .setColour('orange')
      .addButton({ label: 'Invite me', url: 'https://socialfeeds.app/invite', style: ComponentButtonStyle.Blurple })
      .addButton({ label: 'Support server', url: 'https://socialfeeds.app/support' })
      .addButton({ style: ComponentButtonStyle.Link, label: 'View Dashboard', url: 'https://socialfeeds.app/dashboard' });
  }

};
