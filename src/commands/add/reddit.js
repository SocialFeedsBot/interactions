const Command = require('../../framework/Command');
const { ApplicationCommandOptionType } = require('../../constants/Types');
const verifyFeed = require('../../util/verifyFeed');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'reddit',
      type: ApplicationCommandOptionType.SubCommand,
      description: 'Add a new reddit feed to the server.',
      options: [{
        name: 'subreddit',
        description: 'The name of the subreddit to add.',
        type: ApplicationCommandOptionType.String,
        required: true
      }, {
        name: 'channel',
        description: 'The channel to post subreddit to.',
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

  async run ({ member, guildID, args: [subreddit, channel, msg] }) {
    if (![0, 5].includes(channel.type)) {
      return new Command.InteractionResponse()
        .setContent('Channel can only be a text channel.')
        .setEmoji('xmark');
    }
    if (!member.permissions.has('manageWebhooks')) {
      return new Command.InteractionResponse()
        .setContent('You need the **Manage Webhooks** permission to run this command!')
        .setEmoji('xmark');
    }

    subreddit = verifyFeed('reddit', subreddit);

    const { success, message, body } = await this.core.api.createNewFeed(guildID, {
      url: subreddit,
      type: 'reddit',
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
