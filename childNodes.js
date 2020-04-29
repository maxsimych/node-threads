const { fork } = require('child_process');

const heavyCommand = i => {
  const now = Date.now();
  console.log(`${i} start`);
  while (Date.now() - now < 5000) {};
  console.log(`${i} finish`);
  if (process.send) process.send('ok');
}

const start = withChildNodes => {
  if (withChildNodes) {
    if (process.argv.length === 3) {
      console.log(`start ${new Date}`);
      const childs = parseInt(process.argv[2]);
      let finished = 0;
      for (let i = 0; i < childs; i++) {
        const subProc = fork(__filename);
        subProc.on("message", m => {
          if (++finished === childs) {
            console.log(`finish ${new Date}`);
            process.exit(0);
          }
        });
        subProc.send(i);
      }
    } else {
      process.on('message', i => {
        heavyCommand(i);
      })
    }
  } else {
    console.log(`start ${new Date}`);
    for (let i = 0; i < 5; i++) {
      heavyCommand(i);
    }
    console.log(`finish ${new Date}`);
  }
}

start(false);