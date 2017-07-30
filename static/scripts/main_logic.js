var Global  = {
    diplayIndexCounter: 0,
    breakpointsArray: [],
    breakpointsMap: {},
    status: 'off',
    codeBoundId: -1,
    htmlDecode: function(input)
    {
        var doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
    },
    setCodeBound: function(newId) {
        this.codeBoundId = newId;
        getEditorInstanceFromServer();
    } 
}

function getEditorInstanceFromServer() {
    if (Global.codeBoundId == -1) {
        editor.setValue(Cookies.get('code'), 1);
    }
    else {
        console.log('**********');
        waitingDialog.show('Getting saved code...');
        setTimeout(function(){ 
            socket.emit('get_code', {id: Global.codeBoundId});
        }, 3000);
    }
}

function populateEditorInstance(data) {
    console.log(JSON.stringify(data));
    editor.setValue(data.code, 1);
    if (data.breakpoints)
    for (var i = 0; i < data.breakpoints.length; i++) {
        var line = data.breakpoints[i].line;
        toggleBreakpoint(line-1);
        Global.breakpointsMap[line] = new BreakpointData(line, data.breakpoints[i].temporary, 
            data.breakpoints[i].condition);
    }
    var newData = [];
    if (data.watches)
    for (var i = 0; i < data.watches.length; i++) {
        var wtext = data.watches[i].expr;
        addWithBackup({text: wtext});
        newData.push({text: wtext});
    }
    jstreeElement.jstree(true).settings.core.data = newData;
    jstreeElement.jstree(true).refresh();
    doMagic();
}

var simpleVar = new MemoryVarHandler("Simple");
var pointerVar = new MemoryVarHandler("Pointer");

$( document ).ready(function() {
    toggle_running_state(false);
    wrapper1 = jQuery('<div/>');
    wrapper2 = jQuery('<div/>');

    wrapper1.css('display', 'inline-block');
    wrapper2.css('display', 'inline-block');

    simpleVar.init(wrapper1);
    pointerVar.init(wrapper2);

    initLeftPart();
    $("#left_content").append(wrapper1);
    $("#left_content").append(wrapper2);

    watchTable();
    var result = convertGDBToJSON("es = {fi = 0, se = 23}");
    console.log(JSON.stringify(result));
});

//https://stackoverflow.com/questions/1068834/object-comparison-in-javascript
Object.equals = function( x, y ) {
  if ( x === y ) return true;
  if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;
  if ( x.constructor !== y.constructor ) return false;
  for ( var p in x ) {
    if ( ! x.hasOwnProperty( p ) ) continue;
    if ( ! y.hasOwnProperty( p ) ) return false;
    if ( x[ p ] === y[ p ] ) continue;
    if ( typeof( x[ p ] ) !== "object" ) return false;
    if ( ! Object.equals( x[ p ],  y[ p ] ) ) return false;
  }
  for ( p in y ) {
    if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) return false;
  }
  return true;
}