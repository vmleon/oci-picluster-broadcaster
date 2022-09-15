import {createServer} from 'http';
import {Server} from 'socket.io';
import pino from 'pino';
import * as dotenv from 'dotenv';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV;
const BROADCAST_REFRESH_UPDATE = process.env.BROADCAST_REFRESH_UPDATE;
const PORT = process.env.PORT || 3000;
const CORS_URL = process.env.CORS_URL || '*';

const logger = pino({level: NODE_ENV === 'production' ? 'info' : 'debug'});

const httpServer = createServer();

let cluster = {};

let clusterCache = {};

const io = new Server(httpServer, {
  cors: {
    origin: CORS_URL,
  },
  serveClient: false,
});

io.on('connection', (socket) => {
  socket.emit('cluster.all', cluster);

  socket.on('cluster.update', ({id, data}) => {
    clusterCache[id] = data;
    cluster[id] = data;
  });
});

setInterval(() => {
  logger.debug(`cluster.event with ${Object.keys(clusterCache).length} data points`);
  io.emit('cluster.event', clusterCache);
  clusterCache = {};
}, BROADCAST_REFRESH_UPDATE);

httpServer.listen(PORT, () => logger.info(`Server listening to port ${PORT}`));
