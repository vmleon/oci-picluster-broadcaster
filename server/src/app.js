import {createServer} from 'http';
import {Server} from 'socket.io';
import shortid from 'shortid';
import pino from 'pino';
import {createTerminus} from '@godaddy/terminus';
import * as dotenv from 'dotenv';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV;
const BROADCAST_REFRESH_UPDATE = parseInt(process.env.BROADCAST_REFRESH_UPDATE);
const CLEAN_STALE_NODES_AFTER = parseInt(process.env.CLEAN_STALE_NODES_AFTER);
const CLUSTER_SIZE = parseInt(process.env.CLUSTER_SIZE);
const PORT = parseInt(process.env.PORT) || 3000;
const CORS_URL = process.env.CORS_URL || '*';

const logger = pino({level: NODE_ENV === 'production' ? 'info' : 'debug'});

logger.info(`NODE_ENV: ${NODE_ENV}`);

const httpServer = createServer();

logger.info(`CLUSTER_SIZE: ${CLUSTER_SIZE}`);
const ids = initArrayOfIDs();
let cluster = initCluster(ids);

let numOfClients = 0;

let clusterCache = {};

let tracesPerSecond = 0;

const io = new Server(httpServer, {
  cors: {
    origin: CORS_URL,
  },
  serveClient: false,
});

io.on('connection', (socket) => {
  ++numOfClients;
  socket.emit('cluster.all', cluster);

  socket.on('cluster.update', (clusterUpdate) => {
    Object.keys(clusterUpdate).forEach((id) => {
      const data = clusterUpdate[id];
      clusterCache[id] = data;
      cluster[id] = {...data, lastUpdate: Date.now()};
      ++tracesPerSecond;
    });
  });

  socket.on('disconnect', () => {
    --numOfClients;
  });
});

setInterval(() => {
  if (!tracesPerSecond) {
    return;
  }
  logger.info(`Cluster sent ${tracesPerSecond} traces per sec`);
  tracesPerSecond = 0;
}, 1000);

setInterval(() => {
  if (!numOfClients) {
    return;
  }
  logger.info(`${numOfClients} clients`);
  logger.debug(`Size of Cluster: ${Object.keys(cluster).length}`);
}, 1000);

logger.info(`CLEAN_STALE_NODES_AFTER: ${CLEAN_STALE_NODES_AFTER}`);
setInterval(() => {
  const idsToClean = Object.keys(cluster).filter((id) => {
    const now = Date.now();
    const {lastUpdate} = cluster[id];
    const millis = now - lastUpdate;
    const elapsedTimeInSeconds = Math.floor(millis / 1000);
    logger.debug(`id: ${id}, diff: ${millis}, elapsed: ${elapsedTimeInSeconds}`);
    return elapsedTimeInSeconds > CLEAN_STALE_NODES_AFTER;
  });
  logger.debug(`IDs to clean: ${idsToClean}`);
}, 2000);

setInterval(() => {
  const clusterCacheLength = Object.keys(clusterCache).length;
  if (!clusterCacheLength) return;
  io.emit('cluster.event', clusterCache);
  clusterCache = {};
}, BROADCAST_REFRESH_UPDATE);

httpServer.listen(PORT, () => logger.info(`Server listening to port ${PORT}`));

function initArrayOfIDs() {
  const ids = new Array(CLUSTER_SIZE).fill(null).map(shortid.generate);
  return ids;
}

function initCluster(ids) {
  const cluster = {};
  ids.forEach(
    (id) =>
      (cluster[id] = {
        cpu: 25,
        temp: 20,
        memFree: 7000,
        diskFree: 118000,
        memTotal: 8000,
        diskTotal: 128000,
        processes: [],
        lastUpdate: null,
      }),
  );
  return cluster;
}

function onSignal() {
  logger.info('Server is starting cleanup');
  cluster = {};
}

createTerminus(httpServer, {
  signal: 'SIGINT',
  onSignal,
});
