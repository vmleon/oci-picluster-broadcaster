const http = require('http');
const {io} = require('socket.io-client');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const {createTerminus} = require('@godaddy/terminus');
require('dotenv').config();

const winston = require('winston');
const expressWinston = require('express-winston');
const app = express();

const {NODE_ENV} = process.env;
const PORT = parseInt(process.env.PORT);
const DATA_UPDATE_FREQUENCY = parseInt(process.env.DATA_UPDATE_FREQUENCY);
const WEBSOCKET_SERVER_URL = process.env.WEBSOCKET_SERVER_URL;

const isProductionMode = NODE_ENV === 'production';
const winstonConfig = {
  level: isProductionMode ? 'http' : 'debug',
  transports: [new winston.transports.Console()],
  format: winston.format.json(),
};

const logger = winston.createLogger(winstonConfig);

logger.info(`NODE_ENV: ${NODE_ENV}`);

logger.info(`Connecting to ${WEBSOCKET_SERVER_URL}`);
const socket = io(WEBSOCKET_SERVER_URL);

const port = PORT || 3000;

let tracesPerSecond = 0;
let cache = {};
let cluster = {};

socket.on('disconnect', () => {
  logger.info(`Disconnected from ${WEBSOCKET_SERVER_URL}`);
});

socket.on('error', (error) => {
  logger.error(error);
});

socket.on('cluster.all', (data) => {
  cluster = data;
});

// app.use(expressWinston.logger(winstonConfig));
app.use(express.json());
app.use(helmet());
app.use(compression());

setInterval(() => {
  if (!tracesPerSecond) {
    return;
  }
  logger.info(`Sending ${tracesPerSecond} traces per sec`);
  tracesPerSecond = 0;
}, 1000);

logger.info(`DATA_UPDATE_FREQUENCY: ${DATA_UPDATE_FREQUENCY}`);
setInterval(() => {
  if (!Object.keys(cache).length) {
    return;
  }
  socket.emit('cluster.update', cache);
  ++tracesPerSecond;
}, DATA_UPDATE_FREQUENCY);

app.get('/api/cluster', (req, res) => {
  const isClusterEmpty = Object.keys(cluster).length === 0;
  if (isClusterEmpty) {
    res.status(503).json({message: 'Cluster is still empty, try again.'});
  }
  res.json(cluster);
});

app.post('/api/cluster/:id', (req, res) => {
  const id = req.params.id;
  const data = req.body;
  cache[id] = data;
  cluster[id] = data;
  res.json({});
});

const server = http.createServer(app);

function onSignal() {
  logger.info('Server is starting cleanup');
}

async function onHealthCheck() {
  return Promise.resolve();
}

createTerminus(server, {
  signal: 'SIGINT',
  healthChecks: {'/api/healthcheck': onHealthCheck},
  onSignal,
});

server.listen(port, () => {
  logger.info(`API Server listening on port ${port}`);
});
