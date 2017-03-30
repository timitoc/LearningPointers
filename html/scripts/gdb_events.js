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
socket.on("gdb_stdout",function(data){
    $("#output").append(data);
});
socket.on("gdb_stderr",function(data){
    $("#output").append(data);
});
socket.on('request_expressions_response',function(data){
<<<<<<< HEAD
		alert(data);
=======
	updateWatchesData(data);
>>>>>>> 4246577605b73da227842d3946c0d658796bb3eb
});
