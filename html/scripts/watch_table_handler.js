var watchTable = function() {
    var parent = $('.watch_table_class');
    var header = createHeader();
    var jstreeElement;
    var body = createBody();
    header.appendTo(parent);
    body.appendTo(parent);
    header.click(function() {toggleView();});

    var isBodyVisible = 1;
}

var expresionList = {};

function createHeader() {
    var header = jQuery('<div/>', {
        class: 'watches_header',
        text: 'Watches!'
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
        var data = //[convertGDBToJSON("s = {a = {fi = 12, se = 23}, b = {fi = -5, se = 23}}"),
        [convertGDBToJSON("es = {{fi = 0, se = 23}, {fi = 1, se = 23}, {fi = 2, se = 23}, {fi = 0, se = 0}}"),
        {
            id: "y",
            text: "y",
            data: {value: 5, quantity: 20}
        }];
        
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
                    {width: 150, value: "value", header: "Value"}
                ],
                resizable: true,
                draggable: false,
                contextmenu: true,
                width: 500,
                height: 300
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
                removeExpressionFromDisplayList(data.old);
                addExpressionToDiplayList(data.text);
            }
        );
    });
}

function removeExpressionFromDisplayList(exprName) {
    if (expresionList[exprName] == undefined || expresionList[exprName].length == 0)
        return;
    console.log(expresionList[exprName]);
    //sendCommand("delete display " + expresionList[exprName][0]);
    socket.emit('remove_watch', expresionList[exprName][0]);
    console.log("deleting " + expresionList[exprName][0]);
    expresionList[exprName].splice(0, 1);
}

function addExpressionToDiplayList(exprName) {
    if (expresionList[exprName] == undefined)
        expresionList[exprName] = [];
    socket.emit('add_watch', exprName);
    Global.diplayIndexCounter++;
    expresionList[exprName].push(Global.diplayIndexCounter);
}

function toggleView() {
    body.toggle();
    isBodyVisible ^= 1;
}

function requestUpdateWatches() {
    var expr = [];
    var v = jstreeElement.jstree(true).get_json('#', {flat:true});
    console.log(JSON.stringify(v));
    for (var i = 0; i < v.length; i++)
        expr.push(v[i].text);
    //alert(expr);
    socket.emit('request_expressions', expr);
}

function updateWatchesData(jsonObject) {
        var v = jstreeElement.jstree(true).get_json('#', {flat:true});
        for (var i = 0; i < v.length; i++) {
            var txt = "" + v[i].text;
            if (jsonObject.hasOwnProperty(txt)) {
                console.log("v[" + i + "]= " + txt+ " and \nJson value= " + jsonObject[txt]);
                v[i].data.value = jsonObject[txt];
            }
        }
        jstreeElement.jstree(true).settings.core.data = v;
        jstreeElement.jstree(true).refresh();
}
