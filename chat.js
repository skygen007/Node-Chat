var fs = require('fs');
var S = require('string');
var mysql      = require('mysql');
var pool  = mysql.createPool({
connectionLimit : 10,
  host     : '31.220.20.84',
  user     : 'u521549300_222',
  database: "u521549300_222",
        password : "ebe22bcg2"
});

var cfg = {
    ssl: true,
    port: 8080,
    ssl_key: 'my-private-decrypted.key',
    ssl_cert: 'unified.crt'
};

var httpServ = ( cfg.ssl ) ? require('https') : require('http');

var app      = null;

// dummy request processing
var processRequest = function( req, res ) {

    res.writeHead(404);
    res.end();
};

if ( cfg.ssl ) {

    app = httpServ.createServer({

        // providing server with  SSL key/cert
        key: fs.readFileSync( cfg.ssl_key ),
        cert: fs.readFileSync( cfg.ssl_cert )

    }, processRequest ).listen( cfg.port );

} else {

    app = httpServ.createServer( processRequest ).listen( cfg.port );
}

// passing or reference to web server so WS would knew port and SSL capabilities
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer( { server: app } );

wss.broadcast = function(data) {
  for (var i in this.clients)
    this.clients[i].send(data);
};
var firstmessages = [];
var online = new Object();
online.status = 'online';
online.online = 0;

wss.on('connection', function(ws) {

 var newuser = new Object();
newuser.status = 'first';
newuser.messages = firstmessages;
var datatosend = JSON.stringify(newuser);
ws.send(datatosend);


online.online = online.online + 1;
var datatosend = JSON.stringify(online);
wss.broadcast(datatosend);

  ws.on('message', function incoming(message) {

    


  });//Event onmessage

ws.on('close', function() {
online.online = online.online - 1;
var datatosend = JSON.stringify(online);
wss.broadcast(datatosend);

});


});


String.prototype.countWords = function(){
  return this.split(/\s+/).length;
}

function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}
