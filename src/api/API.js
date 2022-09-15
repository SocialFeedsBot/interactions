const superagent = require('superagent');
const config = require('../../config.json');
const jwt = require('jsonwebtoken');

const routeBuilder = require('./routeBuilder');

module.exports = class API {

  constructor () {
    Object.defineProperty(this, 'url', { value: config.api.url });
    Object.defineProperty(this, 'auth', {
      value: jwt.sign({ id: '', bot: true }, config.api.secret, { algorithm: 'HS256' })
    });
  }

  getAllFeeds (query = {}) {
    return this.api.feeds.get(undefined, query);
  }

  getCounts (query = {}) {
    return this.api.feeds.counts.get(undefined, query);
  }

  getGuildFeeds (guildID, query = {}) {
    return this.api.feeds(guildID).get({}, query);
  }

  createNewFeed (guildID, data) {
    return this.api.feeds(guildID).post(data);
  }

  deleteFeed (guildID, data) {
    return this.api.feeds(guildID).delete(data);
  }

  setStatus (body) {
    return this.api.status.messages.patch(body);
  }

  request (method, path, data, query) {
    return new Promise(resolve => {
      superagent[method](`${this.url}/${path}`)
        .set('Authorization', this.auth)
        .query(query)
        .send(data)
        .then(result => {
          resolve({ success: true, body: result.body });
        })
        .catch(err => {
          if (err.message.includes('ECONNREFUSED')) {
            err.message = 'API Offline';
          } else if (err.response) {
            err.message = err.response.body.error;
          }
          resolve({ success: false, message: err.message });
        });
    });
  }

  get api () {
    return routeBuilder(this);
  }

};
