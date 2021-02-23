module.exports = class Extension {

  constructor(baseLogger, name) {
    this.baseLogger = baseLogger;
    this.name = name;
  }

  /**
   * Send an info log.
   * @param text {string}
   * @returns {string}
   */
  info (...text) {
    return this.baseLogger.log(this.name, 'info', ...text);
  }

  /**
   * Send an ok/green log.
   * @param webhook {boolean}
   * @param text {string}
   * @returns {string}
   */
  ok (webhook = true, ...text) {
    return this.baseLogger.log(webhook, this.name, 'ok', ...text);
  }

  /**
   * Send a warning log.
   * @param text {string}
   * @returns {string}
   */
  warn (...text) {
    return this.baseLogger.log(this.name, 'warn', ...text);
  }

  /**
   * Send a debug log.
   * @param text {string}
   * @returns {string}
   */
  debug (...text) {
    return this.baseLogger.log(this.name, 'debug', ...text);
  }

  /**
   * Send an error log.
   * @param text {string}
   * @returns {string}
   */
  error (...text) {
    return this.baseLogger.log(this.name, 'error', ...text);
  }

  /**
   * Get or create an extension.
   * @param name {string}
   * @returns {Extension}
   */
  extension (name) {
    return this.baseLogger.extension(name);
  }
};
