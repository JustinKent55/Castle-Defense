//------------------------------------------------------------------
//
// GAME.persistence manages all localStorage scores. The top 5 scores
// are saved back to localStorage regardless of how many scores were
// saved there from before.
GAME.persistence = (function () {
	'use strict';
	
	var previousScores,
		highScores,
		highScoresSorted = [];
	
	if (previousScores !== null) {
		loadJSON(function(response) {
			// Parse JSON string into object
			var actual_JSON = JSON.parse(response);
			console.log(actual_JSON);
		});
		
		
		sortHighScores();
	}
	
	function loadJSON(callback) {
		var xobj = new XMLHttpRequest();
			xobj.overrideMimeType("application/json");
			xobj.open('GET', 'scores.json', true); // Replace 'my_data' with the path to your file
			xobj.onreadystatechange = function () {
				if (xobj.readyState == 4 && xobj.status == "200") {
					// Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
					callback(xobj.responseText);
				}
			};
			
		xobj.send(null);
	}

	function add(key, value) {
		highScores[key] = value;
		localStorage['GAME.highScores'] = JSON.stringify(highScores);
	}

	function remove(key) {
		delete highScores[key];
		localStorage['GAME.highScores'] = JSON.stringify(highScores);
	}
	
	//Will work as long as the highScores object has been sorted
	//with the lowest scores at the bottom.
	function isANewHighScore(scoreToCheck) {
		if(highScoresSorted.length === 0) {
			highScoresSorted.push( [0, scoreToCheck] );
			assignNewKeys();
			assignScoresToObject();
			return true;
		}
		
		for(var i = highScoresSorted.length - 1; i >= 0; i--) {
			if(scoreToCheck > highScoresSorted[i][0]) {
				highScoresSorted.splice(i, 0, [i, scoreToCheck] );
				assignNewKeys();
				assignScoresToObject();
				return true;
			}
		}
		return false;
	}
	
	//sort the highScores object by values.
	function sortHighScores() {
		
		for(var items in highScores) {
			highScoresSorted.push( [items,highScores[items]] );
		}
		
		highScoresSorted.sort(function(a,b) {return a[1] - b[1]});
		assignNewKeys();
		assignScoresToObject();
	}
	
	function assignNewKeys() {
		for(var i = highScoresSorted.length - 1, j = 0; i >= 0; i--, j++) {
			highScoresSorted[i][0] = j;
		}
	}
	
	//Per assignment description, we will only save the
	//top 5 scores to the highScores object.
	function assignScoresToObject() {
		highScores = {};
		
		if(highScoresSorted.length > 5) {
			for(var i = highScoresSorted.length - 1; i > highScoresSorted.length - 6 ; i--) {
				highScores[highScoresSorted[i][0]] = highScoresSorted[i][1];
			}
		} else {
			for(var i = highScoresSorted.length - 1; i >= 0 ; i--) {
				highScores[highScoresSorted[i][0]] = highScoresSorted[i][1];
			}
		}
		
		localStorage['GAME.highScores'] = JSON.stringify(highScores);
	}
	
	function printHighScoresSorted() {
		for(var i = 0; i < highScoresSorted.length; i++) {
			console.log(highScoresSorted[i][0] + ': ' + highScoresSorted[i][1]);
		}
	}
	
	function deleteAll() {
		for(var scores in highScores) {
			delete highScores[scores];
		}
		localStorage['GAME.highScores'] = JSON.stringify({});
	}
	
	function getHighScores() {
		return highScores;
	}

	function report() {
		var htmlNode = document.getElementById('highScoresDiv'),
			key;
		
		htmlNode.innerHTML = '';
		for (key in highScores) {
			htmlNode.innerHTML += ('Score: ' + highScores[key] + '<br/>'); 
		}
		htmlNode.scrollTop = htmlNode.scrollHeight;
	}

	return {
		add : add,
		remove : remove,
		deleteAll: deleteAll,
		getHighScores: getHighScores,
		isANewHighScore: isANewHighScore,
		report : report
	};
}(GAME.highScores))