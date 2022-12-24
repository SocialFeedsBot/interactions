// INDEX: Connect to the gateway and start up the service.
const GatewayClient = require('./src/gateway/');
const Interactions = require('./src/Interactions');
const config = require('./config');
const winston = require('winston');

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message} ${JSON.stringify(Object.assign({}, info, {
      level: undefined,
      message: undefined,
      splat: undefined,
      label: undefined,
      timestamp: undefined
    }))}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'log.log' })
  ]
});

const worker = new GatewayClient(config.gateway.use, 'interactions', config.gateway.address, config.gateway.secret, Number(process.env.NODE_APP_INSTANCE) || 0);

worker
  .on('error', (err) => logger.error(err, { src: 'gateway' }))
  .on('connect', (ms) => logger.info(`Connected in ${ms}ms`, { src: 'gateway' }))
  .once('ready', ({ id }) => new Interactions(id, worker, logger));

worker.getExtraStats = () => ({ interactionsID: Number(process.env.NODE_APP_INSTANCE || 0) });

worker.connect();
process.on('unhandledRejection', err => logger.error(`Unhandled Rejection: ${err.stack}`));

