import cluster from 'cluster';
import { cpus } from 'os';
import process from 'process';
import { setupMaster } from '@socket.io/cluster-adapter';

const numCPUs = cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} running. Forking ${numCPUs} workers...`);
  // Wire Socket.io cross-worker message relay via IPC (no Redis needed)
  setupMaster(cluster, { retries: 3 });
  for (let i = 0; i < numCPUs; i++) cluster.fork();
  cluster.on('exit', (worker, code, signal) => {
    console.warn(`Worker ${worker.process.pid} died (${signal || code}). Restarting...`);
    cluster.fork();
  });
} else {
  // Workers import the actual server
  await import('./index.js');
}
