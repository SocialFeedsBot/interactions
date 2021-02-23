// INDEX: Connect to the gateway and start up the service.
const GatewayClient = require('gateway-client');
const Interactions = require('./src/Interactions');
const Logger = require('./src/logger/');
const config = require('./config');

const logger = new Logger('Core', []);
const worker = new GatewayClient(config.gateway.use, 'interactions', config.gateway.address, config.gateway.secret, process.env.NODE_APP_ID || 0);

worker
  .on('error', (err) => logger.extension('Gateway').error(err))
  .on('connect', (ms) => logger.extension('Gateway').info(`Connected in ${ms}ms`))
  .on('restart', () => process.exit(1))
  .once('ready', ({ id }) => new Interactions(id, worker, logger));

worker.connect();
process.on('unhandledRejection', err => logger.error(`Unhandled Rejection: ${err.stack}`));

