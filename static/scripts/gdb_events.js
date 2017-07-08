var socket = io();

$("#stop_button").prop('disabled', true);
$("#step_debugger").prop('disabled', true);
$("#next_debugger").prop('disabled', true);
$("#continue_debugger").prop('disabled', true);
$("#pls").prop('disabled', true);

function sendCommand(comand) {
    socket.emit("gdb_command", comand);
}

$("#send_command").click(function(){
    var cmd = $("#gdb_command").val();
    sendCommand(cmd);
});

socket.on("program_stdout", function(data){
	$("#output").val(data);
});

socket.on("compile_result",function(data){
	waitingDialog.hide();
	$("#errors").text(data);
	$("#compilation_error_modal").modal();

	if(data == "Successfully compiled!"){
		console.log("Sucessfully compiled!");
		var brArray = [];
		if (Global.status == "debugging")
			brArray = Global.breakpointsArray;
		socket.emit("run", {
			br: brArray,
			we: expresionList,
			input: $("#input").val()
		});
	}
	else {
		console.log("Compilation error!");
		Global.status = "off";
	}
});

socket.on('debug', function(data){
	console.log(data);
	if(data.line){
		moveHighlight(data.line-1);
	}
});

socket.on('gdb_stdout', function(data){
	console.log(data);
});

socket.on('gdb_stderr', function(data){
	console.log(data);
});

socket.on("step", function(data){
    console.log("step data: " + JSON.stringify(data));
	recievedData(data.watches);
    moveHighlight(data.line-1);
});

socket.on("next", function(data){
	console.log("next data: " + JSON.stringify(data));
	recievedData(data.watches);
    moveHighlight(data.line-1);
});
socket.on("continue", function(data){
	console.log("continue data: " + JSON.stringify(data));
	recievedData(data.watches);
    moveHighlight(data.line-1);
});

socket.on("print_expressions", function(data){
	console.log("print expressions " + JSON.stringify(data));
    recievedData(data);
});

function recievedData(dataWatches) {
	if (dataWatches) {
		updateWatchesData(dataWatches);
		simpleVar.updateVarData(dataWatches);
		pointerVar.updateVarData(dataWatches);
		memoryHandler.gatherVarData();
	}
}

socket.on('add_watch', function(data){
    console.log("add watch " + JSON.stringify(data));
    var x = {};
    x[data.result.expr] = data.result.value;
    recievedData(x);
});

socket.on('run', function(data){
	console.log("RUN " + JSON.stringify(data));
	if(data.line)
		moveHighlight(data.line-1);
	if (Global.status == "debugging") {
		$("#step_debugger").prop('disabled', false);
		$("#next_debugger").prop('disabled', false);
		$("#continue_debugger").prop('disabled', false);
		$("#stop_button").prop('disabled', false);
		$("#pls").prop('disabled', false);
	}
});

socket.on('code_saved', function(data) {
	data = data.id;
	alert("Code successfully saved as http://localhost:3000/code/" + data);
});

socket.on('editor_source', function(data){
	console.log('Recieved' + data);
	editor.setValue(data, 1);
});

socket.on('add_breakpoints_result', function(data){
    console.log('add_breakpoints_result ' + JSON.stringify(data));
});
