//------------------------------------------------------------------
//
// Make a request to the server to add a new score.
//
//------------------------------------------------------------------
function addScore() {
	var name = $('#id-playerName').val(),
		score = $('#id-playerScore').val();

	$.ajax({
		url: 'http://localhost:3000/v1/high-scores?name=' + name + '&score=' + score,
		type: 'POST',
		error: function() { alert('POST failed'); },
		success: function() {
			showScores();
		}
	});
}

//------------------------------------------------------------------
//
// Make a request to the server to obtain the current set of high
// scores and show them.
//
//------------------------------------------------------------------
function showScores() {
	$.ajax({
		url: 'http://localhost:3000/v1/high-scores',
		cache: false,
		type: 'GET',
		error: function() { alert('GET failed'); },
		success: function(data) {
			var list = $('#id-high-scores'),
				value,
				text;

			list.empty();
			for (value = 0; value < data.length; value++) {
				text = (data[value].name + ' : ' + data[value].score);
				list.append($('<li>', { text: text }));
			}
		}
	});
}
