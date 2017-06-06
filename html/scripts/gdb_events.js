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

socket.on("compile_error",function(data){
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

socket.on("step", function(data){
    console.log("step data: " + JSON.stringify(data));
    updateWatchesData(data.result.display_variables);
    simpleVar.updateVarData(data.result.display_variables);
    pointerVar.updateVarData(data.result.display_variables);
    memoryHandler.gatherVarData();
    moveHighlight(data.result.line-1);
});
socket.on("next", function(data){
	console.log("next data: " + JSON.stringify(data));
    updateWatchesData(data.result.display_variables);
    simpleVar.updateVarData(data.result.display_variables);
    pointerVar.updateVarData(data.result.display_variables);
    memoryHandler.gatherVarData();
    moveHighlight(data.result.line-1);
});
socket.on("continue", function(data){
	console.log("continue data: " + JSON.stringify(data));
    updateWatchesData(data.result.display_variables);
    simpleVar.updateVarData(data.result.display_variables);
    pointerVar.updateVarData(data.result.display_variables);
    memoryHandler.gatherVarData();
    moveHighlight(data.result.line-1);
});
socket.on("gdb_stdout",function(data){
    $("#output").append(data);
});
socket.on("gdb_stderr",function(data){
    $("#output").append(data);
});
// socket.on('add_watch',function(data){
// 	updateWatchesData(data);
// });
socket.on('add_watch', function(data){
    console.log(JSON.stringify(data));
    var x = {};
    x[data.result.expr] = data.result.value;
    updateWatchesData(x);
    simpleVar.updateVarData(x);
    pointerVar.updateVarData(x);
    memoryHandler.gatherVarData();
});

socket.on('code_saved', function(data) {
    if (data.status == false) {
        alert("saving failed");
    }
    else {
        alert("Code successfully saved as http://localhost:3000/code/" + data.id);
    }
});

socket.on('editor_source', function(data){
    console.log("editor: " + data);
});