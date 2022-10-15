import { createServer } from "http";
import { Server } from "socket.io";
import pino from "pino";
import * as dotenv from "dotenv";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV;
const BROADCAST_REFRESH_UPDATE = parseInt(process.env.BROADCAST_REFRESH_UPDATE);
const PORT = parseInt(process.env.PORT) || 3000;
const CORS_URL = process.env.CORS_URL || "*";

const logger = pino({ level: NODE_ENV === "production" ? "info" : "debug" });

const httpServer = createServer();

let numOfClients = 0;

let cluster = {};
let clusterCache = {};

let tracesPerSecond = 0;

const io = new Server(httpServer, {
  cors: {
    origin: CORS_URL,
  },
  serveClient: false,
});

io.on("connection", (socket) => {
  ++numOfClients;
  socket.emit("cluster.all", cluster);

  socket.on("cluster.update", (update) => {
    Object.keys(update).forEach((id) => {
      const data = update[id];
      clusterCache[id] = data;
      cluster[id] = data;
      ++tracesPerSecond;
    });
  });

  socket.on("cluster.delete", () => {
    clusterCache = {};
    cluster = {};
    logger.info("cluster.delete");
    io.emit("cluster.delete");
  });

  socket.on("disconnect", () => {
    --numOfClients;
  });
});

setInterval(() => {
  if (!tracesPerSecond) {
    return;
  }
  logger.info(`Cluster sent ${tracesPerSecond} traces/sec`);
  tracesPerSecond = 0;
}, 1000);

setInterval(() => {
  if (!numOfClients) {
    return;
  }
  logger.info(`${numOfClients} clients`);
}, 1000);

setInterval(() => {
  const clusterCacheLength = Object.keys(clusterCache).length;
  if (!clusterCacheLength) return;
  io.emit("cluster.event", clusterCache);
  clusterCache = {};
}, BROADCAST_REFRESH_UPDATE);

httpServer.listen(PORT, () => logger.info(`Server listening to port ${PORT}`));
