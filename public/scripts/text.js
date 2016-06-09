//------------------------------------------------------------------
//
// This is the text function that handles all of the game's 
// required text ojects.
GAME.text = (function(graphics) {
	'use strict';
	
	
		//Initialize text objects
		function initialize(spec) {
			var that = {};
			
			//Render the text object
			that.render = function() {
				graphics.drawText(spec);
			};
			
			that.update = function(elapsedTime) {
				spec.elapsedTime += elapsedTime;
				
				if(spec.elapsedTime > spec.maxTime) {
					that.updateText('');
				}
			};
			
			that.updateText = function(newText) {
				spec.elapsedTime = 0;
				spec.text = newText;
			};
			
			that.changeText = function(Text) {
				spec.text = Text;
			}
			
			that.setPosition = function(x, y) {
				spec.pos.x = x;
				spec.pos.y = y;
			};
			
			that.setFont = function(font) {
				spec.font = font;
			};
			
			that.toDefault = function() {
				spec.text = spec.default.text;
				spec.font = spec.default.font;
				spec.fill = spec.default.fill;
				spec.stroke = spec.default.stroke;
				spec.pos.x = spec.default.pos.x;
				spec.pos.y = spec.default.pos.y;
			}
			
			return that;
		}
	
	return {
		initialize: initialize
	};
}(GAME.graphics));