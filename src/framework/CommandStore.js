const fs = require('fs');
const path = require('path');
const config = require('../../config');
const Types = require('../constants/Types');
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
    const dir = path.resolve('src', 'commands');
    const commands = fs.readdirSync(dir);

    for (let cmd of commands) {
      const commandName = cmd.split('.')[0];
      const Command = require(path.join(dir, cmd));
      const command = new Command(this.core, {
        name: commandName
      });
      this.set(commandName, command);

      if (!cmd.includes('.js')) {
        this.registerSubCommands(command, path.join(dir, command.name));
      }
    }
  }

  registerSubCommands (command, dir) {
    const subCommandGroups = fs.readdirSync(dir).filter(c => fs.statSync(path.join(dir, c)).isDirectory());
    for (let group of subCommandGroups) {
      this.registerSubCommandGroup(command, path.join(dir, group));
    }

    const commands = fs.readdirSync(dir)
      .filter(filename => filename.endsWith('.js') && filename !== 'index.js');

    for (let file of commands) {
      if (file === 'index.js') {
        continue;
      }

      const Command = require(path.join(dir, file));
      const subCommand = new Command(this.core, {
        name: file.slice(0, -3),
        type: Types.ApplicationCommandOptionType.SubCommand
      });
      command.options.push(subCommand);
    }
  }

  registerSubCommandGroup(command, dir) {
    const Command = require(dir);
    const subCommandGroup = new Command(this.core, {
      name: command.name,
      type: Types.ApplicationCommandOptionType.SubCommandGroup
    });

    command.options.push(subCommandGroup);

    this.registerSubCommands(subCommandGroup, dir);
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
