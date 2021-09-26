const Command = require('../framework/Command');
const { ApplicationCommandOptionType, ComponentButtonStyle } = require('../constants/Types');

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

  async run ({ guildID, args: [channel], user, member, token }) {
    if (![0, 5].includes(channel.type)) {
      return new Command.InteractionResponse()
        .setContent('Channel can only be a text channel.')
        .setEmoji('xmark');
    }

    let { success, docs: allDocs } = await this.getFeeds(guildID);
    if (!success) {
      return new Command.InteractionResponse()
        .setContent('I need permissions to **Manage Webhooks** in order to view your feed list.')
        .setEmoji('xmark');
    }

    let docs = allDocs.filter(doc => doc.channelID === channel.id);
    if (!docs.length) {
      return new Command.InteractionResponse()
        .setContent('There are no feeds setup in this channel.')
        .setEmoji('xmark');
    } else {
      let chunks = [];
      while (docs.length > 0) chunks.push(docs.splice(0, 5));

      let page = Math.min(1, chunks.length) || 1;
      let embed = this.generatePage(page, channel, allDocs, chunks)
        .addButton({ style: ComponentButtonStyle.Blurple, label: 'Previous Page', disabled: (page - 1) === 0, id: `list.pagination:prevpage.${guildID}:${channel.id}` })
        .addButton({ style: ComponentButtonStyle.Blurple, label: 'Next Page', disabled: page === chunks.length, id: `list.pagination:nextpage.${guildID}:${channel.id}` });

      this.awaitingButtons.set(`pagination:prevpage.${guildID}:${channel.id}`, {
        userID: member ? member.user.id : user.id,
        deleteAfter: false,
        func: () => {
          page = Math.min(page - 1, chunks.length) || 1;
          embed = this.generatePage(page, channel, allDocs, chunks);
          embed.updateMessage();

          embed.addButton({ style: ComponentButtonStyle.Blurple, label: 'Previous Page', disabled: (page - 1) === 0, id: `list.pagination:prevpage.${guildID}:${channel.id}` })
            .addButton({ style: ComponentButtonStyle.Blurple, label: 'Next Page', disabled: (page - 1) === chunks.length, id: `list.pagination:nextpage.${guildID}:${channel.id}` });

          return embed;
        }
      });

      this.awaitingButtons.set(`pagination:nextpage.${guildID}:${channel.id}`, {
        userID: member ? member.user.id : user.id,
        deleteAfter: false,
        func: () => {
          page = Math.min(page + 1, chunks.length);
          embed = this.generatePage(page, channel, allDocs, chunks);
          embed.updateMessage();

          embed.addButton({ style: ComponentButtonStyle.Blurple, label: 'Previous Page', disabled: (page - 1) === 0, id: `list.pagination:prevpage.${guildID}:${channel.id}`, emoji: { id: null, name: '◀️' } })
            .addButton({ style: ComponentButtonStyle.Blurple, label: 'Next Page', disabled: page === chunks.length, id: `list.pagination:nextpage.${guildID}:${channel.id}`, emoji: { id: null, name: '▶️' } });

          return embed;
        }
      });

      setTimeout(() => {
        this.awaitingButtons.delete(`pagination:nextpage.${guildID}:${channel.id}`);
        this.awaitingButtons.delete(`pagination:prevpage.${guildID}:${channel.id}`);

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

  generatePage (page, channel, allDocs, chunks) {
    let description = '';
    const embed = new Command.InteractionEmbedResponse()
      .setTitle(`Feed list for #${channel.name}`)
      .setColour(16753451)
      .setFooter(`Total feeds: ${allDocs.length} (Page ${page}/${chunks.length})`);

    // Populate fields
    chunks[page - 1].forEach((doc) => {
      description += `\n${this.feedType(doc)} ${doc.type === 'twitter' ? `[${doc.options.replies ? 'with replies' : 'without replies'}]` : ''}`;
    });

    embed.setDescription(`You can now manage your feeds on an online [dashboard](https://socialfeeds.app)\n${description}`);
    return embed;
  }

};
