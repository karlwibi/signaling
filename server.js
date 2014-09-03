var express=require('express');
var http= require('http');
var app = express();

app.engine('.html', require('ejs').__express);//setup for ejs

app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use('/js',express.static(__dirname + "/js"));
app.use('/lib',express.static(__dirname + "/lib"));
app.use('/plugin',express.static(__dirname + "/plugin"));
app.use('/css',express.static(__dirname + "/css"));

app.use(function (req, res, next) {
    if (req.query.roomId) {

        // Do something; call next() when done.
        var roomId=req.query.roomId;
        console.log("roomID :" +roomId);
        getUserInfo();
        res.render('index3',{roomId:roomId});
        next();
    } else {
        next();
    }
});

/**
 * setup the nodejs server and the socketIo
 */
var server = http.createServer(app)
    , io = require('socket.io').listen(server);

var owner='';
var participant=[];
var connect_start='';

server.listen(9001);


//app.get('/', function (req, res) {
//    res.render('index3');
//});

//app.get('/', function (req, res) {
//    res.sendfile(__dirname + '/index3.html');
//});

app.get('/presentation.html', function (req, res) {
//    res.sendfile(__dirname + '/presentation.html');
    res.render('presentation');
});




io.sockets.on('connection', function (socket) {

    //socket.emit('news', { hello: 'world' });
    /*socket.on('my other event', function (data) {
        console.log(data);
    });*/
    messageLog(socket.userid);
    socket.on('candidate', function (data) {
        console.log("got a candidate");
    });



    socket.on('addCaller',function(data){

        if (data.type=='caller'){
            owner=data.value;
            socket.username = 'caller';
            participant.push(new Participant(socket.userid,'owner'));
            messageLog(owner);
            messageLog(participant);
        }
    });

    socket.on('addCallee',function(data){

        if(data.type=='callee'){
            socket.username = 'callee';
            participant.push(new Participant(socket.userid,'callee'));

            messageLog(participant);
            socket.broadcast.emit('messages',{type:'arrived'});


        }

       /* if (owner=='join' && participant.length>2 && connect_start==''){

            messageLog("room owner and participant are present");
            socket.broadcast.emit('messages',{type:'arrived'});
            connect_start='true';

        }*/

    });

    socket.on('offer',function(data){

       messageLog("got offer : " + data);
        socket.broadcast.emit('messages',{type:'onOffer', value:data.value});
    });

    socket.on('answer',function(data){

        messageLog("got answer: " + data);
        socket.broadcast.emit('messages',{type:'answer', value:data.value});
    });



    socket.on('sendChat', function (data) {
        console.log("got a chat message message");

        // we tell the client to execute 'updatechat' with 2 parameters
        io.sockets.emit('updatechat', socket.username, data);
    });


    socket.on('messages', function (data) {
        console.log("got a message");

     });


    socket.on('onSlideChange', function(data){

        console.log('slide has been changed');

        socket.broadcast.emit('slideChange',{previousSlide:data.previousSlide, currentSlide:data.currentSlide});
    });

   socket.on('onPreziChange', function(data){

       console.log('Prezi slide has been changed');
       console.log(data.value);
       socket.broadcast.emit('preziChange',{value:data.value});

   });

});

function messageLog(data){
    console.log(data);
}

function Participant(id, type, status){
 this.userid=id;
 this.type=type;
 this.status=status;
}


function getUserInfo(){

    var options = {
        host: 'localhost',
        port: 8181,
        path: '/MWVCAppAPI/webresources/user/3',
        method: 'GET'
    };

    var req = http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
    }).end();

}