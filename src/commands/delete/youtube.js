const Command = require('../../framework/Command');
const { ApplicationCommandOptionType } = require('../../constants/Types');
const verifyFeed = require('../../util/verifyFeed');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'youtube',
      type: ApplicationCommandOptionType.SubCommand,
      description: 'Remove a YouTube account from posting to a channel.',
      options: [{
        name: 'account',
        description: 'The name of the channel to remove.',
        type: ApplicationCommandOptionType.String,
        required: true
      }, {
        name: 'channel',
        description: 'The channel the account currently post to.',
        type: ApplicationCommandOptionType.Channel,
        required: true
      }]
    });
  }

  async run ({ member, channelID, guildID, args: [account, channel] }) {
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

    account = verifyFeed('youtube', account);

    const webhook = (await this.core.rest.api.channels(channel.id).webhooks.get())
      .filter(hook => hook.user.id === this.core.config.applicationID)[0];
    const { success, message, body } = await this.core.api.deleteFeed(guildID, {
      url: account,
      type: 'youtube',
      webhookID: webhook.id,
      webhookToken: webhook.token
    });

    if (!success) {
      return new Command.InteractionEmbedResponse()
        .setContent('Something went wrong when deleting this feed, please report the error if it continues.')
        .setDescription(message)
        .setColour('red');
    }

    if (body.display) {
      return new Command.InteractionEmbedResponse()
        .setColour('green')
        .setAuthor(body.display.title, body.display.icon)
        .setDescription(`Successfully removed feed from \`#${channel.name}\`!`)
        .setEmoji('check');
    } else {
      return new Command.InteractionEmbedResponse()
        .setColour('green')
        .setAuthor(`${this.humanise(body.type)}: ${body.url}`)
        .setContent(`Successfully removed feed from \`#${channel.name}\`!`)
        .setEmoji('check');
    }
  }

  humanise(key) {
    return {
      reddit: 'Reddit',
      rss: 'RSS',
      twitter: 'Twitter',
      twitch: 'Twitch',
      youtube: 'YouTube',
      statuspage: 'Status Page'
    }[key];
  }

};
