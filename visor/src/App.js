import React, {useState, useEffect} from 'react';
import {Layout} from 'antd';
import {Typography} from 'antd';
import {Space} from 'antd';
import ClusterVisor from './ClusterVisor';
import AppFooter from './AppFooter';
const {Header, Footer, Content} = Layout;
const {Title} = Typography;

const worker = new Worker(new URL('./commsWorker.js', import.meta.url));

worker.postMessage({message: 'Hello from client'});

function App() {
  const [isConnected, setIsConnected] = useState(false); // socket.connected);
  const [cluster, setCluster] = useState({});

  useEffect(() => {
    worker.onmessage = ({data: message}) => {
      const {type, data, id, error} = message;
      if (error) {
        console.error(error);
      }
      switch (type) {
        case 'connect':
          const isConnected = data;
          setIsConnected(isConnected);
          if (!isConnected) {
            setCluster({});
          }
          break;
        case 'event':
          setCluster({...cluster, ...data});
          break;
        case 'all':
          setCluster(data);

          break;

        default:
          break;
      }
    };

    return () => {};
  }, [cluster, isConnected]);

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
