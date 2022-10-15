import React, { useState, useEffect } from "react";
import { Layout } from "antd";
import { DisconnectOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { Statistic } from "antd";
import { PageHeader } from "antd";
import ClusterVisor from "./ClusterVisor";
const { Content } = Layout;

const worker = new Worker(new URL("./commsWorker.js", import.meta.url));

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [cluster, setCluster] = useState({});

  useEffect(() => {
    worker.onmessage = ({ data: message }) => {
      const { type, data, error } = message;
      if (error) {
        console.error(error);
      }
      switch (type) {
        case "connect":
          setIsConnected(true);
          break;
        case "disconnect":
          setCluster({});
          setIsConnected(false);
          break;
        case "event":
          setCluster({ ...cluster, ...data });
          break;
        case "clean":
          setCluster({});
          break;
        case "all":
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
      <PageHeader
        title="Pi Cluster"
        subTitle="Visor"
        extra={[
          <Statistic
            key={1}
            title="Connection"
            value={isConnected ? "On" : "Off"}
            prefix={
              isConnected ? <CheckCircleOutlined /> : <DisconnectOutlined />
            }
          />,
          <Statistic
            key={2}
            title="No. RPi"
            value={Object.keys(cluster).length}
          />,
        ]}
      ></PageHeader>
      <Content style={{ padding: "24px", minHeight: 400 }}>
        <ClusterVisor cluster={cluster} />
      </Content>
    </Layout>
  );
}

export default App;
