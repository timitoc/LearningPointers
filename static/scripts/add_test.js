var gotFromServer = JSON.parse($("#data").html());
console.log(JSON.stringify(gotFromServer));

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
			"<h3><b> " + question.question + "</b></h3>",
			"<div class='variants' id='variants-"+index+"'>",
				question.answers.map(function(item) {
					console.log(item);
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
						item.answerText,
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
	console.log(JSON.stringify(json));
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
			question: question,
			answers: []
		}, ++questionCount);
		$(".add-variant").click(function() {
			showModal($($(this).parent(".question")[0]).children('.variants')[0]);
		});
	});
});



createQuestions(gotFromServer);

function renderToJson() {
	var texts = []
	$(".question").children("h3").each(function(index, value) {
		texts.push($(value).text());
	});
	var obj = texts.reduce(function(result,text) {
		result.push({
			question: text,
			answers: []
		});
		return result;
	},[]);

	$(".question").children(".variants").each(function(index, value) {
		$(value).each(function(index0, val) {
			$(val).children(".variant").each(function(index1, variant) {
				obj[index].answers.push({
					answerText : $($(variant).children()[2]).text(),
					//value : $($(variant).children()[1]).val(),
					correct : $($(variant).children()[1]).is(':checked')
				});
			});
		});
	});
	return JSON.stringify(obj);
};

$(function() {
	$("#edit_button").click(function(e) {
		$("#to_send").val(renderToJson());
	});
});
