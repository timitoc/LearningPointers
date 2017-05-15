var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/c_cpp");

//editor.setAutoScrollEditorIntoView(true);
editor.setOption("maxLines", 30);
editor.setOption("minLines", 30);

var vim_enabled = false;

var persistentBreakpoints = [];

$("#enable_vim").change(function(){
	if(!vim_enabled)
		editor.setKeyboardHandler("ace/keyboard/vim");
	else editor.setKeyboardHandler("ace/keyboard/textinput");

	vim_enabled = !vim_enabled;
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
        persistentBreakpoints.push(row+1);
    }
    else {
        editor.session.clearBreakpoint(row);
        //socket.emit("remove_breakpoint", row+1);
        sendCommand("clear " + (row+1));
        var index = persistentBreakpoints.indexOf(row+1);
        if (index >= 0)
            persistentBreakpoints.splice(index, 1);
    }
}
