var socket = io();

$("#run_code_button").prop('disabled', true);
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

socket.on("compile_error",function(data){
	waitingDialog.hide();

	$("#errors").text(data);
	$("#compilation_error_modal").modal();

	if(data == "Successfully compiled!"){
		console.log("Sucessfully compiled!");
		$("#run_code_button").prop('disabled', false);
		$("#step_debugger").prop('disabled', false);
		$("#next_debugger").prop('disabled', false);
		$("#continue_debugger").prop('disabled', false);
		$("#stop_button").prop('disabled', false);
		$("#pls").prop('disabled', false);
	}

	else console.log("Compilation error!");
});

socket.on("compile_success",function(data){
	$("#errors").text(data);
	$("#compilation_error_modal").modal();


	$("#run_code_button").prop('disabled', false);
	$("#step_debugger").prop('disabled', false);
	$("#next_debugger").prop('disabled', false);
	$("#continue_debugger").prop('disabled', false);
	$("#pls").prop('disabled', false);
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
	if(data.watches){
		updateWatchesData(data.watches);
		simpleVar.updateVarData(data.watches);
		pointerVar.updateVarData(data.watches);
		memoryHandler.gatherVarData();
	}
    moveHighlight(data.line-1);
});

socket.on("next", function(data){
	console.log(JSON.stringify(data));
	console.log("next data: " + JSON.stringify(data));
	if(data.watches){
		updateWatchesData(data.watches);
		simpleVar.updateVarData(data.watches);
		pointerVar.updateVarData(data.watches);
		memoryHandler.gatherVarData();
	}
    moveHighlight(data.line-1);
});
socket.on("continue", function(data){
	console.log("continue data: " + JSON.stringify(data));
	if(data.watches){
		updateWatchesData(data.watches);
		simpleVar.updateVarData(data.watches);
		pointerVar.updateVarData(data.watches);
		memoryHandler.gatherVarData();
	}
    moveHighlight(data.line-1);
});

function recievedData(data) {
    console.log(data);
    updateWatchesData(data);
    simpleVar.updateVarData(data);
    pointerVar.updateVarData(data);
    memoryHandler.gatherVarData();
}

socket.on("print_expressions", function(data){
	console.log("here print expr");
    recievedData(data);
});

socket.on('add_watch', function(data){
    console.log(JSON.stringify(data));
    var x = {};
    x[data.result.expr] = data.result.value;
    updateWatchesData(x);
    simpleVar.updateVarData(x);
    pointerVar.updateVarData(x);
    memoryHandler.gatherVarData();
});

socket.on('run', function(data){
	alert('RUN'+data);
	if(data.line)
		moveHighlight(data.line-1);
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
    console.log(data);
});
