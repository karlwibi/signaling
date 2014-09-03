
/**
 * Created by kawibi on 8/23/2014.
 */



function ConnectionCounter(){

    this.counter=0;
    this.roomSize=0;
    this.roomId=0;
}


ConnectionCounter.prototype.increaseCounter=function(){
    this.counter++;
}

ConnectionCounter.prototype.resetCounter=function(){
    this.counter=0;
}

ConnectionCounter.prototype.getCounter=function(){
    return this.counter;
}

ConnectionCounter.prototype.setRoomSize=function(roomSize){
    this.roomSize=roomSize;
}

ConnectionCounter.prototype.getRoomSize=function(){
    return this.roomSize;
}


ConnectionCounter.prototype.setRoomId=function(roomId){
    this.roomId=roomId;
}

ConnectionCounter.prototype.getRoomId=function(){
    return this.roomId;
}

module.exports.ConnectionCounter=ConnectionCounter;