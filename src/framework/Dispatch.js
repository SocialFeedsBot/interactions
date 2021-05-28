// INTERACTIONS: Main command dispatcher.

const { InteractionType, InteractionResponseType } = require('../constants/Types');
const { Interaction, ApplicationCommand, InteractionResponse, InteractionEmbedResponse } = require('../structures');
const CommandStore = require('./CommandStore');

module.exports = class Dispatch {

  constructor (core, logger) {
    this.logger = logger.extension('Dispatch');
    this.core = core;
    this.commandStore = new CommandStore(core);

    this.awaiting = new Map();
  }

  async handleInteraction (data) {
    const interaction = new Interaction(data);
    switch (interaction.type) {
      case InteractionType.Ping:
        return {
          type: InteractionResponseType.Pong
        };

      case InteractionType.ApplicationCommand:
        return this.handleCommand(interaction)
          .catch(this.handleError.bind(this));

      case InteractionType.MessageComponent:
        return this.handleComponent(interaction)
          .catch(this.handleError.bind(this));

      default:
        this.logger.warn(`Unknown interaction type "${interaction.type}" received`);
        return {};
    }
  }

  async handleCommand (interaction) {
    const applicationCommand = new ApplicationCommand(interaction.data);
    const context = {
      ...interaction,
      args: applicationCommand.args,
      awaitButton: (id) => new Promise((resolve) => this.awaiting.set(id, (arg) => {
        this.awaiting.delete(id);
        return resolve(arg);
      }))
    };

    //  Check for a global command
    const command = this.commandStore.get(applicationCommand.commandName);
    if (command) {
      return (await command.run(context)) ||
        new InteractionEmbedResponse()
          .setDescription('Missing response')
          .setColor('red');
    }

    return true;
  }

  async handleComponent (interaction) {
    // Find the command
    const [command, button, id] = interaction.data.custom_id.split('.');
    return await this.commandStore.get(command).onButtonClick(button, id, interaction);
  }

  /**
   * Handle errors executing commands
   * @param error
   * @returns {InteractionResponse}
   */
  handleError (error) {
    this.logger.error(error.stack);
    return new InteractionResponse()
      .setContent('An unexpected error occurred executing this interaction.')
      .setEmoji('xmark')
      .setEphemeral();
  }
};
