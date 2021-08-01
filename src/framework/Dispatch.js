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
      user: interaction.member ? interaction.member.user : interaction.user,
      args: applicationCommand.args
    };

    //  Check for a global command
    const command = this.commandStore.get(applicationCommand.commandName);
    if (command) {
      // check disabled
      const disabled = await this.core.redis.get(`commands:${applicationCommand.commandName}:disabled`);
      if (disabled && disabled !== 'no') {
        return new InteractionEmbedResponse()
          .setContent('This command is disabled')
          .setDescription(`**Reason:** ${disabled}`)
          .setColour('red');
      }

      // metrics
      await this.core.prometheus.gauge('inc', 'commandsRan', 1);

      // run
      return (await command.run(context)) ||
        new InteractionEmbedResponse()
          .setDescription('Missing response')
          .setColor('red');
    }

    return true;
  }

  async handleComponent (interaction) {
    // find in redis
    let data = await this.core.redis.get(`interactions:awaits:${interaction.data.custom_id}`);
    if (!data) {
      return new InteractionResponse()
        .setContent('Interaction timed out')
        .setEmoji('xmark')
        .setEphemeral();
    }
    data = JSON.parse(data);
    if (data.removeOnResponse) {
      await this.core.redis.delete(`interactions:awaits:${interaction.data.custom_id}`);
    }
    return this.commandStore.get(data.command).handleComponent(data, interaction);
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
