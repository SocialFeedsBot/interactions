const Command = require('../../framework/Command');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'delete',
      description: 'Delete a feed from a channel.',
      options: []
    });
  }

};
