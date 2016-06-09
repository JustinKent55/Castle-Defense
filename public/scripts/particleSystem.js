/*jslint browser: true, white: true, plusplus: true */
/*global Random */
GAME.particleSystem = (function(graphics, images, sounds) {
	'use strict';
	var nextName = 1,						// unique identifier for the next particle
		arrowParticles = {},				// Set of active arrow particles
		cannonParticles = {},				// Set of active cannon particles
		cannonExplosion = {},				// Set of active cannon explosions
		cannonTrail = {},					// Set of fire particles from cannon shell
		airParticles = {},					// Set of active air particles from air tower.
		airMissileTrail = {},				// Particles for air missile trail.
		goldParticles = {},					// Particles for gold that is earned / sold.
		arrowParticlesThatHitCreeps = [],	// These are arrow particles that have hit a creep, need to be deleted.
		cannonParticlesThatHitCreeps = [],	// These are cannon particles that have hit a creep, need to be deleted.
		airParticlesThatHitCreeps = [],		// These are air particles that have hit a creep, need to be deleted.
		
		explosionSheet = graphics.ExplosiveSpriteSheet(),
		goldSheet = graphics.GoldSpriteSheet();

	//------------------------------------------------------
	// Manage all particles related to the arrow projectile.
	// Arrows that are deleted when they hit a creep or when they've
	// reached their max travel distance.
	function initializeArrow() {
		var that = {};
	
		//------------------------------------------------------------------
		//
		// This creates one new arrow
		that.create = function(spec) {
			var p = {
					type: spec.type,
					image: spec.image,
					width: spec.width,
					height: spec.height,
					outerRadius: spec.outerRadius,
					innerRadii: spec.innerRadii,
					center: {x: spec.center.x, y: spec.center.y},
					direction: {x: spec.direction.x, y: spec.direction.y},
					speed: spec.speed, // pixels per second
					rotation: spec.rotation,
					lifetime: spec.lifetime,	// How long the arrow should alive, in seconds
					alive: 0,	// How long the arrow has been alive, in seconds
					damageDealt: spec.damageDealt
				};
				
			GAME.sounds['sounds/arrowFire.wav'].play();
			
			// Assign a unique name to each arrow
			arrowParticles[nextName++] = p;
		};
		
		//------------------------------------------------------------------
		//
		// Update the state of all particles.  This includes remove any that 
		// have exceeded their lifetime.
		that.update = function(elapsedTime) {
			var removeMe = [],
				value,
				particle;
				
			// We work with time in seconds, elapsedTime comes in as milliseconds
			elapsedTime = elapsedTime / 1000;
			
			for(var i = 0; i < arrowParticlesThatHitCreeps.length; i++) {
				GAME.sounds['sounds/arrowHit.wav'].play();
				
				delete arrowParticles[arrowParticlesThatHitCreeps[0]];
				arrowParticlesThatHitCreeps.splice(0,1);
				i--;
			}
			
			for (value in arrowParticles) {
				
				if (arrowParticles.hasOwnProperty(value)) {
					particle = arrowParticles[value];
					
					// Update how long it has been alive
					particle.alive += elapsedTime;
					
					// Update its position
					// Update inner radii positions
					particle.center.x += (elapsedTime * particle.speed * particle.direction.x);
					particle.center.y += (elapsedTime * particle.speed * particle.direction.y);
					for(var i = 0; i < particle.innerRadii.length; i++) {
						particle.innerRadii[i].center.x += (elapsedTime * particle.speed * particle.direction.x)
						particle.innerRadii[i].center.y += (elapsedTime * particle.speed * particle.direction.y);
					}
					
					// If the lifetime has expired, identify it for removal
					if (particle.alive > particle.lifetime) {
						removeMe.push(value);
					}
				}
			}
			
			
			// Remove all of the expired particles
			for (particle = 0; particle < removeMe.length; particle++) {
				delete arrowParticles[removeMe[particle]];
			}
			removeMe.length = 0;
		};
		
		//------------------------------------------------------------------
		//
		// Render all particles contained inside the particles object.
		that.render = function() {
			var value,
				particle;
			
			for (value in arrowParticles) {
				if (arrowParticles.hasOwnProperty(value)) {
					particle = arrowParticles[value];
					graphics.drawImage(particle);
				}
			}
		};
		
		that.reset = function() {
			for (var value in arrowParticles) {
				if (arrowParticles.hasOwnProperty(value)) {
					delete arrowParticles[value];
				}
			}
		};
	
		return that;
	}
	
	//------------------------------------------------------
	// Manage all particles related to the cannon projectile.
	// When cannons are fired they create a trail of fire behind them.
	// Cannons that are deleted create explosion particles.
	function initializeCannon() {
		var that = {};
	
		//------------------------------------------------------------------
		//
		// This creates one new cannon ball
		that.create = function(spec) {
			var p = {
					type: spec.type,
					image: spec.image,
					width: spec.width,
					height: spec.height,
					outerRadius: spec.outerRadius,
					innerRadii: spec.innerRadii,
					center: {x: spec.center.x, y: spec.center.y},
					direction: {x: spec.direction.x, y: spec.direction.y},
					speed: spec.speed, // pixels per second
					rotation: spec.rotation,
					lifetime: spec.cannonLifeTime,	// How long the cannon should alive, in seconds
					trailElapsedTime: 0,
					trailInterval: 0.15,
					alive: 0,	// How long the cannon has been alive, in seconds
					damageDealt: 0,
					explosionDamage: spec.damageDealt,
				};
			
			GAME.sounds['sounds/cannon_shot.mp3'].play();
			
			// Assign a unique name to each cannon
			cannonParticles[nextName++] = p;
		};
		
		that.createTrail = function(spec) {
			var p = {
					image: images['images/particles/fire.png'],
					width: 10,
					height: 10,
					center: {x: spec.center.x, y: spec.center.y},
					direction: {x: 0, y: -3},
					speed: 1, // pixels per second
					rotation: 0,
					lifetime: Random.nextGaussian(1.5,1),
					alive: 0,
				};
				
			// Ensure we have a valid size - gaussian numbers can be negative
			p.lifetime = Math.max(1, p.lifetime);
			
			// Assign a unique name to each trail particle
			cannonTrail[nextName++] = p;
		};
		
		that.createExplosion = function(spec) {
			var p = {
					type: 'explosion',
					spriteSheet: images['images/particles/explosion.png'],
					spriteCount: 16,
					sprite: 0,
					elapsedTime: 0,
					spriteMoveTime: [],
					width: undefined,
					height: undefined,
					center: {x: spec.center.x, y: spec.center.y},
					direction: {x: 0, y: 0},
					speed: 0, // pixels per second
					rotation: 0,
					lifetime: 1,
					alive: 0,
					damageDealt: spec.explosionDamage,
					damageChecked: false,
				};
				
				p.height = p.spriteSheet.height;
				p.width = p.spriteSheet.width / p.spriteCount;
				
				for(var i = 0; i < p.spriteCount; i++) {
					p.spriteMoveTime.push(62.5);
				}
			
			GAME.sounds['sounds/cannon_explosion.mp3'].play();
			
			// Assign a unique name to each explosion
			cannonExplosion[nextName++] = p;
		};
		
		//------------------------------------------------------------------
		//
		// Update the state of all particles.  This includes remove any that 
		// have exceeded their lifetime.
		that.update = function(elapsedTime) {
			var removeMe = [],
				removeMe2 = [],
				removeMe3 = [],
				value,
				particle;
			
			//Delete cannons that have hit creeps.
			for(var i = 0; i < cannonParticlesThatHitCreeps.length; i++) {
				//Create an explosion
				that.createExplosion({
					center: {x: cannonParticles[cannonParticlesThatHitCreeps[0]].center.x, 
							 y: cannonParticles[cannonParticlesThatHitCreeps[0]].center.y},
					explosionDamage: cannonParticles[cannonParticlesThatHitCreeps[0]].explosionDamage,
				});
				
				delete cannonParticles[cannonParticlesThatHitCreeps[0]];
				cannonParticlesThatHitCreeps.splice(0,1);
				i--;
			}
				
			// We work with time in seconds, elapsedTime comes in as milliseconds
			elapsedTime = elapsedTime / 1000;
			
			for (value in cannonParticles) {
				if (cannonParticles.hasOwnProperty(value)) {
					particle = cannonParticles[value];
					
					particle.trailElapsedTime += elapsedTime;
					
					if(particle.trailElapsedTime > particle.trailInterval) {
						particle.trailElapsedTime = 0;
						
						for(var k = 0; k < 8; k++) {
							that.createTrail({
								center: {x: Random.nextGaussian(particle.center.x, particle.outerRadius/2), 
										 y: Random.nextGaussian(particle.center.y, particle.outerRadius/2)},
							})
						}
					}
					
					// Update how long it has been alive
					particle.alive += elapsedTime;
					
					// Update its position
					// Update inner radii positions
					particle.center.x += (elapsedTime * particle.speed * particle.direction.x);
					particle.center.y += (elapsedTime * particle.speed * particle.direction.y);
					for(var i = 0; i < particle.innerRadii.length; i++) {
						particle.innerRadii[i].center.x += (elapsedTime * particle.speed * particle.direction.x)
						particle.innerRadii[i].center.y += (elapsedTime * particle.speed * particle.direction.y);
					}
					
					// If the lifetime has expired, identify it for removal
					if (particle.alive > particle.lifetime) {
						removeMe.push(value);
					}
				}
			}
			
			for (value in cannonTrail) {
				if (cannonTrail.hasOwnProperty(value)) {
					particle = cannonTrail[value];
					
					// Update how long it has been alive
					particle.alive += elapsedTime;
					
					particle.rotation += particle.speed / 500;
					
					// Update its position
					particle.center.x += (elapsedTime * particle.speed * particle.direction.x);
					particle.center.y += (elapsedTime * particle.speed * particle.direction.y);
					
					// If the lifetime has expired, identify it for removal
					if (particle.alive > particle.lifetime) {
						removeMe2.push(value);
					}
				}
			}
			
			for(value in cannonExplosion) {
				if(cannonExplosion.hasOwnProperty(value)) {
					particle = cannonExplosion[value];
					
					// Update how long it has been alive
					particle.alive += elapsedTime;
					
					// If the lifetime has expired, identify it for removal
					if (particle.alive > particle.lifetime) {
						removeMe3.push(value);
					}
					
					//Update the spriteSheet information
					explosionSheet.update(particle, (elapsedTime * 1000));
				}
			}
			
			// Remove all of the expired particles
			for (particle = 0; particle < removeMe.length; particle++) {
				//Create an explosion
				that.createExplosion({
					center: {x: cannonParticles[removeMe[particle]].center.x, 
							 y: cannonParticles[removeMe[particle]].center.y},
					explosionDamage: cannonParticles[removeMe[particle]].explosionDamage,
				});
				delete cannonParticles[removeMe[particle]];
			}
			removeMe.length = 0;
			
			// Remove all of the expired particles
			for (particle = 0; particle < removeMe2.length; particle++) {
				delete cannonTrail[removeMe2[particle]];
			}
			removeMe2.length = 0;
			
			// Remove all of the expired particles
			for (particle = 0; particle < removeMe3.length; particle++) {
				delete cannonExplosion[removeMe3[particle]];
			}
			removeMe3.length = 0;
		};
		
		//------------------------------------------------------------------
		//
		// Render all particles contained inside the particles object.
		that.render = function() {
			var value,
				particle;
			
			for (value in cannonParticles) {
				if (cannonParticles.hasOwnProperty(value)) {
					particle = cannonParticles[value];
					graphics.drawImage(particle);
				}
			}
			
			for (value in cannonTrail) {
				if (cannonTrail.hasOwnProperty(value)) {
					particle = cannonTrail[value];
					graphics.drawImage(particle);
				}
			}
			
			for (value in cannonExplosion) {
				if( cannonExplosion.hasOwnProperty(value)) {
					particle = cannonExplosion[value];
					explosionSheet.draw(particle);
				}
			}
		};
		
		//------------------------------------------------------------------
		//
		// Reset all particles contained inside the particles object.
		that.reset = function() {
			for (var value in cannonParticles) {
				if (cannonParticles.hasOwnProperty(value)) {
					delete cannonParticles[value];
				}
			}
			
			for (var value in cannonTrail) {
				if (cannonTrail.hasOwnProperty(value)) {
					delete cannonTrail[value];
				}
			}
		};
	
		return that;
	}
	
	//------------------------------------------------------
	// Manage all particles related to the air Projectile.
	// Air projectiles follow the creep that they are locked onto.
	// Air projectiles create other particles when they hit.
	function initializeAirMissile() {
		var that = {};
	
		//------------------------------------------------------------------
		//
		// This creates one air missile
		that.create = function(spec) {
			var p = {
					type: spec.type,
					image: spec.image,
					width: spec.width,
					height: spec.height,
					outerRadius: spec.outerRadius,
					innerRadii: spec.innerRadii,
					center: {x: spec.center.x, y: spec.center.y},
					direction: {x: spec.direction.x, y: spec.direction.y},
					speed: spec.speed, // pixels per second
					rotation: spec.rotation,
					trailElapsedTime: 0,
					trailInterval: 0.15,
					lifetime: spec.lifetime,	// How long the missile should alive, in seconds
					alive: 0,	// How long the missile has been alive, in seconds
					damageDealt: spec.damageDealt,
					airCreepTarget: spec.airCreepTarget,
				};
			
			GAME.sounds['sounds/Air_shot.mp3'].play();
			
			// Assign a unique name to each air missile
			airParticles[nextName++] = p;
		};
		
		that.createMissileTrail = function(spec) {
			var p = {
					image: images['images/particles/blue_sparkle.png'],
					imageArray: [images['images/particles/white_sparkle.png'], images['images/particles/blue_sparkle.png']],
					imageNum: 0,
					imageNumMax: 2,
					imageElaspedTime: 0,
					imageInterval: 0.2,
					width: 8,
					height: 8,
					center: {x: spec.center.x, y: spec.center.y},
					direction: {x: Random.nextGaussian(0, 7), y: Random.nextGaussian(10, 3)},
					speed: 1, // pixels per second
					rotation: 0,
					lifetime: Random.nextGaussian(2.5,1),
					alive: 0,
				};
			
			// Ensure we have a valid size - gaussian numbers can be negative
			p.lifetime = Math.max(1, p.lifetime);
			
			// Assign a unique name to each air missile
			airMissileTrail[nextName++] = p;
		};
		
		//------------------------------------------------------------------
		//
		// Update the state of all particles.  This includes remove any that 
		// have exceeded their lifetime.
		that.update = function(elapsedTime) {
			var removeMe = [],
				removeMe2 = [],
				value,
				particle;
				
			// We work with time in seconds, elapsedTime comes in as milliseconds
			elapsedTime = elapsedTime / 1000;
			
			//These are air missiles that have hit creeps,
			//create another particle effect for when they hit.
			for(var i = 0; i < airParticlesThatHitCreeps.length; i++) {
				GAME.sounds['sounds/tower_magic_explosion.wav'].play();
				
				delete airParticles[airParticlesThatHitCreeps[0]];
				airParticlesThatHitCreeps.splice(0,1);
				i--;
			}
			
			for (value in airParticles) {
				
				if (airParticles.hasOwnProperty(value)) {
					particle = airParticles[value];
					
					// Update how long it has been alive
					particle.alive += elapsedTime;
					particle.trailElapsedTime += elapsedTime;
					
					if(particle.trailElapsedTime > particle.trailInterval) {
						particle.trailElapsedTime = 0;
						
						for(var k = 0; k < 1; k++) {
							that.createMissileTrail({
								center: {x: Random.nextGaussian(particle.center.x, particle.outerRadius/2), 
										 y: Random.nextGaussian(particle.center.y, particle.outerRadius/2)},
							})
						}
					}
					
					// Update its position
					// Update inner radii positions
					particle.center.x += (elapsedTime * particle.speed * particle.direction.x);
					particle.center.y += (elapsedTime * particle.speed * particle.direction.y);
					for(var i = 0; i < particle.innerRadii.length; i++) {
						particle.innerRadii[i].center.x += (elapsedTime * particle.speed * particle.direction.x)
						particle.innerRadii[i].center.y += (elapsedTime * particle.speed * particle.direction.y);
					}
					
					// If the lifetime has expired, identify it for removal
					if (particle.alive > particle.lifetime) {
						removeMe.push(value);
					}
				}
			}
			
			for (value in airMissileTrail) {
				if (airMissileTrail.hasOwnProperty(value)) {
					particle = airMissileTrail[value];
					
					// Update how long it has been alive
					particle.alive += elapsedTime;
					particle.imageElaspedTime += elapsedTime
					
					if(particle.imageElaspedTime > particle.imageInterval) {
						particle.imageElaspedTime = 0;
						particle.imageNum += 1;
						particle.imageNum %= particle.imageNumMax;
						particle.image = particle.imageArray[particle.imageNum];
						particle.direction.x = Random.nextGaussian(0,7);
					}
					
					particle.rotation += particle.speed / 250;
					
					// Update its position
					particle.center.x += (elapsedTime * particle.speed * particle.direction.x);
					particle.center.y += (elapsedTime * particle.speed * particle.direction.y);
					
					// If the lifetime has expired, identify it for removal
					if (particle.alive > particle.lifetime) {
						removeMe2.push(value);
					}
				}
			}
			
			
			// Remove all of the expired particles
			for (particle = 0; particle < removeMe.length; particle++) {
				delete airParticles[removeMe[particle]];
			}
			removeMe.length = 0;
			
			// Remove all of the expired particles
			for (particle = 0; particle < removeMe2.length; particle++) {
				delete airMissileTrail[removeMe2[particle]];
			}
			removeMe2.length = 0;
		};
		
		//------------------------------------------------------------------
		//
		// Render all particles contained inside the particles object.
		that.render = function() {
			var value,
				particle;
			
			for (value in airParticles) {
				if (airParticles.hasOwnProperty(value)) {
					particle = airParticles[value];
					graphics.drawImage(particle);
				}
			}
			
			for (value in airMissileTrail) {
				if (airMissileTrail.hasOwnProperty(value)) {
					particle = airMissileTrail[value];
					graphics.drawImage(particle);
				}
			}
		};
		
		that.reset = function() {
			for (var value in airParticles) {
				if (airParticles.hasOwnProperty(value)) {
					delete airParticles[value];
				}
			}
			
			for (var value in airMissileTrail) {
				if (airMissileTrail.hasOwnProperty(value)) {
					delete airMissileTrail[value];
				}
			}
		};
	
		return that;
	}
	
	function initializeGold() {
		var that = {};
		
		that.create = function(spec) {
			var p = {
					spriteSheet: images['images/particles/rotatingGold.png'],
					spriteCount: 10,
					sprite: 0,
					elapsedTime: 0,
					spriteMoveTime: [],
					width: undefined,
					height: undefined,
					center: {x: spec.center.x, y: spec.center.y},
					direction: {x: Random.nextGaussian(0, 5), y: Random.nextGaussian(-10, 5) },
					speed: 2, // pixels per second
					rotation: 0,
					lifetime: Random.nextGaussian(1.5, 0.5),
					elapsedInterval: 0,
					interval: 0.025,
					alive: 0,
				};
				
			p.height = p.spriteSheet.height;
			p.width = p.spriteSheet.width / p.spriteCount;
			
			for(var i = 0; i < p.spriteCount; i++) {
				p.spriteMoveTime.push(10);
			}
			
			p.direction.y = Math.min(-5, p.direction.y);
			
			// Ensure we have a valid size - gaussian numbers can be negative
			p.lifetime = Math.max(1, p.lifetime);
			
			// Assign a unique name to each air missile
			goldParticles[nextName++] = p;
		};
		
		//------------------------------------------------------------------
		//
		// Update the state of all particles.  This includes remove any that 
		// have exceeded their lifetime.
		that.update = function(elapsedTime) {
			var removeMe = [],
				value,
				particle;
				
			// We work with time in seconds, elapsedTime comes in as milliseconds
			elapsedTime = elapsedTime / 1000;
			
			for(value in goldParticles) {
				if(goldParticles.hasOwnProperty(value)) {
					particle = goldParticles[value];
					
					// Update how long it has been alive
					particle.alive += elapsedTime;
					particle.elapsedInterval += elapsedTime;
					
					//Update the Y-direction or speed to give a "gravity" effect.
					if(particle.elapsedInterval > particle.interval) {
						particle.elapsedInterval = 0;
						particle.direction.y += 0.5;
					}
					
					particle.center.x += (elapsedTime * particle.speed * particle.direction.x);
					particle.center.y += (elapsedTime * particle.speed * particle.direction.y);
					
					// If the lifetime has expired, identify it for removal
					if (particle.alive > particle.lifetime) {
						removeMe.push(value);
					}
					
					//Update the spriteSheet information
					goldSheet.update(particle, (elapsedTime * 1000));
				}
			}
			
			// Remove all of the expired particles
			for (particle = 0; particle < removeMe.length; particle++) {
				delete goldParticles[removeMe[particle]];
			}
			removeMe.length = 0;
		};
		
		//------------------------------------------------------------------
		//
		// Render all particles contained inside the particles object.
		that.render = function() {
			var value,
				particle;
			
			for (value in goldParticles) {
				if (goldParticles.hasOwnProperty(value)) {
					particle = goldParticles[value];
					goldSheet.draw(particle);
				}
			}
		};
		
		//------------------------------------------------------------------
		//
		// Reset all particles contained inside the particles object.
		that.reset = function() {
			for (var value in goldParticles) {
				if (goldParticles.hasOwnProperty(value)) {
					delete goldParticles[value];
				}
			}
		};
		
		return that;
	}
	
	function getArrowParticles() {
		return arrowParticles;
	}
	
	function getCannonParticles() {
		return cannonParticles;
	}
	
	function getCannonExplosions() {
		return cannonExplosion;
	}
	
	function getAirParticles() {
		return airParticles;
	}
	
	function setParticlesThatHitCreeps(arrows, cannons, airMissiles) {
		arrowParticlesThatHitCreeps = arrows;
		cannonParticlesThatHitCreeps = cannons;
		airParticlesThatHitCreeps = airMissiles;
	}
	
	return {
		initializeArrow: initializeArrow,
		initializeCannon: initializeCannon,
		initializeAirMissile: initializeAirMissile,
		initializeGold: initializeGold,
		getArrowParticles: getArrowParticles,
		getCannonParticles: getCannonParticles,
		getCannonExplosions: getCannonExplosions,
		getAirParticles: getAirParticles,
		setParticlesThatHitCreeps: setParticlesThatHitCreeps,
	}
	
}(GAME.graphics, GAME.images));