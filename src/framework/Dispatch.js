// INTERACTIONS: Main command dispatcher.

const { InteractionType, InteractionResponseType } = require('../constants/Types');
const { Interaction, ApplicationCommand, InteractionResponse, InteractionEmbedResponse } = require('../structures');
const CommandStore = require('./CommandStore');

module.exports = class Dispatch {

  constructor (core, logger) {
    this.logger = logger.extension('Dispatch');
    this.core = core;
    this.commandStore = new CommandStore(core);
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

      default:
        this.logger.warn(`Unknown interaction type "${interaction.type}" received`);
        return {};
    }
  }

  async handleCommand (interaction) {
    const applicationCommand = new ApplicationCommand(interaction.data);
    const context = {
      ...interaction,
      args: applicationCommand.args
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

  /**
   * Handle errors executing commands
   * @param error
   * @returns {InteractionResponse}
   */
  handleError (error) {
    this.logger.error(error.stack);
    return new InteractionResponse()
      .channelMessage()
      .setContent('An unexpected error occurred executing this command.')
      .setEmoji('xmark')
      .setEphemeral();
  }
};
