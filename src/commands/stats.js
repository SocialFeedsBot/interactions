const Command = require('../framework/Command');
const { stripIndents } = require('common-tags');
const Endpoints = require('../constants/Endpoints');

const moment = require('moment');
require('moment-duration-format');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'stats',
      description: 'View useful statistics.'
    });
  }

  async run ({ guildID }) {
    let ram = process.memoryUsage().heapUsed;

    const { body: feeds, success } = await this.core.api.getAllFeeds();
    const { body: thisServer } = guildID ? await this.core.api.getGuildFeeds(guildID) : { success: false, body: null };

    if (!success) {
      return new Command.InteractionResponse()
        .channelMessage()
        .setContent('An unexpected error occurred gathering statistics, please try again later.')
        .setEmoji('xmark')
        .setEphemeral();
    }

    const { body: counts } = await this.core.api.getCounts();

    if (this.core.gatewayClient.connected) {
      let mem = await this.core.gatewayClient.action('stats', { name: 'interactions' });
      ram = mem.reduce((acc, val) => acc + val.memory, 0);
    }

    return new Command.InteractionEmbedResponse()
      .setColour('orange')
      .setTitle('Statistics')
      .setThumbnail(Endpoints.avatarURL(this.core.user.id, this.core.user.avatar))
      .addField('Feeds', stripIndents`:white_small_square: Total feeds: **${feeds.feedCount.toLocaleString()}**
        :white_small_square: Feeds this server: **${thisServer.feedCount.toLocaleString()}**
        :white_small_square: Twitter: **${counts.twitter.toLocaleString()}**
        :white_small_square: Twitch: **${counts.twitch.toLocaleString()}**`, true)
      .addField('\u200b', stripIndents`:white_small_square: YouTube: **${counts.youtube.toLocaleString()}**
        :white_small_square: Reddit: **${counts.reddit.toLocaleString()}**
        :white_small_square: RSS: **${counts.rss.toLocaleString()}**
        :white_small_square: Status pages: **${counts.statuspage.toLocaleString()}**`, true)
      .addField('\u200b', '\u200b', true)
      .addField('Uptime', moment.duration(process.uptime() * 1000).format('D[ days], H[ hours], m[ minutes], s[ seconds]'), true)
      .addField('Memory Usage', this.convertMem(ram), true)
      .addField('\u200b', '\u200b', true);
  }

  convertMem (bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return 'n/a';
    const by = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    if (by === 0) return `${bytes} ${sizes[by]}`;
    return `${(bytes / Math.pow(1024, by)).toFixed(1)} ${sizes[by]}`;
  }

};
