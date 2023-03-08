const Command = require('../../framework/Command');
const { ApplicationCommandOptionType, ChannelType } = require('../../constants/Types');
const verifyFeed = require('../../util/verifyFeed');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'youtube',
      type: ApplicationCommandOptionType.SubCommand,
      description: 'Add a new YouTube channel to the server.\n**!** Adding a new feed will only post new updates.',
      options: [{
        name: 'account',
        description: 'The ID of the channel to add (check the url).',
        type: ApplicationCommandOptionType.String,
        required: true
      }, {
        name: 'channel',
        description: 'The channel to post new videos to.',
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

  async run ({ id, token, guildID, args }) {
    await this.core.rest.api.interactions(id, token).callback.post(new Command.InteractionResponse()
      .setContent('Searching for feed...'));
    args.account = verifyFeed('youtube', args.account.value);

    const { success, message, body } = await this.core.api.createNewFeed(guildID, {
      url: args.account,
      type: 'youtube',
      channelID: args.channel.channel.id,
      nsfw: !!args.channel.channel.nsfw,
      options: { replies: false, message: args.message?.value, noEmbed: args['no-embed']?.value }
    });

    if (!success) {
      return this.core.rest.api.webhooks(this.core.config.applicationID, token).messages('@original').patch(
        new Command.InteractionEmbedResponse()
          .setContent('Something went wrong when creating this feed, please report the error if it continues.')
          .setDescription(`Error: \`${message}\``)
          .setColour('red').toJSON().data
      );
    }

    return this.core.rest.api.webhooks(this.core.config.applicationID, token).messages('@original').patch(
      new Command.InteractionEmbedResponse()
        .setColour('green')
        .setAuthor(body.feedData.title, body.feedData.icon)
        .setContent(`Added feed in \`#${args.channel.channel.name}\`!`).toJSON().data
    );
  }

};
