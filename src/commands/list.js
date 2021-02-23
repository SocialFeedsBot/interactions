
const Command = require('../framework/Command');
const { ApplicationCommandOptionType } = require('../constants/Types');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'list',
      description: 'List the feeds setup in a particular channel.',
      options: [{
        type: ApplicationCommandOptionType.Channel,
        name: 'channel',
        description: 'Channel to view the feeds of.',
        required: true
      }]
    });
  }

  async run ({ guildID, args: [channel] }) {
    if (channel.type !== 0) {
      return new Command.InteractionResponse()
        .setContent('Channel can only be a text channel.')
        .setEmoji('xmark');
    }

    let { success, docs } = await this.getFeeds(guildID);
    if (!success) {
      return new Command.InteractionResponse()
        .setContent('I need permissions to **Manage Webhooks** in order to view your feed list.')
        .setEmoji('xmark');
    }

    docs = docs.filter(doc => doc.channelID === channel.id);
    if (!docs.length) {
      return new Command.InteractionResponse()
        .setContent('There are no feeds setup in this channel.')
        .setEmoji('xmark');
    } else {
      docs = docs.splice(0, 20);
      let description = '';

      const embed = new Command.InteractionEmbedResponse()
        .setTitle(`Viewing feed list for #${channel.name}`)
        .setColour('orange');

      // Populate fields
      docs.forEach((doc) => {
        description += `\n${this.feedType(doc)} ${doc.type === 'twitter' ? `[${doc.options.replies ? 'with replies' : 'without replies'}]` : ''}`;
      });

      embed.setDescription(`**:information_source: Only 20 feeds are shown. You can now manage your feeds on an online dashboard.** [Click here to go.](https://socialfeeds.app)\n\n${description}`);

      // Send the embed
      return embed;
    }
  }

  feedType (feed) {
    return {
      youtube: `<:youtube:644633161464020993> [${feed.url}](https://youtube.com/channel/${feed.url})`,
      twitch: `<:twitch:644633161401368577> [${feed.url}](https://twitch.tv/${feed.url})`,
      twitter: `<:twitter:644633161212624946> [${feed.url}](https://twitter.com/${feed.url})`,
      rss: `<:rss:644633161933914122> [${feed.url}](${feed.url})`,
      reddit: `<:reddit:648124175378284544> [${feed.url}](https://reddit.com/r/${feed.url})`,
      statuspage: `<:statuspage:809109311271600138> [Status Page: ${feed.url}](${feed.url})`
    }[feed.type];
  }

  async getFeeds (guildID) {
    let docs = [];
    let page = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { body: body, message, success: success } = await this.core.api.getGuildFeeds(guildID, { page });
      if (!success) return { success, message, docs };
      docs.push(...body.feeds);
      page++;
      if (body.page >= body.pages) return { success, message, docs };
    }
  }

};
