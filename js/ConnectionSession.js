/**
 * Created by kawibi on 8/13/2014.
 */
function ConnectionSession(){

    this.roomIndex=0;
    this.roomId=0;
    this.teacherId=0;
    this.localParticipant={};
    this.localSDP={};
    this.remoteSDP={};
    this.remoteParticipant={};
    this.localSocketId=0;;
    this.remoteSocketId=0;
    this.roomTotalActiveParticipant=0;
   // this.remoteParticipant=[];
    //this.pc=new RTCPeerConnection;



}



ConnectionSession.prototype.setRoomTotalActiveParticipant=function(roomTotalActiveParticipant){

    this.roomTotalActiveParticipant=roomTotalActiveParticipant;
}


ConnectionSession.prototype.getRoomTotalActiveParticipant=function(){

    return  this.roomTotalActiveParticipant;
}



ConnectionSession.prototype.setLocalSocketID=function(socketId){

    this.localSocketId=socketId;
}


ConnectionSession.prototype.getLocalSocketID=function(){

   return  this.localSocketId;
}


ConnectionSession.prototype.setRemoteSocketID=function(socketId){

    this.remoteSocketId=socketId;
}


ConnectionSession.prototype.getRemoteSocketID=function(){

    return  this.remoteSocketId;
}

ConnectionSession.prototype.setLocalSDP=function(SDP){

    this.localSDP=SDP;
}

ConnectionSession.prototype.getLocalSDP=function(){

    return this.localSDP;
}


ConnectionSession.prototype.setRemoteSDP=function(SDP){

    this.remoteSDP=SDP;
}

ConnectionSession.prototype.getRemoteSDP=function(){

    return this.remoteSDP;
}

ConnectionSession.prototype.addRoomId=function(roomtId){

    this.roomId=roomtId;
}

ConnectionSession.prototype.getRoomId=function(){

    return this.roomId;
}




ConnectionSession.prototype.setRoomIndex=function(roomIndex){

    this.roomIndex=roomIndex;
}

ConnectionSession.prototype.getRoomIndex=function(){

    return this.roomIndex;
}

ConnectionSession.prototype.addTeacherId=function(teacherId){
    this.teacherId= teacherId;
}

ConnectionSession.prototype.getTeacherId=function(){

    return this.teacherId;
}

ConnectionSession.prototype.addLocalParticipant=function(localParticipant){

    this.localParticipant=localParticipant;
}


ConnectionSession.prototype.getLocalParticipant=function(){

    return this.localParticipant;
}

ConnectionSession.prototype.addRemoteParticipant=function(remoteParticipant){

    this.remoteParticipant=remoteParticipant;
}


ConnectionSession.prototype.getRemoteParticipant=function(){

    return this.remoteParticipant;
}



ConnectionSession.prototype.addParticipant=function(participant){

    this.listOfParticipant.push(participant);
}

//ConnectionSession.prototype.getLocalParticipant=function(){
//
//
//    return this.localParticipant;
//}
//
//
//ConnectionSession.prototype.getRemoteParticipant=function() {
//
//
//    return this.localParticipant;
//
//}


ConnectionSession.prototype.getParticipant=function(id){

    var participant={};

    for(var index in this.listOfParticipant){

        if(this.listOfParticipant[index].userid=id){

            participant=this.listOfParticipant[index];

        }

    }

    return participant;
}

module.exports.ConnectionSession=ConnectionSession;



