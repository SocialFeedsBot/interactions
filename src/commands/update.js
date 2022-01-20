// await this.dispatch.commandStore.updateCommandList();

const Command = require('../framework/Command');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'update',
      description: 'Updates commands.',
      isDeveloper: true
    });
  }

  async run () {
    const start = Date.now();
    try {
      const result = await this.core.dispatch.commandStore.updateCommandList();
      return new Command.InteractionResponse()
        .setContent(`Updated **${result.length}** commands in **${Date.now() - start}ms**!`)
        .setEmoji('check');
    } catch(e) {
      return new Command.InteractionResponse()
        .setContent(`Error while updating commands.\`\`\`js\n${e.stack}\n\`\`\``)
        .setEmoji('xmark');
    }
  }

};