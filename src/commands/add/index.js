const Command = require('../../framework/Command');

module.exports = class extends Command {

  constructor (...args) {
    super(...args, {
      name: 'add',
      description: 'Add a new feed to a channel.',
      options: []
    });
  }

};
