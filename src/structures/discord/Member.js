class Member {

  constructor (data) {
    this.roles = data.roles;
    this.joinedAt = data.joined_at;
    this.deaf = data.deaf;
    this.mute = data.mute;
  }

}

module.exports = Member;
