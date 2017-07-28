var body;
var localsTable;
var isBodyVisible = 1;
var jstreeElement = {};
var watchTable = function() {
    var parent = $('.watch_table_class');
    var header = createHeader();
    body = createBody();
    header.appendTo(parent);
    body.appendTo(parent);
    localsTable = new LocalsTable();
    localsTable.init();
}

var backupExpr = [];
var expresionList = [];

function createHeader() {
    var h1 = jQuery('<div/>', {
        class: 'watches_header btn btn-default',
        text: 'Custom'
    });
    h1.click(function() {
        toggleView(1);
    });
    var h2 = jQuery('<div/>', {
        class: 'watches_header btn btn-default',
        text: 'Locals'
    });
    h2.click(function() {
        toggleView(2);
    });
    var header = jQuery('<div/>');
    h1.appendTo(header);
    h2.appendTo(header);
    return header;
}

function createBody() {
    jstreeElement = jQuery('<div/>', {
        class: 'jstree_class'
    });
    addJstreeData(jstreeElement);
    var body = jQuery('<div/>', {
        class: 'watches_body'
    });
    jstreeElement.appendTo(body);
    return body;
}

function addJstreeData() {

    $(document).ready(function(){
        // tree data
        var data = [];//[convertGDBToJSON("s = {a = {fi = 12, se = 23}, b = {fi = -5, se = 23}}"),
        // [convertGDBToJSON("es = {{fi = 0, se = 23}, {fi = 1, se = 23}, {fi = 2, se = 23}, {fi = 0, se = 0}}"),
        // {
        //     id: "y",
        //     text: "y",
        //     data: {value: 5, quantity: 20}
        // }];
        // load jstree
        // element.on('rename.jstree', function (e, data) {
        //     var newText = "Some new text";
        //     alert(JSON.stringify(data.node));
        //     //element.jstree("rename", data.node)
        // });
        element = jstreeElement.jstree({
            plugins: ["table", "contextmenu", "types"],
            contextmenu: {
                "items": function($node) {
                    var tree = jstreeElement.jstree(true);
                    return {
                        "Rename": {
                            "separator_before": false,
                            "separator_after": false,
                            "label": "Rename",
                            "action": function (obj) {
                                tree.edit($node);
                            }
                        },
                        "Remove": {
                            "separator_before": false,
                            "separator_after": false,
                            "label": "Remove",
                            "action": function (obj) {
                                console.log(tree);
                                removeWithBackup({node: $node, old: $node.text});
                                tree.delete_node($node);
                            }
                        }
                    };
                }
            },
            core: {
                check_callback: true,
                data: data
            },
            // configure tree table
            table: {
                columns: [
                    {width: 200, header: "Expression"},
                    {columnClass: 'watch_me_resize', value: "value", header: "Value"}
                ],
                resizable: true,
                draggable: false,
                contextmenu: true,
                width: 300,
                height: 350
            },
        });
        $('#pls').click(function () {
            $('.jstree_class').jstree("create_node", null, null, "last", function (node) {
                this.edit(node);
                this.hide_icons();
            });
        });
        $('.jstree_class').bind(
            "select_node.jstree", function(evt, data){
                if (data.event.type == "contextmenu")
                    return;
                var inst = $.jstree.reference(data.node);
                inst.edit(data.node);
                //$('.jstree_class').jstree(true).edit(data.node);
                //element.jstree("rename", data.node)
                //selected node object: data.inst.get_json()[0];
                //selected node text: data.inst.get_json()[0].data
            }
        );
        $('.jstree_class').bind(
            "rename_node.jstree", function(evt, data){
                //console.log(JSON.stringify(data.node));
                //console.log(JSON.stringify(data.old));
                //console.log(JSON.stringify(data.text));
                var inst = $.jstree.reference(data.node);
                inst.deselect_node(data.node);
                //removeExpressionFromDisplayList(Global.htmlDecode(data.old));
                var pos = removeWithBackup(data);
                addWithBackup(data, pos);
                //addExpressionToDiplayList(Global.htmlDecode(data.text));
            }
        );

        $('.jstree_class').bind(
            "update_cell.jstree-table", function(evt, data){
                if (data.col == "value" && data.node.parent == "#") {
                    console.log("set " + data.node.text + " to " + data.value);
                    setVariable(data.node.text, data.value);
                }
            }
        );
    });
}

function removeWithBackup(data) {
    var pos = getNodePosition(data.node);
    if (pos >= 0)
        backupExpr.splice(pos, 1);
    removeExpressionFromDisplayList(Global.htmlDecode(data.old));
    return pos;
}

function addWithBackup(data, hint) {
    if (hint == undefined || hint < 0) 
        backupExpr.push(data.text);
    else
        backupExpr.splice(hint, 0, data.text);
    addExpressionToDiplayList(Global.htmlDecode(data.text));
}

function removeExpressionFromDisplayList(exprName) {
    console.log("removing " + exprName);
    var index = expresionList.indexOf(exprName);
    if (index >= 0)
        expresionList.splice(index, 1);
}

function addExpressionToDiplayList(exprName) {
    console.log("adding " + exprName);
    expresionList.push(exprName);
    if (Global.status === 'debugging') {
        requestUpdateWatches();
    }
}

function getNodePosition(node) {
    return $.inArray(node.id, jstreeElement.jstree(true).get_node('#').children);
}

function toggleView(who) {
    if (who == 1 && !isBodyVisible || 
        who == 2 && isBodyVisible) 
    {    
        body.toggle();
        localsTable.toggleView();
    }
    isBodyVisible ^= 1;
}

/// changed scope
function requestUpdateWatches() {

    // var expr = [];
    // var v = jstreeElement.jstree(true).get_json('#', {flat:true});
    // //console.log(JSON.stringify(v));
    // for (var i = 0; i < v.length; i++)
    //     expr.push(v[i].text);
    // //alert(expr);
    // socket.emit('request_expressions', expr);
    console.log("reqqqqq " + JSON.stringify(expresionList));
    socket.emit('request_expressions', expresionList);
}

var pure = [];
/*
function updateWatchesData(jsonObject) {
        if (!isBodyVisible)
            localsTable.fetchLocalsFromGdb();
        var v = jstreeElement.jstree(true).get_json('#', {flat:true});
        var newData = [];
        for (var i = 0; i < v.length; i++) {
            if (!(v[i].parent === "#"))
                continue;
            var txt = Global.htmlDecode("" + v[i].text);
            console.log("before " + JSON.stringify(v[i]));
            if (jsonObject.hasOwnProperty(txt)) {
                var nou = convertGDBToJSON(txt + " = " + Global.htmlDecode(jsonObject[txt]));
                console.log("nou = " + JSON.stringify(nou));
                //var nou = convertGDBToJSON("es = {fi = 0, se = 23}");
                pure[i] = nou;
                newData.push(nou);
            }
            else {
                if (pure.length <= i) {
                    var nou = convertGDBToJSON(txt + " = undefined");
                    console.log("nou = " + JSON.stringify(nou));
                    pure[i] = nou;
                }
                newData.push(pure[i]);
            }
        }
        console.log(JSON.stringify(pure));
        jstreeElement.jstree(true).settings.core.data = newData;
        jstreeElement.jstree(true).refresh();
        doMagic();
}*/

function updateWatchesData(jsonObject) {
        if (!isBodyVisible)
            localsTable.fetchLocalsFromGdb();
        var v = backupExpr;
        console.log("new vers " + v);
        var newData = [];
        for (var i = 0; i < v.length; i++) {
            var txt = Global.htmlDecode("" + v[i]);
            console.log("before " + JSON.stringify(v[i]));
            if (jsonObject.hasOwnProperty(txt)) {
                var nou = convertGDBToJSON(txt + " = " + Global.htmlDecode(jsonObject[txt]));
                console.log("nou = " + JSON.stringify(nou));
                //var nou = convertGDBToJSON("es = {fi = 0, se = 23}");
                newData.push(nou);
            }
            else {
                alert("what");
                if (pure.length <= i) {
                    var nou = convertGDBToJSON(txt + " = undefined");
                    console.log("nou = " + JSON.stringify(nou));
                    pure[i] = nou;
                }
                newData.push(pure[i]);
            }
        }
        //console.log(JSON.stringify(pure));
        jstreeElement.jstree(true).settings.core.data = newData;
        jstreeElement.jstree(true).refresh();
        doMagic();
}

/// Spent like 3 hours to understand the jstree-table source code to come up with this. fufufu
function doMagic() {
    //jstreeElement.jstree(true).trigger('ready.jstree');
    $('.jstree_class').trigger("resize_column.jstree-table");
}
