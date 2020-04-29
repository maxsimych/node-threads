module.exports = (start, range) => {
  const arr = [];
  let isPrime = true;
  let end = start + range;
  for (let i = start; i < end; i++) {
    for (let j = 2; j < Math.sqrt(end); j++) {
      if (i !== j && i%j === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) {
      arr.push(i);
    }
    isPrime = true;
  }
  return arr;
}