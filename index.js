// INDEX: Connect to the gateway and start up the service.
const GatewayClient = require('./src/gateway/');
const Interactions = require('./src/Interactions');
const Logger = require('./src/logger/');
const config = require('./config');

const logger = new Logger('Core', []);
const worker = new GatewayClient(config.gateway.use, 'interactions', config.gateway.address, config.gateway.secret, Number(process.env.NODE_APP_INSTANCE) || 0);

worker
  .on('error', (err) => logger.extension('Gateway').error(err))
  .on('connect', (ms) => logger.extension('Gateway').info(`Connected in ${ms}ms`))
  .once('ready', () => new Interactions(Number(process.env.NODE_APP_INSTANCE || 0), worker, logger));

worker.getExtraStats = () => ({ interactionsID: Number(process.env.NODE_APP_INSTANCE || 0) });

worker.connect();
process.on('unhandledRejection', err => logger.error(`Unhandled Rejection: ${err.stack}`));

