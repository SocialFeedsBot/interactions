// INTERACTIONS: Main command dispatcher.

const {
  InteractionType,
  InteractionResponseType,
  ApplicationCommandOptionType,
  ComponentType,
  SubCommandTypes
} = require('../constants/Types');
const {
  InteractionButton,
  InteractionCommand,
  InteractionResponse,
  InteractionEmbedResponse,
  InteractionSelect,
  InteractionAutocomplete
} = require('../structures');
const { captureException } = require('@sentry/node');
const CommandStore = require('./CommandStore');

module.exports = class Dispatch {

  constructor (core, logger) {
    this.logger = logger;
    this.core = core;
    this.commandStore = new CommandStore(core);
  }

  async handleInteraction (data) {
    switch (data.type) {
      case InteractionType.Ping:
        return {
          type: InteractionResponseType.Pong
        };

      case InteractionType.ApplicationCommand:
        return this.handleCommand(new InteractionCommand(data))
          .catch(this.handleError.bind(this));

      case InteractionType.MessageComponent:
        switch (data.data.component_type) {
          case ComponentType.Button:
            return this.handleComponent(new InteractionButton(data))
              .catch(this.handleError.bind(this));

          case ComponentType.SelectMenu:
            return this.handleComponent(new InteractionSelect(data))
              .catch(this.handleError.bind(this));

          default:
            return null;
        }

      case InteractionType.ApplicationCommandAutocomplete:
        return this.handleAutocomplete(new InteractionAutocomplete(data))
          .catch(this.handleError.bind(this));

      default:
        this.logger.warn(`Unknown interaction type "${data.type}" received`, { src: 'dispatch/handleInteraction' });
        return {};
    }
  }

  async handleCommand (interaction) {
    const topLevelCommand = this.commandStore.get(interaction.name);
    const applicationCommand = this.getSubCommand(interaction, topLevelCommand);
    if (!applicationCommand) return null;

    const context = {
      ...interaction,
      user: interaction.member ? interaction.member.user : interaction.user,
      args: {}
    };

    const args = this.findNonSubCommandOption(interaction.options);
    if (args) {
      args.forEach(option => {
        context.args[option.name] = option;
      });
    }

    //  Check for a global command
    const disabled = await this.core.redis.get(`commands:${applicationCommand.name}:disabled`);
    if (disabled && disabled !== 'no') {
      return new InteractionEmbedResponse()
        .setContent('This command is disabled')
        .setDescription(`**Reason:** ${disabled}`)
        .setColour('red');
    }

    // metrics
    await this.core.prometheus.gauge('inc', 'commandsRan', 1);

    // run
    return (await applicationCommand.run(context)) ||
      new InteractionEmbedResponse()
        .setDescription('Missing response')
        .setColour('red');
  }

  async handleComponent (interaction) {
    // find in redis
    let data = await this.core.redis.get(`interactions:awaits:${interaction.customID}`);
    if (!data) {
      return new InteractionResponse()
        .setContent('Interaction timed out')
        .setEmoji('xmark')
        .setEphemeral();
    }
    data = JSON.parse(data);
    if (data.removeOnResponse) {
      await this.core.redis.del(`interactions:awaits:${interaction.customID}`);
    }

    const topLevelCommand = this.commandStore.get(data.command);
    const applicationCommand = this.getSubCommand(interaction, topLevelCommand);
    if (!applicationCommand) return null;

    return applicationCommand.handleComponent(data, interaction);
  }

  async handleAutocomplete (data) {
    const topLevelCommand = this.commandStore.get(data.data.name);
    const applicationCommand = this.getSubCommand(data, topLevelCommand);
    if (!applicationCommand) return null;
    const options = this.findNonSubCommandOption(data.data.options);

    const result = await applicationCommand.handleAutocomplete(options, data);
    return { type: InteractionResponseType.ApplicationCommandAutocompleteResult, data: { choices: result } };
  }

  getSubCommand (interactionCommand, command) {
    if (!command) {
      return null;
    }

    if ([ApplicationCommandOptionType.SubCommand, ApplicationCommandOptionType.SubCommandGroup].includes(interactionCommand.options?.[0]?.type)) {
      command = command.options.find(option => option.name === interactionCommand.options[0].name);
      if (command) {
        return this.getSubCommand(interactionCommand.options[0], command);
      }
    }

    return command;
  }

  findNonSubCommandOption (options) {
    if (SubCommandTypes.includes(options?.[0].type)) {
      return this.findNonSubCommandOption(options[0].options);
    }
    return options;
  }

  /**
   * Handle errors executing commands
   * @param error
   * @returns {InteractionResponse}
   */
  handleError (error) {
    captureException(error);
    this.logger.error(error.stack, { src: 'dispatch/handleError' });
    return new InteractionResponse()
      .setContent('An unexpected error occurred executing this interaction.')
      .setEmoji('xmark')
      .setEphemeral();
  }
};
