var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/c_cpp");

//editor.setAutoScrollEditorIntoView(true);
editor.setOption("maxLines", 30);
editor.setOption("minLines", 30);

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
        sendCommand("b " + (row+1));
    }
    else {
        editor.session.clearBreakpoint(row);
        sendCommand("clear " + (row+1));
    }
}