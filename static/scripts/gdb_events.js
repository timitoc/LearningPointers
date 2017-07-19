var socket = io();

/*$("#stop_button").prop('disabled', true);
$("#step_debugger").prop('disabled', true);
$("#next_debugger").prop('disabled', true);
$("#continue_debugger").prop('disabled', true);
$("#pls").prop('disabled', true);
*/

toggle_running_state(false);

function sendCommand(comand) {
	socket.emit("gdb_command", comand);
}

function setVariable(expr, value) {
	socket.emit("set_var", {expr: expr, value: value});
}

$("#send_command").click(function(){
	var cmd = $("#gdb_command").val();
	sendCommand(cmd);
});

socket.on("program_stdout", function(data){
	$("#output").val(data);
});

//socket.on("running_state", function(data) {
//	console.log('RUNNING STATE', data);
//	switch(data) {
//		case "running":
//			$("#running_state").text("Running");
//			break;
//		case "stopped":
//			$("#running_state").text("Stopped");
//			break;
//	}
//});

socket.on("compile_result",function(data){
	waitingDialog.hide();

	if(data == "Successfully compiled!"){
		console.log("Sucessfully compiled!");
		socket.emit("run", {
			br: normalizeBreakpointMap(),
			we: expresionList,
			input: $("#input").val()
		});
		toggle_running_state(true);
	}
	else {
		console.log("Compilation error!");
		Global.status = "off";
		$("#errors").text(data);
		$("#compilation_error_modal").modal();
	}
});

socket.on('debug', function(data){
	console.log(data);
	if(data.line){
		moveHighlight(data.line-1);
	}
});

socket.on('gdb_stdout', function(data){
	if(data.indexOf("Inferior") !== -1) {
		toggle_running_state(false);
	}
});

socket.on('gdb_stderr', function(data){
	console.log(data);
	console.log("kkkkkkkkkk");
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

socket.on("set_var", function(data){
	console.log("set var event " + JSON.stringify(data));
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
	editor.setValue(data, 1);
	waitingDialog.hide();
});

socket.on('add_breakpoints_result', function(data){
	console.log('add_breakpoints_result ' + JSON.stringify(data));
});
