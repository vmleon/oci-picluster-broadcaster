import React, {useState} from 'react';
import {Card} from 'antd';
import {Progress} from 'antd';
import {Statistic} from 'antd';
import {Drawer} from 'antd';
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

function progressColor(percent) {
  if (percent < 40.0) {
    return green[6];
  }
  if (percent < 60.0) {
    return orange[6];
  }
  if (percent < 80.0) {
    return red[6];
  }
}

function calculatePercentage(total, free) {
  const usage = total - free;
  const percent = (usage / total) * 100;
  return Math.floor(percent);
}

function Cluster({cluster = {}}) {
  const [nodeSelectedId, setNodeSelectedId] = useState();

  if (!Object.keys(cluster).length) return null;

  return (
    <Space wrap={true}>
      {Object.keys(cluster).map((id, pos) => (
        <Card key={id} size="small" style={{width: 99}} onClick={() => setNodeSelectedId(id)}>
          <Tooltip title={id}>
            {`Node ${pos}`}
            <Statistic
              title="CPU"
              valueStyle={{fontSize: '9px'}}
              suffix="&#8451;"
              value={cluster[id].temp}
            />
            <Progress
              showInfo={true}
              percent={cluster[id].cpu}
              steps={10}
              size="small"
              strokeColor={tempColor(cluster[id].cpu)}
            />
          </Tooltip>
        </Card>
      ))}
      <Drawer
        title="Pi Node Info"
        placement="right"
        onClose={() => setNodeSelectedId(null)}
        open={nodeSelectedId}
      >
        <DrawerContent id={nodeSelectedId} cluster={cluster} />
      </Drawer>
    </Space>
  );
}

function DrawerContent({id, cluster}) {
  if (!id) return;
  if (!cluster) return;
  if (!cluster[id]) return;
  const {side, orientation, memTotal, diskTotal, ip, mac} = cluster[id];
  const {cpu, memFree, diskFree, processes} = cluster[id];
  const memPercent = calculatePercentage(memTotal, memFree);
  const diskPercent = calculatePercentage(diskTotal, diskFree);
  return (
    <>
      <p>{`Location ${side}, ${orientation}`}</p>
      <p>{`IP address: ${ip}`}</p>
      <p>{`MAC address: ${mac}`}</p>
      <p>
        <Statistic
          title="Temp"
          valueStyle={{fontSize: '10px'}}
          suffix=" C"
          value={cluster[id].temp}
        />
      </p>
      <p>
        {`CPU: `}
        <Progress
          steps={10}
          percent={cpu}
          showInfo={cpu < 99 ? true : false}
          strokeColor={progressColor(cpu)}
        />
      </p>
      <p>
        {`Mem usage: `}
        <Progress
          steps={10}
          showInfo={memPercent < 99 ? true : false}
          percent={memPercent}
          strokeColor={progressColor(memPercent)}
        />
      </p>
      <p>
        {`Disk usage: `}
        <Progress
          steps={10}
          showInfo={diskPercent < 99 ? true : false}
          percent={diskPercent}
          strokeColor={progressColor(memPercent)}
        />
      </p>
      <p>
        Processes:
        {processes && processes.length ? (
          <ul>
            {processes.slice(0, 5).map(({pid, name}) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        ) : (
          'No data'
        )}
      </p>
    </>
  );
}

export default Cluster;
