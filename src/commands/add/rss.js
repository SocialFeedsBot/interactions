const Command = require('../../framework/Command');
const { ApplicationCommandOptionType } = require('../../constants/Types');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'rss',
      type: ApplicationCommandOptionType.SubCommand,
      description: 'Add a new RSS feed to a channel',
      options: [{
        name: 'url',
        description: 'The url of the RSS feed.',
        type: ApplicationCommandOptionType.String,
        required: true
      }, {
        name: 'channel',
        description: 'The channel to post new articles to.',
        type: ApplicationCommandOptionType.Channel,
        required: true
      }, {
        name: 'message',
        description: 'A message to tag along with new posts, you can use this to notify roles/people.',
        type: ApplicationCommandOptionType.String,
        required: false
      }]
    });
  }

  async run ({ member, guildID, args: [url, channel, msg] }) {
    if (channel.type !== 0) {
      return new Command.InteractionResponse()
        .setContent('Channel can only be a text channel.')
        .setEmoji('xmark');
    }
    if (!member.permissions.has('manageWebhooks')) {
      return new Command.InteractionResponse()
        .setContent('You need the **Manage Webhooks** permission to run this command!')
        .setEmoji('xmark');
    }

    const { success, message } = await this.core.api.createNewFeed(guildID, {
      url,
      type: 'rss',
      channelID: channel.id,
      nsfw: !!channel.nsfw,
      options: { replies: false, message: msg }
    });

    if (!success) {
      return new Command.InteractionEmbedResponse()
        .setContent('Something went wrong when creating this feed, please report the error if it continues.')
        .setDescription(message)
        .setColour('red');
    }

    return new Command.InteractionResponse()
      .setContent(`New RSS articles will be posted to <#${channel.id}>.`)
      .setEmoji('check');
  }

};
