const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'diary-data.json');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'GET' && req.url === '/api/diary') {
        fs.readFile(DATA_FILE, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end('{}');
                } else {
                    res.writeHead(500);
                    res.end('Error reading file');
                }
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
    }

    else if (req.method === 'POST' && req.url === '/api/diary') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            fs.writeFile(DATA_FILE, body, 'utf8', (err) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Error saving file');
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end('{"success": true}');
            });
        });
    }

    else if (req.method === 'GET') {
        let filePath = req.url === '/' ? '/daily-journey.html' : req.url;
        filePath = path.join(__dirname, filePath);

        const extname = path.extname(filePath);
        const contentTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json'
        };
        const contentType = contentTypes[extname] || 'text/plain';

        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404);
                    res.end('File not found');
                } else {
                    res.writeHead(500);
                    res.end('Server error');
                }
                return;
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        });
    }

    else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Data will be saved to: ${DATA_FILE}`);
});
