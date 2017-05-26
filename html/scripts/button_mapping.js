var breakpointList = [];
var makers = {};
var debuggerLine;
var crtLineMarker;

$("#compile_code_button").click(function() {
    var code = editor.getValue();
    socket.emit("code",code);
});
$("#run_code_button").click(function() {
    socket.emit("run");
});
$("#debug_code_button").click(function() {
    if (breakpointList.length > 0)
        sendCommand("run");
    else {
        addBreakpoint();
        sendCommand("run");
    }
})
$("#add_breakpoint_button").click(function() {
    var pos = editor.getCursorPosition();
    var crtRow = parseInt(pos.row)+1;
    toggleBreakpoint(crtRow-1);
})
$("#step_debugger").click(function() {
    stepDebugger();
    requestUpdateWatches();
});
$("#next_debugger").click(function(){
	socket.emit("next");	
    requestUpdateWatches();
});
$("#continue_debugger").click(function(){
	socket.emit("continue");		
	requestUpdateWatches();
});
$("#stop_button").click(function(){
	socket.emit("stop");
});

$("#expressions_button").click(function(){
    var expr = prompt('Enter some expressions','').split(',');
    socket.emit('add_watch',expr);
});

let temp = 2;

function stepDebugger() {
    socket.emit("step");
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
