
const fs = require('fs');
const express = require('express');
const app = express();
const http = require('http');
const https = require('https');

//const { Server } = require("socket.io");
//const io = new Server(server);


//const privateKey = fs.readFileSync(process.env.PRIVATE_KEY, 'utf8')
//const certificate = fs.readFileSync(process.env.CERTIFICATE, 'utf8')


//const privateKey = fs.readFileSync('./file.pem', 'utf8')
//const certificate = fs.readFileSync('./file.crt', 'utf8')
const privateKey = fs.readFileSync('/etc/letsencrypt/live/617e4378-1ef6-4246-a171-6a3483f84f4d.clouding.host/privkey.pem', 'utf8')
const certificate = fs.readFileSync('/etc/letsencrypt/live/617e4378-1ef6-4246-a171-6a3483f84f4d.clouding.host/cert.pem', 'utf8')
const ca = fs.readFileSync('/etc/letsencrypt/live/617e4378-1ef6-4246-a171-6a3483f84f4d.clouding.host/chain.pem', 'utf8')
const credentials = {
    key: privateKey, 
    cert: certificate,
    ca: ca, 
    //passphrase: process.env.PASSPHRASE
}

/*
var options = {
  key: fs.readFileSync('/etc/letsencrypt/live/example.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/example.com/cert.pem'),
  ca: fs.readFileSync('/etc/letsencrypt/live/example.com/chain.pem')
};
*/


//const credentials = {}
//const server = http.createServer(credentials, app);
const server = https.createServer(credentials, app);


const io = require("socket.io")(server, {
  cors: {
    //origin: "http://192.168.1.2", // Local
    //origin: "https://www.eteria-desarrollo.com",
    origin: "*",
    methods: ["GET", "POST"]
  }
});


const port =  3000;


// --------------------------------------------------------------------------------------------------------
// Config socket.io
// --------------------------------------------------------------------------------------------------------
/*
//io.set('log level', 1);
io.configure(function () {
  io.set('flash policy port', -1);
  io.set('transports', [
      'websocket'
    , 'flashsocket'
    , 'htmlfile'
    , 'xhr-polling'
    , 'jsonp-polling'
  ]);
});
*/


// --------------------------------------------------------------------------------------------------------
// Manage crossdomain request with "expressjs" to this server:port
// (You need to copy a valid crossdomain.xml file in the same folder of this server script)
// --------------------------------------------------------------------------------------------------------
app.get('/crossdomain.xml', function (req, res) {
  console.log("request ... " + __dirname);
  res.sendfile(__dirname + '/crossdomain.xml');
});

server.listen(port, () => {
  console.log('listening on *:' + port);
});

console.log("socket.io server started");


// --------------------------------------------------------------------------------------------------------
// Manage sockets communication
// --------------------------------------------------------------------------------------------------------
io.sockets.on('connection', function (socket) {

  console.log("Connection " + socket.id + " accepted.");

  socket.on('message', function (msg) {
    console.log('Message: ' + msg + ' from client: ' + socket.id);

    //socket.emit('message', { param1: 'Hello client, Im the server!' }); // Envia solo al socket
    socket.broadcast.emit('message', { msg: msg }); // Envia a todos menos al que lo envia
    //io.sockets.emit('message', { msg: msg }); // Envia a todos
  });

  // Custom event
  socket.on('my other event', function (msg) {
    console.log('my other event: ' + msg + ' from client: ' + socket.id);
    //socket.emit('message', { param1: 'Hello client, Im the server!' }); // Envia solo al socket
    io.sockets.emit('my other event', { param1: 'The server received custom event: "my other event"' }); // Envia a todos
  });

  socket.on('disconnect', function () {
    console.log("Connection " + socket.id + " terminated.");
    //io.sockets.emit('message', { msg: '<Usuario desconectado>' });
  });

});
