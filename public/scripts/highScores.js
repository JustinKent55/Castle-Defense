/*jslint browser: true, white: true, plusplus: true */
/*global MyGame */
GAME.screens['high-scores'] = (function(game, persist) {
	'use strict';
	
	function initialize() {
		document.getElementById('id-high-scores-back').addEventListener(
			'click',
			function() { game.showScreen('main-menu'); });
			
			document.getElementById('id-high-scores-delete').addEventListener(
			'click',
			function() { persist.deleteAll(); 
						 game.showScreen('high-scores'); });
	}
	
	function run() {
		persist.report();
	}
	
	return {
		initialize : initialize,
		run : run
	};
}(GAME.game, GAME.persistence));