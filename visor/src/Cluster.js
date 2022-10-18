import React, { useState } from "react";
import { Card, Typography } from "antd";
import { Progress } from "antd";
import { Statistic } from "antd";
import { Drawer } from "antd";
import { Tooltip } from "antd";
import { Space } from "antd";
import { red, green, orange } from "@ant-design/colors";

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

function Cluster({ cluster = {} }) {
  const [nodeSelectedId, setNodeSelectedId] = useState();

  if (!Object.keys(cluster).length) return null;

  return (
    <Space wrap={true}>
      {Object.keys(cluster).map((id) => (
        <Card
          key={id}
          size="small"
          style={{ width: 120 }}
          onClick={() => setNodeSelectedId(id)}
        >
          <Tooltip title={id}>
            <Typography>{`${cluster[id].ip}`}</Typography>
            <Statistic
              title="CPU"
              valueStyle={{ fontSize: "9px" }}
              value={cluster[id].CPUTemperature}
            />
            <Progress
              showInfo={true}
              percent={cluster[id].CPU}
              steps={10}
              size="small"
              strokeColor={tempColor(cluster[id].CPU)}
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

function DrawerContent({ id, cluster }) {
  if (!id) return;
  if (!cluster) return;
  if (!cluster[id]) return;
  const { switch_ip, MemoryTotal, DiskTotal, ip, mac } = cluster[id];
  const { CPU, MemoryFree, DiskFree, processes } = cluster[id];
  const memPercent = calculatePercentage(MemoryTotal, MemoryFree);
  const diskPercent = calculatePercentage(DiskTotal, DiskFree);
  return (
    <>
      <p>{`IP address: ${ip}`}</p>
      <p>{`MAC address: ${mac}`}</p>
      <p>{`Switch IP: ${switch_ip}`}</p>
      <p>
        <Statistic
          title="Temp"
          valueStyle={{ fontSize: "10px" }}
          value={cluster[id].CPUTemperature}
        />
      </p>
      <p>
        {`CPU: `}
        <Progress
          steps={10}
          percent={CPU}
          showInfo={CPU < 99 ? true : false}
          strokeColor={progressColor(CPU)}
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
            {processes.slice(0, 5).map(({ pid, name }) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        ) : (
          "No data"
        )}
      </p>
    </>
  );
}

export default Cluster;
