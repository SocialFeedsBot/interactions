const { ApplicationCommandOptionType } = require('../constants/Types');
const ApplicationCommandOption = require('./ApplicationCommandOption');

class ApplicationCommand {

  constructor (data) {
    this.id = data.id;
    this.name = data.name;
    this.resolved = {};
    if (data.options) this.options = data.options.map(option => new ApplicationCommandOption(option));

    Object.keys(data.resolved || {}).forEach(key => {
      Object.keys(data.resolved[key]).forEach(id => {
        this.resolved[id] = data.resolved[key][id];
      });
    });
  }

  /**
   * Convert the args into an array of values
   * @returns {[]}
   */
  get args () {
    let args = [];
    let options = this.options;
    while (options) {
      for (let option of options) {
        // eslint-disable-next-line no-prototype-builtins
        if (option.hasOwnProperty('value')) {
          if (this.resolved[option.value]) {
            args.push(this.resolved[option.value]);
          } else {
            args.push(option.value);
          }
        }
      }
      options = options[0].options;
    }

    return args;
  }

  /**
   * Get the command name, including sub commands in the format "command/subcommand"
   * @returns {string}
   */
  get commandName () {
    let name = this.name;

    let options = this.options;
    while (options) {
      const isSubCommand = [
        ApplicationCommandOptionType.SubCommand,
        ApplicationCommandOptionType.SubCommandGroup
      ].includes(options[0].type);

      if (isSubCommand) {
        name = `${name}/${options[0].name}`;
      }

      options = options[0].options;
    }

    return name;
  }

}

module.exports = ApplicationCommand;
