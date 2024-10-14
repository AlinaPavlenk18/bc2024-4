const http = require('http');
const { program} = require('commander');
const fs = require('fs').promises;
const path = require('path');
const superagent = require('superagent');

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

const server = http.createServer(async (req, res) => {
  console.log(`Received ${req.method} request for ${req.url}`);
const fileCode = req.url.slice(1); 
    const filePath = path.join(cache, `${fileCode}.jpg`);
    const httpCatUrl = `https://http.cat/${fileCode}`;
    
    if (req.method === 'GET') {
        try {
          console.log(`Перевірка кешу для ${filePath}`);
          const image = await fs.readFile(filePath);
          res.writeHead(200, { 'Content-Type': 'image/jpeg' });
          res.end(image);
        } catch (error) {
          console.log(`Помилка кешу: ${filePath} не знайдено, отримання з ${httpCatUrl}`);
          try {
            const response = await superagent.get(httpCatUrl).buffer(true).parse(superagent.parse.image);
            const imageData = response.body;
            // Зберігаємо отримане зображення у кеш
            await fs.writeFile(filePath, imageData);
            console.log(`Зображення збережено в cache: ${filePath}`);
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(imageData);
          } catch (err) {
            console.error(`Не вдалося отримати зображення з${httpCatUrl}:`, err.message);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Файл не знайдено ні в кеші, ні на сервері http.cat');
            console.log(`Надіслана відповідь: ${res.statusCode} ${res.statusMessage}`);
          }
        }
      } else if (req.method === 'PUT') {
        const buffers = [];
        req.on('data', chunk => buffers.push(chunk));
        req.on('end', async () => {
          const imageData = Buffer.concat(buffers);
          try {
            console.log(`Збереження зображення для коду ${fileCode}`);
            await fs.writeFile(filePath, imageData);
            res.writeHead(201, { 'Content-Type': 'text/plain' });
            res.end('Файл збережено');
            console.log(`Зображення збережено до cache: ${filePath}`);
          } catch (error) {
            console.error(`Помилка збереження зображення до cache:`, error.message);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Помилка при збереженні файлу');
          }
        });
      } else if (req.method === 'DELETE') {
        try {
          console.log(`Спроба видалити ${filePath}`);
          await fs.unlink(filePath);
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('Файл видалено');
          console.log(`Видалений файл: ${filePath}`);
        } catch (error) {
          console.error(`Помилка видалення файлу: ${filePath}`, error.message);
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Файл не знайдено');
        }
      } else {
        console.log(`Непідтримуваний метод: ${req.method}`);
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Метод не дозволено');
        
      }
    });

server.listen(port, host, () => {
  console.log(`Сервер працює на http://${host}:${port}, кеш у директорії ${cache}`);
});