const http = require('http');
const { program} = require('commander');
const fs = require('fs').promises;
const path = require('path');



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
const fileCode = req.url.slice(1); 
const filePath = path.join(cache, `${fileCode}.jpg`);
  
    if (req.method === 'GET') {
        (async () => {
          try {
            const image = await fs.readFile(filePath);
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(image);
          } catch (error) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Файл не знайдено');
          }
        })();}


server.listen(port, host, () => {
  console.log(`Сервер працює на http://${host}:${port}, кеш у директорії ${cache}`);
});