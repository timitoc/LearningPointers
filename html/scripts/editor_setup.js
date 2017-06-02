var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/c_cpp");

//editor.setAutoScrollEditorIntoView(true);
editor.setOption("maxLines", 23);
editor.setOption("minLines", 30);

editor.setOptions({
	fontSize: "13pt"
});

var vim_enabled = false;

function toggle_vim(){
	if(!vim_enabled)
		editor.setKeyboardHandler("ace/keyboard/vim");
	else editor.setKeyboardHandler("ace/keyboard/textinput");

	vim_enabled = !vim_enabled;
}


$("#enable_vim").change(function(){
	toggle_vim();
});


ace.require("ace/ext/language_tools");
// enable autocompletion and snippets
editor.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
});

editor.on("guttermousedown", function(e) {	
    var row = e.getDocumentPosition().row;
    toggleBreakpoint(row);	
});

function toggleBreakpoint(row) {
    var breakpoints = editor.session.getBreakpoints(row, 0);
    if(typeof breakpoints[row] === typeof undefined) {
        editor.session.setBreakpoint(row);
        //socket.emit("add_breakpoint", row+1);
        sendCommand("b " + (row+1));
    }
    else {
        editor.session.clearBreakpoint(row);
        //socket.emit("remove_breakpoint", row+1);
        sendCommand("clear " + (row+1));
    }
}
