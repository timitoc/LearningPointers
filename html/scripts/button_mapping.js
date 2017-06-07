var makers = {};
var debuggerLine;
var crtLineMarker;

$("#compile_code_button").click(function() {
    var code = editor.getValue();
	waitingDialog.show('Compiling...');
    socket.emit("code",code);
});

$("#run_code_button").click(function() {
    Global.status = 'debugging';
    socket.emit("run", {
		br:Global.breakpointsArray,
		we:expresionList,
		input: $("#input").val()
	});
});

$("#add_breakpoint_button").click(function() {
    var pos = editor.getCursorPosition();
    var crtRow = parseInt(pos.row)+1;
    toggleBreakpoint(crtRow-1);
})
$("#step_debugger").click(function() {
    stepDebugger();
});
$("#next_debugger").click(function(){
	nextDebugger();
});
$("#continue_debugger").click(function(){
	//socket.emit("continue");
	//requestUpdateWatches();
    continueDebuger();
});
$("#stop_button").click(function(){
	socket.emit("stop");
});

$("#expressions_button").click(function(){
    var expr = prompt('Enter some expressions','').split(',');
    socket.emit('add_watch',expr);
});

$("#save_code").click(function() {
    var cod = editor.getValue();
    socket.emit('save_code', cod);
});
let temp = 2;

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
