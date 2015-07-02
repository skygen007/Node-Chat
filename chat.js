var fs = require('fs');
var S = require('string');
var mysql = require('mysql');
var connection = mysql.createPool({
    connectionLimit: 10,
    host: '31.220.20.84',
    user: 'u521549300_222',
    database: "u521549300_222",
    password: "ebe22bcg2"
});

var cfg = {
    ssl: true,
    port: 8080,
    ssl_key: 'my-private-decrypted.key',
    ssl_cert: 'unified.crt'
};

var httpServ = (cfg.ssl) ? require('https') : require('http');

var app = null;

// dummy request processing
var processRequest = function(req, res) {

    res.writeHead(404);
    res.end();
};

if (cfg.ssl) {

    app = httpServ.createServer({

        // providing server with  SSL key/cert
        key: fs.readFileSync(cfg.ssl_key),
        cert: fs.readFileSync(cfg.ssl_cert)

    }, processRequest).listen(cfg.port);

} else {

    app = httpServ.createServer(processRequest).listen(cfg.port);
}

// passing or reference to web server so WS would knew port and SSL capabilities
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({
    server: app
});

wss.broadcast = function(data) {
    for (var i in this.clients)
        this.clients[i].send(data);
};
var firstmessages = [];
var online = new Object();
online.status = 'online';
online.online = 0;

var users = new Object();


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

        console.log(message);
    

        try {
            message = JSON.parse(message);

            switch (message.status) {
                case 'newUser':

                    connection.query('SELECT nickname,avatar,steamid FROM steamids WHERE hash=' + connection.escape(message.hash), function(err, rows) {

                        

                        if (err && rows === []) throw err;

                        var userInfo = {
                          name: rows[0].nickname,
                          avatar: rows[0].avatar,
                          steamid: rows[0].steamid
                        };

                        users[ws.upgradeReq.headers['sec-websocket-key']] = userInfo;
                    




                    });




                    break;

                case 'msg':

        var text = message.text;

        text = S(text).stripTags().s;//HTML tags
        text = S(text).trim().s;//whitespaces
        text = S(text).collapseWhitespace().s;//whitespaces
        

        text = S(text).strip('\\').s;
        if(S(text).length > 50){
         text = S(text).truncate(50).s;}
         text = S(text).capitalize().s;

         if(text){

          var msg = {
            msg:text,
            steamid: users[ws.upgradeReq.headers['sec-websocket-key']].steamid,
            name: users[ws.upgradeReq.headers['sec-websocket-key']].nickname,
            avatar: users[ws.upgradeReq.headers['sec-websocket-key']].avatar,
            time: message.time

          };


      wss.broadcast(JSON.stringify(msg));

         }


                break;

            }

        } catch (err) {




        }


    }); //Event onmessage

    ws.on('close', function() {
        online.online = online.online - 1;
        var datatosend = JSON.stringify(online);
        wss.broadcast(datatosend);

       delete users[ws.upgradeReq.headers['sec-websocket-key']];
        

    });


});


String.prototype.countWords = function() {
    return this.split(/\s+/).length;
}

