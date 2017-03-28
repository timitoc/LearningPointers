var parent = $('.watch_table_class');
var header = createHeader();
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
    var jstreeElement = jQuery('<div/>', {
        id: 'jstree', 
    });
    addJstreeData();
    var body = jQuery('<div/>', {
        class: 'watches_body'
    });
    jstreeElement.appendTo(body);
    return body;
}

function addJstreeData() {

	$(document).ready(function(){
        // tree data
        var data = [{
            id: "Locals",
            text: "Locals",
            data: {},
            children: [{
                id: "Fruit",
                text: "a",
                data: {}, 
                children:[
                    {id: "x", text: "x", data: {value: 5, quantity: 20}},
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
        
        // load jstree
        $("div#jstree").jstree({
            plugins: ["table","dnd","contextmenu","sort", "types"],
            core: {
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
            types: {
                types: {
                    file: {
                        icon: {
                            image: ''
                        }
                    },
                    default: {
                        icon: {
                            image: ''
                        },
                        valid_children: 'default'
                    }
                }
            }
        });
    });
}

function toggleView() {
    body.toggle();
    isBodyVisible ^= 1;
}