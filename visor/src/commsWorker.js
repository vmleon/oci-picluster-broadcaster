import {io} from 'socket.io-client';

let clusterCache = {};

const socket = io('ws://localhost:3001');

socket.io.on('error', (error) => postMessage({error}));

socket.on('connect', () => {
  postMessage({type: 'connect', data: true});
});

socket.on('disconnect', () => {
  postMessage({type: 'connect', data: false});
});

socket.on('cluster.event', (data) => {
  clusterCache = {...clusterCache, ...data};
});

setInterval(() => {
  postMessage({type: 'event', data: clusterCache});
  clusterCache = {};
}, 1000);

socket.on('cluster.all', (cluster) => {
  clusterCache = {};
  postMessage({type: 'all', data: cluster});
});

onmessage = ({type}) => {
  if (type === 'clean') {
    socket.off('connect');
    socket.off('disconnect');
    socket.off('pong');
  }
};
