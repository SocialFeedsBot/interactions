const Command = require('../../../framework/Command');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'roblox',
      description: 'Add a new ROBLOX feed to a channel.',
      options: [],
      isDeveloper: true
    });
  }

};
