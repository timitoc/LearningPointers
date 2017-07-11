function setGutterInteractions() {
    console.log("Setting gutter interactions");
    var marker, range
    var gutter = editor.renderer.$gutterLayer
    editor.on("guttermousemove", function(e) {
        var gutterRegion = gutter.getRegion(e);
        if (gutterRegion == "foldWidgets") {
            var row = e.getDocumentPosition().row;
            if (!range || range.start.row >= row || range.end.row <= row) {
                var session = editor.session;
                range = session.getParentFoldRangeData(row).range || session.getFoldWidgetRange(row);
            }
        } else {
            range = null        
        }
        if (marker) { editor.session.removeMarker(marker); }    
        marker = range && editor.session.addMarker(range, "ace_bracket", "fullLine");
    })

    editor.on("guttermousedown", function (e) {
        var row = e.getDocumentPosition().row;
        var gutterRegion = editor.renderer.$gutterLayer.getRegion(e);
        if (gutterRegion == "foldWidgets") {
            console.log("Folding");
        }
        else {
            toggleBreakpoint(row);
        }
    });

    editor.renderer.$gutter.addEventListener("mouseout", function() {
        editor.session.removeMarker(marker); 
        marker = null
    });
}