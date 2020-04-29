const { workerData } = require('worker_threads');
const generatePrimes = require('./generatePrimes');

const arr = generatePrimes(workerData.start, workerData.range);
workerData.primes.set(arr, workerData.index);