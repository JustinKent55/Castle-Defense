//------------------------------------------------------------------
//
// 'about' menu state. Runs from GAME.game.showScreen('about').
GAME.screens['about'] = (function(game) {
	'use strict';
	
	function initialize() {
		document.getElementById('id-about-back').addEventListener(
			'click',
			function() { game.showScreen('main-menu'); });
	}
	
	function run() {
		console.log('about attemping to run...');
	}
	
	return {
		initialize : initialize,
		run : run
	};
}(GAME.game));
