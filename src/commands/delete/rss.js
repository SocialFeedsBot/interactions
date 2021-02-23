const Command = require('../../framework/Command');
const { ApplicationCommandOptionType } = require('../../constants/Types');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'rss',
      type: ApplicationCommandOptionType.SubCommand,
      description: 'Delete a RSS feed from a channel.',
      options: [{
        name: 'url',
        description: 'The url of the RSS feed to remove.',
        type: ApplicationCommandOptionType.String,
        required: true
      }, {
        name: 'channel',
        description: 'The channel the RSS feed currently posts to.',
        type: ApplicationCommandOptionType.Channel,
        required: true
      }]
    });
  }

  async run ({ member, channelID, guildID, args: [url, channel] }) {
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

    const webhook = (await this.core.rest.api.channels(channelID).webhooks.get())
      .filter(hook => hook.user.id === this.core.config.applicationID)[0];
    const { success, message } = await this.core.api.deleteFeed(guildID, {
      url,
      type: 'rss',
      webhookID: webhook.id,
      webhookToken: webhook.token
    });

    if (!success) {
      return new Command.InteractionEmbedResponse()
        .setContent('Something went wrong when deleting this feed, please report the error if it continues.')
        .setDescription(message)
        .setColour('red');
    }

    return new Command.InteractionResponse()
      .setContent('This feed has been removed successfully.')
      .setEmoji('check');
  }

};
