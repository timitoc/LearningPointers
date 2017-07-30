var gotFromServer = JSON.parse($("#data").html());
console.log(JSON.stringify(gotFromServer));

var questions = [];

gotFromServer.forEach(function(question, question_index) {
	questions.push([ "<h3 id='",question.id,"'>", question.question, "</h3>" ].join("")
	.concat(
		question.answers.map(function(answer, index) {
			return ["<input id='",
				answer.id,
				"' required type='radio' name='",
				question_index,
				"'> " ,
				answer.answerText ,
				"<BR>"].join("");
		}) .join("")
	).concat("<hr>"));
});

$(".questions").html(questions.reduce(function(result, item) {
	return result.concat(item);
},""));

function parseJson() {
	var dom_questions = {}
	var last_question;
	$(".questions")
		.children()
		.map(function() {
			if($(this).prop("tagName") == "H3") {
				last_question = this.id;
				dom_questions[this.id] = {
					id: this.id,
					question: $(this).text(),
					answers: []
				};
			}
			if($(this).prop("tagName") == "INPUT") {
				dom_questions[last_question].answers.push({
					id: this.id,
					correct: $(this).is(':checked')
				});
			}
			return this;
		});
	return JSON.stringify(dom_questions);
}

$("#send").click(function(e) {
	$("#test").val(parseJson());
});

