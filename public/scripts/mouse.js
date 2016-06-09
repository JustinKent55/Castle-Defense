//------------------------------------------------------------------
//
// This IIFE is used to manage the all the mouse input
// registering and unregistering.
GAME.mouse = (function(){
	
	var mouse = GAME.input.Mouse();
	
	function initialize() {
		var that = {};
		
		that.update = function(elapsedTime) {
			mouse.update(elapsedTime);
		};
		
		that.render = function() {
			
		};
		
		return that;
	}
	
	//MOUSE REGISTERING FUNCTIONS-------------------------------------------
	function setupMouseForTowerPlacement() {
		mouse.registerCommand('mousemove', function(e) {
			GAME.newTower.moveTo( {x: e.clientX, y: e.clientY} );
		});
	
		mouse.registerCommand('mousedown', function(e) {
			if(e.which === 1) {
				GAME.newTower.setTowertoGrid( {x: e.clientX, y: e.clientY} );
			} else if(e.which === 3) {
				GAME.newTower.cancelPlacement();
			} else {
				console.log('No action for this click event.');
			}
		});
	}
	
	function setupMouseForTowerSelection() {
		mouse.registerCommand('mousedown', function(e) {
			GAME.selectedTower.selectATower( {x: e.clientX, y: e.clientY} );
		});
	}
	
	function unregisterMouse() {
		mouse.mouseMove.length = 0;
		mouse.mouseUp.length = 0;
		mouse.mouseDown.length = 0;
		mouse.handlersMove.length = 0;
		mouse.handlersDown.length = 0;
		mouse.handlersUp.length = 0;
	}
	//MOUSE REGISTERING FUNCTIONS-------------------------------------------
	
	return {
		initialize: initialize,
		setupMouseForTowerPlacement: setupMouseForTowerPlacement,
		setupMouseForTowerSelection: setupMouseForTowerSelection,
		unregisterMouse: unregisterMouse,
	};
}());