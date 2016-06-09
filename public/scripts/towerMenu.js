//------------------------------------------------------------------
//
// 'TowerMenu' menu state. Runs from onmouseover and onlick events from index.html.
// This IIFE manages what gold, lives, and tower information is displayed to the
// tower-stats div.
GAME.screens['tower-menu'] = (function(game)  {
	
	var newTowerLevel = 1
		SELLBACK_MODIFIER = 0.7,
		currentSellPrice = undefined,
		currentUpgradePrice = undefined;
	
	function initialize() {
		// Setup each of the menu events for this screen
		initializeNewTowerButtons();
		
		initializeSellorUpgradeTowerButton();
	}
	
	function run() {
		
	}
	
	function showNewTowerStats(towerType, level) {
		var obj = {},
			towerInfo = '<p>';
		
		switch(towerType) {
			case 'arrow':
				towerInfo += 'New Arrow Tower' + '<br/>';
				break;
			case 'cannon':
				towerInfo += 'New Cannon Tower' + '<br/>';
				break;
			case 'air':
				towerInfo += 'New Air Tower' + '<br/>';
				break;
			case 'mixed':
				towerInfo += 'New Air/Ground Tower' + '<br/>';
				break;
			default:
				console.log('Unknown tower type for stats display.');
		}
		
		obj = GAME.towerInfo.returnTowerWeaponStats(towerType, level);
		obj.cost = GAME.towerInfo.returnTowerCost(towerType, level);
		
		towerInfo += 'Gold Cost: ' + obj.cost + '<br/>';
		towerInfo += 'Damage: ' + obj.damageDealt + '<br/>';
		towerInfo += 'Attack Rate: ' + (obj.fireRate / 1000) + ' s<br/></p>';
		
		showDiv('new-tower-stats');
		document.getElementById('newtowerInfo').innerHTML = towerInfo;
	}
	
	//Show properties for a selected tower
	function showSelectedTowerStats(towerType, level) {
		var obj = {},
			towerInfo = '<p>';
		
		switch(towerType) {
			case 'arrow':
				towerInfo += 'Level ' + level + ' Arrow Tower' + '<br/>';
				break;
			case 'cannon':
				towerInfo += 'Level ' + level + ' Cannon Tower' + '<br/>';
				break;
			case 'air':
				towerInfo += 'Level ' + level + ' Air Tower' + '<br/>';
				break;
			case 'mixed':
				towerInfo += 'Level ' + level + ' Ground/Air Tower' + '<br/>';
				break;
			default:
				console.log('Unknown tower type for stats display.');
		}
		
		obj = GAME.towerInfo.returnTowerWeaponStats(towerType, level);
		obj.cost = GAME.towerInfo.returnTowerCost(towerType, level);
		if(level < 3) {
			obj.upgradeCost = GAME.towerInfo.returnTowerCost(towerType, level+1);
		}
		
		obj.sellPrice = Math.round(obj.cost * SELLBACK_MODIFIER);
		currentSellPrice = obj.sellPrice;
		
		if(obj.upgradeCost !== undefined) {
			showDiv('upgradeTower');
			currentUpgradePrice = obj.upgradeCost;
			towerInfo += 'Upgrade Cost: ' + obj.upgradeCost + '<br/>';
		} else {
			currentUpgradePrice = undefined;
			hideDiv('upgradeTower');
		}
		
		towerInfo += 'Sell Price: ' + obj.sellPrice + '<br/>';
		towerInfo += 'Damage: ' + obj.damageDealt + '<br/>';
		towerInfo += 'Attack Rate: ' + (obj.fireRate / 1000) + ' s<br/></p>';
		
		showDiv('selected-tower-stats');
		document.getElementById('selectedtowerInfo').innerHTML = towerInfo;
	}
	
	function showDiv(divToShow) {
		document.getElementById(divToShow).style.display = "block";
	}
	
	function hideDiv(divToHide) {
		document.getElementById(divToHide).style.display = "none";
	}
	
	function showGold(amount) {
		document.getElementById('players-gold').innerHTML = amount;
	}
	
	function showLives(amount) {
		 document.getElementById('players-lives').innerHTML = amount;
	}
	
	//Initialize New Tower Buttons
	function initializeNewTowerButtons() {
		document.getElementById('ground1').addEventListener(
			'mouseover',
			function() {
				showNewTowerStats('arrow', newTowerLevel); 
		});
			
		document.getElementById('ground1').addEventListener(
			'mouseout',
			function() {
				hideDiv('new-tower-stats');
		});
		
		document.getElementById('ground2').addEventListener(
			'mouseover',
			function() {
				showNewTowerStats('cannon', newTowerLevel); 
		});
			
		document.getElementById('ground2').addEventListener(
			'mouseout',
			function() {
				hideDiv('new-tower-stats');
		});
		
		document.getElementById('air1').addEventListener(
			'mouseover',
			function() {
				showNewTowerStats('air', newTowerLevel); 
		});
			
		document.getElementById('air1').addEventListener(
			'mouseout',
			function() {
				hideDiv('new-tower-stats');
		});
		
		document.getElementById('mixed1').addEventListener(
			'mouseover',
			function() {
				showNewTowerStats('mixed', newTowerLevel); 
		});
			
		document.getElementById('mixed1').addEventListener(
			'mouseout',
			function() {
				hideDiv('new-tower-stats');
		});
	}
	
	//Initialize the button to sell selected towers.
	function initializeSellorUpgradeTowerButton() {
		document.getElementById('upgradeTower').addEventListener(
			'click',
			function() {
				GAME.towerGrid.upgradeSelectedTower(currentUpgradePrice); 
		});
		
		document.getElementById('sellTower').addEventListener(
			'click',
			function() {
				GAME.towerGrid.sellSelectedTower(currentSellPrice); 
		});
	}
	
	return {
		initialize: initialize,
		run: run,
		showNewTowerStats: showNewTowerStats,
		showSelectedTowerStats: showSelectedTowerStats,
		showDiv: showDiv,
		hideDiv: hideDiv,
		showGold: showGold,
		showLives: showLives,
	};
}(GAME.game));