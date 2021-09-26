const { ApplicationCommandOptionType } = require('../constants/Types');
const Command = require('../framework/Command');
const superagent = require('superagent');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'eval',
      isDeveloper: true,
      description: 'Evaluation',
      options: [{
        type: ApplicationCommandOptionType.String,
        name: 'code',
        description: 'Code to evaluate',
        required: true
      }]
    });
  }

  async run (ctx) {
    await this.core.rest.api.interactions(ctx.id, ctx.token).callback.post(new Command.InteractionResponse()
      .ack());

    // eslint-disable-next-line no-unused-vars
    const { get, post, patch } = superagent;
    let res;
    try {
      const result = await eval(ctx.args.code.value);
      res = `\`\`\`js\n${require('util').inspect(result, { depth: 0 }).substring(0, 1800)}\n\`\`\``;
    } catch(err) {
      res = `\`\`\`js\n${err.stack}\n\`\`\``;
    }

    return this.core.rest.api.webhooks(this.core.config.applicationID, ctx.token).messages('@original').patch(
      new Command.InteractionResponse()
        .setContent(res).toJSON().data);
  }

};
