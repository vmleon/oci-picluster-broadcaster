import {Card} from 'antd';
import {Progress} from 'antd';
import {Tooltip} from 'antd';
import {Space} from 'antd';
import {red, green, orange} from '@ant-design/colors';

function tempColor(temp) {
  if (temp > 40.0) {
    return green[6];
  }
  if (temp > 50.0) {
    return orange[6];
  }
  if (temp > 65.0) {
    return red[6];
  }
}

function Cluster({cluster}) {
  return (
    <Space wrap={true}>
      {Object.keys(cluster).map((id) => (
        <Card key={id} size="small" style={{width: 90}}>
          <Tooltip title={id}>
            <Progress
              percent={cluster[id].temp}
              steps={5}
              size="small"
              strokeColor={tempColor(cluster[id].temp)}
            />
          </Tooltip>
        </Card>
      ))}
    </Space>
  );
}

export default Cluster;
