//------------------------------------------------------------------
//
// This IIFE is used to manage the player's gold and lives.
// It is also used to manage information about the tower's stats.
// Check creeps.js for conditions where lives will be decremented.
// Check creeps.js for conditions where gold will be incremented.
// Check towerGrid.js for conditions where gold will be decremented.
GAME.stats = (function() {
	
	var myGold = 100,
		myLives = 50;
		
	function reset() {
		myGold = 100;
		myLives = 50;
	}
		
	function initialize() {
		var that = {};
		
		that.update = function(elapsedTime) {
			if(myLives <= 0) {
				GAME.gameOver = true;
			}
		};
		
		that.render = function() {
			GAME.screens['tower-menu'].showGold(myGold);
			GAME.screens['tower-menu'].showLives(myLives);
		};
		
		return that;
	}
		
	//GOLD MANAGEMENT------------------------------------
	function addGold(amount) {
		myGold += amount;
	}
	
	function removeGold(amount) {
		if(!(myGold - amount < 0)) {
			myGold -= amount;
		} else {
			console.log('Unable to remove gold amount that results in < 0.');
		}
	}
	
	function getGold() {
		return myGold;
	}
	//GOLD MANAGEMENT------------------------------------
	
	//LIVES MANAGEMENT--------------------------------------------
	function removeLives(amount) {
		myLives -= amount;
	}
	
	function getLives() {
		return myLives;
	}
	//LIVES MANAGEMENT--------------------------------------------
	
	return {
		initialize: initialize,
		addGold: addGold,
		removeGold: removeGold,
		getGold: getGold,
		removeLives: removeLives,
		getLives: getLives,
		reset: reset,
	};
}());