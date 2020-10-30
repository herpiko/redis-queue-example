const redis = require('redis');
const async = require('async');
let redisNotReady = true;
let redisClient = redis.createClient({
  host: '127.0.0.1',
  port: 6379
});
redisClient.on('error', err => {
  console.log('error', err);
});
redisClient.on('connect', err => {
  console.log('connect');
});
redisClient.on('ready', err => {
  redisNotReady = false;
  console.log('ready');

  async.forever(
    next => {
      redisClient.lrange('antrian-bank', 0, -1, function (err, reply) {
        if (reply.length < 1) {
          console.log('Menunggu antrian baru')
          setTimeout(() => {
            next();
          }, 1000);
        } else {
          console.log('Antrian', reply);
          let toBeProcessed = reply[0];
          console.log('Memproses ' + toBeProcessed);
          setTimeout(() => {
            redisClient.lpop(['antrian-bank'], function (err, reply) {
              console.log('Sisa antrian: ', reply);
              next();
            });
          }, 3000);
        }
      });
    },
    err => {
      console.log(err);
    }
  );
});
