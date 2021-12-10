const Command = require('../../framework/Command');
const { ApplicationCommandOptionType, ChannelType } = require('../../constants/Types');
const verifyFeed = require('../../util/verifyFeed');
const superagent = require('superagent');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'reddit',
      type: ApplicationCommandOptionType.SubCommand,
      description: 'Add a new reddit feed to the server.\n**!** Adding a new feed will only post new updates from after you add the feed, not old posts.',
      options: [{
        name: 'subreddit',
        description: 'The name of the subreddit to add.',
        type: ApplicationCommandOptionType.String,
        required: true,
        autocomplete: true
      }, {
        name: 'channel',
        description: 'The channel to post subreddit to.',
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
    if (!member.permissions.has('manageWebhooks')) {
      return new Command.InteractionResponse()
        .setContent('You need the **Manage Webhooks** permission to run this command!')
        .setEmoji('xmark')
        .setEphemeral();
    }

    await this.core.rest.api.interactions(id, token).callback.post(new Command.InteractionResponse()
      .ack());
    args.subreddit.value = verifyFeed('reddit', args.subreddit.value);

    const { success, message, body } = await this.core.api.createNewFeed(guildID, {
      url: args.subreddit.value,
      type: 'reddit',
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

  // return subreddits based on query
  async handleAutocomplete (options) {
    const query = options.filter(o => o.focused)[0].value;
    const { body: { data } } = await superagent.get('https://www.reddit.com/subreddits/search.json')
      .query({ q: encodeURIComponent(query), include_over_18: 'on' });

    if (!data || !data.children) {
      return [];
    }
    const children = data.children;

    return children.splice(0, 10).map(child => ({
      name: child.data.display_name_prefixed,
      value: child.data.display_name
    }));
  }

};
