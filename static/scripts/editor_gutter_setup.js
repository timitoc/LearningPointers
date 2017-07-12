function setGutterInteractions() {
    console.log("Setting gutter interactions");

    // Inspired by https://groups.google.com/forum/#!topic/ace-discuss/mRIXzXwYrnk
    var bracketMarker, range
    var gutter = editor.renderer.$gutterLayer
    editor.on("guttermousemove", function(e) {
        var gutterRegion = gutter.getRegion(e);
        if (gutterRegion == "foldWidgets") {
            var row = e.getDocumentPosition().row;
            if (!range || range.start.row >= row || range.end.row <= row) {
                var session = editor.session;
                range = session.getParentFoldRangeData(row).range || session.getFoldWidgetRange(row);
            }
        } 
        else if (gutterRegion == "markers") {
            moveInRegion(e);
            range = null;       
        }
        else
            range = null;
        if (bracketMarker) { editor.session.removeMarker(bracketMarker); }    
        bracketMarker = range && editor.session.addMarker(range, "ace_bracket", "fullLine");
    });

    editor.renderer.$gutter.addEventListener("mouseout", function() {
        editor.session.removeMarker(bracketMarker); 
        bracketMarker = null
    });

    editor.on("guttermousedown", function (e) {
        var row = e.getDocumentPosition().row;
        var gutterRegion = editor.renderer.$gutterLayer.getRegion(e);
        if (gutterRegion == "foldWidgets") {
            //console.log("Folding");
        }
        else {
            toggleBreakpoint(row);
        }
    });

}



/// Breakpoint options

var BROShown = -1;

function moveInRegion(e) {
    var position = e.getDocumentPosition();
    //console.log(JSON.stringify(position));
    if (BROShown == position.row)
        return ;
    var divid = "breakpoint_options";
    var breakpoints = editor.session.getBreakpoints(position.row, 0);
    if (typeof breakpoints[position.row] == typeof undefined) {
        BROShown = -1;
        $("#"+divid).hide();
        return;
    }
    BROShown = position.row;
    var left = (e.clientX+2) + "px"; 
    var top = (e.clientY+2) + "px"; 
    
    $("#"+divid).css('left',left); 
    $("#"+divid).css('top',top); 
    $("#"+divid).show();

    //$("#"+divid).toggle(); 
}