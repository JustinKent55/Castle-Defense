//------------------------------------------------------------------
//
// This IIFE is used to manage all the locations where weapons will exist.
// Anywhere a tower exists, a weapon will be drawn and managed.
GAME.weapons= (function(graphics) {
	'use strict';
	
	var Y_PLACEMENT_OFFSET = 15,
		myTowers = {},
		myGroundCreeps = {},
		myAirCreeps = {},
		mynewTowers = [],
		mydeletedTowers = [],
		myWeapons = {},
		myAirWeapons = {},
		towersFiring = [];
		
	function reset() {
		myTowers = {};
		myGroundCreeps = {};
		myAirCreeps = {};
		mynewTowers = [];
		mydeletedTowers = [];
		myWeapons = {};
		myAirWeapons = {};
		towersFiring = [];
	}
	
	function initialize() {
		var that = {};
		
		//----------------------------------------------------------
		//
		// Update all the weapons on top of towers
		that.update = function(elapsedTime) {
			//If any towers were deleted, delete the associated weapon.
			//If the tower was in the firing array, clear it out.
			for(var j = 0; j < mydeletedTowers.length; j++) {
				var key = mydeletedTowers[0];
				
				if(myAirWeapons[key] !== undefined) {
					delete myAirWeapons[key];
				} else {
					delete myWeapons[key];
				}
				
				for(var k = 0; k < towersFiring.length; k++) {
					if(towersFiring[k].tower === key) {
						towersFiring.splice(k,1);
						k--;
					}
				}
				
				mydeletedTowers.splice(0,1);
				j--;
			}
			
			//If any new towers have been created, add a weapon.
			for(var i = 0; i < mynewTowers.length; i++) {
				var key = mynewTowers[0];
				
				if(myTowers[key].type === 'air') {
					myAirWeapons[key] = JSON.parse(JSON.stringify(myTowers[key]));
					myAirWeapons[key].width = 30;
					myAirWeapons[key].height = 30;
					myAirWeapons[key].center.y -= Y_PLACEMENT_OFFSET;
					setupWeaponInfo( myAirWeapons[key], myAirWeapons[key].type );
				} else {
					myWeapons[key] = JSON.parse(JSON.stringify(myTowers[key]));
					myWeapons[key].width = 30;
					myWeapons[key].height = 30;
					myWeapons[key].center.y -= Y_PLACEMENT_OFFSET;
					setupWeaponInfo( myWeapons[key], myWeapons[key].type );
				}
				
				mynewTowers.splice(0,1);
				i--;
			}
			
			//find nearest creep target if the weapon is ready to fire.
			findNearestCreepTarget(myWeapons, myGroundCreeps, elapsedTime);
			findNearestCreepTarget(myAirWeapons, myAirCreeps, elapsedTime);
			
			//update angle towards creep
			rotateWeaponAngle(myGroundCreeps, myWeapons);
			rotateWeaponAngle(myAirCreeps, myAirWeapons);
			
			//generate particle at creep, particle dies outside of radius
			createProjectileForTowersFiring(myGroundCreeps, myWeapons);
			createProjectileForTowersFiring(myAirCreeps, myAirWeapons);
		};
		
		//----------------------------------------------------------
		//
		// Render all the weapons on top of towers
		that.render = function(zIndex) {
			for(var items in myWeapons) {
				if(zIndex === myWeapons[items].zIndex) {
					graphics.drawImage(myWeapons[items]);
				}
			}
			
			for(var items in myAirWeapons) {
				if(zIndex === myAirWeapons[items].zIndex) {
					graphics.drawImage(myAirWeapons[items]);
				}
			}
		};
		
		return that;
	}
	
	function findNearestCreepTarget(weapon, creeps, elapsedTime) {
		for(var location in weapon) {
			var shortest = undefined,
				creepKey = undefined,
				firingAngle = undefined,
				negate = undefined;
			
			weapon[location].elapsedTime += elapsedTime;
			towerScanforCreeps(myTowers[location], location, weapon, shortest, creeps, creepKey, firingAngle, negate);
		}
	}
	
	//-----------------------------------------------------------------------------------------
	//
	//Each tower will scan for a creep to fire at if the creep is whithin firing range.
	function towerScanforCreeps(tower, towerKey, weapon, shortestDistance, creeps, creepKey, firingAngle, negate) {
		for(var creep in creeps) {
			var xDistance = tower.center.x - creeps[creep].center.x,
				yDistance = tower.center.y - creeps[creep].center.y,
				distance = Math.sqrt( Math.pow(xDistance,2) + Math.pow(yDistance,2) ),
				angle = (yDistance / xDistance);
			
			//Is the creep within the tower radius?
			if(distance < (tower.radius + creeps[creep].radius)) {
				if(shortestDistance === undefined){
					shortestDistance = distance;
					creepKey = creep;
					firingAngle = angle;
					if(xDistance > 0) {
						negate = true;
					} else {
						negate = false;
					}
				} else {
					if(distance < shortestDistance) { //Add any creep with a shorter distance
						shortestDistance = distance;
						creepKey = creep;
						firingAngle = angle;
						if(xDistance > 0) {
							negate = true;
						} else {
							negate = false;
						}
					}
				}
			}
		}
		
		//ShortestDistance undefined meaning there is no creep to fire at
		//within the tower's radius. Remove that tower's key from the towersFiring[]
		if(shortestDistance !== undefined) {
			var exists = false;
			firingAngle = Math.atan(firingAngle);
			
			//Add 180 degrees to the angle if we need to be in the 2nd or 3rd quadrant.
			if(negate) {
				firingAngle -= Math.PI;
			}
			
			//If the weapon is ready to fire, set readyToFire object true and
			//set that the tower info already exists (=true) in the array.
			//Update the existing tower with new information.
			for(var i = 0; i < towersFiring.length; i++) {
				if(weapon[towerKey] !== undefined) {
					if(towerKey === towersFiring[i].tower && weapon[towerKey].elapsedTime >= weapon[towerKey].fireRate) {
						towersFiring[i].creep = creepKey;
						towersFiring[i].distance = shortestDistance;
						towersFiring[i].rotation = firingAngle;
						towersFiring[i].readyToFire = true;
						exists = true;
					} else if(towerKey === towersFiring[i].tower) {
						towersFiring[i].creep = creepKey;
						towersFiring[i].distance = shortestDistance;
						towersFiring[i].rotation = firingAngle;
						towersFiring[i].readyToFire = false;
						exists = true;
					}
				}
			}
			
			//If the tower does not exist in the firing array,
			//create it and setup the info needed.
			if(!exists) {
				towersFiring.push({
					tower: towerKey,
					creep: creepKey,
					distance: shortestDistance,
					rotation: firingAngle,
					readyToFire: true,
				});
			}
		} else {
			//no creeps inside the firing radius.
			//delete the tower's record from firing if it exists.
			for(var i = 0; i < towersFiring.length; i++) {
				if(towerKey === towersFiring[i].tower) {
					towersFiring.splice(i,1);
					i--;
				}
			}
		}
	}
	
	function rotateWeaponAngle(creeps, weapon) {
		for(var i = 0; i < towersFiring.length; i++) {
			if(weapon[towersFiring[i].tower] !== undefined) {
				var result = computeAngle(weapon[towersFiring[i].tower].rotation,
										weapon[towersFiring[i].tower].center,
										creeps[towersFiring[i].creep].center);
				if (testTolerance(result.angle, 0, .1) == false) {
					towersFiring[i].readyToFire = false;
					
					if (result.crossProduct > 0) {
						weapon[towersFiring[i].tower].rotation += weapon[towersFiring[i].tower].rotateRate;
					} else {
						weapon[towersFiring[i].tower].rotation -= weapon[towersFiring[i].tower].rotateRate;
					}
				}
			}
		}
	}
	
	//Used by towerGrid.js for the selected tower's weapon angle
	function getWeaponAngle(key) {
		if(myTowers[key].type === 'air') {
			return myAirWeapons[key].rotation;
		} else {
			return myWeapons[key].rotation;
		}
		
	}
	
	//------------------------------------------------------------------
	//
	// Computes the angle, and direction (cross product) between two vectors.
	function computeAngle(rotation, ptCenter, ptTarget) {
		var v1 = {
				x : Math.cos(rotation),
				y : Math.sin(rotation)
			},
			v2 = {
				x : ptTarget.x - ptCenter.x,
				y : ptTarget.y - ptCenter.y
			},
			dp,
			cp,
			angle;

		v2.len = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
		v2.x /= v2.len;
		v2.y /= v2.len;

		dp = v1.x * v2.x + v1.y * v2.y;
		angle = Math.acos(dp);

		//
		// Get the cross product of the two vectors so we can know
		// which direction to rotate.
		cp = crossProduct2d(v1, v2);

		return {
			angle : angle,
			crossProduct : cp
		};
	}
	
	//------------------------------------------------------------------
	//
	// Simple helper function to help testing a value with some level of tolerance.
	function testTolerance(value, test, tolerance) {
		if (Math.abs(value - test) < tolerance) {
			return true;
		} else {
			return false;
		}
	}
	
	//------------------------------------------------------------------
	//
	// Returns the magnitude of the 2D cross product.  The sign of the
	// magnitude tells you which direction to rotate to close the angle
	// between the two vectors.
	function crossProduct2d(v1, v2) {
		return (v1.x * v2.y) - (v1.y * v2.x);
	}
	
	function createProjectileForTowersFiring(creeps, weapon) {
		for(var i = 0; i < towersFiring.length; i++) {
			if(towersFiring[i].readyToFire) {
				if(creeps[towersFiring[i].creep] !== undefined && weapon[towersFiring[i].tower] !== undefined) {
					var vectorX = Math.cos(towersFiring[i].rotation),
						vectorY = Math.sin(towersFiring[i].rotation),
						xDistance = myTowers[towersFiring[i].tower].center.x - creeps[towersFiring[i].creep].center.x,
						yDistance = myTowers[towersFiring[i].tower].center.y - creeps[towersFiring[i].creep].center.y,
						distance = Math.sqrt( Math.pow(xDistance,2) + Math.pow(yDistance,2) );
						
					//Set the elapsedTime to 0 so that tower must wait
					//in order to fire again.
					weapon[towersFiring[i].tower].elapsedTime = 0;
						
					createProjectile({
						type: weapon[towersFiring[i].tower].type,
						image: weapon[towersFiring[i].tower].projectileImage,
						width: weapon[towersFiring[i].tower].projectileImage.width,
						height: weapon[towersFiring[i].tower].projectileImage.height,
						center: {x: myTowers[towersFiring[i].tower].center.x, y: myTowers[towersFiring[i].tower].center.y},
						direction: {x: vectorX, y: vectorY},
						rotation: towersFiring[i].rotation,
						speed: weapon[towersFiring[i].tower].projectileSpeed,
						damageDealt: weapon[towersFiring[i].tower].damageDealt,
						lifetime: myTowers[towersFiring[i].tower].radius / weapon[towersFiring[i].tower].projectileSpeed,
						cannonLifeTime: distance / weapon[towersFiring[i].tower].projectileSpeed,
						outerRadius: setupCollisionOuterRadius(weapon[towersFiring[i].tower].type, myTowers[towersFiring[i].tower].center),
						innerRadii: setupCollisionInnerRadii(weapon[towersFiring[i].tower], myTowers[towersFiring[i].tower].center),
						airCreepTarget: towersFiring[i].creep,
					});
				}
			}
		}
	}
	
	//Lookup table for weapon image type
	function setupWeaponInfo(weapon, towerType) {
		var tempObject = {};
		
		tempObject = GAME.towerInfo.returnTowerWeaponStats(towerType, weapon.level);
		for(var items in tempObject){
			weapon[items] = tempObject[items];
		}
		
		switch(towerType) {
			case 'arrow': GAME.sounds['sounds/buiding_creation_wood.wav'].play(); break;
			case 'cannon': GAME.sounds['sounds/building_creation_stone.wav'].play(); break;
			case 'air': GAME.sounds['sounds/building_creation.wav'].play(); break;
			case 'mixed': GAME.sounds['sounds/buiding_creation_wood.wav'].play(); break;
			default:
				console.log('Unknown sound building type');
		}
	}
	
	function setupCollisionOuterRadius(towerType, center) {
		switch(towerType) {
			case 'arrow': return 15;
			case 'cannon': return 7;
			case 'air': return 10;
			case 'mixed': return 8;
			default:
				console.log('Unknown weapon type, no outer collision information available.');
		}
	}
	
	function setupCollisionInnerRadii(weapon, center){
		switch(weapon.type) {
			case 'arrow': return ([
					{center: {x: center.x - (weapon.image.width/2) + 3, y: center.y },
					 radius: 3},
					{center: {x: center.x - (weapon.image.width/2) + 9, y: center.y },
					 radius: 3},
					{center: {x: center.x - (weapon.image.width/2) + 14, y: center.y },
					 radius: 3},
					{center: {x: center.x, y: center.y },
					 radius: 7}
				]);
			case 'cannon': return ([
					{center: {x: center.x + (weapon.image.width/2) - 7, y: center.y },
					 radius: 7}
				]);
			case 'air': return ([
				{center: {x: center.x + (weapon.image.width/2) - 7, y: center.y },
					radius: 9}
			]);
			case 'mixed': return ([
					{center: {x: center.x + (weapon.image.width/2) - 7, y: center.y },
					 radius: 7}
				]);
			default:
				console.log('Unknown weapon type, no inner collision information available.');
		}
	}
	
	//Create an arrow projectile
	function createProjectile(spec) {
		switch(spec.type) {
			case 'arrow': GAME.myArrowProjectiles.create(spec);
				break;
			case 'cannon': GAME.myCannonProjectiles.create(spec);
				break;
			case 'air': GAME.myAirProjectiles.create(spec);
				break;
			case 'mixed': GAME.myArrowProjectiles.create(spec);
				break;
			default:
				console.log('Not a valid weapon type.');
		}
	}
	
	//Setup the initial connection to
	function setupTowersInfo(towers, newTowers, deletedTowers) {
		myTowers = towers;
		mynewTowers = newTowers;
		mydeletedTowers = deletedTowers;
	}
	
	function setupCreepInfo(groundCreeps, airCreeps) {
		myGroundCreeps = groundCreeps;
		myAirCreeps = airCreeps;
	}
	
	return {
		initialize: initialize,
		setupTowersInfo: setupTowersInfo,
		setupCreepInfo: setupCreepInfo,
		getWeaponAngle: getWeaponAngle,
		reset: reset,
	}

}(GAME.graphics));