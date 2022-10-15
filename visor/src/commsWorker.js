import { io } from "socket.io-client";

const SERVER_URL =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:3001";

let clusterCache = {};

const socket = io(SERVER_URL);

socket.io.on("error", (error) => postMessage({ error }));

socket.on("connect", () => {
  postMessage({ type: "connect" });
});

socket.on("disconnect", () => {
  postMessage({ type: "disconnect" });
});

socket.on("cluster.event", (data) => {
  clusterCache = { ...clusterCache, ...data };
});

setInterval(() => {
  postMessage({ type: "event", data: clusterCache });
  clusterCache = {};
}, 1000);

socket.on("cluster.all", (cluster) => {
  clusterCache = {};
  postMessage({ type: "all", data: cluster });
});

socket.on("cluster.delete", () => {
  clusterCache = {};
  postMessage({ type: "clean" });
});

onmessage = ({ type }) => {
  if (type === "clean") {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("pong");
  }
};
