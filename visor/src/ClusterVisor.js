import Cluster from './Cluster';

function ClusterVisor({cluster = {}, metadata = {}}) {
  return <Cluster cluster={cluster} metadata={metadata} />;
}

export default ClusterVisor;
