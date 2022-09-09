import {createServer} from 'http';
import {Server} from 'socket.io';
import pino from 'pino';
import * as dotenv from 'dotenv';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV;
// const BROADCAST_REFRESH_UPDATE = process.env.BROADCAST_REFRESH_UPDATE;
const PORT = process.env.PORT || 3000;
const CORS_URL = process.env.CORS_URL || '*';

const logger = pino({level: NODE_ENV === 'production' ? 'info' : 'debug'});

const httpServer = createServer();

let cluster = {};

const io = new Server(httpServer, {
  cors: {
    origin: CORS_URL,
  },
  serveClient: false,
});

io.on('connection', (socket) => {
  socket.emit('cluster.all', cluster);

  socket.on('cluster.update', ({id, data}) => {
    logger.debug(`cluster.update {${id}: ${data.temp}}`);
    cluster[id] = data;
    io.emit('cluster.event', {id, data});
  });
});

httpServer.listen(PORT, () => logger.info(`Server listening to port ${PORT}`));
