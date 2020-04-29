const {
  Worker, isMainThread, parentPort, workerData
} = require('worker_threads');

const max = 1.4e7;
const min = 2;
let primes = [];
const generatePrimes = (start, range) => {
  let isPrime = true;
  let end = start + range;
  for (let i = start; i < end; i++) {
    for (let j = min; j < Math.sqrt(end); j++) {
      if (i !== j && i%j === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) {
      primes.push(i);
    }
    isPrime = true;
  }
}
const start = withThreads => {
  if (withThreads) {
    if (isMainThread) {
      const threadCount = parseInt(process.argv[2]) || 2;
      const threads = new Set();
      console.log(`Running with ${threadCount} threads`);
      console.log(new Date());
      const range = Math.ceil((max - min) / threadCount);
      let start = min;
      for (let i = 0; i < threadCount - 1; i++) {
        const subStart = start;
        threads.add(new Worker(__filename, { workerData: { start: subStart, range }}));
        start += range;
      }
      threads.add(new Worker(__filename, { workerData: { start, range: range + ((max - min + 1) % threadCount)}}));
      threads.forEach(worker => {
        worker.on('exit', () => {
          threads.delete(worker);
          if (threads.size === 0) {
            console.log(primes.length);
            console.log(new Date());
          }
        })
        worker.on('message', (msg) => {
          primes = primes.concat(msg);
        });
      });
    } else {
      generatePrimes(workerData.start, workerData.range);
      parentPort.postMessage(primes);
    }
  } else {
    console.log(new Date());
    generatePrimes(min, max);
    console.log(primes.length);
    console.log(new Date());
  }
}
start(true);