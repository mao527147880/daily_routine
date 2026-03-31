const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

function getBasePath() {
    if (process.pkg) {
        return path.dirname(process.execPath);
    }
    return __dirname;
}

function getDataFilePath() {
    return path.join(getBasePath(), 'diary-data.json');
}

function getStaticFilePath(filename) {
    return path.join(getBasePath(), filename);
}

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
        const dataFile = getDataFilePath();
        fs.readFile(dataFile, 'utf8', (err, data) => {
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
        return;
    }

    if (req.method === 'POST' && req.url === '/api/diary') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const dataFile = getDataFilePath();
            fs.writeFile(dataFile, body, 'utf8', (err) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Error saving file');
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end('{"success": true}');
            });
        });
        return;
    }

    if (req.method === 'GET') {
        let filePath;
        if (req.url === '/' || req.url === '') {
            filePath = getStaticFilePath('daily-journey.html');
        } else {
            filePath = getStaticFilePath(req.url);
        }

        const extname = path.extname(filePath);
        const contentTypes = {
            '.html': 'text/html; charset=utf-8',
            '.js': 'application/javascript',
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
        return;
    }

    res.writeHead(404);
    res.end('Not found');
});

server.listen(PORT, () => {
    console.log('');
    console.log('=================================');
    console.log('  每日流程展示 已启动');
    console.log('=================================');
    console.log('');
    console.log(`  访问地址: http://localhost:${PORT}`);
    console.log(`  数据文件: ${getDataFilePath()}`);
    console.log('');
    console.log('  按 Ctrl+C 停止服务');
    console.log('');
});
