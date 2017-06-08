var body;
var watchTable = function() {
    var parent = $('.watch_table_class');
    var header = createHeader();
    var jstreeElement;
    body = createBody();
    header.appendTo(parent);
    body.appendTo(parent);
    header.click(function() {toggleView();});

    var isBodyVisible = 1;
}

var expresionList = [];

function createHeader() {
    var header = jQuery('<div/>', {
        class: 'watches_header btn btn-default',
        text: 'Toggle watches'
    });
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

function addJstreeData(element) {

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
        element = $('.jstree_class').jstree({
            plugins: ["table", "contextmenu", "types"],
            core: {
                check_callback: true,
                data: data
            },
            // configure tree table
            table: {
                columns: [
                    {width: 200, header: "Expression"},
                    {width: 100, value: "value", header: "Value"}
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
                var newText = "Some new text";
                //alert(JSON.stringify(data.node));
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
                removeExpressionFromDisplayList(Global.htmlDecode(data.old));
                addExpressionToDiplayList(Global.htmlDecode(data.text));
            }
        );
    });
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

function toggleView() {
    body.toggle();
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

function updateWatchesData(jsonObject) {
        var v = jstreeElement.jstree(true).get_json('#', {flat:true});
        var newData = [];
        for (var i = 0; i < v.length; i++) {
            if (!(v[i].parent === "#"))
                continue;
            var txt = "" + v[i].text;
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
}

/// Spent like 3 hours to understand the jstree-table source code to come up with this. fufufu
function doMagic() {
    //jstreeElement.jstree(true).trigger('ready.jstree');
    $('.jstree_class').trigger("resize_column.jstree-table");
}