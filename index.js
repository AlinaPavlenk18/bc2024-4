const http = require('http');
const { Command} = require('commander');
const program = new Command();

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
// Запуск веб-сервера
const server = http.createServer((req, res) => {
  res.end('Веб-сервер працює');
});

server.listen(port, host, () => {
  console.log(`Сервер працює на http://${host}:${port}, кеш у директорії ${cache}`);
});