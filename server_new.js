var connectionHandlerTimer = setInterval(function () {
    connectionHandler();
}, 1000);


var connectionFlag = "Free";
var connectionCounterList = [];
var connectionQueue = [];
var tempConnectionSession = {};
var connectionSessionList = [];
var tempRoomParticipantAvailableList = [];
var roomList = [];
var Room = require('./js/Room.js').Room;
var Participant = require('./js/Participant.js').Participant;
var ConnectionSession = require('./js/ConnectionSession.js').ConnectionSession;
var ConnectionCounter = require('./js/ConnectionCounter.js').ConnectionCounter;
var express = require('express');
var http = require('http');
var app = express();

app.engine('.html', require('ejs').__express);//setup for ejs

app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use('/js', express.static(__dirname + "/js"));
app.use('/lib', express.static(__dirname + "/lib"));
app.use('/plugin', express.static(__dirname + "/plugin"));
app.use('/css', express.static(__dirname + "/css"));

app.use(function (req, res, next) {
    if (req.query.roomId && req.query.userId) {
        var aRoom = new Room();
        getRoomInfo(req.query.roomId, req.query.userId, aRoom, res, next);

    } else {
        next();
    }
});

/**
 * setup the nodejs server and the socketIo
 */
var server = http.createServer(app)
    , io = require('socket.io').listen(server, { log: false });

var owner = '';
var participant = [];
var connect_start = '';

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


    //partiticpant joining a room
    socket.on('participant', function (data) {


        messageLog("-------------------------------------------------------");
        messageLog("participant join the room");
        messageLog("roomId: " + data.roomId);
        messageLog("-------------------------------------------------------");


        for (var index in roomList) {


            messageLog("-------------------------------------------------------");
            messageLog("looping in the room objects to add participant");
            messageLog(" to the available list");
            messageLog("-------------------------------------------------------");


            messageLog("room Index" + index);
            messageLog("room length" + roomList.length);
            messageLog(JSON.stringify(roomList));

            if (roomList[index].getRoomId() == data.roomId) {

                messageLog("user " + data.participantId + " just connected to room: " + roomList[index].getRoomId());

                //create a participant

                var participant = new Participant();

                //get participant info

                messageLog("participant in roomlist:" + index);
                messageLog(roomList[index].getRoomParticipants());
                var roomParticipant = [];
                roomParticipant = roomList[index].getRoomParticipants();

                for (var j in roomParticipant) {

                    messageLog("setting participant:" + j + " information");

                    messageLog(roomParticipant[j]);

                    var aRoomParticipant = {};
                    aRoomParticipant = JSON.parse(roomParticipant[j]);

                    messageLog(aRoomParticipant['userid']);
                    if (aRoomParticipant.userid == data.participantId) {

                        participant.addId(data.participantId);
                        participant.setFname(roomList[index].getRoomParticipants()[j].fname);
                        participant.setLname(roomList[index].getRoomParticipants()[j].lname);
                        participant.setUserName(roomList[index].getRoomParticipants()[j].username);
                        participant.setSocketId(socket.userid);
                        participant.setRoomID(roomList[index].getRoomId());

                        roomList[index].addToAvailableList(participant);

                        connectionQueue.push(participant);

                        messageLog("Partcipant was added to the available list: ");
                        messageLog(roomList[index].getAvailableList().length);
                        messageLog(JSON.stringify(participant));
                        messageLog(JSON.stringify(roomList[index].getAvailableList()));

                        messageLog("connectionQueue list : ");
                        messageLog(JSON.stringify(connectionQueue));
                        messageLog(connectionQueue.length);

                    }

                }


            }
        }

    });

    socket.on('candidate', function (data) {
        console.log("receive and broadcasting a candidate");

            socket.broadcast.emit('messages',{type:'candidate', value: data.value, participantId:data.participantId});
           });

    socket.on('established', function (data) {
        connectionFlag = data.connectionFlag; //set the connection flag to Done

    });



    socket.on('offer', function (data) {

        messageLog("offer receive from: " + socket.userid);
        var input=JSON.parse(data.value)
        tempConnectionSession.setLocalSDP(input.sdp);
        connectionFlag = data.connectionFlag;

//        if (data.type == 'caller') {
//            owner = data.value;
//            socket.username = 'caller';
//            participant.push(new Participant(socket.userid, 'owner'));
//            messageLog(owner);
//            messageLog(participant);
//        }
    });

    socket.on('answer', function (data) {


        messageLog("answer receive from :" + socket.userid);
        var input=JSON.parse(data.value);

        tempConnectionSession.setRemoteSDP(input.sdp);

        io.sockets.socket(data.to).emit('messages', {type: "answer", value:data.value, participantId:tempConnectionSession.getRemoteParticipant().getUserId()});
        connectionFlag = data.connectionFlag;
//        if (data.type == 'callee') {
//            socket.username = 'callee';
//            participant.push(new Participant(socket.userid, 'callee'));
//
//            messageLog(participant);
//            socket.broadcast.emit('messages', {type: 'arrived'});
//
//
//        }

        /* if (owner=='join' && participant.length>2 && connect_start==''){

         messageLog("room owner and participant are present");
         socket.broadcast.emit('messages',{type:'arrived'});
         connect_start='true';

         }*/

    });

//    socket.on('offer', function (data) {
//
//        messageLog("got offer : " + data);
//        socket.broadcast.emit('messages', {type: 'onOffer', value: data.value});
//    });
//
//    socket.on('answer', function (data) {
//
//        messageLog("got answer: " + data);
//        socket.broadcast.emit('messages', {type: 'answer', value: data.value});
//    });


    socket.on('sendChat', function (data) {
        console.log("got a chat message message");

        // we tell the client to execute 'updatechat' with 2 parameters
        io.sockets.emit('updatechat', socket.username, data);
    });


    socket.on('messages', function (data) {
        console.log("got a message");

    });


    socket.on('onSlideChange', function (data) {

        console.log('slide has been changed');

        socket.broadcast.emit('slideChange', {previousSlide: data.previousSlide, currentSlide: data.currentSlide});
    });

    socket.on('onPreziChange', function (data) {

        console.log('Prezi slide has been changed');
        console.log(data.value);
        socket.broadcast.emit('preziChange', {value: data.value});

    });

});

function messageLog(message) {
    var date = new Date();
    console.log(date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + " Logging message : " + message)

}

function Participant(id, type, status) {
    this.userid = id;
    this.type = type;
    this.status = status;
}


function getUserInfo() {

    var options = {
        host: 'localhost',
        port: 8181,
        path: '/MWVCAppAPI/webresources/user/3',
        method: 'GET'
    };


    try {
        var req = http.request(options, function (res) {
//        console.log('STATUS: ' + res.statusCode);
            //      console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
            });
        }).end();

    }
    catch (err) {
        messageLog(err);
    }


}


function getRoomInfo(roomId, userId, Room, response, next) {

    var options = {
        host: 'localhost',
        port: 8181,
        path: '/MWVCAppAPI/webresources/room/' + roomId,
        method: 'GET'
    };


    try {

        var req = http.request(options, function (res) {
            //console.log('STATUS: ' + res.statusCode);
            //console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');

            res.on('data', function (chunk) {

                var data = JSON.parse(chunk);
                console.log('BODY: ' + chunk);


                if (containsObject(roomId, roomList)) {


                    messageLog("-------------------------------------------------------");
                    messageLog("Room Already Exist")
                    messageLog("-------------------------------------------------------");


                } else {

                    messageLog("-------------------------------------------------------");
                    messageLog("Creating room object and adding it to the roomList")
                    messageLog("-------------------------------------------------------");


                    Room.setRoomId(roomId);
                    Room.setOnlineClassID(data.onlineClassid);
                    Room.setRoomParticipants(data.roomParticipants);

                    roomList.push(Room);

                    messageLog("online ClassID " + Room.getOnlineClassID());
                    messageLog("Room Participants " + Room.getRoomParticipants());

                }


                //Do something; call next() when done.
                var roomid = roomId;
                console.log("roomID :" + roomid);
                // getUserInfo();
                response.render('virtualClassTV', {roomId: roomId, userId: userId});
                response.end;
            });
        }).end();

    }
    catch (err) {
        messageLog(err);
    }


}


function connectionHandler() {

    messageLog("handler is activated");
    messageLog("Connection Flag Value:" + connectionFlag);
    messageLog("--------------------------------------------")
    messageLog("Connection List:")
    messageLog(JSON.stringify(connectionSessionList));

    if (connectionQueue.length > 0) {

        if (connectionFlag == "Free") {

            for (var i in roomList) {


                messageLog("-------------------------------------------------------");
                messageLog("checking to see which room the participant in the connection queues want to create peer seesions");


                messageLog("-------------------------------------------------------");

                messageLog(JSON.stringify(connectionQueue));
                messageLog(connectionQueue[0].getRoomID());
                messageLog(roomList[i].getRoomId());

                if (fullyMeshed(connectionQueue[0], i)) {

                    messageLog("the participant :");
                    messageLog(JSON.stringify(connectionQueue[0]));
                    messageLog("is fully meshed to the other participant in the room");

                    connectionQueue.shift();

                } else if (roomList[i].getAvailableList().length > 1 && connectionQueue[0].getRoomID() == roomList[i].getRoomId()) {
                    messageLog("-------------------------------------------------------");
                    messageLog("room in roomlist that match id : " + JSON.stringify(roomList[i]));
                    messageLog(" starting to establish connection  between the paricipants in rooms; roomList[" + i + "]");
                    messageLog("-------------------------------------------------------");


                    //var availableParticipants = roomList[i].getAvailableList();


                    //create a connection session
                    var aConnectionSession = new ConnectionSession();
                    //create a counter object
                    var aConnectionCounter = new ConnectionCounter();

                    aConnectionCounter.setRoomId(connectionQueue[0].getRoomID());

                    aConnectionSession.addRoomId(connectionQueue[0].getRoomID());
                    aConnectionSession.setRoomIndex(i);

                    aConnectionSession.setLocalSocketID(connectionQueue[0].getSocketID());
                    aConnectionSession.addLocalParticipant(connectionQueue[0]);
                    //ADD CONNECTION TO LIST
                    connectionSessionList.push(aConnectionSession);
                    //add counter to list
                    connectionCounterList.push(aConnectionCounter);


                    tempConnectionSession = aConnectionSession;

                    //initialize the temporary participant available list
                    tempRoomParticipantAvailableList = clone(roomList[i].getAvailableList());
                    messageLog("-------------------------------------------------------");
                    messageLog("Connection Session Info: " + JSON.stringify(aConnectionSession));
                    messageLog("Connection counter Info: " + JSON.stringify(aConnectionCounter));
                    messageLog("temporary connection session Info: " + JSON.stringify(tempConnectionSession));
                    messageLog("-------------------------------------------------------");

                    messageLog("-------------------------------------------------------");
                    messageLog("Sending the request for offer to the socket : " + connectionQueue[0].getSocketID());
                    messageLog("-------------------------------------------------------");
                    io.sockets.socket(connectionQueue[0].getSocketID()).emit('message', {type: 'requestOffer', sockerId: connectionQueue[0].getSocketID()});
                    connectionFlag = "busy";

                }

            }
        } else if (connectionFlag == "initiate") {


            //updating the tmporary participant available list in case someone join the room
//            if (!(tempRoomParticipantAvailableList.length == roomList[tempConnectionSession.getRoomIndex()].getAvailableList().length)) {
//                tempRoomParticipantAvailableList = clone(roomList[tempConnectionSession.getRoomIndex()].getAvailableList());
//            }

            tempRoomParticipantAvailableList = checkIfInRoomConnectionSession(tempConnectionSession.getRoomId(), tempConnectionSession.getLocalParticipant().getUserId(), tempRoomParticipantAvailableList[0].getUserId(), clone(roomList[tempConnectionSession.getRoomIndex()].getAvailableList()));

            if (tempRoomParticipantAvailableList.length > 0) {

                messageLog("-------------------------------------------------------");
                messageLog("temp Room Participant available list socket ID");
                messageLog(tempRoomParticipantAvailableList[0].getSocketID());

                messageLog("temp connection session localsocket ID");
                messageLog(tempConnectionSession.getLocalSocketID());
                messageLog("-------------------------------------------------------");

                if (tempRoomParticipantAvailableList[0].getSocketID() == tempConnectionSession.getLocalSocketID()) {

                    messageLog("-------------------------------------------------------");
                    messageLog("this is the same participant as in the queue list");
                    messageLog("-------------------------------------------------------");
                    retreiveCounter(tempConnectionSession.getRoomId()).increaseCounter();


                    messageLog("-------------------------------------------------------");
                    messageLog("retrieve the new counter valuew for the room");
                    messageLog("-------------------------------------------------------");
                    messageLog(JSON.stringify(retreiveCounter(tempConnectionSession.getRoomId())));


                    //tempRoomParticipantAvailableList.shift();

                    messageLog("-------------------------------------------------------");
                    messageLog("getting the new temp room participant availablelist");
                    messageLog("-------------------------------------------------------");
                    messageLog(JSON.stringify(retreiveCounter(tempConnectionSession.getRoomId())));


                } else {

                    messageLog("-------------------------------------------------------");
                    messageLog("this is a different participant from the queue list")
                    messageLog("-------------------------------------------------------");
                    messageLog("-------------------------------------------------------");
                    messageLog("Now asking for a peer to generate answers");
                    messageLog("-------------------------------------------------------");


                    tempConnectionSession.setRemoteSocketID(tempRoomParticipantAvailableList[0].getSocketID());//setting te
                    tempConnectionSession.addRemoteParticipant(tempRoomParticipantAvailableList[0]);//adding the remote participant information
                    io.sockets.socket(tempConnectionSession.getRemoteSocketID()).emit('message', {type: "requestAnswer", participantId:tempConnectionSession.getLocalParticipant().getUserId(),offerId:tempConnectionSession.getLocalSocketID(),value:JSON.stringify(tempConnectionSession.getLocalSDP())});
                    messageLog("-------------------------------------------------------");
                    messageLog("retrieve the counter for the room");
                    messageLog("-------------------------------------------------------");
                    messageLog(JSON.stringify(retreiveCounter(tempConnectionSession.getRoomId())));

                    retreiveCounter(tempConnectionSession.getRoomId()).increaseCounter();

                    messageLog("-------------------------------------------------------");
                    messageLog("retrieve the new counter valuew for the room");
                    messageLog("-------------------------------------------------------");
                    messageLog(JSON.stringify(retreiveCounter(tempConnectionSession.getRoomId())));


                    //tempRoomParticipantAvailableList.shift();
                    connectionFlag = "busy";

                }
//                messageLog("-------------------------------------------------------");
//                messageLog("Now asking for a peer to generate answers");
//                messageLog("-------------------------------------------------------");
//
//                tempConnectionSession.setRemoteSocketID(tempRoomParticipantAvailableList[0].getSocketID());
//                io.sockets.socket(tempConnectionSession.getRemoteSocketID()).emit('message', {type: "requestAnswer"});
//                messageLog("-------------------------------------------------------");
//                messageLog("retriive the counter for the room");
//                messageLog("-------------------------------------------------------");
//                mecssageLog(JSON.stringify(retreiveCounter(tempConnectionSession.getRoomId())));
//
//                retreiveCounter(tempConnectionSession.getRoomId()).increaseCounter();
//                tempRoomParticipantAvailableList.shift();

            }


        } else if (connectionFlag == "Done") {


            messageLog("----------------------------------------------------------------------------------------------------------------------------------------------");
            messageLog("a connection session has finished between participant " + tempConnectionSession.getLocalSocketID() + " and" + tempConnectionSession.getRemoteSocketID());
            messageLog("----------------------------------------------------------------------------------------------------------------------------------------");


            messageLog("Counter value :");
            messageLog(retreiveCounter(tempConnectionSession.getRoomId()).getCounter());

            messageLog("RoomList length :");
            messageLog(JSON.stringify(roomList[tempConnectionSession.getRoomIndex()].getAvailableList()));

            connectionFlag = "Free";

            //for (var i in roomList) {

            // if (tempConnectionSession.getRoomId() == roomList[i].getRoomId()){

            if (retreiveCounter(tempConnectionSession.getRoomId()).getCounter() == roomList[tempConnectionSession.getRoomIndex()].getAvailableList().length - 1) {
                retreiveCounter(tempConnectionSession.getRoomId()).resetCounter();
                connectionQueue.shift();
            }

//        }
//            }

        }


    }


//    if (connectionSessionList>0){
//
//        for (var i in roomList){
//
//            if(tempConnectionSession.getRoomId=roomList[i].getRoomId)
//
//                if ( retreiveCounter(tempConnectionSession.getRoomID).getCounter() == roomList[i].getAvailableList().length - 1) {
//                    retreiveCounter(tempConnectionSession.getRoomID).resetCounter();
//                    connectionQueue.shift();
//                }
//
//
//        }
//    }


}


function retreiveCounter(roomid) {

    var counter = {};

    for (var index in connectionCounterList) {

        if (connectionCounterList[index].getRoomId() == roomid) {
            counter = connectionCounterList[index];
        }

        return counter;
    }

}

/**
 * Checks to see if the room contains this object
 * @param obj
 * @param list
 * @returns {boolean}
 */
function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].getRoomId() == obj) {
            return true;
        }
    }

    return false;
}

/**
 * deep cloning of objects in Javascript
 * @param obj
 * @returns {*}
 */
function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    //if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
//    if (obj instanceof Date) {
//        copy = new Date();
//        copy.setTime(obj.getTime());
//        return copy;
//    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone2(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var prop in obj) {
            copy[prop] = obj[prop];
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}


function clone2(obj) {

    var copy = {};
    for (var prop in obj) {
        copy[prop] = obj[prop];
    }
    return copy;
}


function validateConnectionSession() {


    if (connectionQueue[0].getRoomID == tempConnectionSession.getRoomId) {

    }


}

/**
 * this function will remove the element from the available list
 * @param id
 * @param obj
 */
function purgeTempRoomAvailableList(id, obj) {


    messageLog("---------------------------------------------------------------");
    messageLog("before removing the purge :");
    messageLog(JSON.stringify(obj));
    messageLog("---------------------------------------------------------------");

    for (var index in obj) {

        messageLog(obj[index].userid);

        if (obj[index].userid == id) {
            obj.splice(index, 1);
            messageLog("---------------------------------------------------------------");
            messageLog("after the purge:");
            messageLog(JSON.stringify(obj));
            messageLog("---------------------------------------------------------------");
        }

    }

}
/**
 * this method checks to see which participant has
 * already been connected to another participant
 * and purge the temporary connection list
 *
 * @param roomId
 * @param localId
 * @param remoteId
 * @param availableList
 * @returns {*}
 */
function checkIfInRoomConnectionSession(roomId, localId, remoteId, availableList) {

    var copy = availableList;

    messageLog("---------------------------------------------------------------");
    messageLog("before removing the local id and remote id in the checking section:");
    messageLog("room ID:" + roomId);
    messageLog("localId:" + localId);
    messageLog("remoteID:" + remoteId);
    messageLog(JSON.stringify(copy));
    messageLog("---------------------------------------------------------------");

    for (var index in connectionSessionList) {

        if (connectionSessionList[index].getRoomId() == roomId) {
            messageLog("kote mwen gen erreur la");
            messageLog(JSON.stringify(connectionSessionList[index].getLocalParticipant()));
            messageLog(JSON.stringify(connectionSessionList[index].getRemoteParticipant()));

            if (!(isEmpty(connectionSessionList[index].getLocalParticipant())) && !(isEmpty(connectionSessionList[index].getRemoteParticipant()))) {


                if ((connectionSessionList[index].getLocalParticipant().getUserId() == localId && connectionSessionList[index].getRemoteParticipant().getUserId() == remoteId) || (connectionSessionList[index].getLocalParticipant().getUserId() == remoteId && connectionSessionList[index].getRemoteParticipant().getUserId() == localId)) {

                    purgeTempRoomAvailableList(remoteId, copy);//remove the already connected one
                    purgeTempRoomAvailableList(localId, copy);//remove the local connection in this copy

                    messageLog("---------------------------------------------------------------");
                    messageLog("after removing the local id and remote id in the checking section:");
                    messageLog(JSON.stringify(copy));
                    messageLog("---------------------------------------------------------------");

                    return copy;
                }

            }


        }

    }

    return copy;

}


/**
 * this function is looking if the
 * participant is already connected to
 * all the available participant in the room
 *
 * @param participant
 * @param roomIndex
 * @returns {boolean}
 */
function fullyMeshed(participant, roomIndex) {


    messageLog("checking to see if the participant is fully meshed");
    var count = 0;


    var array = roomList[roomIndex].getAvailableList()
    for (var index in array) {

        if (array[index].userid != participant.getUserId()) {

            if (hasAConnection(array[index].userid, participant.getUserId(), participant.getRoomID())) {

                count++;
            }

        }
    }

    if (count == array.length - 1) {
        return true;
    }

    return false;


}


/**
 * check if the participant has a particular connection
 *  with another participant already
 *
 * @param localId
 * @param remoteId
 * @param roomId
 * @returns {boolean}
 */
function hasAConnection(localId, remoteId, roomId) {


    for (var index in connectionSessionList) {

        if (connectionSessionList[index].getRoomId() == roomId) {

            if (!(isEmpty(connectionSessionList[index].getLocalParticipant())) && !(isEmpty(connectionSessionList[index].getRemoteParticipant()))) {

                if ((connectionSessionList[index].getLocalParticipant().getUserId() == localId && connectionSessionList[index].getRemoteParticipant().getUserId() == remoteId) || (connectionSessionList[index].getLocalParticipant().getUserId() == remoteId && connectionSessionList[index].getRemoteParticipant().getUserId() == localId)) {

                    return true;
                }

            }


        }

    }

    return false;
}


/**
the functions below was taken from
Stack overflow website
the li nk is : http://stackoverflow.com/questions/4994201/is-object-empty
Code provided by :Sean Vieira feb 14 2011 at 15:57
 **/

// Speed up calls to hasOwnProperty

var hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}