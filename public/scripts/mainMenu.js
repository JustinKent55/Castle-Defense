//------------------------------------------------------------------
//
// 'main-menu' menu state. Runs from GAME.game.showScreen('main-menu').
// This menu allows the user to access all other menu states.
GAME.screens['main-menu'] = (function(game) {
	'use strict';
	
	function initialize() {
		//
		// Setup each of menu events for the screens
		document.getElementById('id-new-game').addEventListener(
			'click',
			function() { game.showScreens('game-play','tower-menu'); });
		
		document.getElementById('id-high-scores').addEventListener(
			'click',
			function() { game.showScreen('high-scores'); });
			
		document.getElementById('id-user-controls').addEventListener(
			'click',
			function() { game.showScreen('user-controls'); });
		
		document.getElementById('id-about').addEventListener(
			'click',
			function() { game.showScreen('about'); });
	}
	
	function run() {
		
	}
	
	return {
		initialize : initialize,
		run : run
	};
}(GAME.game));