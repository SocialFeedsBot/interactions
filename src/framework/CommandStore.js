const config = require('../../config');
const fs = require('fs');
const path = require('path');

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
          // ignore
        } else if (!cmd.endsWith('.js')) {
          readDirectory(`${dir}/${cmd}`);
        } else {
          this.registerCommand(`${dir}/${cmd}`);
        }
      });
    };

    readDirectory(path.resolve('src', 'commands'));
  }

  registerCommand (dir) {
    const Command = require(dir);
    const index = dir.indexOf('commands/') + 9;
    dir = dir.substring(index).replace(/\/index.js/g, '').replace(/.js/g, '');
    this.set(dir, new Command(this.core));
  }

  commandList () {
    //  Bit of a hacky way to construct the command list
    const result = [];
    const awaiting = {};
    for (let key of [...this.keys()]) {
      const route = key.split('/');
      const command = this.get(key).toJSON();
      if (command.isDeveloper) continue;

      if (route.length === 1) {
        if (awaiting[route[0]]) {
          command.options = [...command.options, ...awaiting[route[0]]];
          result.push(command);
          delete awaiting[route[0]];
        } else {
          result.push(command);
        }
      } else if (route.length === 2) {
        const main = result.find(c => c.name === route[0]);
        if (!main) {
          if (!awaiting[route[0]]) {
            awaiting[route[0]] = [command];
          } else {
            awaiting[route[0]].push(command);
          }
        } else {
          main.options.push(command);
        }
      }
    }

    return result;
  }

  developerCommandList () {
    const result = [];
    const awaiting = {};
    for (let key of [...this.keys()]) {
      const route = key.split('/');
      const command = this.get(key).toJSON();
      if (!command.isDeveloper) continue;

      if (route.length === 1) {
        if (awaiting[route[0]]) {
          command.options = [...command.options, ...awaiting[route[0]]];
          result.push(command);
          delete awaiting[route[0]];
        } else {
          result.push(command);
        }
      } else if (route.length === 2) {
        const main = result.find(c => c.name === route[0]);
        if (!main) {
          if (!awaiting[route[0]]) {
            awaiting[route[0]] = [command];
          } else {
            awaiting[route[0]].push(command);
          }
        } else {
          main.options.push(command);
        }
      }
    }

    return result;
  }

  /**
   * Update the global commands
   * @returns {Promise<*>}
   */
  async updateCommandList() {
    await this.core.rest.api.applications(config.applicationID)
      .guilds(config.devServerID)
      .commands()
      .put(this.developerCommandList());
    return this.core.rest.api
      .applications(config.applicationID)
      .commands()
      .put(this.commandList());
  }
};
