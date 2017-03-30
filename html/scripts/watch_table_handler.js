var parent = $('.watch_table_class');
var header = createHeader();
var jstreeElement;
var body = createBody();
header.appendTo(parent);
body.appendTo(parent);
header.click(function() {toggleView();});

var isBodyVisible = 1;

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
        var data = [{
            id: "x",
            text: "x",
            data: {value: 5, quantity: 20}
        },{
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
    });
}

function toggleView() {
    body.toggle();
    isBodyVisible ^= 1;
}

function updateData(jsonData) {
    jsonData = [{
            id: "Locals",
            text: "Locals",
            data: {},
            children: [{
                id: "Fruit",
                text: "a",
                data: {}, 
                children:[
                    {id: "x", text: "x", data: {value: 5000000, quantity: 20}},
                    {id: "y", text: "y", data: {value: 20, quantity: 31}}
                ],
                state: {'opened': true}
            }, {
                id: "Vegetables",
                text: "b",
                data: {}, 
                children:[
                    {id: "x2", text: "x", data: {value: 0.5, quantity: 8}},
                    {id: "y2", text: "y", data: {value: "flori", quantity: 22}}
                ]
            }],
            state: {'opened': true}
        }];
    jstreeElement.jstree(true).settings.core.data = jsonData;
    jstreeElement.jstree(true).refresh();
}