const { ApplicationCommandOptionType, ComponentButtonStyle, ComponentType, ChannelType } = require('../constants/Types');
const Command = require('../framework/Command');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'delete',
      description: 'Open up a dropdown menu to select feeds to remove.',
      options: [{
        type: ApplicationCommandOptionType.Channel,
        name: 'channel',
        description: 'Channel to remove the feed from.',
        required: true,
        channel_types: [ChannelType.Text, ChannelType.News]
      }],
      dmPermission: false,
      defaultMemberPermission: ['manageWebhooks']
    });
  }

  async run ({ id, token, guildID, member, user, args }) {
    await this.core.rest.api.interactions(id, token).callback.post(new Command.InteractionResponse()
      .ack());
    let { body: { feeds } } = await this.core.api.getGuildFeeds(guildID);
    feeds = feeds.filter(f => f.channelID === args.channel.value);

    if (!feeds.length) {
      return await this.core.rest.api.webhooks(this.core.config.applicationID, token).messages('@original').patch(
        new Command.InteractionEmbedResponse()
          .setColour('red')
          .setDescription(':x: You do not have any feeds in this channel to delete.').toJSON().data
      );
    }

    await this.core.redis.set(`interactions:awaits:deleteselect-${user.id}`, JSON.stringify({
      command: 'delete',
      feeds,
      token,
      removeOnResponse: true,
      userID: user.id
    }));
    await this.core.redis.set(`interactions:awaits:cancel-deleteselect-${user.id}`, JSON.stringify({
      command: 'delete',
      feeds,
      token,
      removeOnResponse: true,
      userID: user.id
    }));

    feeds = feeds.map(f => this.display(f));
    let chunks = [];
    while (feeds.length > 0) chunks.push(feeds.splice(0, 25));

    const resp = new Command.InteractionResponse()
      .setContent('Use the select menu below to select feeds to remove.');

    chunks.forEach((chunk, i) => {
      resp.addActionRow();
      resp.addSelectMenu({
        custom_id: `deleteselect-${user.id}`,
        placeholder: `Click to see feeds (page ${i + 1})`,
        options: chunk,
        max_values: chunk.length
      });
    });

    resp.addActionRow();
    resp.addButton({
      style: ComponentButtonStyle.Red,
      label: 'Cancel',
      custom_id: `cancel-deleteselect-${user.id}`
    });

    return await this.core.rest.api.webhooks(this.core.config.applicationID, token).messages('@original').patch(resp.toJSON().data);
  }

  async handleComponent (data, interaction) {
    if (interaction.member.user.id !== data.userID) {
      return null;
    }

    if (interaction.componentType === ComponentType.Button) {
      return new Command.InteractionResponse()
        .updateMessage()
        .setContent('Select menu cancelled');
    }

    const toRemove = interaction.values;

    let promises = [];
    toRemove.forEach(value => {
      const feed = data.feeds.find(f => f.url === value);
      promises.push(this.core.api.deleteFeed(interaction.guildID, {
        type: feed.type,
        url: value,
        webhookID: feed.webhookID
      }));
    });

    return await Promise.all(promises).then(res => new Command.InteractionEmbedResponse()
      .updateMessage()
      .setColour('green')
      .setDescription(`Successfully removed ${res.length} feeds from this channel!`)
    ).catch(err => new Command.InteractionEmbedResponse()
      .updateMessage()
      .setColour('red')
      .setDescription(`:x: Some feeds could not be removed.\nError: \`${err.message}\``)
    );
  }

  display (feed) {
    const emojis = {
      youtube: { name: 'youtube', id: '644633161464020993' },
      twitch: { name: 'twitch', id: '644633161401368577' },
      twitter: { nmae: 'twitter', id: '644633161212624946' },
      rss: { name: 'rss', id: '644633161933914122' },
      reddit: { name: 'reddit', id: '648124175378284544' },
      statuspage: { name: 'statuspage', id: '809109311271600138' }
    };
    return {
      label: feed.display && feed.display.title ? feed.display.title.substring(0, 25) : feed.url.substring(0, 25),
      value: feed.url.length > 100 ? feed.url.substring(0, 99) : feed.url,
      description: feed.url.length > 50 ? `${feed.url.substring(0, 45)}...` : feed.url,
      emoji: emojis[feed.type]
    };
  }

};
