//------------------------------------------------------------------
//
// Game object used for drawing, keyboard input, canvas rendering
GAME.graphics = (function() {
	'use strict';
	
	var canvas = document.getElementById('canvas-main'),
		context = canvas.getContext('2d');
	
	//------------------------------------------------------------------
	//
	// Place a 'clear' function on the Canvas prototype, this makes it a part
	// of the canvas, rather than making a function that calls and does it.
	CanvasRenderingContext2D.prototype.clear = function() {
		this.save();
		this.setTransform(1, 0, 0, 1, 0, 0);
		this.clearRect(0, 0, canvas.width, canvas.height);
		this.restore();
	};
	
	//------------------------------------------------------------------
	//
	// Public function that allows the client code to clear the canvas.
	function clear() {
		context.clear();
	}
	
	//------------------------------------------------------------------
	//
	// This is used to create a border around the towers to see placement.
	function drawBorders(spec) {
		var x, y;
		
		x = spec.center.x - spec.width/2;
		y = spec.center.y - spec.height/2
		
		context.lineWidth = 1;
		context.strokeStyle = '#000000';
		context.beginPath();
		context.moveTo(x, y);
		
		//top
		context.lineTo(x + spec.width, y);
		//right
		context.lineTo(x + spec.width, y + spec.height);
		//bottom
		context.lineTo(x, y + spec.height);
		//left
		context.closePath();
		context.stroke();
	}
	
	//------------------------------------------------------------------
	//
	// This is used to create a texture function that can be used by client
	// code for rendering.
	function drawImage(spec) {
		context.save();
		
		context.translate(spec.center.x, spec.center.y);
		context.rotate(spec.rotation);
		context.translate(-spec.center.x, -spec.center.y);
		
		context.drawImage(
			spec.image, 
			spec.center.x - spec.width/2, 
			spec.center.y - spec.height/2,
			spec.width, spec.height);
		
		context.restore();	
	}
	
	//------------------------------------------------------------------
	//
	// This is used to create a filled box that can be used by client
	// code for rendering.
	function drawFilledBox(spec) {
		context.fillStyle = spec.fill;
		
		context.fillRect(
			spec.center.x - spec.width/2, 
			spec.center.y - spec.height/2,
			spec.width, spec.height
		);
	}
	
	//------------------------------------------------------------------
	//
	// This is used to create an non-filled box that can be used by client
	// code for rendering.
	function drawBox(spec) {
		context.beginPath();
		
		context.rect(
			spec.center.x - spec.width/2, 
			spec.center.y - spec.height/2,
			spec.width, spec.height
		);
		
		context.strokeStyle = spec.stroke;
		context.stroke();
	}
	
	//------------------------------------------------------------------
	//
	// This is used to create a cirlce or arc function that can be used by client
	// code for rendering.
	function drawCircle(spec) {
		context.beginPath();
		
		context.arc(
			spec.center.x, 
			spec.center.y,
			spec.radius, 
			0,
			2 * Math.PI);
			
		context.fillStyle = spec.fillCircle;
		context.fill();
	}
	
	//------------------------------------------------------------------
	//
	// This is used to create a nonfilled cirlce or arc function that can be used by client
	// code for rendering.
	function drawArc(spec) {
		context.beginPath();
		
		context.arc(
			spec.center.x, 
			spec.center.y,
			spec.radius, 
			0,
			2 * Math.PI);
			
		context.strokeStyle = spec.arcStyle;
		context.stroke();
	}
	
	//------------------------------------------------------------------
	//
	// This is used to create a text function that can be used by client
	// code for rendering.
	function drawText(spec) {
		context.save();
			
		context.font = spec.font;
		context.fillStyle = spec.fill;
		context.strokeStyle = spec.stroke;
		context.textBaseline = 'top';

		//context.translate(spec.pos.x + that.width / 2, spec.pos.y + that.height / 2);
		//context.rotate(spec.rotation);
		//context.translate(-(spec.pos.x + that.width / 2), -(spec.pos.y + that.height / 2));

		context.fillText(spec.text, spec.pos.x, spec.pos.y);
		context.strokeText(spec.text, spec.pos.x, spec.pos.y);
		
		context.restore();
	}
	
	//------------------------------------------------------------------
	//
	// Provides rendering support for a sprite animated from a sprite sheet.
	//
	//------------------------------------------------------------------
	function CreepWalkSpriteSheet() {
		var that = {};
		var mirror = false;
		
		//------------------------------------------------------------------
		//
		// Update the animation of the sprite based upon elapsed time.
		that.update = function(spec, elapsedTime) {
			
			spec.elapsedTime += elapsedTime;
			
			if(spec.alive) {
				//always start first row, column is determined using if statements
				if(spec.directionChanged) {
					spec.directionChanged = false;
					
					if( (spec.rotation < -1.178097 && spec.rotation >= -1.9634955) ||
						 (spec.rotation < 5.1050882 && spec.rotation >= 4.31969) ) {			//facing up
						spec.sprite = 0; 
					} else if( (spec.rotation < -0.3926991 && spec.rotation >= -1.178097) ||
								(spec.rotation < 5.8904864 && spec.rotation >= 5.1050882) ) {	//facing up and right
						spec.sprite = 1;
					} else if( (spec.rotation < 0.3926991 && spec.rotation >= -0.3926991) ||
								(spec.rotation < 6.6758846 && spec.rotation >= 5.8904864) ) {	//facing right
						spec.sprite = 2;
					} else if( (spec.rotation < 1.178097 && spec.rotation >= 0.3926991) ||
								(spec.rotation < -5.1050882 && spec.rotation >= -5.8904864) ) {	 //facing down and right
						spec.sprite = 3;
					} else if( (spec.rotation < 1.9634955 && spec.rotation >= 1.178097) ||
								(spec.rotation < -4.31969 && spec.rotation >= -5.1050882) ) {	//facing down
						spec.sprite = 4;
					} else if( (spec.rotation < 2.7488936 && spec.rotation >= 1.9634955) ||
								(spec.rotation < -3.5342918 && spec.rotation >= -4.31969) ) {	//facing down and left
						spec.sprite = 5;
						mirror = true;
					} else if( (spec.rotation < 3.5342918 && spec.rotation >= 2.7488936) ||
								(spec.rotation < -2.7488936 && spec.rotation >= -3.5342918) ) {	//facing left
						spec.sprite = 6;
						mirror = true;
					} else if( (spec.rotation < 4.31969 && spec.rotation >= 3.5342918) ||
								(spec.rotation < -1.9634955 && spec.rotation >= -2.7488936) ) {	//facing up and left
						spec.sprite = 7;
						mirror = true;
					} else {
						console.log('undefined angle:' + spec.rotation);
					}
				}
			}
			
			// Check to see if we should update the animation frame
			if (spec.elapsedTime >= spec.spriteMoveTime[spec.sprite]) {
				var row = Math.trunc(spec.sprite / spec.spriteColumns),
					column = spec.sprite % spec.spriteColumns;
				
				row += 1;
				
				// This provides wrap around from the last back to the first sprite
				row = row % spec.spriteRows; //1 row is death sprites
				
				// When switching sprites, keep the leftover time because
				// it needs to be accounted for the next sprite animation frame.
				spec.elapsedTime -= spec.spriteMoveTime[spec.sprite];
				spec.sprite = (row * spec.spriteColumns) + (column % spec.spriteColumns);
			}
		};
		
		//------------------------------------------------------------------
		//
		// Render the correct sprint from the sprite sheet.
		that.draw = function(spec) {
			var row = Math.trunc(spec.sprite / spec.spriteColumns),
					column = spec.sprite % spec.spriteColumns;
			
			context.drawImage(
				spec.spriteSheet,
				column * spec.width, row * spec.height,	// Which sprite to pick out
				spec.width, spec.height,		// The size of the sprite
				spec.center.x - spec.width/2,	// Where to draw the sprite
				spec.center.y - spec.height/2,
				spec.width, spec.height);
		};
			
		return that;
	}
	
	function DeadCreepSpriteSheet() {
		var that = {}
		
		that.update = function(spec, elapsedTime) {
			spec.elapsedTime += elapsedTime;
			
			// Check to see if we should update the animation frame
			if (spec.elapsedTime >= spec.spriteMoveTime[spec.sprite] &&
				spec.sprite < spec.spriteCount) {
					
				// When switching sprites, keep the leftover time because
				// it needs to be accounted for the next sprite animation frame.
				spec.elapsedTime -= spec.spriteMoveTime[spec.sprite];
				spec.sprite += 1;
			}
		}
		
		that.draw = function(spec) {
			// Pick the selected sprite from the sprite sheet to render
			context.drawImage(
				spec.spriteSheet,
				spec.width * spec.sprite, 0,	// Which sprite to pick out
				spec.width, spec.height,		// The size of the sprite
				spec.center.x - spec.width/2,	// Where to draw the sprite
				spec.center.y - spec.height/2,
				spec.width, spec.height);
		}
		
		return that;
	}
	
	function ExplosiveSpriteSheet() {
		var that = {},
			SIZE_REDUCTION = 0.9;
		
		that.update = function(spec, elapsedTime) {
			spec.elapsedTime += elapsedTime;
			
			// Check to see if we should update the animation frame
			if (spec.elapsedTime >= spec.spriteMoveTime[spec.sprite] &&
				spec.sprite < spec.spriteCount) {
					
				// When switching sprites, keep the leftover time because
				// it needs to be accounted for the next sprite animation frame.
				spec.elapsedTime -= spec.spriteMoveTime[spec.sprite];
				spec.sprite += 1;
			}
		}
		
		that.draw = function(spec) {
			// Pick the selected sprite from the sprite sheet to render
			context.drawImage(
				spec.spriteSheet,
				spec.width * spec.sprite, 0,	// Which sprite to pick out
				spec.width, spec.height,		// The size of the sprite
				spec.center.x - spec.width/2,	// Where to draw the sprite
				spec.center.y - spec.height/2,
				(spec.width * SIZE_REDUCTION), (spec.height * SIZE_REDUCTION));
		}
		
		return that;
	}
	
	function GoldSpriteSheet() {
		var that = {},
			SIZE_REDUCTION = 0.9;
		
		that.update = function(spec, elapsedTime) {
			spec.elapsedTime += elapsedTime;
			
			// Check to see if we should update the animation frame
			if (spec.elapsedTime >= spec.spriteMoveTime[spec.sprite] &&
				spec.sprite < spec.spriteCount) {
					
				// When switching sprites, keep the leftover time because
				// it needs to be accounted for the next sprite animation frame.
				spec.elapsedTime -= spec.spriteMoveTime[spec.sprite];
				spec.sprite += 1;
				spec.sprite = spec.sprite % spec.spriteCount;
			}
		}
		
		that.draw = function(spec) {
			// Pick the selected sprite from the sprite sheet to render
			context.drawImage(
				spec.spriteSheet,
				spec.width * spec.sprite, 0,	// Which sprite to pick out
				spec.width, spec.height,		// The size of the sprite
				spec.center.x - spec.width/2,	// Where to draw the sprite
				spec.center.y - spec.height/2,
				(spec.width * SIZE_REDUCTION), (spec.height * SIZE_REDUCTION));
		}
		
		return that;
	}

	return {
		clear: clear,
		drawImage: drawImage,
		drawText: drawText,
		drawBorders: drawBorders,
		drawCircle: drawCircle,
		drawArc: drawArc,
		drawFilledBox: drawFilledBox,
		drawBox: drawBox,
		CreepWalkSpriteSheet : CreepWalkSpriteSheet,
		DeadCreepSpriteSheet: DeadCreepSpriteSheet,
		ExplosiveSpriteSheet: ExplosiveSpriteSheet,
		GoldSpriteSheet: GoldSpriteSheet,
	};
}());