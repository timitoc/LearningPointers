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
});

$("#save_code").click(function() {
    var cod = editor.getValue();
    socket.emit('save_code', cod);
});

function stepDebugger() {
    socket.emit("step", expresionList);
}

function nextDebugger() {
    socket.emit("next", expresionList);
}

function continueDebuger() {
    socket.emit("continue", expresionList);
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
