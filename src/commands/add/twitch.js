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
      }]
    });
  }

  async run ({ member, guildID, args: [account, channel, msg] }) {
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

    account = verifyFeed('twitch', account);

    const { success, message, body } = await this.core.api.createNewFeed(guildID, {
      url: account,
      type: 'twitch',
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

    return new Command.InteractionEmbedResponse()
      .setColour('green')
      .setAuthor(body.feedData.title, body.feedData.icon)
      .setDescription(`Successfully added feed in \`#${channel.name}\`!`)
      .setEmoji('check');
  }

};
