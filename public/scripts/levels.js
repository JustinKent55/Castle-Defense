//------------------------------------------------------------------
//
// This IIFE is used to manage the game's level system
GAME.levels = (function(creeps) {
	
	var myGroundCreeps = undefined,
		myAirCreeps = undefined,
		myLevel = 0,
		levelWon = false,
		gameLive = false,
		gruntsCleared = false,
		ogresCleared = false,
		dragonsCleared = false,
		gruntElapsedTime = 0,
		ogreElapsedTime = 0,
		dragonElapsedTime = 0,
		SPEED_INCREASE = 0.20,
		gruntSpawnTimeGap = {low: 800, high: 1200},
		ogreSpawnTimeGap = {low: 2000, high: 3000},
		dragonSpawnTimeGap = {low: 3000, high: 5000},
		nextGruntSpawnTime = undefined,
		nextOgreSpawnTime = undefined,
		nextDragonSpawnTime = undefined,
		northGateOpenAtLevel = 4,
		southGateOpenAtLevel = 5,
		gruntsInLevel = [{level: 0, quantity: 15},
						 {level: 1, quantity: 35},
						 {level: 2, quantity: 65},
						 {level: 3, quantity: 80},
						 {level: 4, quantity: 110},
						 {level: 5, quantity: 145},
						 {level: 6, quantity: 185},
						 {level: 7, quantity: 230},
						 {level: 8, quantity: 280},
						 {level: 9, quantity: 335}],
		ogresInLevel = [{level: 2, quantity: 2},
						{level: 3, quantity: 7},
						{level: 4, quantity: 15},
						{level: 5, quantity: 30},
						{level: 6, quantity: 45},
						{level: 7, quantity: 62},
						{level: 8, quantity: 82},
						{level: 9, quantity: 100}],
		dragonsInLevel = [{level: 7, quantity: 1},
						  {level: 8, quantity: 1},
						  {level: 9, quantity: 2}];
						  
	function reset() {
		myLevel = 0;
		levelWon = false;
		gameLive = false;
		gruntsCleared = false;
		ogresCleared = false;
		dragonsCleared = false;
		gruntElapsedTime = 0;
		ogreElapsedTime = 0;
		dragonElapsedTime = 0;
		SPEED_INCREASE = 0.20;
		gruntSpawnTimeGap = {low: 800, high: 1200};
		ogreSpawnTimeGap = {low: 2000, high: 3000};
		dragonSpawnTimeGap = {low: 3000, high: 5000};
		nextGruntSpawnTime = undefined;
		nextOgreSpawnTime = undefined;
		nextDragonSpawnTime = undefined;
		northGateOpenAtLevel = 4;
		southGateOpenAtLevel = 5;
		gruntsInLevel = [{level: 0, quantity: 15},
						 {level: 1, quantity: 35},
						 {level: 2, quantity: 65},
						 {level: 3, quantity: 80},
						 {level: 4, quantity: 110},
						 {level: 5, quantity: 145},
						 {level: 6, quantity: 185},
						 {level: 7, quantity: 230},
						 {level: 8, quantity: 280},
						 {level: 9, quantity: 335}];
		ogresInLevel = [{level: 2, quantity: 2},
						{level: 3, quantity: 7},
						{level: 4, quantity: 15},
						{level: 5, quantity: 30},
						{level: 6, quantity: 45},
						{level: 7, quantity: 62},
						{level: 8, quantity: 82},
						{level: 9, quantity: 100}];
		dragonsInLevel = [{level: 7, quantity: 1},
						  {level: 8, quantity: 1},
						  {level: 9, quantity: 2}];
	}
	
	//Initailze the the level manager.
	//Pre-define up to 10 levels.
	//Everything after that will be randomized by an additional percentage.
	function initialize() {
		var that = {};
		
		that.update = function(elapsedTime) {
			if(gameLive) {
				gruntElapsedTime += elapsedTime;
				ogreElapsedTime += elapsedTime;
				dragonElapsedTime += elapsedTime;
				
				if(gruntElapsedTime >= nextGruntSpawnTime) {
					gruntElapsedTime = 0;
					nextGruntSpawnTime = Random.nextRange(gruntSpawnTimeGap.low, gruntSpawnTimeGap.high);
					
					//Can grunt spawn this level?
					//Any grunts left to spawn?
					if(gruntsInLevel[0].level === myLevel) {
						if(gruntsInLevel[0].quantity !== 0){
							GAME.myCreeps.generate('grunt', getRandomStartLocation());
							gruntsInLevel[0].quantity -= 1;
						} else if(gruntsInLevel[0].quantity === 0) {
							gruntsCleared = true;
						}
					} else {
						//grunt can't spawn at this level, they're cleared.
						gruntsCleared = true;
					}
				}
				
				if(ogreElapsedTime >= nextOgreSpawnTime) {
					ogreElapsedTime = 0;
					nextOgreSpawnTime = Random.nextRange(ogreSpawnTimeGap.low, ogreSpawnTimeGap.high);
					
					//Can ogres spawn this level?
					//Any ogres left to spawn?
					if(ogresInLevel[0].level === myLevel) {
						if(ogresInLevel[0].quantity !== 0){
							GAME.myCreeps.generate('ogre', getRandomStartLocation());
							ogresInLevel[0].quantity -= 1;
						} else if(ogresInLevel[0].quantity === 0) {
							ogresCleared = true;
						}
					} else {
						//ogres can't spawn at this level, they're cleared.
						ogresCleared = true;
					}
				}
				
				//Can dragons spawn this level?
				//Any dragons left to spawn?
				if(dragonElapsedTime >= nextDragonSpawnTime) {
					dragonElapsedTime = 0;
					nextDragonSpawnTime = Random.nextRange(dragonSpawnTimeGap.low, dragonSpawnTimeGap.high);
					
					//Can grunt spawn this level?
					//Any grunts left to spawn?
					if(dragonsInLevel[0].level === myLevel) {
						if(dragonsInLevel[0].quantity !== 0){
							GAME.myCreeps.generate('dragon', getRandomStartLocation());
							dragonsInLevel[0].quantity -= 1;
						} else if(dragonsInLevel[0].quantity === 0) {
							dragonsCleared = true;
						}
					} else {
						//dragons can't spawn at this level, they're cleared.
						dragonsCleared = true;
					}
				}
					
				checkForLevelComplete();
			}
		};
		
		return that;
	}
	
	
	
	function checkForLevelComplete() {
		//If grunts, ogres, and dragons are all cleared, level is cleared.
		if(gruntsCleared && ogresCleared && dragonsCleared) {
			var count = 0;
			for(var items in myGroundCreeps) {
				count++;
			}
			
			for(var items in myAirCreeps) {
				count++;
			}
			
			//If count === 0, all creeps have been killed.
			if(count === 0) {
				console.log('LEVEL ' + myLevel + ' COMPLETED!!');
				setupForNextLevel();
			}
		}
	}
	
	function setupForNextLevel() {
		//Splice off the old level from the creep arrays...
		//Modify the spawn timer only if creeps spawned in this level.
		if(gruntsInLevel[0].level === myLevel) {
			gruntsInLevel.splice(0,1);
			gruntSpawnTimeGap.low -= (gruntSpawnTimeGap.low * SPEED_INCREASE);
			gruntSpawnTimeGap.high -= (gruntSpawnTimeGap.high * SPEED_INCREASE);
		}
		
		if(ogresInLevel[0].level === myLevel) {
			ogresInLevel.splice(0,1);
			ogreSpawnTimeGap.low -= (ogreSpawnTimeGap.low * SPEED_INCREASE);
			ogreSpawnTimeGap.high -= (ogreSpawnTimeGap.high * SPEED_INCREASE);
		}
		
		
		if(dragonsInLevel[0].level === myLevel) {
			dragonsInLevel.splice(0,1);
			dragonSpawnTimeGap.low -= (dragonSpawnTimeGap.low * SPEED_INCREASE);
			dragonSpawnTimeGap.high -= (dragonSpawnTimeGap.high * SPEED_INCREASE);
		}
		

		gruntsCleared = false;
		ogresCleared = false;
		dragonsCleared = false;
		gameLive = false;
		myLevel += 1;
		GAME.screens['tower-menu'].showDiv('nextLevel');
		
		if(myLevel === northGateOpenAtLevel) {
			displayNorthSighting();
		}
			
		if(myLevel === southGateOpenAtLevel) {
			displaySouthSighting();
		}
		
		if(myLevel === 10) {
			GAME.won = true;
		}
	}
	
	function playerStartedLevel() {
		gameLive = true;
		GAME.screens['tower-menu'].hideDiv('nextLevel');
		
		if(gruntsInLevel[0].level === myLevel) {
			nextGruntSpawnTime = Random.nextRange(gruntSpawnTimeGap.low, gruntSpawnTimeGap.high);
		} else {
			nextGruntSpawnTime = 0;
		}
		
		if(ogresInLevel[0].level === myLevel) {
			nextOgreSpawnTime = Random.nextRange(ogreSpawnTimeGap.low, ogreSpawnTimeGap.high);
		} else {
			nextOgreSpawnTime = 0;
		}
		
		if(dragonsInLevel[0].level === myLevel) {
			nextDragonSpawnTime = Random.nextRange(dragonSpawnTimeGap.low, dragonSpawnTimeGap.high);
		} else {
			nextDragonSpawnTime = 0;
		}
		
		GAME.sounds['sounds/drawSteelBoys.wav'].play();
	}
	
	function getRandomStartLocation() {
		var otherSpawnsOpen = undefined,
			leftSpawn = 0;
		
		if(myLevel >= southGateOpenAtLevel) {
			otherSpawnsOpen = 2;
		} else if(myLevel >= northGateOpenAtLevel) {
			otherSpawnsOpen = 1;
		} else {
			otherSpawnsOpen = leftSpawn;
		}
		
		switch(Random.nextRange(leftSpawn, otherSpawnsOpen)) {
			case 0: return 'left';
			case 1: return 'top';
			case 2: return 'bottom';
			default:
				console.log('Spawn # is invalid.');
		}
	}
	
	function displayNorthSighting() {
		GAME.orcSpottedText.updateText('Orcs Spotted At');
		GAME.orcLocationText.updateText('The North Gate');
	}
	
	function displaySouthSighting() {
		GAME.orcSpottedText.updateText('Orcs Spotted At');
		GAME.orcLocationText.updateText('The South Gate');
	}
	
	function getLevel() {
		return myLevel;
	}
	
	function setupCreeps(groundCreeps, airCreeps) {
		myGroundCreeps = groundCreeps;
		myAirCreeps = airCreeps;
	}
	
	return {
		initialize: initialize,
		playerStartedLevel: playerStartedLevel,
		getLevel: getLevel,
		setupCreeps: setupCreeps,
	};
}(GAME.creeps.myCreeps));