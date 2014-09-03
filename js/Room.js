/**
 * Created by kawibi on 8/19/2014.
 */

function Room(){

    this.roomid=0;
    this.onlineClassId=0;
    this.roomParticipants=[];
    this.presentationInfo={};
    this.studyToolInfo={};
    this.availableList=[];
    this.teacherInfo={};
}

Room.prototype.getRoomId=function(){
    return this.roomid;
}

Room.prototype.setRoomId=function(roomId){
    this.roomid=roomId;
}

Room.prototype.getOnlineClassID=function(){

    return this.onlineClassId;

}

Room.prototype.setOnlineClassID=function(id){
    this.onlineClassId=id;
}

Room.prototype.getRoomParticipants=function(){

    return this.roomParticipants;
}

Room.prototype.setRoomParticipants=function(participants){
    this.roomParticipants=participants;
}

Room.prototype.getPresentationInfo=function(){
    return this.presentationInfo;
}


Room.prototype.getStudyToolInfo=function(){
    return this.studyToolInfo;
}


Room.prototype.getAvailableList=function(){
    return this.availableList;
}

Room.prototype.addToAvailableList=function(participant){
    this.availableList.push(participant);
}

Room.prototype.removeFromAvailableList=function(id){

    var index= this.availableList.length;

    while(index--){

        if (this.availableList[index].userid==id){
            this.availableList.splice(index,1);
        }
    }


}

Room.prototype.getTeacherInfo=function(){

    return this.teacherInfo;
}



module.exports.Room=Room;