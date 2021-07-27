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

  async run ({ id, token, member, guildID, args: [url, channel, msg] }) {
    if (![0, 5].includes(channel.type)) {
      return new Command.InteractionResponse()
        .setContent('Channel can only be a text channel.')
        .setEmoji('xmark')
        .setEphemeral();
    }
    if (!member.permissions.has('manageWebhooks')) {
      return new Command.InteractionResponse()
        .setContent('You need the **Manage Webhooks** permission to run this command!')
        .setEmoji('xmark')
        .setEphemeral();
    }
    await this.core.rest.api.interactions(id, token).callback.post(new Command.InteractionResponse()
      .ack());

    const { success, message, body } = await this.core.api.createNewFeed(guildID, {
      url,
      type: 'rss',
      channelID: channel.id,
      nsfw: !!channel.nsfw,
      options: { replies: false, message: msg }
    });

    if (!success) {
      return this.core.rest.api.webhooks(this.core.config.applicationID, token).messages('@original').patch(
        new Command.InteractionEmbedResponse()
          .setContent('Something went wrong when creating this feed, please report the error if it continues.')
          .setDescription(message)
          .setColour('red').toJSON().data
      );
    }

    return this.core.rest.api.webhooks(this.core.config.applicationID, token).messages('@original').patch(
      new Command.InteractionEmbedResponse()
        .setColour('green')
        .setAuthor(body.feedData.title, body.feedData.icon)
        .setDescription(`Successfully added feed in \`#${channel.name}\`!`)
        .setEmoji('check').toJSON().data
    );
  }

};
