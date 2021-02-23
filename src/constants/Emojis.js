const Emojis = {
  xmark: '603947943829045311',
  check: '603947881803677728',

  memberUpdate: '68993836461588511',

  status_idle: '603947923260309519',
  status_offline: '603947923541196811',
  status_online: '603947923629408256',
  status_streaming: '697767194179796993',
  status_dnd: '603948678004342805'
};

module.exports = {
  Emojis,
  resolveEmoji: (name) => {
    const id = Emojis[name];
    return id ? `<:${name}:${id}>` : '';
  }
};
