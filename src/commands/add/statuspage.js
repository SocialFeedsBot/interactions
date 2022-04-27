const Command = require('../../framework/Command');
const { ApplicationCommandOptionType, ChannelType } = require('../../constants/Types');
const verifyFeed = require('../../util/verifyFeed');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'statuspage',
      type: ApplicationCommandOptionType.SubCommand,
      description: 'Track a status page to get realtime updates.\n**!** Adding a new feed will only post new updates.',
      options: [{
        name: 'url',
        description: 'The url of the status page.',
        type: ApplicationCommandOptionType.String,
        required: true
      }, {
        name: 'channel',
        description: 'The channel to post status updates to.',
        type: ApplicationCommandOptionType.Channel,
        required: true,
        channel_types: [ChannelType.Text, ChannelType.News]
      }, {
        name: 'message',
        description: 'A message to tag along with new posts, you can use this to notify roles/people.',
        type: ApplicationCommandOptionType.String,
        required: false
      }, {
        name: 'no-embed',
        description: 'Send the message as plain text rather than an embed.',
        type: ApplicationCommandOptionType.Boolean,
        required: false
      }]
    });
  }

  async run ({ id, token, member, guildID, args }) {
    await this.core.rest.api.interactions(id, token).callback.post(new Command.InteractionResponse()
      .ack());
    args.url = verifyFeed('statuspage', args.url.value);

    const { success, message, body } = await this.core.api.createNewFeed(guildID, {
      url: args.url,
      type: 'statuspage',
      channelID: args.channel.value,
      nsfw: !!args.channel.channel.nsfw,
      options: { replies: false, message: args.message?.value, noEmbed: args['no-embed']?.value }
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
        .setDescription(`Successfully added feed in \`#${args.channel.channel.name}\`!`)
        .setEmoji('check').toJSON().data
    );
  }

};
