//------------------------------------------------------------------
//
// This function performs the one-time game initialization.
// Called from Game.js (using modernizr.js) in the yepnope.addPrefix() after all
// javascript file have loaded.
GAME.initialize = (function (images, input, text, towerGrid) {
	'use strict';
	
	return function() {
		console.log('game initializing...');
		
		//Create the background
		GAME.background = ({
			image: images['images/gameBackground.png'],
			width: 700, height: 700,
			center: {x: 350, y: 350},
			rotation: 0
		});
		
		GAME.gameOverText  = text.initialize({
			text: 'Game Over',
			font: '112px Ceviche One, cursive',
			fill: 'rgba(195, 195, 195, 1)',
			stroke: 'rgba(255, 255, 255, 1)',
			pos: {x : 125, y : 275},
			rotation: 0
		});
		
		GAME.gameWonText  = text.initialize({
			text: 'Game Won!',
			font: '112px Ceviche One, cursive',
			fill: 'rgba(195, 195, 195, 1)',
			stroke: 'rgba(255, 255, 255, 1)',
			pos: {x : 125, y : 275},
			rotation: 0
		});
		
		GAME.towerBlockingText  = text.initialize({
			text: '',
			font: '30px Ceviche One, cursive',
			fill: 'rgba(255, 0, 0, 0.8)',
			stroke: 'rgba(0, 0, 0, 1)',
			pos: {x: 20, y: 650},
			rotation: 0,
			elapsedTime: 0,
			maxTime: 4000
		});
		
		GAME.playerScoreText = text.initialize({
			text: 'Score: ',
			font: '40px Ceviche One, cursive',
			fill: 'rgba(255, 0, 0, 0.8)',
			stroke: 'rgba(0, 0, 0, 1)',
			pos: {x: 500, y: 650},
			rotation: 0,
			elapsedTime: 0,
			maxTime: 4000
		});
		
		GAME.orcSpottedText  = text.initialize({
			text: '',
			font: '50px Ceviche One, cursive',
			fill: 'rgba(255, 0, 0, 0.8)',
			stroke: 'rgba(0, 0, 0, 1)',
			pos: {x: 200, y: 300},
			rotation: 0,
			elapsedTime: 0,
			maxTime: 4000
		});
		
		GAME.orcLocationText  = text.initialize({
			text: '',
			font: '50px Ceviche One, cursive',
			fill: 'rgba(255, 0, 0, 0.8)',
			stroke: 'rgba(0, 0, 0, 1)',
			pos: {x: 210, y: 345},
			rotation: 0,
			elapsedTime: 0,
			maxTime: 4000
		});
		
		//Create the tower placing grid, define width & height of each cell.
		GAME.myTowerGrid = towerGrid.initializeGrid({
			origin: {x: 50, y: 50}, //Top left point where towers can start being populated.
			rows: 15,
			columns: 15,
			cell: {width: 40, height: 40},
			pitch: {x: 0, y: 0}
		});
		
		GAME.game.initialize();
	};
}(GAME.images, GAME.input, GAME.text, GAME.towerGrid));
