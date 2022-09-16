import pino from 'pino';
import * as dotenv from 'dotenv';
import {io} from 'socket.io-client';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV;
const DATA_UPDATE_FREQUENCY = parseInt(process.env.DATA_UPDATE_FREQUENCY);
const WEBSOCKET_SERVER_URL = process.env.WEBSOCKET_SERVER_URL;

const logger = pino({level: NODE_ENV === 'production' ? 'info' : 'debug'});

logger.info(`Connecting to ${WEBSOCKET_SERVER_URL}`);
const socket = io(WEBSOCKET_SERVER_URL);

let ids = [];
let cluster = {};

let tracesPerSecond = 0;

socket.on('cluster.all', (data) => {
  cluster = data;
  ids = Object.keys(cluster);
});

setInterval(() => {
  if (!tracesPerSecond) {
    return;
  }
  logger.info(`Sending ${tracesPerSecond} traces per sec`);
  tracesPerSecond = 0;
}, 1000);

logger.info(`DATA_UPDATE_FREQUENCY: ${DATA_UPDATE_FREQUENCY}`);
setInterval(() => {
  if (!ids.length) {
    return;
  }
  const randomId = ids[Math.floor(Math.random() * ids.length)];
  cluster[randomId] = deltaDataPoint();
  socket.emit('cluster.update', {id: randomId, data: cluster[randomId]});
  ++tracesPerSecond;
}, DATA_UPDATE_FREQUENCY);

function deltaDataPoint() {
  const temp = (Math.random() * 70.0 + 22.0).toFixed(1);
  return {temp};
}
