const Extension = require('./Extension');
const superagent = require('superagent');

module.exports = class Logger {

  constructor(name, sensitive = [], webhook) {
    this.name = name;
    this.sensitive = sensitive;
    this.webhook = webhook;

    this.extensions = {};
    this.history = [];
    this.colours = { info: 0x3498DB, ok: 0x2ECC71, warn: 0xE67E22, error: 0xE74C3C, debug: 0x7289DA };
    this.emoji = {
      info: '<:status_blue:765734270051942411>', ok: '<:status_online:603947923629408256>',
      warn: '<:status_idle:603947923260309519>', debug: '<:status_streaming:697767194179796993>',
      error: '<:status_dnd:603948678004342805>'
    };
  }

  /**
   * Add a text to history.
   * @param text
   */
  add (text) {
    this.history.push(text);
    while (this.history.join('\n').length > 2000) {
      this.history = this.history.splice(1);
    }
  }

  /**
   * Get the history.
   * @returns {string}
   */
  getHistory () {
    return this.history.join('\n');
  }

  /**
   * Replace sensitive strings in the message.
   * @param string
   * @returns {string}
   */
  replaceSensitive (string) {
    for (const sensitive of this.sensitive) {
      string = string.replace(new RegExp(sensitive, 'gi'), '[SENSITIVE]');
    }

    return string;
  }

  /**
   * Send a log.
   * @param webhook {boolean}
   * @param name {string}
   * @param type {string}
   * @param text {string}
   * @returns {string}
   */
  log (name, type, ...text) {
    text = this.replaceSensitive(text.join(' '));
    const string = `${new Date().toUTCString()} [${name}:${type.toUpperCase()}] ${text}`;

    this.add(string);
    console.log(string);

    if (type === 'error' && this.webhook && !text.startsWith('[WH]')) {
      superagent.post(`https://canary.discord.com/api/webhooks/${this.webhook.id}/${this.webhook.token}`)
        .send({
          embeds: [{
            description: `\`\`\`js\n${text}\n\`\`\``,
            footer: { text: `Interactions/${this.name}` },
            color: 0xeb4634
          }]
        })
        .catch((err) => {
          this.error(`[WH] Could not post error message to webhook (${err.message})`);
          if (err.headers['x-reset-after']) {
            setTimeout(() => {
              superagent.post(`https://canary.discord.com/api/webhooks/${this.webhook.id}/${this.webhook.token}`)
                .send({
                  embeds: [{
                    description: `\`\`\`js\n${text}\n\`\`\``,
                    footer: { text: `Interactions/${this.name}` },
                    color: 0xeb4634
                  }]
                })
                .catch(e => {})
            }, Number(err.headers['x-reset-after']) * 1000)
          }
        })
    }

    return string;
  }

  /**
   * Send an info log.
   * @param text {string}
   * @returns {string}
   */
  info (...text) {
    return this.log(this.name, 'info', ...text);
  }

  /**
   * Send an ok/green log.
   * @param text {string}
   * @returns {string}
   */
  ok (...text) {
    return this.log(this.name, 'ok', ...text);
  }

  /**
   * Send a warning log.
   * @param text {string}
   * @returns {string}
   */
  warn (...text) {
    return this.log(this.name, 'warn', ...text);
  }

  /**
   * Send a debug log.
   * @param text {string}
   * @returns {string}
   */
  debug (...text) {
    return this.log(this.name, 'debug', ...text);
  }

  /**
   * Send an error log.
   * @param text {string}
   * @returns {string}
   */
  error (...text) {
    return this.log(this.name, 'error', ...text);
  }

  /**
   * Get or create an extension.
   * @param name {string}
   * @returns {Extension}
   */
  extension(name) {
    if (!this.extensions[name]) {
      this.extensions[name] = new Extension(this, name);
    }

    return this.extensions[name];
  }

};
