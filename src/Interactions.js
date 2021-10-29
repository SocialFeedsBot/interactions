// INTERACTIONS: Core file
const config = require('../config');

const app = require('express')();
const cors = require('cors');
const morgan = require('morgan');
const nacl = require('tweetnacl');
const bodyParser = require('body-parser');
const Redis = require('ioredis');

const Dispatch = require('./framework/Dispatch');
const Prometheus = require('./framework/Prometheus');
const RequestHandler = require('./rest/RequestHandler');
const APIHandler = require('./api/API');

module.exports = class Interactions {

  constructor (id, worker, logger) {
    this.gatewayClient = worker;
    this.logger = logger;
    this.config = config;
    this.id = id;
    this.app = app;
    this.startedAt = Date.now();

    this.redis = new Redis(config.redis);

    this.dispatch = new Dispatch(this, logger);
    this.prometheus = new Prometheus(config.prometheus);
    this.rest = new RequestHandler(logger, { token: config.token });
    this.api = new APIHandler();

    this.start();
  }

  async start () {
    this.logger.info(`Assigned interactions id ${this.id}, starting...`);

    // Get current user
    this.user = await this.rest.api.users(config.applicationID).get();

    // Initialise the server
    this.app.listen(config.port);
    this.app.use(bodyParser.json());
    this.app.use(cors());
    this.app.use(morgan(':date[web] [Request/DEBUG] :method :url :status - :response-time ms'));
    this.registerRoutes();

    this.logger.ok(`Server listening on port: ${config.port}`);
    this.gatewayClient.sendReady();
  }

  /**
   * Register the routes.
   */
  async registerRoutes () {
    this.app.post('/', this.verifySignature, async (req, res) => {
      const result = await this.dispatch.handleInteraction(req.body);
      return res.json(result);
    });
  }

  /**
   * Verify the signature
   * @param req {object}
   * @param res {object}
   * @param next {function}
   * @returns {boolean}
   */
  verifySignature (req, res, next) {
    const signature = req.header('X-Signature-Ed25519');
    const timestamp = req.header('X-Signature-Timestamp');

    if (!signature || !timestamp) {
      return res.status(401).json({ error: 'Unauthorised' });
    }

    const sig = nacl.sign.detached.verify(
      Buffer.from(timestamp + JSON.stringify(req.body)),
      Buffer.from(signature, 'hex'),
      Buffer.from(config.publicKey, 'hex')
    );

    if (!sig) {
      return res.status(401).json({ error: 'Unauthorised' });
    }

    return next();
  }

};
