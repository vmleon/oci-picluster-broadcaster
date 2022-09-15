import {Space} from 'antd';
import {DisconnectOutlined, CheckCircleOutlined} from '@ant-design/icons';
import {Statistic} from 'antd';

function AppFooter({isConnected, clusterSize}) {
  return (
    <Space size="large">
      <Statistic
        title="Connection"
        value={isConnected ? 'Online' : 'Offline'}
        prefix={isConnected ? <CheckCircleOutlined /> : <DisconnectOutlined />}
      />
      <Statistic title="No. RPi" value={clusterSize} />
    </Space>
  );
}

export default AppFooter;
