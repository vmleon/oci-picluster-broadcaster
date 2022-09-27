import pino from 'pino';
import * as dotenv from 'dotenv';
import {io} from 'socket.io-client';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV;
const DATA_UPDATE_FREQUENCY = parseInt(process.env.DATA_UPDATE_FREQUENCY);
const METADATA_UPDATE_FREQUENCY = parseInt(process.env.METADATA_UPDATE_FREQUENCY);
const WEBSOCKET_SERVER_URL = process.env.WEBSOCKET_SERVER_URL;

const logger = pino({level: NODE_ENV === 'production' ? 'info' : 'debug'});

logger.info(`Connecting to ${WEBSOCKET_SERVER_URL}`);
const socket = io(WEBSOCKET_SERVER_URL);

let ids = [];
let clusterMetadata = {};
let cluster = {};

let tracesPerSecond = 0;

socket.on('disconnect', () => {
  ids = [];
  cluster = {};
  clusterMetadata = {};
});

socket.on('cluster.all', (data) => {
  cluster = data;
  ids = Object.keys(cluster);
  clusterMetadata = ids.reduce((prev, cur, idx) => {
    const node = {
      nodeName: `Body${idx}`,
      side: 'North',
      orientation: 'West',
      memTotal: 8000,
      diskTotal: 128000,
      ip: `192.168.${(idx / 5).toFixed(0)}.${idx % 256}`,
      mac: `00:B0:D0:63:C2:${(idx % 256).toString(16)}`,
    };
    prev[cur] = node;
    return {...prev};
  }, {});
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
  cluster[randomId] = deltaDataPoint(
    randomId,
    clusterMetadata[randomId].memTotal,
    clusterMetadata[randomId].diskTotal,
    cluster[randomId],
  );
  socket.emit('cluster.update', {id: randomId, data: cluster[randomId]});
  ++tracesPerSecond;
}, DATA_UPDATE_FREQUENCY);

logger.info(`METADATA_UPDATE_FREQUENCY: ${METADATA_UPDATE_FREQUENCY}`);
setInterval(() => {
  if (!ids.length) {
    return;
  }
  socket.emit('cluster.metadata', clusterMetadata);
  logger.info('Cluster metadata sent');
}, METADATA_UPDATE_FREQUENCY);

let elapsedTime = 0;
let lastTime = new Date();

function progressValue(value, elapsedTime, options = {speed: 0.5, min: 0, max: 100}) {
  if (value >= options.max) return value - 40;
  if (value <= options.min) return value + 40;
  const newValue = value + Math.sin(elapsedTime + 3) * options.speed;
  const normalized = Math.abs(newValue);
  return Math.floor(normalized);
}

function deltaDataPoint(
  id,
  memTotal,
  diskTotal,
  {cpu = 25, temp = 20, memFree = 7000, diskFree = 118000, processes = []},
) {
  const currentTime = new Date();
  elapsedTime = currentTime - lastTime;
  lastTime = currentTime;

  cpu = progressValue(cpu, elapsedTime);
  temp = progressValue(temp, elapsedTime); // (Math.random() * 70.0 + 22.0).toFixed(1);
  memFree = progressValue(memFree, elapsedTime, {max: memTotal});
  diskFree = progressValue(diskFree, elapsedTime, {max: diskTotal});
  processes = ['systemd', 'cpuhp', 'net_ns', 'rcu_gp'];
  const data = {
    temp,
    cpu,
    memFree,
    diskFree,
    processes,
  };
  return data;
}
