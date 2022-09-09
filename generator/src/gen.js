import pino from 'pino';
import shortid from 'shortid';
import * as dotenv from 'dotenv';
import {io} from 'socket.io-client';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV;
const CLUSTER_SIZE = parseInt(process.env.CLUSTER_SIZE);
const DATA_UPDATE_FREQUENCY = parseInt(process.env.DATA_UPDATE_FREQUENCY);
const WEBSOCKET_SERVER_URL = process.env.WEBSOCKET_SERVER_URL;

const logger = pino({level: NODE_ENV === 'production' ? 'info' : 'debug'});

logger.info(`Connecting to ${WEBSOCKET_SERVER_URL}`);
const socket = io(WEBSOCKET_SERVER_URL);

logger.info(`CLUSTER_SIZE: ${CLUSTER_SIZE}`);
const ids = initArrayOfIDs();
let cluster = initCluster(ids);

logger.info(`DATA_UPDATE_FREQUENCY: ${DATA_UPDATE_FREQUENCY}`);
setInterval(() => {
  const randomId = ids[Math.floor(Math.random() * ids.length)];
  cluster[randomId] = deltaDataPoint();
  logger.debug(`${randomId}: ${cluster[randomId].temp}`);
  socket.emit('cluster.update', {id: randomId, data: cluster[randomId]});
}, DATA_UPDATE_FREQUENCY);

function deltaDataPoint() {
  const temp = (Math.random() * 70.0 + 22.0).toFixed(1);
  return {temp};
}

function initArrayOfIDs() {
  const ids = new Array(CLUSTER_SIZE).fill(null).map(shortid.generate);
  return ids;
}

function initCluster(ids) {
  const cluster = {};
  ids.forEach((id) => (cluster[id] = deltaDataPoint()));
  return cluster;
}
