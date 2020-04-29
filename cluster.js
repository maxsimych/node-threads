const http = require('http');
const cluster = require('cluster');
const { cpus } = require('os');

const heavyCommand = () => {
  const list = new Array(1e6);
  for (let k = 0; k < list.length; k++) {
    list[k] = k * Math.floor(Math.random() * 1000);
  }

  if(process.send) {
    process.send(`List is created on worker process id ${process.pid}`);
  } else {
    console.log('List created without workers');
  }
  return process.pid;
}

const workers = [];

const setupWorkerProcesses = () => {
  const numCores = cpus().length;
  console.log(`Master cluster setting up ${numCores} workers`);

  for (let i = 0; i < numCores; i++) {
    workers.push(cluster.fork());

    workers[i].on('message', msg => {
      console.log(msg);
    });
  }

  cluster.on('online', worker => {
    console.log(`Worker ${worker.process.pid} is listening`);
  });

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
    console.log('Starting a new worker');
    workers.push(cluster.fork());
    workers[workers.length - 1].on('message', msg => {
      console.log(msg);
    });
  });
};

const setupRouter = () => {
  const server = http.createServer((req, res) => {
    if (req.url === '/' && req.method === 'GET') {
      const pid = heavyCommand();
      res.writeHead(200, { 'Content-Type': 'text/html'});
      res.end(`Worker Process Id ${pid}`);
    }
  });

  server.listen(8000, () => {
    console.log('Server started');
  });
};

const setupServer = isClustered => {
  if (isClustered && cluster.isMaster) {
    setupWorkerProcesses();
  } else {
    setupRouter();
  }
}

setupServer(false);