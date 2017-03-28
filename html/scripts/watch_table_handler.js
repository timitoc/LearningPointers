var parent = $('.watch_table_class');
createHeader().appendTo(parent);

function createHeader() {
    var header = jQuery('<div/>', {
        id: 'watches_header',
        class: 'watches_header',
        title: 'watches',
        text: 'Watches!'
    });
    return header;
}