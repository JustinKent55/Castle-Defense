//------------------------------------------------------------------
//
// 'game-play' menu state. Runs from GAME.game.showScreen('game-play').
GAME.screens['game-play'] = (function(game) {
	'use strict';
	
	function initialize() {
		document.getElementById('id-game-play-back').addEventListener(
		'click',
		function() {
			GAME.cancelNextRequest = true; 
			game.showScreen('main-menu'); 
		});
	}
	
	function run() {
		
		// Reinitialize the game parameters and start the animation loop
		GAME.reinitialize();
		requestAnimationFrame(GAME.gameloop);
	}
	
	return {
		initialize : initialize,
		run : run
	};
}(GAME.game));