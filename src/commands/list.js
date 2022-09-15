const Command = require('../framework/Command');
const { ApplicationCommandOptionType, ComponentButtonStyle, ChannelType } = require('../constants/Types');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'list',
      description: 'List the feeds setup in a particular channel.',
      options: [{
        type: ApplicationCommandOptionType.Channel,
        name: 'channel',
        description: 'Channel to view the feeds of.',
        required: true,
        channel_types: [ChannelType.Text, ChannelType.News]
      }]
    });
  }

  async run ({ guildID, args: { channel }, user, member, token }) {
    let { success, docs: allDocs } = await this.getFeeds(guildID);
    if (!success) {
      return new Command.InteractionResponse()
        .setContent('I need permissions to **Manage Webhooks** in order to view your feed list.')
        .setEmoji('xmark');
    }

    let docs = allDocs.filter(doc => doc.channelID === channel.value);
    if (!docs.length) {
      return new Command.InteractionResponse()
        .setContent('There are no feeds setup in this channel.')
        .setEmoji('xmark');
    } else {
      let chunks = [];
      while (docs.length > 0) chunks.push(docs.splice(0, 5));

      let page = Math.min(1, chunks.length) || 1;
      let embed = this.generatePage(page, channel.channel.name, allDocs, chunks)
        .addButton({ style: ComponentButtonStyle.Blurple, label: 'Previous Page', disabled: (page - 1) === 0, custom_id: `list-prevpage-${guildID}-${channel.value}`, emoji: { id: null, name: '◀️' } })
        .addButton({ style: ComponentButtonStyle.Blurple, label: 'Next Page', disabled: page === chunks.length, custom_id: `list-nextpage-${guildID}-${channel.value}`, emoji: { id: null, name: '▶️' } });

      await this.core.redis.set(`interactions:awaits:list-prevpage-${guildID}-${channel.value}`, JSON.stringify({
        command: 'list',
        pages: chunks,
        channel: channel.channel.name,
        page,
        allDocs,
        token,
        removeOnResponse: false,
        userID: user.id
      }));
      await this.core.redis.set(`interactions:awaits:list-nextpage-${guildID}-${channel.value}`, JSON.stringify({
        command: 'list',
        channel: channel.channel.name,
        pages: chunks,
        allDocs,
        page,
        token,
        removeOnResponse: false,
        userID: user.id
      }));

      setTimeout(async () => {
        await this.core.redis.del(`interactions:awaits:list-nextpage-${guildID}-${channel.value}`);
        await this.core.redis.del(`interactions:awaits:list-prevpage-${guildID}-${channel.value}`);

        this.core.rest.api.webhooks(this.core.config.applicationID, token).messages('@original').patch({
          components: []
        });
      }, 2 * 60 * 1000);

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
      statuspage: `<:statuspage:809109311271600138> [Status Page: ${feed.url}](${feed.url})`,
      'roblox-group': `<:roblox:977963193836142602> [Roblox Group: ${feed.display ? feed.display.title : feed.url}](https://roblox.com/groups/${feed.url})`
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

  generatePage (page, channel, allDocs, chunks) {
    let description = '';
    const embed = new Command.InteractionEmbedResponse()
      .setTitle(`Feed list for #${channel}`)
      .setColour(16753451)
      .setFooter(`Total feeds: ${allDocs.length} (Page ${page}/${chunks.length})`);

    // Populate fields
    chunks[page - 1].forEach((doc) => {
      description += `\n${this.feedType(doc)} ${doc.type === 'twitter' ? `[${doc.options.replies ? 'with replies' : 'without replies'}]` : ''}`;
    });

    embed.setDescription(`You can now manage your feeds on an online [dashboard](https://socialfeeds.app)\n${description}`);
    return embed;
  }

  async handleComponent (data, interaction) {
    if (interaction.member.user.id !== data.userID) {
      return null;
    }

    let page = Math.min(data.page - 1, data.pages.length) || 1;
    if (interaction.customID.includes('nextpage')) {
      page = Math.min(data.page + 1, data.pages.length);
    } else {
      page = Math.min(data.page - 1, data.pages.length) || 1;
    }

    let embed = this.generatePage(page, data.channel, data.allDocs, data.pages);
    embed.updateMessage();

    embed.addButton({ style: ComponentButtonStyle.Blurple, label: 'Previous Page', disabled: (page - 1) === 0, custom_id: `list-prevpage-${interaction.guildID}-${interaction.channelID}`, emoji: { id: null, name: '◀️' } })
      .addButton({ style: ComponentButtonStyle.Blurple, label: 'Next Page', disabled: (page - 1) === data.pages.length, custom_id: `list-nextpage-${interaction.guildID}-${interaction.channelID}`, emoji: { id: null, name: '▶️' } });

    await this.core.redis.set(`interactions:awaits:list-nextpage-${interaction.guildID}-${interaction.channelID}`, JSON.stringify(data));
    await this.core.redis.set(`interactions:awaits:list-prevpage-${interaction.guildID}-${interaction.channelID}`, JSON.stringify(data));

    return embed;
  }

};
