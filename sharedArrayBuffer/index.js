const { Worker } = require('worker_threads');
const generatePrimes = require('./generatePrimes');

const start = withThreads => {
  const max = 1.4e7;
  const min = 2;
  if (withThreads) {
    const sharedBuffer = new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT * 910077);
    const primes = new Uint32Array(sharedBuffer);
    const threadCount = 2;
    const threads = new Set();
    console.log(`Running with ${threadCount} threads`);
    console.log(new Date());
    const range = Math.ceil((max - min) / threadCount);
    let start = min;
    for (let i = 0; i < threadCount - 1; i++) {
      const subStart = start;
      threads.add(new Worker(`${__dirname}/worker.js`, { workerData: { start: subStart, range, primes, index: 0 }}));
      start += range;
    }
    threads.add(new Worker(`${__dirname}/worker.js`, { workerData: {
      start,
      range: range + ((max - min + 1) % threadCount),
      primes,
      index: 455040
    } }));
    threads.forEach(worker => {
      worker.on('error', err => { console.log(err) });
      worker.on('exit', () => {
        threads.delete(worker);
        if (threads.size === 0) {
          console.log(primes);
          console.log(new Date());
        }
      })
    });
  } else {
    console.log(new Date());
    const arr = generatePrimes(min, max);
    console.log(arr.length);
    console.log(new Date());
  }
}
start(true);