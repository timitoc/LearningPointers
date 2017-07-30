var gotFromServer = JSON.parse('<%=test%>');

console.log(gotFromServer)
jQuery.expr[':'].regex = function(elem, index, match) {
    var matchParams = match[3].split(','),
        validLabels = /^(data|css):/,
        attr = {
            method: matchParams[0].match(validLabels) ?
                        matchParams[0].split(':')[0] : 'attr',
            property: matchParams.shift().replace(validLabels,'')
        },
        regexFlags = 'ig',
        regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g,''), regexFlags);
    return regex.test(jQuery(elem)[attr.method](attr.property));
}

var buttonCount = 0;
var questionCount = 0;

function createQuestionHtml(question, index) {
	if(index > questionCount) questionCount = index;
	return [
		"<div class='question'>",
			"<h3><b> " + question.text + "</b></h3>",
			"<div class='variants' id='variants-"+index+"'>",
				question.variants.map(function(item) {
					return [
						"<div class='variant'>",
						"<button class='btn btn-danger btn-sm' id='remove-",
						(++buttonCount).toString(),
						"'> Remove</button>&nbsp;",
						"<input type='radio' name='",
						"question-"+index,
						"' value='",
						item.value,
						"'>",
						"<span>",
						item.text,
						"</span>",
						"</div>"].join("");
				}).join(""),
			"</div>",
			"<button class='add-variant btn btn-primary'>Add variant</button>",
		"</div>"
	].join("") + "<hr>";
}

$(function() {
	$(".add-variant").click(function() {
		showModal($($(this).parent(".question")[0]).children('.variants')[0]);
	});
});

function createVariant(name, value, count) {
	return [
		"<div class='variant'>",
		"<button class='btn btn-danger btn-sm' id='remove-",
		(++buttonCount).toString(),
		"'> Remove</button>&nbsp;",
		"<input type='radio' ",
		"' value='",
		value,
		"'> ",
		"<span>",
		name,
		"</span>",
		"</div>" ].join("");
}

function addVariant(id, name, value) {
	$("#"+id).append(createVariant(name, value));
	var json = JSON.parse(renderToJson());
	$(".questions").html("");
	createQuestions(json);
	$(".add-variant").click(function() {
		showModal($($(this).parent(".question")[0]).children('.variants')[0]);
	});

	$("button:regex(id, remove.*)").click(function() {
		var parent_variant = $($(this).parent('.variant')[0]);
		parent_variant.remove();
	});

}
var globalId;

function showModal(element) {
	var id = $(element).attr("id");
	globalId = id;
	$("#modal").modal('show');
}


$("#add").click(function() {
	var name = $("#modal-name").val();
	var value = $("#modal-value").val();
	addVariant(globalId, name, value);
	$(".add-variant").prop('disabled', true);
	$("#modal").modal('hide');
});

$('#modal').on('hidden.bs.modal', function (e) {
	$(".add-variant").prop('disabled', false);
})


function createQuestion(question, index) {
	$("<div>").appendTo(".questions").html(createQuestionHtml(question, index));
}

function createQuestions(questions) {
	questions.forEach(function(item, index) {
		createQuestion(item, index);
	});
};

$(function() {
	$("button:regex(id, remove.*)").click(function() {
		var parent_variant = $($(this).parent('.variant')[0]);
		parent_variant.remove();
	});

	$("#add-question").click(function() {
		$("#modal-question").modal('show');
	});

	$("#modal-add-question").click(function() {
		$("#modal-question").modal('hide');
		var question = $("#modal-question-value").val();
		createQuestion({
			text: question,
			variants: []
		}, ++questionCount);
		$(".add-variant").click(function() {
			showModal($($(this).parent(".question")[0]).children('.variants')[0]);
		});
	});
});

createQuestions([
	{
		text: '123',
		variants: [
			{value: 'a', text: 'Varianta A'},
			{value: 'b', text: 'Varianta B'}
		]
	},
	{
		text: '124',
		variants: [
			{value: 'a', text: 'Varianta A'},
			{value: 'b', text: 'Varianta B'}
		]
	},
	{
		text: '125',
		variants: [
			{value: 'a', text: 'Varianta A'},
			{value: 'b', text: 'Varianta B'}
		]
	}
]);

function renderToJson() {
	var texts = []
	$(".question").children("h3").each(function(index, value) {
		texts.push($(value).text());
	});
	var obj = texts.reduce(function(result,text) {
		result.push({
			text: text,
			variants: []
		});
		return result;
	},[]);

	$(".question").children(".variants").each(function(index, value) {
		console.log(index);
		$(value).each(function(index0, val) {
			$(val).children(".variant").each(function(index1, variant) {
				obj[index].variants.push({
					text : $($(variant).children()[2]).text(),
					value : $($(variant).children()[1]).val()
				});
			});
		});
	});
	return JSON.stringify(obj);
};

console.log(renderToJson());
