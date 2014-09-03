/**
 * Created by kawibi on 8/13/2014.
 */
function Participant(){

    this.userid=0;
    this.peerConnection={};
    this.roomID=0;
    this.type="";
    this.socketId=0;
    this.fname="";
    this.lname="";
    this.username="";


}


Participant.prototype.getRoomID=function(){
    return this.roomID;
}

Participant.prototype.setRoomID=function(roomId){
    this.roomID=roomId;
}


Participant.prototype.getFname=function(){
    return this.fname;
}

Participant.prototype.setFname=function(fname){
    this.fname=fname;
}

Participant.prototype.getLname=function(){
    return this.lname;
}

Participant.prototype.setLname=function(lname){
    this.lname=lname;
}

Participant.prototype.getUserName=function(){
    return this.username;
}

Participant.prototype.setUserName=function(username){
    this.username=username;
}



Participant.prototype.getSocketID=function(){
    return this.socketId;
}

Participant.prototype.setSocketId=function(socketID){
    this.socketId=socketID;
}

Participant.prototype.addId=function(id){
    this.userid=id;
}



Participant.prototype.getUserId=function(){
    return this.userid;
}

Participant.prototype.addPeerConnection=function(pc){

    this.peerConnection=pc;
}

Participant.prototype.addType=function(type){
    this.type=type;
}

Participant.prototype.getId=function(){

    return this.userid;

}

Participant.prototype.getPeerConnection=function(){

    return this.peerConnection;
}




module.exports.Participant=Participant;