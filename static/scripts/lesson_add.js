var editor = ace.edit("editor");
var converter = new showdown.Converter();

editor.getSession().setMode("ace/mode/markdown");

editor.setAutoScrollEditorIntoView(true);
editor.setOption("maxLines", 19);
editor.setOption("minLines", 17);

editor.setOptions({
    fontSize: "15pt"
});

editor.getSession().on('change', function() {
    var text = editor.getValue();
    var html = converter.makeHtml(text);
    $("#view").html(html);
});
