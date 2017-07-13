function toggle_running_state(x) { // true or false
	if(x)
	{
		$("#running_state").text("Running");
		editor.setReadOnly(true);
		editor.renderer.$cursorLayer.element.style.display="none";

		if(Global.status == "debugging") {
			$("#stop_button").prop('disabled', false);
			$("#step_debugger").prop('disabled', false);
			$("#stepnr").prop('disabled', false);
			$("#next_debugger").prop('disabled', false);
			$("#nextnr").prop('disabled', false);
			$("#continue_debugger").prop('disabled', false);
			$("#continuenr").prop('disabled', false);
		}
	}
	else
	{
		$("#running_state").text("Stopped");
		editor.setReadOnly(false);
		editor.renderer.$cursorLayer.element.style.display="";
		$("#stop_button").prop('disabled', true);
		$("#step_debugger").prop('disabled',true);
		$("#next_debugger").prop('disabled',true);
		$("#continue_debugger").prop('disabled',true);
	}
}

var makers = {};
var debuggerLine;
var crtLineMarker;

$("#compile_code_button").click(function() {

});

$("#debug_code_button").click(function() {
    Global.status = "debugging";
    startDebugging();
});

$("#run_code_button").click(function() {
    Global.status = "running";
    startDebugging();
});

function startDebugging() {
    var code = editor.getValue();
	waitingDialog.show('Compiling...');
    socket.emit("code",code);
}

$("#step_debugger").click(function() {
    stepDebugger();
});
$("#next_debugger").click(function(){
	nextDebugger();
});
$("#continue_debugger").click(function(){
    continueDebuger();
});
$("#stop_button").click(function(){
	socket.emit("stop");
	toggle_running_state(false);
});

$("#save_code").click(function() {
    var cod = editor.getValue();
    socket.emit('save_code', cod);
});

function stepDebugger() {
	var stepnr = $("#stepnr").val();
	socket.emit("stepn", {
		watches: expresionList,
		n: stepnr
	});
}

function nextDebugger() {
	var nextnr = $("#nextnr").val();
	socket.emit("nextn", {
		watches: expresionList,
		n: nextnr
	});
}

function continueDebuger() {
	console.log('CONTINUEEE');
	var contnr = $("#continuenr").val();
	socket.emit("continuen", JSON.stringify({
		watches: expresionList,
		n: contnr
	}));
}

var Range = ace.require('ace/range').Range;

function moveHighlight(row) {
    if (crtLineMarker != null) {
        editor.getSession().removeMarker(crtLineMarker);
    }
    crtLineMarker = editor.getSession().addMarker(new Range(row, 0, row, 1), "myMarker", "fullLine");
}

function highLine(row) {
    marker = editor.getSession().addMarker(new Range(row, 0, row, 1),"myMarker","fullLine");
}
