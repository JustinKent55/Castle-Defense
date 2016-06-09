//------------------------------------------------------------------
//
// This IIFE is used to manage all the locations where towers can be placed.
// Draws towers over valid areas where towers can be placed.
// Manages the user's mouse movement and button clicks for tower placement.
GAME.towerGrid = (function(images, graphics, stats) {
	'use strict';
	
	var ROWS = undefined,
		COLUMNS = undefined,
		PLACEMENT_OFFSET = 5,
		WEAPON_Y_PLACEMENT_OFFSET = 15,
		LEFT_ENTRANCE = [{x:0, y:7}, {x:0, y:6}, {x:0, y:8}],
		TOP_ENTRANCE = [{x:6, y:0}, {x:7, y:0}, {x:8, y:0}],
		BOTTOM_ENTRANCE = [{x:6, y:14}, {x:7, y:14}, {x:8, y:14}],
		GOAL_EXIT = [{x:14, y:7}, {x:14, y:6}, {x:14, y:8}],
		leftPath = [],
		topPath = [],
		bottomPath = [],
		myGrid = [],
		gridBoundry = {},
		newTower = {},
		selectedTower = {},
		towers = {},
		newTowers = [],
		deletedTowers = [],
		needToRecalculatePath = true;
		
	function reset() {
		LEFT_ENTRANCE = [{x:0, y:7}, {x:0, y:6}, {x:0, y:8}];
		TOP_ENTRANCE = [{x:6, y:0}, {x:7, y:0}, {x:8, y:0}];
		BOTTOM_ENTRANCE = [{x:6, y:14}, {x:7, y:14}, {x:8, y:14}];
		GOAL_EXIT = [{x:14, y:7}, {x:14, y:6}, {x:14, y:8}];
		leftPath = [];
		topPath = [];
		bottomPath = [];
		myGrid = [];
		gridBoundry = {};
		newTower = {};
		selectedTower = {};
		towers = {};
		newTowers = [];
		deletedTowers = [];
		needToRecalculatePath = true;
	}
	
	//Initialize that grid that allows towers to be placed.
	function initializeGrid(spec) {
		var that = {};
		
		that.generate = function() {
			ROWS = spec.rows;
			COLUMNS = spec.columns;
			
			//Generate centroids for the entire tower grid.
			//Note: This grid is generated using COLUMN MAJOR.
			for(var i = 0; i < spec.columns; i++) {
				for(var j = 0; j < spec.rows; j++) {
					myGrid.push ( {
						cell: { x: i, y: j }, 
						center: {x: (((i * spec.cell.width) + spec.origin.x) + spec.cell.width/2), y: (((j * spec.cell.height) + spec.origin.y) + spec.cell.height/2)},
						width: spec.cell.width,
						height: spec.cell.height,
						towerExists: false,
						zIndex: j,
					} );
				}
			}
			
			gridBoundry.left = spec.origin.x;
			gridBoundry.top = spec.origin.y;
			gridBoundry.right = (spec.columns * spec.cell.width) + spec.origin.x;
			gridBoundry.bottom = (spec.rows * spec.cell.height) + spec.origin.y;
			
			Pathing.setGrid(myGrid, ROWS, COLUMNS);
		};
		
		//Render everything needed for the tower grid.
		that.render = function(currentZIndex) {
			//Draw grid borders if needed.
			//Rendered on the first layer "0"
			/*if(currentZIndex === 0) {
				for(var i = 0; i < myGrid.length; i++) {
					graphics.drawBorders(myGrid[i]);
				}
			}*/
			
			//Draw towers that have been placed on the grid.
			//Draw them in the correct order using a zIndex.
			for(var items in towers) {
				if(currentZIndex === towers[items].zIndex) {
					graphics.drawImage(towers[items]);
				}
			}
			
			//Draw the BFS() path if there is one.
			/*for(var i = 0; i < leftPath.length; i++) {
				graphics.drawCircle({
					center: { x: myGrid[ (leftPath[i].x * ROWS) + (leftPath[i].y % ROWS) ].center.x,
							  y: myGrid[ (leftPath[i].x * ROWS) + (leftPath[i].y % ROWS) ].center.y },
					radius: 3,
					fillCircle: 'rgba(0,0,255,0.5)'
				});
			}*/
		};
		
		
		that.update = function() {
			//nothing to update for the tower grid.
		};
		
		that.getGridInfo = function() {
			return {
				origin: {x: spec.origin.x, y: spec.origin.y},
				rows: spec.rows,
				columns: spec.columns,
				cell: {width: spec.cell.width, height: spec.cell.height}
			};
		};
		
		that.getFullGrid = function() {
			return myGrid;
		}

		return that;
	}
	
	//Initialize a new tower to be placed somewhere on the tower grid.
	function initializeNewTower() {
		var that = {};
		
		//Generate which tower is to be placed on myGrid[]
		that.generate = function(towerType) {
			
			//Check if the newTower is not an empty object.
			//This would mean that the player is clicking to place
			//multiple towers before canceling the previous newTower placement
			if(JSON.stringify(newTower) !== '{}') {
				//Refund gold, does not place a tower.
				stats.addGold( GAME.towerInfo.returnTowerCost(newTower.type, newTower.level));
				newTower = {};
			}
		
			GAME.towerInfo.setupNewTowerInfo(newTower, towerType);
			
			//Check if the player has enough gold.
			//Display error message if they do not have funds.
			if( !(stats.getGold() - newTower.cost < 0) ) {
				stats.removeGold(newTower.cost);
				selectedTower = {};
				GAME.mouse.unregisterMouse();
				GAME.mouse.setupMouseForTowerPlacement();
			} else {
				newTower = {};
				GAME.towerBlockingText.updateText('Insufficient funds.');
			}
		};
		
		//-------------------------------------------------------------------------
		//
		//If the tower is in a valid grid location, create a new tower key
		//at the cell X & Y and place it into the towers object.
		that.setTowertoGrid = function(center) {
			var canvasElement = document.getElementById('canvas-main'),
				rect = canvasElement.getBoundingClientRect();
			
			center.x -= rect.left;
			center.y -= rect.top;
			
			if( isMouseInsideTowerGrid(center.x, center.y) ) {
				var indices = returnGridCellIndices(center.x, center.y);
				
				if( !(GAME.creeps.isCreepInCell(
					myGrid[ (indices.x * ROWS) + (indices.y % ROWS) ].center.x, 
					myGrid[ (indices.x * ROWS) + (indices.y % ROWS) ].center.y,
					myGrid[ (indices.x * ROWS) + (indices.y % ROWS) ].width)) &&  
					!myGrid[ (indices.x * ROWS) + (indices.y % ROWS) ].towerExists) {
					
					myGrid[ (indices.x * ROWS) + (indices.y % ROWS) ].towerExists = true; //Needed for BFS()
					
					if(entrancesOpen(indices) && Pathing.breadthFirstSearch(LEFT_ENTRANCE[0], GOAL_EXIT[0])) {
						Pathing.returnPathIndex( leftPath );
						
						if(Pathing.breadthFirstSearch(TOP_ENTRANCE[0], GOAL_EXIT[0])) {
							Pathing.returnPathIndex( topPath );
							
							if(Pathing.breadthFirstSearch(BOTTOM_ENTRANCE[0], GOAL_EXIT[0])) {
								Pathing.returnPathIndex( bottomPath );
								
								var newKey = indices.x + ' ' + indices.y;
								newTowers.push(newKey);
								towers[newKey] = {};
								
								
								towers[newKey] = JSON.parse(JSON.stringify(newTower));
								towers[newKey].zIndex = myGrid[ (indices.x * ROWS) + (indices.y % ROWS) ].zIndex;
								towers[newKey].image = newTower.image;
								
								//This is needed to let creeps know a new path is required.
								needToRecalculatePath = true;
								
								//Re-initialize objects to default state.
								that.reinitializeNewTower();
								
								GAME.myScore += GAME.towerInfo.returnTowerCost(towers[newKey].type, towers[newKey].level);
								
							} else {
								//Remove if BFS() failed
								myGrid[ (indices.x * ROWS) + (indices.y % ROWS) ].towerExists = false;
								GAME.towerBlockingText.updateText('Path Blocked');
							}
						} else {
							//Remove if BFS() failed
							myGrid[ (indices.x * ROWS) + (indices.y % ROWS) ].towerExists = false;
							GAME.towerBlockingText.updateText('Path Blocked');
						}
					} else {
						//Remove if BFS() failed
						myGrid[ (indices.x * ROWS) + (indices.y % ROWS) ].towerExists = false;
						GAME.towerBlockingText.updateText('Path Blocked');
					}
				} else {
					if(myGrid[ (indices.x * ROWS) + (indices.y % ROWS) ].towerExists) {
						GAME.towerBlockingText.updateText('Tower Is In That Location');
					} else {
						GAME.towerBlockingText.updateText('Creep Is In That Location');
					}
				}
			}
		};
		
		//-------------------------------------------------------------------------
		//
		//This function is used to "snap" to new tower to a grid locations
		//while the user is hovering over the gampeplay area.
		that.moveTo = function(center) {
			var canvasElement = document.getElementById('canvas-main'),
				rect = canvasElement.getBoundingClientRect();
				
			center.x -= rect.left;
			center.y -= rect.top;
			
			if( isMouseInsideTowerGrid(center.x, center.y) ) {
				var indices = returnGridCellIndices(center.x, center.y);

				//Calculate the correct index using (currentCol * ROWS) + (currentRow % ROWS);
				//Note: This grid was generated using COLUMN MAJOR.
				center.x = myGrid[ (indices.x * ROWS) + (indices.y % ROWS) ].center.x;
				center.y = myGrid[ (indices.x * ROWS) + (indices.y % ROWS) ].center.y;
				
				//Change radius fill color to red if it's over another tower
				if( myGrid[ (indices.x * ROWS) + (indices.y % ROWS) ].towerExists ) {
					newTower.fillCircle = 'rgba(255,0,0,0.4)';
				} else {
					newTower.fillCircle = 'rgba(0,255,0,0.4)';
				}
				
				//offset the y-centroid before drawing.
				center.y -= PLACEMENT_OFFSET;
				newTower.center = center;
			} else {
				//offset the y-centroid before drawing.
				center.y -= PLACEMENT_OFFSET;
				newTower.center = center;
			}
		};
		
		//-------------------------------------------------------------------------
		//
		// Player right clicked during tower placement. This function will refund
		// the gold back to the players stats.
		that.cancelPlacement = function() {
			//Refund gold, does not place a tower.
			stats.addGold( GAME.towerInfo.returnTowerCost(newTower.type, newTower.level));
			
			//Re-initialize objects to default state.
			that.reinitializeNewTower();
		};
		
		that.render = function() {
			//Draw new mouse floating tower if it exists.
			if(JSON.stringify(newTower) !== '{}') {
				graphics.drawCircle(newTower);
				graphics.drawArc(newTower);
				graphics.drawImage(newTower);
			}
		};
		
		that.reinitializeNewTower = function () {
			GAME.mouse.unregisterMouse();
			newTower = {};
			GAME.mouse.setupMouseForTowerSelection();
		}
		
		that.update = function(elapsedTime) {
			
		};
		
		return that;
	}
	
	//Manage a user selected tower
	function userSelectedTower(spec) {
		var that = {};
		
		GAME.mouse.setupMouseForTowerSelection();
		
		//Select a tower from myGrid if it exists.
		that.selectATower = function(center) {
			var canvasElement = document.getElementById('canvas-main'),
				rect = canvasElement.getBoundingClientRect();
			
			center.x -= rect.left;
			center.y -= rect.top;
			
			if( isMouseInsideTowerGrid(center.x, center.y) ) {
				var indices = returnGridCellIndices(center.x, center.y);
				
				if( myGrid[ (indices.x * ROWS) + (indices.y % ROWS) ].towerExists ) {
					var newKey = indices.x + ' ' + indices.y;
					
					selectedTower = {};
					that.update(0);
					
					selectedTower = JSON.parse(JSON.stringify(towers[newKey]));
					selectedTower.key = newKey;
					selectedTower.image = towers[newKey].image;
					selectedTower.weaponObject = GAME.towerInfo.returnTowerWeaponStats(selectedTower.type, selectedTower.level);
					selectedTower.weaponObject.center = {};
					selectedTower.weaponObject.center.x = selectedTower.center.x;
					selectedTower.weaponObject.center.y = selectedTower.center.y - WEAPON_Y_PLACEMENT_OFFSET;
					selectedTower.weaponObject.width = 30;
					selectedTower.weaponObject.height = 30;
					selectedTower.weaponObject.rotation = GAME.weapons.getWeaponAngle(selectedTower.key);
			} else {
					selectedTower = {};
				}
			} else {
				selectedTower = {};
			}
		};
		
		that.update = function(elapsedTime) {
			if(JSON.stringify(selectedTower) !== '{}' &&
				document.getElementById('selected-tower-stats').style.display !== 'block') {
				GAME.screens['tower-menu'].showSelectedTowerStats(
					selectedTower.type,
					selectedTower.level );
			} else if(JSON.stringify(selectedTower) === '{}' &&
					  document.getElementById('selected-tower-stats').style.display === 'block') {
				GAME.screens['tower-menu'].hideDiv('selected-tower-stats');
			}
		};
		
		that.render = function(elapsedTime) {
			if(JSON.stringify(selectedTower) !== '{}') {
				graphics.drawCircle(selectedTower);
				graphics.drawArc(selectedTower);
				graphics.drawImage(selectedTower);
				selectedTower.weaponObject.rotation = GAME.weapons.getWeaponAngle(selectedTower.key);
				graphics.drawImage(selectedTower.weaponObject);
			}
		};
		
		return that;
	}
	
	function getLeftEntrance() {
		return LEFT_ENTRANCE;
	}
	
	function getTopEntrance() {
		return TOP_ENTRANCE;
	}
	
	function getBottomEntrance() {
		return BOTTOM_ENTRANCE;
	}
	
	function getExit() {
		return GOAL_EXIT;
	}
	
	function getTowers() {
		return towers;
	}
	
	function getNewTowers() {
		return newTowers;
	}
	
	function getDeletedTowers() {
		return deletedTowers;
	}
	
	function upgradeSelectedTower(upgradePrice) {
		if(JSON.stringify(selectedTower) !== '{}' && upgradePrice !== undefined) {
			if( !(GAME.stats.getGold() - upgradePrice < 0) ) {
				GAME.stats.removeGold(upgradePrice);
				deletedTowers.push(selectedTower.key); //for deleting the old weapon.
				towers[selectedTower.key].level += 1;
				towers[selectedTower.key].image = GAME.towerInfo.returnTowerImage(towers[selectedTower.key].type , towers[selectedTower.key].level);
				GAME.myScore += GAME.towerInfo.returnTowerCost(towers[selectedTower.key].type, towers[selectedTower.key].level);
				newTowers.push(selectedTower.key); //for creating a new weapon.
			} else {
				GAME.towerBlockingText.updateText('Insufficient funds.');
			}
		}
		
		selectedTower = {};
	}
	
	function sellSelectedTower(sellPrice) {
		if(JSON.stringify(selectedTower) !== '{}' && sellPrice !== undefined) {
			var indexArray = selectedTower.key.split(' '),
				indicesX = indexArray[0],
				indicesY = indexArray[1];
			
			GAME.stats.addGold(sellPrice);
			
			for(var i = 0; i < 10; i++) {
				GAME.myGoldParticles.create({
					center: {x: towers[selectedTower.key].center.x, 
								y: towers[selectedTower.key].center.y},
				});
			}
			
			GAME.myScore -= GAME.towerInfo.returnTowerCost(selectedTower.type, selectedTower.level);
			deletedTowers.push(selectedTower.key);
			myGrid[ (indicesX * ROWS) + (indicesY % ROWS) ].towerExists = false;
			delete towers[selectedTower.key];
		}
		
		GAME.sounds['sounds/building_sell.mp3'].play();
		needToRecalculatePath = true;
		selectedTower = {};
	}
	
	//This is needed to let creeps check if a new path is required.
	function getNeedToRecalculatePath() {
		return needToRecalculatePath;
	}
 
	function setNeedToRecalculatePath(recalcPath) {
		needToRecalculatePath = recalcPath;
	}
	
	//Find the nearest tower grid to snap to.
	function returnGridCellIndices(mouseX, mouseY) {
		var xIndex = undefined,
			yIndex = undefined;
			
			//Subtract X-Origin point. 
			xIndex = mouseX - gridBoundry.left;
			if(xIndex % myGrid[0].width === 0) {
				if(xIndex === gridBoundry.right) { 	//is the mouse at the far right of the grid?
					xIndex = COLUMNS - 1; 			//Set to far right column index.
				} else {
					xIndex /= myGrid[0].width;
					xIndex = Math.ceil(xIndex) - 1;
				}
			} else {
				xIndex /= myGrid[0].width;
				xIndex = Math.ceil(xIndex) - 1;
			}
			
			//Subtract Y-Origin point. 
			yIndex = mouseY - gridBoundry.top;
			if(yIndex % myGrid[0].height === 0) {
				if(yIndex === gridBoundry.bottom) { 	//is the mouse at the far bottom of the grid?
					yIndex = ROWS - 1; 					//Set to far bottom row index.
				} else {
					yIndex /= myGrid[0].height;
					yIndex = Math.ceil(yIndex) - 1;
				}
			} else {
				yIndex /= myGrid[0].height;
				yIndex = Math.ceil(yIndex) - 1;
			}
		
		return {x: xIndex, y: yIndex};
	}
	
	//Determine whether the mouse is even inside the tower Grid.
	function isMouseInsideTowerGrid(x, y) {
		if ( x > gridBoundry.left &&
			 x < gridBoundry.right &&
			 y < gridBoundry.bottom &&
			 y > gridBoundry.top) {
			return true;
		} else {
			return false;
		}
	}
	
	//Check to ensure all openings remain open
	function entrancesOpen(newTowerIndicies) {
		if(!validateEntrance(LEFT_ENTRANCE,newTowerIndicies)) {
			return false;
		}
		
		if(!validateEntrance(TOP_ENTRANCE,newTowerIndicies)) {
			return false;
		}
		
		if(!validateEntrance(BOTTOM_ENTRANCE,newTowerIndicies)) {
			return false;
		}
		
		if(!validateEntrance(GOAL_EXIT,newTowerIndicies)) {
			return false;
		}
		
		return true;
	}
	
	//Return true if the entrance is not blocked.
	function validateEntrance(entrance,newTowerIndicies) {
		if(entrance.length === 1) {
			if(entrance[0].x === newTowerIndicies.x && entrance[0].y === newTowerIndicies.y) {
				return false;	//The only remaining opening would be blocked.
			} else {
				return true;
			}
		} else {
			for(var i = 0; i < entrance.length; i++) {
				if(entrance[i].x === newTowerIndicies.x && entrance[i].y === newTowerIndicies.y) {
					entrance.splice(i,1);	//One of the entrance cells is now occupied.
				}
			}
			
			return true;
		}
	}
	
	return {
		initializeGrid: initializeGrid,
		initializeNewTower: initializeNewTower,
		userSelectedTower: userSelectedTower,
		upgradeSelectedTower: upgradeSelectedTower,
		sellSelectedTower: sellSelectedTower,
		getLeftEntrance: getLeftEntrance,
		getTopEntrance: getTopEntrance,
		getBottomEntrance: getBottomEntrance,
		getExit: getExit,
		getTowers: getTowers,
		getNewTowers: getNewTowers,
		getDeletedTowers: getDeletedTowers,
		getNeedToRecalculatePath: getNeedToRecalculatePath,
		setNeedToRecalculatePath: setNeedToRecalculatePath,
		reset: reset,
	}
		
}(GAME.images, GAME.graphics, GAME.stats));