//------------------------------------------------------------------
//
// This IIFE is used to manage the all the tower leveling information and costs.
GAME.towerInfo = (function(images) {
	
	function setupNewTowerInfo(newTower, towerType) {
		newTower.type = towerType;
		newTower.center = {x: 350, y: 350};
		newTower.width = 45;
		newTower.height = 50;
		newTower.rotation = 0;
		newTower.level = 1;
		newTower.fillCircle = 'rgba(0,255,0,0.4)';
		newTower.arcStyle = 'rgba(255,255,0,0.8)';
		
		switch(towerType) {
			case 'arrow':
				newTower.image = images['images/towers/arrow_lvl1.png'];
				newTower.radius = 135;
				newTower.cost = arrowTowerLevelPrice(newTower.level);
				break;
			case 'cannon':
				newTower.image = images['images/towers/cannon_lvl1.png'];
				newTower.radius = 75;
				newTower.cost = cannonTowerLevelPrice(newTower.level);
				break;
			case 'air':
				newTower.image = images['images/towers/air_lvl1.png'];
				newTower.radius = 175;
				newTower.cost = airTowerLevelPrice(newTower.level);
				break;
			case 'mixed':
				newTower.image = images['images/towers/mixed_lvl1.png'];
				newTower.radius = 135;
				newTower.cost = mixedTowerLevelPrice(newTower.level);
				break;
			default:
				console.log('Does not match any tower type.');
		}
	}
	
	function returnTowerCost(towerType, Level) {
		switch(towerType) {
			case 'arrow': return arrowTowerLevelPrice(Level);
			case 'cannon': return cannonTowerLevelPrice(Level);
			case 'air': return airTowerLevelPrice(Level);
			case 'mixed': return mixedTowerLevelPrice(Level);
			default:
				console.log('Does not match any tower type.');
		}
	}
	
	function returnTowerImage(towerType, Level) {
		switch(towerType) {
			case 'arrow': return images['images/towers/arrow_lvl'+Level+'.png'];
			case 'cannon': return images['images/towers/cannon_lvl'+Level+'.png'];
			case 'air': return images['images/towers/air_lvl'+Level+'.png'];
			case 'mixed': return images['images/towers/mixed_lvl'+Level+'.png'];
			default:
				console.log('Unknown weapon type.');
		}
	}
	
	function returnTowerWeaponStats(towerType, weaponLevel) {
		switch(towerType) {
			case 'arrow': return arrowWeaponLevelStats(weaponLevel);
			case 'cannon': return cannonWeaponLevelStats(weaponLevel);
			case 'air': return airWeaponLevelStats(weaponLevel);
			case 'mixed': return mixedWeaponLevelStats(weaponLevel);
			default:
				console.log('Unknown weapon type.');
		}
	}
	
	//ARROW TOWER INFO-------------------------------------------------------------
	function arrowTowerLevelPrice(Level) {
		switch(Level) {
			case 1: return 10;
			case 2: return 50;
			case 3: return 125;
			default:
				console.log('Arrow Price - Does not match any tower level.');
		}
	}
	
	function arrowWeaponLevelStats(Level) {
		var obj = {
			image: images['images/weapons/tower_arrow.png'],
			projectileImage: images['images/particles/projectile_arrow.png'],
			projectileSpeed: 150,
			fireRate: 1500,
			rotateRate: 8 * 3.14159 / 1000, // radians per second;
			elapsedTime: 1500,
			canAttackGround: true,
			canAttackAir: false,
		}
		
		switch(Level) {
			case 1: 
				obj.damageDealt = 5;
				return obj;
			case 2: 
				obj.damageDealt = 30;
				return obj;
			case 3: 
				obj.damageDealt = 90;
				return obj;
			default:
				console.log('Arrow Weapon - Does not match any tower level.');
		}
	}
	//ARROW TOWER INFO-------------------------------------------------------------
	
	//CANNON TOWER INFO---------------------------------------------
	function cannonTowerLevelPrice(Level) {
		switch(Level) {
			case 1: return 50;
			case 2: return 250;
			case 3: return 700;
			default:
				console.log('Cannon Price - Does not match any tower level.');
		}
	}
	
	function cannonWeaponLevelStats(Level) {
		var obj = {
			image:images['images/weapons/tower_cannon.png'],
			projectileImage: images['images/particles/projectile_cannon.png'],
			projectileSpeed: 100,
			fireRate: 3000,
			rotateRate: 8 * 3.14159 / 1000, // radians per second;
			elapsedTime: 3000,
			canAttackGround: true,
			canAttackAir: false,
		}
		
		switch(Level) {
			case 1: 
				obj.damageDealt = 10;
				return obj;
			case 2: 
				obj.damageDealt = 25;
				return obj;
			case 3: 
				obj.damageDealt = 50;
				return obj;
			default:
				console.log('Cannon Weapon - Does not match any tower level.');
		}
	}
	//CANNON TOWER INFO---------------------------------------------
	
	//AIR TOWER INFO-------------------------------------------------------------
	function airTowerLevelPrice(Level) {
		switch(Level) {
			case 1: return 75;
			case 2: return 200;
			case 3: return 600;
			default:
				console.log('Air Price - Does not match any tower level.');
		}
	}
	
	function airWeaponLevelStats(Level) {
		var obj = {
			image: images['images/weapons/tower_air.png'],
			projectileImage: images['images/particles/projectile_air.png'],
			projectileSpeed: 65,
			fireRate: 4000,
			rotateRate: 8 * 3.14159 / 1000, // radians per second;
			elapsedTime: 4000,
			canAttackGround: false,
			canAttackAir: true,
		}
		
		switch(Level) {
			case 1: 
				obj.damageDealt = 75;
				return obj;
			case 2: 
				obj.damageDealt = 200;
				return obj;
			case 3: 
				obj.damageDealt = 800;
				return obj;
			default:
				console.log('Air Weapon - Does not match any tower level.');
		}
	}
	//AIR TOWER INFO-------------------------------------------------------------
	
	//MIXED TOWER INFO-------------------------------------------
	function mixedTowerLevelPrice(Level) {
		switch(Level) {
			case 1: return 20;
			case 2: return 75;
			case 3: return 175;
			default:
				console.log('Mixed Tower Price - Does not match any tower level.');
		}
	}
	
	function mixedWeaponLevelStats(Level) {
		var obj = {
			image: images['images/weapons/tower_air_ground_lvl2.png'],
			projectileImage: images['images/particles/projectile_mixed.png'],
			projectileSpeed: 115,
			fireRate: 1500,
			rotateRate: 8 * 3.14159 / 1000, // radians per second;
			elapsedTime: 1500,
			canAttackGround: true,
			canAttackAir: true,
		}
		
		switch(Level) {
			case 1: 
				obj.damageDealt = 10;
				return obj;
			case 2: 
				obj.damageDealt = 50;
				return obj;
			case 3: 
				obj.damageDealt = 115;
				return obj;
			default:
				console.log('Mixed Tower Weapon - Does not match any tower level.');
		}
	}
	//MIXED TOWER INFO-------------------------------------------
	
	return {
		setupNewTowerInfo: setupNewTowerInfo,
		returnTowerCost: returnTowerCost,
		returnTowerWeaponStats: returnTowerWeaponStats,
		returnTowerImage: returnTowerImage,
	};
}(GAME.images));