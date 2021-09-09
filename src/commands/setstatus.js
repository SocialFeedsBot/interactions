/*
constructor(...args) {
    super(...args, {
      args: [{ type: 'text', label: 'msg', optional: false }], hidden: true
    });
  }

  async run({ reply, author, client, args: { msg } }) {
    const [head, body, status] = msg.split(' | ');
    client.api.setStatus({ head, body, status }).then(({ body: res }) => {
      reply(`\`\`\`js\n${require('util').inspect(res)}\n\`\`\``);
    }).catch(e => {
      reply(`__**Error**__\`\`\`js\n${e.stack}\n\`\`\``);
    });
  }
  */

const { ApplicationCommandOptionType } = require('../constants/Types');
const Command = require('../framework/Command');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'setstatus',
      description: 'Set status page message.',
      isDeveloper: true,
      options: [{
        type: ApplicationCommandOptionType.SubCommandGroup,
        name: 'status',
        description: 'Status type',
        required: true,
        options: [{
          name: 'major',
          description: 'Red status',
          type: ApplicationCommandOptionType.SubCommand
        },
        {
          name: 'warn',
          description: 'Yellow/amber status',
          type: ApplicationCommandOptionType.SubCommand
        },
        {
          name: 'ok',
          description: 'Green status',
          type: ApplicationCommandOptionType.SubCommand
        }]
      },
      {
        name: 'title',
        description: 'Title text',
        required: true,
        type: ApplicationCommandOptionType.String
      },
      {
        name: 'message',
        description: 'Main message (description)',
        required: true,
        type: ApplicationCommandOptionType.String
      }]
    });

    this.awaitingClicks = new Map();
  }

  async run ({ args: [status, title, message] }) {
    return this.core.api.setStatus({ head: title, body: message, status }).then(({ body: res }) => new Command.InteractionResponse()
      .setContent(`\`\`\`js\n${res}\n\`\`\``)
    ).catch(e => new Command.InteractionResponse()
      .setContent(`**:x: Error!**\`\`\`js\n${e.stack || e.message}\n\`\`\``));
  }

};
