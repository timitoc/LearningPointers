var socket = io();

function sendCommand(comand) {
    socket.emit("gdb_cmd", comand);
}

$("#send_command").click(function(){
    var cmd = $("#gdb_command").val();
    sendCommand(cmd);
});

socket.on("compile_error",function(data){
    alert(data);
});
socket.on("compile_success",function(data){
    alert(data);
});
socket.on("step", function(data){
    console.log("step data: " + JSON.stringify(data));
    updateWatchesData(data.display_variables);
    simpleVar.updateVarData(data.display_variables);
    pointerVar.updateVarData(data.display_variables);
    memoryHandler.gatherVarData();
    moveHighlight(data.line-1);
});
socket.on("next", function(data){
    alert(data);
});
socket.on("continue", function(data){
    alert(data);
});
socket.on("gdb_stdout",function(data){
    $("#output").append(data);
});
socket.on("gdb_stderr",function(data){
    $("#output").append(data);
});
socket.on('request_expressions_response',function(data){
	updateWatchesData(data);
});
socket.on('post_watch_added', function(data){
    console.log(data);
    var x = {};
    x[data.expr] = data.value;
    updateWatchesData(x);
    simpleVar.updateVarData(x);
    pointerVar.updateVarData(x);
    memoryHandler.gatherVarData();
});