$(function() {
	var ratings = document.getElementsByClassName("lesson-rating");
	for(var i = 0; i < ratings.length; i++) {
		var ratingProperty = ratings[i].getAttribute("rating");
		var ratingValue = parseInt(ratingProperty.split('/')[0])
		var ratingTotal = parseInt(ratingProperty.split('/')[1])

		var j = 0;

		for(; j < ratingValue; j++ ) {
			var starImage = document.createElement("img");
			starImage.src = "star.svg";
			ratings[i].appendChild(starImage);
		}

		for(; j < ratingTotal; j++) {
			var starImage = document.createElement("img");
			starImage.src = "stargray.svg";
			ratings[i].appendChild(starImage);
		}
	}
});
