//------------------------------------------------------------------
//
// This IIFE is used to manage all the collision detection.
// Check collisions between creeps and particles
GAME.collisions = (function() {
	
	var myGroundCreeps = {},
		myAirCreeps = {},
		myArrows = {},
		myCannonBalls = {},
		myExplosions = {},
		myAirMissiles = {},
		removeHPfromCreeps = [],
		arrowsThatHit = [],
		cannonsThatHit = [];
		airMissilesThatHit = [];
		
	function initialize() {
		var that = {};
		
		that.update = function(elapsedTime) {
			//Check for damage dealt by arrows that have hit a creep.
			for(var particleID in myArrows) {
				if( checkOuterCollision(myArrows[particleID], myGroundCreeps) )
					arrowsThatHit.push(particleID);
			}
			
			//Only checks if a cannon has hit a creep, no damage is dealt.
			for(var particleID in myCannonBalls) {
				if( checkOuterCollision(myCannonBalls[particleID], myGroundCreeps) )
					cannonsThatHit.push(particleID);
			}
			
			//Check for damage dealt to all creeps within the explosion radius.
			for(var particleID in myExplosions) {
				if( !myExplosions[particleID].damageChecked ) {
					checkExplosionCollision(myExplosions[particleID], myGroundCreeps);
				}
			}
			
			//Check for damage dealt to any air creeps by air missiles.
			for(var particleID in myAirMissiles) {
				if( checkOuterCollision(myAirMissiles[particleID], myAirCreeps) ) {
					airMissilesThatHit.push(particleID);
				} else {
					//update the direction of the missle to lock onto the target
					redirectAirMissle(myAirMissiles[particleID]);
				}
			}
		}
		
		return that;
	}
	
	function checkOuterCollision(projectile, creeps) {
		for(var creep in creeps) {
			var xDistance = projectile.center.x - creeps[creep].center.x,
				yDistance = projectile.center.y - creeps[creep].center.y,
				distance = Math.sqrt( Math.pow(xDistance,2) + Math.pow(yDistance,2) );
				
			if(distance < (projectile.outerRadius + creeps[creep].radius)){
				if( checkInnerCollision(projectile, creep, creeps) ) {
					return true;
				}
			}
		}
	}
	
	function checkInnerCollision(projectile, creepKey, creeps) {
		for(var i = 0; i < projectile.innerRadii.length; i++) {
			var xDistance = projectile.innerRadii[i].center.x - creeps[creepKey].center.x,
				yDistance = projectile.innerRadii[i].center.y - creeps[creepKey].center.y,
				distance = Math.sqrt( Math.pow(xDistance,2) + Math.pow(yDistance,2) );
			
			if(distance < (projectile.innerRadii[i].radius + creeps[creepKey].radius)){
				if(projectile.damageDealt > 0) {
					removeHPfromCreeps.push( {creepKey: creepKey, HPlost: projectile.damageDealt});
				}
				return true;
			}
		}
		return false;
	}
	
	function checkExplosionCollision(projectile, creeps) {
		for(var creep in creeps) {
			var xDistance = projectile.center.x - creeps[creep].center.x,
				yDistance = projectile.center.y - creeps[creep].center.y,
				distance = Math.sqrt( Math.pow(xDistance,2) + Math.pow(yDistance,2) );
				
			if(distance < (projectile.width/2 + creeps[creep].radius)){
				removeHPfromCreeps.push( {creepKey: creep, HPlost: projectile.damageDealt} );
			}
		}
		
		projectile.damageChecked = true;
	}
	
	function redirectAirMissle(missile) {
		if(myAirCreeps[missile.airCreepTarget] !== undefined) {
			var vectorX,
				vectorY,
				xDistance = missile.center.x - myAirCreeps[missile.airCreepTarget].center.x,
				yDistance = missile.center.y - myAirCreeps[missile.airCreepTarget].center.y,
				distance = Math.sqrt( Math.pow(xDistance,2) + Math.pow(yDistance,2) ),
				angle;
			
			angle = ( yDistance / xDistance );
			angle = Math.atan(angle);
			
			//Add 180 degrees to the angle if we need to be in the 2nd or 3rd quadrant.
			if(xDistance > 0) {
				angle += Math.PI;
			}
			
			missile.rotation = angle;
			missile.lifeTime = (distance / myAirCreeps[missile.airCreepTarget].moveRate);
			
			vectorX = Math.cos(missile.rotation);
			vectorY = Math.sin(missile.rotation);
			missile.direction.x = vectorX;
			missile.direction.y = vectorY;
		}
	}
	
	function setupCreeps(groundCreeps, airCreeps) {
		myGroundCreeps = groundCreeps;
		myAirCreeps = airCreeps;
	}
	
	function setupProjectiles(arrows, cannonBalls, explosions, airMissiles) {
		myArrows = arrows;
		myCannonBalls = cannonBalls;
		myExplosions = explosions;
		myAirMissiles = airMissiles;
	}
	
	function getRemoveHPfromCreeps() {
		return removeHPfromCreeps;
	}
	
	function getArrowsThatHitCreeps() {
		return arrowsThatHit;
	}
	
	function getCannonsThatHitCreeps() {
		return cannonsThatHit;
	}
	
	function getAirMissilesThatHitCreeps() {
		return airMissilesThatHit;
	}
	
	return {
		initialize: initialize,
		setupCreeps: setupCreeps,
		setupProjectiles: setupProjectiles,
		getRemoveHPfromCreeps: getRemoveHPfromCreeps,
		getArrowsThatHitCreeps: getArrowsThatHitCreeps,
		getCannonsThatHitCreeps: getCannonsThatHitCreeps,
		getAirMissilesThatHitCreeps: getAirMissilesThatHitCreeps,
	};
}());