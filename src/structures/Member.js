const Permission = require('./discord/Permission');
const User = require('./discord/User');

class Member {

  constructor (data) {
    this.permissions = new Permission(data.permissions);
    this.user = new User(data.user);
  }

  get id() {
    return this.user.id;
  }

}

module.exports = Member;

