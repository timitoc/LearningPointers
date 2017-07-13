var editor = ace.edit("editor");

if (Cookies.get('theme')) {
    editor.setTheme(Cookies.get('theme'));
    if (Cookies.get('theme') == 'ace/theme/eclipse')
        $(".selectpicker option[value='light']").prop('selected', true);
    else $(".selectpicker option[value='dark']").prop('selected', true);
}
else {
    editor.setTheme("ace/theme/monokai");
    $(".selectpicker option[value='dark']").prop('selected', true);
}


ace.require("ace/ext/language_tools");

editor.getSession().setMode("ace/mode/c_cpp");

editor.setAutoScrollEditorIntoView(true);
editor.setOption("maxLines", 30);
editor.setOption("minLines", 25);
editor.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
    fontSize: "10pt"
});

$(".selectpicker").change(function (e) {
    if (this.value == "dark") {
        editor.setTheme("ace/theme/monokai");
        Cookies.set('theme', 'ace/theme/monokai');
    }
    else {
        editor.setTheme("ace/theme/eclipse");
        Cookies.set('theme', 'ace/theme/eclipse');
    }
});

var vim_enabled = false;

function toggle_vim() {
    if (!vim_enabled)
        editor.setKeyboardHandler("ace/keyboard/vim");
    else
        editor.setKeyboardHandler("ace/keyboard/textinput");
    vim_enabled = !vim_enabled;
}

$("#enable_vim").change(function () {
    toggle_vim();
});

editor.getSession().on('change', function () {
    //Cookies.set('code', editor.getValue());
	console.log('Changed');
	console.log(editor.getValue());
});

Array.prototype.myActualIndexOf = function(element){
    for (var i = 0; i < this.length; i++)
        if (Object.equals(this[i], element))
            return i;
    return -1;
}

setGutterInteractions();
function toggleBreakpoint(row) {
    var breakpoints = editor.session.getBreakpoints(row, 0);
    if (typeof breakpoints[row] === typeof undefined) {
        editor.session.setBreakpoint(row);
        if (Global.status === 'debugging') {
            console.log("epa");
            var tosa = [];
            tosa.push({ line: row + 1 });
            socket.emit("add_breakpoints", tosa);
        }
        Global.breakpointsArray.push({ line: row + 1 });
    }
    else {
        editor.session.clearBreakpoint(row);
        if (Global.status === 'debugging') {
            sendCommand("clear " + (row + 1));
        }
        var elem = {line: row+1};
        var index = Global.breakpointsArray.myActualIndexOf(elem);
        if (index >= 0)
            Global.breakpointsArray.splice(index, 1);
    }
}


/// Full screen logic (working only on mozzila)

var videoElement = editor.container;

function toggleFullScreen() {
    if (!document.mozFullScreen && !document.webkitFullScreen) {
        if (videoElement.mozRequestFullScreen) {
            videoElement.mozRequestFullScreen();
            editor.setOption("maxLines", 49);
            editor.setOption("minLines", 300);
        } else {
            videoElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
            editor.setOption("maxLines", 49);
            editor.setOption("minLines", 300);
        }
    }
    editor.resize();
}

document.addEventListener("mozfullscreenchange", function (event) {
    if (document.mozFullScreen);
    else {
        editor.setOption("maxLines", 30);
        editor.setOption("minLines", 30);
    }
    editor.resize();
});

var launcher = document.getElementById("full_screen");
launcher.onclick = function () {
    toggleFullScreen();
}
