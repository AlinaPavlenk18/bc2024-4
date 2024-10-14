const http = require('http');
const { program} = require('commander');

program
  .requiredOption('-h, --host <host>', 'Серверна адреса')
  .requiredOption('-p, --port <port>', 'Порт сервера')
  .requiredOption('-c, --cache <path>', 'Директорія для кешу')
  .parse(process.argv);
const { host, port, cache } = program.opts();
if (!host || !port || !cache) {
  console.error('Error: Required parameters are missing');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  res.end('Веб-сервер працює');
});
server.listen(port, host, () => {
  console.log(`Сервер працює на http://${host}:${port}, кеш у директорії ${cache}`);
});