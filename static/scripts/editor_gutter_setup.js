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

    editor.on("mousemove", function (e){
        if (BROShown != -1)
            hideBreakpointOptions();
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


    /// breakpoint_options interactions
    $("#cond_br").on('change keyup paste mouseup', function() {
        if (Global.breakpointsMap[BROShown+1])
            Global.breakpointsMap[BROShown+1].setCondition($("#cond_br").val());
    });
    $("#temp_br").on('change', function() {
        if (Global.breakpointsMap[BROShown+1]) {
            if (Global.breakpointsMap[BROShown+1].isTemporary != $("#temp_br").prop('checked'))
                Global.breakpointsMap[BROShown+1].toggleTemporary();
        }
    })
}



/// Breakpoint options

var BROShown = -1;
var divid = "breakpoint_options";

function moveInRegion(e) {
    var position = e.getDocumentPosition();
    //console.log(JSON.stringify(position));
    if (BROShown == position.row)
        return ;
    var breakpoints = editor.session.getBreakpoints(position.row, 0);
    if (typeof breakpoints[position.row] == typeof undefined) {
        hideBreakpointOptions();
        return;
    }
    BROShown = position.row;
    //var left = (e.clientX+2) + "px"; 
    //var top = (e.clientY+2) + "px"; 
    //console.log(JSON.stringify( $('#editor_parent').offset()));

    /// NOT COMPATIBLE WITH CHROME
    var left = editor.renderer.$cursorLayer.getPixelPosition(position, 1).left + 
        $('#editor_parent').offset().left + 5;
    var top = editor.renderer.$cursorLayer.getPixelPosition(position, 1).top + 
        $('#editor_parent').offset().top + 10;


    $("#"+divid).css('left',left); 
    $("#"+divid).css('top',top); 
    console.log("This breakpoint: " + JSON.stringify(Global.breakpointsMap[BROShown+1]));
    if (Global.breakpointsMap[BROShown+1])
        Global.breakpointsMap[BROShown+1].populate();
    $("#"+divid).show();
}

function hideBreakpointOptions() {
    if (BROShown != -1 && Global.status == "debugging" && Global.breakpointsMap[BROShown+1])
        Global.breakpointsMap[BROShown+1].sendEditToServer();
    BROShown = -1;
    $("#"+divid).hide();
}

/// Breakpoint class
var BreakpointData = function(row, temp, cond) {
    this.row = row || 0;
    this.isTemporary = temp || false;
    this.condition = cond || "true";
}

BreakpointData.prototype.populate = function() {
    $("#temp_br").bootstrapToggle(this.isTemporary ? 'on' : 'off');
    if (this.condition == "true")
        $("#cond_br").val("");
    else
        $("#cond_br").val(this.condition);
}

BreakpointData.prototype.generateSimple = function() {
    var toR = {line: this.row, temporary: this.isTemporary, condition: this.condition};
    return toR;
}

BreakpointData.prototype.setCondition = function(newCondition) {
    if (!newCondition || newCondition.replace(/\s+/g, '') == "")
        this.condition = "true";
    else {
        this.condition = newCondition;
    }
}   

BreakpointData.prototype.toggleTemporary = function() {
    this.isTemporary = !this.isTemporary;
}

BreakpointData.prototype.sendEditToServer = function() {
    console.log("sending edit for " + this.row);
    socket.emit("edit_breakpoint", this.generateSimple());   
}

var normalizeBreakpointMap = function() {
    var array = [];
     for (var key in Global.breakpointsMap) {
        if (Global.breakpointsMap.hasOwnProperty(key)) {
            array.push(Global.breakpointsMap[key].generateSimple());
        }
    }
    return array;
}