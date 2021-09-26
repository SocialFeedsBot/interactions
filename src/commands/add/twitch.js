const Command = require('../../framework/Command');
const { ApplicationCommandOptionType } = require('../../constants/Types');
const verifyFeed = require('../../util/verifyFeed');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'twitch',
      type: ApplicationCommandOptionType.SubCommand,
      description: 'Add a new Twitch user to the server.',
      options: [{
        name: 'account',
        description: 'The name of the channel to add (check the url).',
        type: ApplicationCommandOptionType.String,
        required: true
      }, {
        name: 'channel',
        description: 'The channel to post stream updates to.',
        type: ApplicationCommandOptionType.Channel,
        required: true
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
    if (![0, 5].includes(args.channel.channel.type)) {
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
    args.account = verifyFeed('twitch', args.account);

    const { success, message, body } = await this.core.api.createNewFeed(guildID, {
      url: args.account,
      type: 'twitch',
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
