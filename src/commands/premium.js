const Command = require('../framework/Command');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'premium',
      description: 'Shows the premium status of the server.'
    });
  }

  async run ({ guildID }) {
    const { success, body: data } = await this.core.api.getPremiumStatus(guildID);
    if (!success) {
      return new Command.InteractionEmbedResponse()
        .setColour('red')
        .setDescription('Something went wrong finding premium information for this server.')
        .setEmoji('xmark');
    }

    if (data.status) {
      return new Command.InteractionEmbedResponse()
        .setColour('green')
        .setDescription('This server is activated with SocialFeeds Premium.')
        .addField('User', `<@${data.user}>`, true)
        .addField('Tier', data.tier, true)
        .addField('Feed Limit', data.maxFeeds.toLocaleString(), true)
        .setEmoji('check');
    } else {
      return new Command.InteractionEmbedResponse()
        .setColour('red')
        .setDescription('This server is **not** activated with SocialFeeds Premium.\nGet premium at [https://socialfeeds.app/premium](https://socialfeeds.app/premium).')
        .setEmoji('xmark');
    }
  }

};
