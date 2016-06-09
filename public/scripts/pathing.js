var Pathing = (function(graphics) {
	'use strict';
	
	var ROWS = undefined,
		COLUMNS = undefined,
		myGrid = [],
		queue = [],
		path = [];
	
	//-------------------------------------------------------------
	//
	//Public function for client to use.
	//Setup local grid array to towerGrid.js array.
	//Re-initialize values as needed.
	function setGrid(currentGrid, rows, columns) {
		myGrid = currentGrid;
		ROWS = rows;
		COLUMNS = columns;
	}
	
	//-------------------------------------------------------------
	//
	//Public function for client to use.
	//Returns the grid's center x and center y for each path point.
	function returnCreepPath(creepsPath) {
		creepsPath.length = 0;
		
		for(var i = 0; i < path.length; i++) {
			creepsPath.push( {x: myGrid[ (path[i].x * ROWS) + (path[i].y % ROWS) ].center.x,
							  y: myGrid[ (path[i].x * ROWS) + (path[i].y % ROWS) ].center.y} );
		}
	}
	
	//-------------------------------------------------------------
	//
	//Public function for client to use.
	//Returns the grid's path indicies x and y.
	function returnPathIndex(pathIndicies) {
		pathIndicies.length = 0;
		
		for(var i = 0; i < path.length; i++) {
			pathIndicies.push( {x: path[i].x, y: path[i].y } );
		}
	}
	
	//-------------------------------------------------------------
	//
	//Public function for client to use.
	//Performs a breadth first search of the myGrid array.
	//If the queue runs out of objects to add then there is no path -> returns false.
	//If the ending point gets added to the queue, a path is found -> returns true.
	function breadthFirstSearch(starting, ending) {
		queue.length = 0;
		
		for(var i = 0; i < myGrid.length; i++) {
			myGrid[i].visited = false;
			myGrid[i].parent = {};
		}
		
		queue.push({
			x: starting.x,
			y: starting.y,
		});
		
		myGrid[ (starting.x * ROWS) + (starting.y % ROWS) ].visited = true;
		myGrid[ (starting.x * ROWS) + (starting.y % ROWS) ].parent.x = starting.x;
		myGrid[ (starting.x * ROWS) + (starting.y % ROWS) ].parent.y = starting.y;
		
		while( queue.length > 0) {
			//console.log('Queue length before adding: ' + queue.length);
			
			//Add all eight neighboring cells if possible.
			if( validateNewCoordinate(queue[0].x+1, queue[0].y, ending, starting) ) return true;	//add right
			//if( validateNewCoordinate(queue[0].x+1, queue[0].y-1, ending, starting) ) return true;	//add up right
			//if( validateNewCoordinate(queue[0].x+1, queue[0].y+1, ending, starting) ) return true;	//add down right
			if( validateNewCoordinate(queue[0].x, queue[0].y-1, ending, starting) ) return true;	//add up
			if( validateNewCoordinate(queue[0].x, queue[0].y+1, ending, starting) ) return true;	//add down
			//if( validateNewCoordinate(queue[0].x-1, queue[0].y+1, ending, starting) ) return true;	//add down left
			//if( validateNewCoordinate(queue[0].x-1, queue[0].y-1, ending, starting) ) return true;	//add up left
			if( validateNewCoordinate(queue[0].x-1, queue[0].y, ending, starting) ) return true;	//add left
			
			queue.splice(0,1);
			//console.log('Queue length after splicing: ' + queue.length);
		}
		
		//No path through the entire maze.
		return false;
	}
	
	//-----------------------------------------------------------------------------
	//
	//Private function for determinging if a grid's cell x & y can be 
	//added to the BFS() queue.
	function validateNewCoordinate(newX, newY, ending, starting) {
		//check if cell is outside the maze boundry
		//Is there a tower in the spot?
		//Has the cell already been visited?
		//console.log('Attemping to push X: ' + newX + ' Y: ' + newY);
		if(newX >= 0 && newX < COLUMNS && newY >= 0 && newY < ROWS) {
			if( !myGrid[ (newX * ROWS) + (newY % ROWS) ].towerExists ){
				if( !myGrid[ (newX * ROWS) + (newY % ROWS) ].visited ) {
					//console.log('All checks cleared, pushing X: ' + newX + ' Y: ' + newY);
					queue.push({
						x: newX,
						y: newY
					});
					myGrid[ (newX * ROWS) + (newY % ROWS) ].visited = true;
					myGrid[ (newX * ROWS) + (newY % ROWS) ].parent.x = queue[0].x;
					myGrid[ (newX * ROWS) + (newY % ROWS) ].parent.y = queue[0].y;
					
					//console.log(newX + ' ' + newY + ' ParentX: ' + myGrid[ (newX * ROWS) + (newY % ROWS) ].parent.x + ' ParentY: ' + myGrid[ (newX * ROWS) + (newY % ROWS) ].parent.y);
					
					if(queue[queue.length-1].x === ending.x && queue[queue.length-1].y === ending.y) {
						path.length = 0;
						findPath(starting, ending);
						return true;
					}
				}
			}
		}
		return false;
	}
	
	//-----------------------------------------------------------------
	//
	//Private function to determine the path.
	function findPath(starting, ending) {
		
		
		var currentX = ending.x,
			currentY = ending.y;
			
		//console.log('currentX: ' + currentX + ' currentY: ' + currentY);
		//console.log('StartingX: ' + starting.x + ' StartingY: ' + starting.y);
		//console.log('EndingX: ' + ending.x + ' EndingY: ' + ending.y);
		
		while( !(currentX === starting.x && currentY === starting.y) ) {
			path.push({x: currentX, y: currentY});
			currentX = myGrid[ (currentX * ROWS) + (currentY % ROWS) ].parent.x;
			currentY = myGrid[ (currentX * ROWS) + (currentY % ROWS) ].parent.y;
		}
		
		path.push({x: starting.x, y: starting.y});
		
		/*for(var i = 0; i < path.length; i++) {
			console.log('X: ' + path[i].x + ' Y: ' + path[i].y);
		}*/
	}
	
	return {
		setGrid: setGrid,
		breadthFirstSearch: breadthFirstSearch,
		returnCreepPath: returnCreepPath,
		returnPathIndex: returnPathIndex,
	};
	
}(GAME.graphics));