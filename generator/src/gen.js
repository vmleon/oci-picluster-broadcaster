import pino from "pino";
import * as dotenv from "dotenv";
import shortid from "shortid";
import fetch from "node-fetch";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV;
const CLUSTER_SIZE = parseInt(process.env.CLUSTER_SIZE);
const DATA_UPDATE_FREQUENCY = parseInt(process.env.DATA_UPDATE_FREQUENCY);
const API_URL = process.env.API_URL;

const logger = pino({ level: NODE_ENV === "production" ? "info" : "debug" });

logger.info(`Connecting to ${API_URL}`);
logger.info(`CLUSTER_SIZE: ${CLUSTER_SIZE}`);

logger.info("Deleting cluster data");
deleteClusterData();

let ids = initArrayOfIDs(CLUSTER_SIZE);
let cluster = initCluster(ids);

let tracesPerSecond = 0;

async function postClusterData(id, data) {
  const URL = `${API_URL}/api/cluster/${id}`;
  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.status !== 200) {
      logger.error(
        new Error(`ERROR on ${URL}: ${response.status} ${response.statusText}`)
      );
      return;
    }
  } catch (error) {
    logger.error(error.message);
  }
}

async function deleteClusterData() {
  const URL = `${API_URL}/api/cluster`;
  try {
    const response = await fetch(URL, {
      method: "DELETE",
    });
    if (response.status !== 200) {
      logger.error(
        new Error(`ERROR on ${URL}: ${response.status} ${response.statusText}`)
      );
      return;
    }
  } catch (error) {
    logger.error(error.message);
  }
}

setInterval(() => {
  if (!tracesPerSecond) {
    return;
  }
  logger.info(`Sending ${tracesPerSecond} traces/sec`);
  tracesPerSecond = 0;
}, 1000);

logger.info(`DATA_UPDATE_FREQUENCY: ${DATA_UPDATE_FREQUENCY}`);
setInterval(() => {
  if (!ids.length) {
    return;
  }
  const randomId = ids[Math.floor(Math.random() * ids.length)];
  cluster[randomId] = deltaDataPoint(randomId, cluster[randomId]);
  postClusterData(randomId, cluster[randomId]);
  ++tracesPerSecond;
}, DATA_UPDATE_FREQUENCY);

let elapsedTime = 0;
let lastTime = new Date();

function progressValue(
  value,
  elapsedTime,
  options = { speed: 0.5, min: 0, max: 100 }
) {
  if (value >= options.max) return value - 40;
  if (value <= options.min) return value + 40;
  const newValue = value + Math.sin(elapsedTime + 3) * options.speed;
  const normalized = Math.abs(newValue);
  return Math.floor(normalized);
}

function deltaDataPoint(id, dataPoint) {
  let {
    cpu = 25,
    temp = 20,
    memFree = 7000,
    diskFree = 118000,
    processes = [],
    memTotal,
    diskTotal,
  } = dataPoint;
  const currentTime = new Date();
  const idNumberHashed = hashCode(id);
  elapsedTime = currentTime - lastTime;
  lastTime = currentTime;

  cpu = progressValue(cpu, elapsedTime);
  temp = progressValue(temp, elapsedTime); // (Math.random() * 70.0 + 22.0).toFixed(1);
  memFree = progressValue(memFree, elapsedTime, { max: memTotal });
  diskFree = progressValue(diskFree, elapsedTime, { max: diskTotal });
  processes = [
    { pid: 100, name: "systemd", cpu_percent: 12, memory_percent: 13 },
    { pid: 200, name: "cpuhp", cpu_percent: 7, memory_percent: 24 },
    { pid: 300, name: "net_ns", cpu_percent: 21, memory_percent: 25 },
    { pid: 400, name: "rcu_gp", cpu_percent: 9, memory_percent: 5 },
  ];
  const data = {
    temp,
    cpu,
    memFree,
    diskFree,
    processes,
    ...calculatePosition(idNumberHashed),
    memTotal: 8000,
    diskTotal: 128000,
    ip: `192.168.${(idNumberHashed / 5).toFixed(0)}.${idNumberHashed % 256}`,
    mac: `00:B0:D0:63:${(idNumberHashed % 256).toString(16)}:${(
      idNumberHashed % 256
    ).toString(16)}`,
  };
  return data;
}

function hashCode(id) {
  var hash = 0,
    i,
    chr;
  if (id.length === 0) return hash;
  for (i = 0; i < id.length; i++) {
    chr = id.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function calculatePosition(hashCode) {
  const pos = hashCode % 4;
  switch (pos) {
    case 0:
      return { side: "North", orientation: "West" };
    case 1:
      return { side: "North", orientation: "East" };
    case 2:
      return { side: "South", orientation: "West" };
    case 3:
      return { side: "South", orientation: "East" };
    default:
      return { side: "North", orientation: "West" };
  }
}

function initArrayOfIDs(size) {
  const ids = new Array(size).fill(null).map(shortid.generate);
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
      })
  );
  return cluster;
}
