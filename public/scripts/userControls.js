//------------------------------------------------------------------
//
// 'user-controls' menu state.
// This menu allows the user to change their keyboard controls.
GAME.screens['user-controls'] = (function(game) {
	'use strict';
	
	function initialize() {
		document.getElementById('id-controls-back').addEventListener(
			'click',
			function() { game.showScreen('main-menu'); });
	}
	
	function run() {
	}
	
	return {
		initialize : initialize,
		run : run
	};
}(GAME.game));