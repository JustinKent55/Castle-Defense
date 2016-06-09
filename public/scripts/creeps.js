//------------------------------------------------------------------
//
// This IIFE is used to manage all the creeps in the game.
// Passes the information for a creep's spritesheet to the graphics object.
// Creep paths are managed here but defined using the GAME.pathing object.
GAME.creeps = (function(graphics, images, stats) {
	'use strict';
	
	var LEFT_SPAWN = {xMin: -10, xMax: 0, yMin: 290, yMax: 410},
		TOP_SPAWN = {xMin: 290, xMax: 410, yMin: -10, yMax: 0},
		BOTTOM_SPAWN = {xMin: 290, xMax: 410, yMin: 700, yMax: 700},
		LEFT_ENTRANCE = [],
		TOP_ENTRANCE = [],
		BOTTOM_ENTRANCE = [],
		GOAL_EXIT = [],
		needToRecalculatePath = undefined,
		creepID = 0,
		myDeadCreeps = [],
		myDeadAirCreeps = [],
		myCreeps = {},
		myAirCreeps = {},
		myDeadCreepSheet = graphics.DeadCreepSpriteSheet(),
		myCreepSheet = graphics.CreepWalkSpriteSheet(), // We contain a SpriteSheet, not inherited from, big difference
		healthRemovedFromCreeps = [],
		townUnderAttackElapsedTime = 0,
		townUnderAttackInterval = 15000;
		
	function reset() {
		LEFT_ENTRANCE = [];
		TOP_ENTRANCE = [];
		BOTTOM_ENTRANCE = [];
		GOAL_EXIT = [];
		needToRecalculatePath = undefined;
		creepID = 0;
		myDeadCreeps = [];
		myDeadAirCreeps = [];
		myCreeps = {};
		myAirCreeps = {};
		healthRemovedFromCreeps = [];
	}
	
	//Initialize all information needed for a creep
	//Add it to the myCreeps object using that.generate()
	function initialize() {
		var that = {};
		
		that.generate = function(creepType,startingLocation) {
			if(creepType === 'dragon'){
				that.createNewCreep(myAirCreeps,creepType,startingLocation);
			} else {
				that.createNewCreep(myCreeps,creepType,startingLocation);
			}
			
			creepID++;
		};
		
		//Update the position of all creeps
		//Manage any creeps that are killed.
		that.update = function(elapsedTime) {
			
			//---------------------------------------------------------
			//Remove any HP from creeps if needed.
			//Check for death.
			for(var i = 0; i < healthRemovedFromCreeps.length; i++) {
				checkToRemoveHPfromCreeps(healthRemovedFromCreeps[0],myCreeps);
				checkToRemoveHPfromCreeps(healthRemovedFromCreeps[0],myAirCreeps);
				
				healthRemovedFromCreeps.splice(0,1);
				i--;
			}
			
			//If a tower has been placed, recalculate the creep paths
			needToRecalculatePath = GAME.towerGrid.getNeedToRecalculatePath();
			
			//---------------------------------------------------------
			//Update path, move forward, update creepsheets
			updateCreepsPosition(myCreeps, elapsedTime);
			updateCreepsPosition(myAirCreeps, elapsedTime);
			
			GAME.towerGrid.setNeedToRecalculatePath(false);
			
			//---------------------------------------------------------
			//Check if the first path point needs to be removed
			//If we reached the destination, pop it off
			//and calculate the angle to the next destination.
			hasCreepReachedADestination(myCreeps, elapsedTime);
			hasCreepReachedADestination(myAirCreeps, elapsedTime);
			
			//Update elapsedTime on any dead creep sprites.
			for(var i = 0; i < myDeadCreeps.length; i++) {
				myDeadCreepSheet.update(myDeadCreeps[i],elapsedTime);
				if(myDeadCreeps[i].elapsedTime >= myDeadCreeps[i].maxDeathTime) {
					myDeadCreeps.splice(i,1);
					i--;
				}
			}
			
			for(var i = 0; i < myDeadAirCreeps.length; i++) {
				myDeadCreepSheet.update(myDeadAirCreeps[i],elapsedTime);
				if(myDeadAirCreeps[i].elapsedTime >= myDeadAirCreeps[i].maxDeathTime) {
					myDeadAirCreeps.splice(i,1);
					i--;
				}
			}
			
		};
		
		//Draw creeps in the correct order using a zIndex
		//Dependant upon the row they are in on the tower grid
		//Draw health bars if creep is not at full health.
		that.render = function(currentZIndex) {
			//Render any dead creeps first.
			if(currentZIndex === 0) {
				for(var i = 0; i < myDeadCreeps.length; i++) {
					myDeadCreepSheet.draw(myDeadCreeps[i]);
				}
			}
			
			//Render alive creeps in the order according to their zIndex (tower row).
			renderAllCreeps(myCreeps,currentZIndex);
			renderAllCreeps(myAirCreeps,currentZIndex);
		};
		
		that.renderDeadAirCreeps = function() {
			for(var i = 0; i < myDeadAirCreeps.length; i++) {
				myDeadCreepSheet.draw(myDeadAirCreeps[i]);
			}
		};
		
		that.createNewCreep = function(creeps, creepType, startingLocation) {
			creeps[creepID] = {
					type: creepType,
					spriteCount: undefined,
					sprite: 0,
					elapsedTime: 0,
					timeToNextCell: 0,
					spriteMoveTime: [],				// milliseconds per sprite animation frame
					center: getStartLocation(startingLocation),
					height: undefined,
					width: undefined,
					alive: true,
					directionChanged: true,
					rotation: 0,
					orientation: 0,					// Sprite orientation with respect to "forward"
					moveRate: 30 / 1000,			// pixels per millisecond
					rotateRate: 1.570795 / 1000,	// Radians per millisecond
					pathIndicies: [],
					pathCoords: [],
				};
				
			//Creep objects that need a lookup table
			setCreepInfo(creeps[creepID],creepType);
			
			//Creep objects that need to be calculated.
			creeps[creepID].height = creeps[creepID].spriteSheet.height / creeps[creepID].spriteRows;
			creeps[creepID].width = creeps[creepID].spriteSheet.width / creeps[creepID].spriteColumns;
			creeps[creepID].spriteCount = creeps[creepID].spriteRows * creeps[creepID].spriteColumns;
			
			for(var i = 0; i < creeps[creepID].spriteCount; i++) {
				creeps[creepID].spriteMoveTime.push(150);
			}
			
			creeps[creepID].pathIndicies.push( getStartEntrance(startingLocation) );
			Pathing.breadthFirstSearch(creeps[creepID].pathIndicies[creeps[creepID].pathIndicies.length-1], GOAL_EXIT[0]);
			Pathing.returnCreepPath( creeps[creepID].pathCoords );
			Pathing.returnPathIndex( creeps[creepID].pathIndicies );
			
			if(creepType === 'dragon') {
				for(var i = 0; i < creeps[creepID].pathCoords.length; i++) {
					if( i !== 0 && i !== creeps[creepID].pathCoords.length-1  ) {
						creeps[creepID].pathCoords.splice(i,1);
						creeps[creepID].pathIndicies.splice(i,1);
						i--;
					}
				}
			}
			
			determineAngle(creeps[creepID]);
		};
		
		return that;
	}
	
	//-------------------------------------------
	// Removes hit points from creeps that have been hit by projectiles. See collisions.js
	// If a creep dies, the gold value is added to the player's stats. Dead animation 
	// array is populated with the dead creep.
	// Gold particles are generated per the creeps gold value.
	function checkToRemoveHPfromCreeps(HPRemovedFromCreep,creeps) {
		if(creeps[HPRemovedFromCreep.creepKey] !== undefined) {
			creeps[HPRemovedFromCreep.creepKey].hitPoints -= HPRemovedFromCreep.HPlost;
			
			if(creeps[HPRemovedFromCreep.creepKey].hitPoints <= 0) {
				stats.addGold(creeps[HPRemovedFromCreep.creepKey].goldValue);
				
				for(var i = 0; i < creeps[HPRemovedFromCreep.creepKey].goldValue; i++) {
					GAME.myGoldParticles.create({
						center: {x: creeps[HPRemovedFromCreep.creepKey].center.x, 
								 y: creeps[HPRemovedFromCreep.creepKey].center.y},
					});
				}
				
				addDeadCreep(creeps[HPRemovedFromCreep.creepKey]);
				delete creeps[HPRemovedFromCreep.creepKey];
			}
		}
	}
	
	function updateCreepsPosition(creeps, elapsedTime) {
		for(var items in creeps) {
			if(needToRecalculatePath && creeps[items].type !== 'dragon') { recalculateCreepPath(creeps[items]) };
			creeps[items].timeToNextCell -= elapsedTime;
			moveForward(creeps[items], elapsedTime);
			myCreepSheet.update(creeps[items], elapsedTime);
		}
	}
	
	//------------------------------------------------------------------
	//
	// Move in the direction the sprite is facing
	function moveForward(creeps, elapsedTime) {
		// Create a normalized direction vector
		var vectorX = Math.cos(creeps.rotation + creeps.orientation),
			vectorY = Math.sin(creeps.rotation + creeps.orientation);
		
		// With the normalized direction vector, move the center of the sprite
		creeps.center.x += (vectorX * creeps.moveRate * elapsedTime);
		creeps.center.y += (vectorY * creeps.moveRate * elapsedTime);
	}
	
	//Determine if the angle needs to be updated to make it to the
	//next path point.
	function determineAngle(creep) {
		var xDistance = creep.pathCoords[creep.pathCoords.length-1].x - creep.center.x,
			yDistance = creep.pathCoords[creep.pathCoords.length-1].y - creep.center.y,
			distance = Math.sqrt( Math.pow(xDistance, 2) + Math.pow(yDistance, 2) ),
			angle;
		
		angle = ( yDistance / xDistance );
		angle = Math.atan(angle);
		
		//Add 180 degrees to the angle if we need to be in the 2nd or 3rd quadrant.
		if(xDistance < 0) {
			angle += Math.PI;
		}
		
		//If the angle has changed by more than 22.5 degrees, update the sprite image
		if(angle > (creep.rotation + 0.3926991) || angle < (creep.rotation - 0.3926991)) {
			creep.directionChanged = true;
		}
		
		creep.rotation = angle;
		creep.timeToNextCell = (distance / creep.moveRate) + 100;
	}
	
	function hasCreepReachedADestination(creeps, elapsedTime) {
		townUnderAttackElapsedTime += elapsedTime;
		
		for(var items in creeps) {
			var xDistance = creeps[items].center.x - creeps[items].pathCoords[creeps[items].pathCoords.length-1].x,
				yDistance = creeps[items].center.y - creeps[items].pathCoords[creeps[items].pathCoords.length-1].y,
				distance = Math.sqrt( Math.pow(xDistance, 2) + Math.pow(yDistance, 2) );
				
			if(distance <= 3 || creeps[items].timeToNextCell < 0) {
				creeps[items].pathCoords.splice(creeps[items].pathCoords.length-1,1);
				creeps[items].pathIndicies.splice(creeps[items].pathIndicies.length-1,1);
				
				//Check if the creep made it to the castle.
				if(creeps[items].pathIndicies.length === 0){
					if(townUnderAttackElapsedTime > townUnderAttackInterval) {
						townUnderAttackElapsedTime = 0;
						GAME.sounds['sounds/help_underAttack.wav'].play();
					}
					
					stats.removeLives(1);
					delete creeps[items];
				} else {
					determineAngle(creeps[items], elapsedTime);
				}
			}
		}
	}
	
	function renderAllCreeps(creeps, currentZIndex) {
		for(var items in creeps) {
			if(currentZIndex === creeps[items].pathIndicies[creeps[items].pathIndicies.length-1].y ||
				creeps[items].type === 'dragon') {
				myCreepSheet.draw(creeps[items]);
				
				if(creeps[items].hitPoints < creeps[items].maxHitPoints) {
					graphics.drawBox({
						center: {x: creeps[items].center.x, 
									y: creeps[items].center.y - (creeps[items].height/2.5)},
						width: creeps[items].width/2,
						height: 5,
						stroke: 'rgba(255,0,0,1)',
					});
					
					var percentage = (creeps[items].hitPoints/creeps[items].maxHitPoints),
						healthWidth = percentage * (creeps[items].width/2),
						xOffset = (creeps[items].width/2) - healthWidth;
						xOffset /= 2;
						
					graphics.drawFilledBox({
						center: {x: creeps[items].center.x - xOffset, 
									y: creeps[items].center.y - (creeps[items].height/2.5)},
						width: healthWidth,
						height: 5,
						fill: 'rgba(255,0,0,1)',
					});
				}
			}
		}
	}
	
	function setEntrances(left, top, bottom) {
		LEFT_ENTRANCE = left;
		TOP_ENTRANCE = top;
		BOTTOM_ENTRANCE = bottom;
	}
	
	function setExit(exit) {
		GOAL_EXIT = exit;
	}
	
	function getGroundCreepInfo() {
		return myCreeps;
	}
	
	function getAirCreepInfo() {
		return myAirCreeps;
	}
	
	function getStartLocation(location) {
		switch(location) {
			case 'left': 
				return {x: Random.nextRange(LEFT_SPAWN.xMin, LEFT_SPAWN.xMax), 
						y: Random.nextRange(LEFT_SPAWN.yMin, LEFT_SPAWN.yMax)};
			case 'top':
				return {x: Random.nextRange(TOP_SPAWN.xMin, TOP_SPAWN.xMax), 
						y: Random.nextRange(TOP_SPAWN.yMin, TOP_SPAWN.yMax)};
			case 'bottom':
				return {x: Random.nextRange(BOTTOM_SPAWN.xMin, BOTTOM_SPAWN.xMax), 
						y: Random.nextRange(BOTTOM_SPAWN.yMin, BOTTOM_SPAWN.yMax)};
			default:
				console.log('Unkonwn starting location');
		}
	}
	
	function getStartEntrance(location) {
		switch(location) {
			case 'left': return LEFT_ENTRANCE[0];
			case 'top': return TOP_ENTRANCE[0];
			case 'bottom': return BOTTOM_ENTRANCE[0];
		}
	}
	
	function setHPtoRemove(HPtoRemove) {
		healthRemovedFromCreeps = HPtoRemove;
	}
	
	function recalculateCreepPath(creep) {
		Pathing.breadthFirstSearch(creep.pathIndicies[creep.pathIndicies.length - 1], GOAL_EXIT[0]);
		Pathing.returnCreepPath( creep.pathCoords );
		Pathing.returnPathIndex( creep.pathIndicies );
	}
	
	function isCreepInCell(xCenter,yCenter,cellWidth) {
		for(var creep in myCreeps) {
			var xDistance = xCenter - myCreeps[creep].center.x,
				yDistance = yCenter - myCreeps[creep].center.y,
				distance = Math.sqrt( Math.pow(xDistance,2) + Math.pow(yDistance,2) );
				
			if(distance < (myCreeps[creep].radius + (cellWidth/2) )) {
				return true;
			}
		}
		
		return false;
	}
	
	function addDeadCreep(creep) {
		var sumDeathTime = 0;
		
		if(creep.type === 'dragon') {
			GAME.sounds['sounds/dragon_death.wav'].play();
			GAME.myScore += creep.goldValue;
			
			myDeadAirCreeps.push({
				type: creep.type,
				spriteCount: undefined,
				sprite: 0,
				elapsedTime: 0,
				spriteMoveTime: [],				// milliseconds per sprite animation frame
				center: { x: creep.center.x, y: creep.center.y },
				height: undefined, 
				width: undefined,
			});
		
			setDeadCreepInfo(myDeadAirCreeps[myDeadAirCreeps.length-1], creep.type);
		} else {
			GAME.sounds['sounds/ground_creep_death.wav'].play();
			GAME.myScore += creep.goldValue;
			
			myDeadCreeps.push({
				type: creep.type,
				spriteCount: undefined,
				sprite: 0,
				elapsedTime: 0,
				spriteMoveTime: [],				// milliseconds per sprite animation frame
				center: { x: creep.center.x, y: creep.center.y },
				height: undefined, 
				width: undefined,
			});
		
			setDeadCreepInfo(myDeadCreeps[myDeadCreeps.length-1], creep.type);
		}
		
	}

	//CREEP PRE-SET INFORMATION----------------------------------------------
	function setCreepInfo(creep, creepType) {
		switch(creepType) {
			case 'grunt':
				creep.spriteSheet = images['images/creeps/ground_grunt.png'];
				creep.spriteRows = 5;
				creep.spriteColumns = 8;
				creep.maxHitPoints = 35;
				creep.hitPoints = 35;
				creep.radius = 20.5;
				creep.goldValue = 1;
				break;
			case 'ogre':
				creep.spriteSheet = images['images/creeps/ground_ogre.png'];
				creep.spriteRows = 5;
				creep.spriteColumns = 8;
				creep.maxHitPoints = 150;
				creep.hitPoints = 150;
				creep.radius = 25;
				creep.goldValue = 5;
				break;
			case 'dragon':
				creep.spriteSheet = images['images/creeps/air_dragon.png'];
				creep.spriteRows = 4;
				creep.spriteColumns = 8;
				creep.maxHitPoints = 300;
				creep.hitPoints = 300;
				creep.radius = 30;
				creep.goldValue = 15;
				break;
			default:
				console.log('Does not match any creep type.');
		}
	}
	//CREEP PRE-SET INFORMATION----------------------------------------------
	
	//DEAD CREEP SPRITE INFORMATION----------------------------------------------
	function setDeadCreepInfo(creep, creepType) {
		creep.maxDeathTime = 3000;
		
		switch(creepType) {
			case 'grunt':
				creep.spriteSheet = images['images/creeps/dead_ground_grunt.png'];
				creep.spriteCount = 3;
				creep.width = creep.spriteSheet.width / creep.spriteCount;
				creep.height = creep.spriteSheet.height;
				creep.sumDeathTime = 0;
				creep.animationInterval = 150;
				
				for(var i = 0; i < creep.spriteCount-1; i++) {
					creep.sumDeathTime += creep.animationInterval;
					creep.spriteMoveTime.push(creep.animationInterval);
				}
				creep.spriteMoveTime.push(creep.maxDeathTime - creep.sumDeathTime);
				break;
			case 'ogre':
				creep.spriteSheet = images['images/creeps/dead_ground_ogre.png'];
				creep.spriteCount = 5;
				creep.width = creep.spriteSheet.width / creep.spriteCount;
				creep.height = creep.spriteSheet.height;
				creep.sumDeathTime = 0;
				creep.animationInterval = 250;
				
				for(var i = 0; i < creep.spriteCount-1; i++) {
					creep.sumDeathTime += creep.animationInterval;
					creep.spriteMoveTime.push(creep.animationInterval);
				}
				creep.spriteMoveTime.push(creep.maxDeathTime - creep.sumDeathTime);
				break;
			case 'dragon':
				creep.spriteSheet = images['images/creeps/dead_air_dragon.png'];
				creep.spriteCount = 5;
				creep.width = creep.spriteSheet.width / creep.spriteCount;
				creep.height = creep.spriteSheet.height;
				creep.animationInterval = 200;
				
				for(var i = 0; i < creep.spriteCount; i++) {
					creep.spriteMoveTime.push(creep.animationInterval);
				}
				break;
			default:
				console.log('No dead creep sprite of that type.');
		}
	}
	//DEAD CREEP SPRITE INFORMATION----------------------------------------------
	
	return {
		initialize: initialize,
		setEntrances: setEntrances,
		setExit: setExit,
		setHPtoRemove: setHPtoRemove,
		getGroundCreepInfo: getGroundCreepInfo,
		getAirCreepInfo: getAirCreepInfo,
		isCreepInCell: isCreepInCell,
		reset: reset,
	};
		
}(GAME.graphics, GAME.images, GAME.stats));