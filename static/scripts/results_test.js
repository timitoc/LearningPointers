var gotFromServer = JSON.parse($("#data").html());
console.log(JSON.stringify(gotFromServer));

var results = JSON.parse($("#results").html());
var keys = Object.keys(results);

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
		.concat(results[keys[question_index]] ? "<b class='correct'>CORRECT</b>": "<b class='incorrect'>INCORRECT</b>")
	).concat("<hr>"));
});

$(".questions").html(questions.reduce(function(result, item) {
	return result.concat(item);
},""));

var passed = JSON.parse($("#passed").html());

if(passed) {
	alert('You passed this test!');
} else {
	alert('You failed this test!');
}
