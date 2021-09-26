const fs = require('fs');
const path = require('path');
const config = require('../../config');
const { ApplicationCommandOptionType } = require('../constants/Types');

module.exports = class CommandStore extends Map {

  constructor (core) {
    super();
    this.core = core;
    this.registerCommands();
  }

  get api () {
    return this.core.dispatch.rest.api;
  }

  registerCommands () {
    const readDirectory = (dir) => {
      const inPath = fs.readdirSync(dir);
      inPath.forEach(cmd => {
        if (cmd.endsWith('.ignore')) {
          // Ignore, better than disabling cus Discord
        } else if (!cmd.endsWith('.js')) {
          this.registerSubCommands(`${dir}/${cmd}`);
        } else {
          const Command = require(path.join(dir, cmd));
          const commandName = cmd.slice(0, -3);
          const command = new Command(this.core, {
            name: commandName
          });
          this.set(commandName, command);
        }
      });
    };

    readDirectory(path.resolve('src', 'commands'));
  }

  registerSubCommands (dir) {
    const commands = fs.readdirSync(dir);
    const Command = require(path.join(dir, 'index.js'));
    const command = new Command(this.core, {
      name: dir.substring(dir.lastIndexOf('/'))
    });
    this.set(command.name, command);

    commands.filter(c => c !== 'index.js').forEach(commandName => {
      const SubCommand = require(path.join(dir, commandName));
      const subCommand = new SubCommand(this.core, {
        name: commandName,
        type: ApplicationCommandOptionType.SubCommand
      });
      command.options.push(subCommand);
    });
  }
  /**
   * Update the global commands
   * @returns {Promise<*>}
   */
  async updateCommandList() {
    // dev commands
    await this.core.rest.api.applications(config.applicationID)
      .guilds(config.devServerID)
      .commands()
      .put([...this.values()]
        .filter(c => c.isDeveloper)
        .map(v => v.toJSON())
      );
    // normal command
    return await this.core.rest.api.applications(config.applicationID)
      .commands()
      .put([...this.values()]
        .filter(c => !c.isDeveloper)
        .map(v => v.toJSON())
      );
  }
};
