const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const qrcode = require('qrcode');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

const PORT = process.env.PORT || 8085;

app.get('/', (req, res) => {
  res.send('<h1>WhatsApp Server is running</h1>');
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
        ],
    }
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
        io.emit('qr', url);
        io.emit('message', 'QR Code received, please scan.');
    });
});

client.on('ready', () => {
    console.log('Client is ready!');
    io.emit('ready', 'Client is ready!');
    io.emit('message', 'Client is ready!');
});

client.on('message', message => {
	io.emit('new_message', message);
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
    io.emit('message', 'Authentication failed, please try again.');
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
    io.emit('message', 'Client was logged out');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('send_message', (data) => {
    const { to, message } = data;
    client.sendMessage(to, message).then(response => {
        socket.emit('message_sent', response);
    }).catch(err => {
        socket.emit('message_error', err.toString());
    });
  });

  socket.on('get_chats', () => {
    client.getChats().then(chats => {
        socket.emit('chats', chats);
    }).catch(err => {
        socket.emit('chats_error', err.toString());
    });
  });
});

client.initialize();

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
