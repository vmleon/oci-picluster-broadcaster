import React, {useState, useEffect} from 'react';
import {io} from 'socket.io-client';
import {Layout} from 'antd';
import {Typography} from 'antd';
import {Space} from 'antd';
import ClusterVisor from './ClusterVisor';
import AppFooter from './AppFooter';
const {Header, Footer, Content} = Layout;
const {Title} = Typography;

const socket = io('ws://localhost:3001');

const worker = new Worker(new URL('./commsWorker.js', import.meta.url));

worker.onmessage = ({data}) => {
  console.log(data);
};

worker.postMessage({number: 0});

socket.io.on('error', (error) => console.error(`error: ${error}`));

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [cluster, setCluster] = useState({});

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setCluster({});
    });

    socket.on('cluster.event', ({id, data}) => {
      const newEntry = {};
      newEntry[id] = data;
      setCluster({...cluster, ...newEntry});
    });

    socket.on('cluster.all', (cluster) => {
      console.log('cluster.all');
      setCluster(cluster);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('pong');
    };
  }, [cluster]);

  return (
    <Layout>
      <Header>
        <Space>
          <Title style={{color: 'white'}}>Visor</Title>
          <Title style={{color: 'white'}} level={4}>
            Pi Cluster
          </Title>
        </Space>
      </Header>
      <Content style={{padding: '0 24px', minHeight: 400}}>
        <ClusterVisor cluster={cluster} />
      </Content>
      <Footer style={{textAlign: 'center'}}>
        <AppFooter isConnected={isConnected} clusterSize={Object.keys(cluster).length} />
      </Footer>
    </Layout>
  );
}

export default App;
