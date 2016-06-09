//------------------------------------------------------------------
//
// This is the GAME object that handles all game parameters and functions.
// Game images are stored. 
// The gameloop is executed upon IEFE call from the GAME.screen['game-play']
// run() when the user selects New Game from the main menu.
var GAME = {
	lastTimeStamp: performance.now(),
	elapsedTime: 0,
	cancelNextRequest: undefined,
	won: false,
	gameOver: false,
	gameOverText: undefined,
	gameWonText: undefined,
	highScores: {},
	myScore: undefined,
	myScoreText: undefined,
	myLevel: undefined,
	myStats: undefined,
	nextLevel: undefined,
	collisionManager: undefined,
	myTowerGrid: undefined,
	myCreeps: undefined,
	myWeapons: undefined,
	myArrowProjectiles: undefined,
	myCannonProjectiles: undefined,
	myAirProjectiles: undefined,
	myGoldParticles: undefined,
	myKeyboard: undefined,
	myMouse: undefined,
	towerOrigin: undefined,

	screens: {},

	images: {},
	
	sounds : {},
	

	status: {
		preloadRequest : 0,
		preloadComplete : 0
	},
	
	//----------------------------------------------------
	// 
	// Allow the game menu to reinitialize some values.
	reinitialize: function () {
		//Clear ALL
		GAME.lastTimeStamp = performance.now();
		GAME.cancelNextRequest = false;
		GAME.myScore = 0;
		GAME.towerGrid.reset();
		GAME.creeps.reset();
		GAME.stats.reset();
		GAME.weapons.reset();
		
		//Initialize Sounds
		GAME.sounds['sounds/arrowFire.wav'] = new Audio('sounds/arrowFire.wav');
		GAME.sounds['sounds/arrowHit.wav'] = new Audio('sounds/arrowHit.wav');
		GAME.sounds['sounds/Air_shot.mp3'] = new Audio('sounds/Air_shot.mp3');
		GAME.sounds['sounds/buiding_creation_wood.wav'] = new Audio('sounds/buiding_creation_wood.wav');
		GAME.sounds['sounds/building_creation.wav'] = new Audio('sounds/building_creation.wav');
		GAME.sounds['sounds/building_creation_stone.wav'] = new Audio('sounds/building_creation_stone.wav');
		GAME.sounds['sounds/building_sell.mp3'] = new Audio('sounds/building_sell.mp3');
		GAME.sounds['sounds/cannon_explosion.mp3'] = new Audio('sounds/cannon_explosion.mp3');
		GAME.sounds['sounds/cannon_shot.mp3'] = new Audio('sounds/cannon_shot.mp3');
		GAME.sounds['sounds/creepy_music.mp3'] = new Audio('sounds/creepy_music.mp3');
		GAME.sounds['sounds/dragon_death.wav'] = new Audio('sounds/dragon_death.wav');
		GAME.sounds['sounds/ground_creep_death.wav'] = new Audio('sounds/ground_creep_death.wav');
		GAME.sounds['sounds/tower_magic_explosion.wav'] = new Audio('sounds/tower_magic_explosion.wav');
		GAME.sounds['sounds/drawSteelBoys.wav'] = new Audio('sounds/drawSteelBoys.wav');
		GAME.sounds['sounds/help_underAttack.wav'] = new Audio('sounds/help_underAttack.wav');
		
		//Initialize towers and weapon objects
		GAME.myTowerGrid.generate();
		GAME.newTower = GAME.towerGrid.initializeNewTower();
		GAME.selectedTower = GAME.towerGrid.userSelectedTower({});
		GAME.myWeapons = GAME.weapons.initialize();
		GAME.weapons.setupCreepInfo( GAME.creeps.getGroundCreepInfo(),
									 GAME.creeps.getAirCreepInfo() );
		GAME.weapons.setupTowersInfo( GAME.towerGrid.getTowers(), 
									  GAME.towerGrid.getNewTowers(), 
									  GAME.towerGrid.getDeletedTowers() );
		
		//Initialize creep objects and creep pathing entrances / exits
		GAME.myCreeps = GAME.creeps.initialize();
		GAME.creeps.setEntrances( GAME.towerGrid.getLeftEntrance(),
								  GAME.towerGrid.getTopEntrance(),
								  GAME.towerGrid.getBottomEntrance() );
		GAME.creeps.setExit( GAME.towerGrid.getExit() );
		GAME.creeps.setHPtoRemove( GAME.collisions.getRemoveHPfromCreeps() );
		
		//Initialize particle systems
		GAME.myGoldParticles = GAME.particleSystem.initializeGold();
		GAME.myArrowProjectiles = GAME.particleSystem.initializeArrow();
		GAME.myCannonProjectiles = GAME.particleSystem.initializeCannon();
		GAME.myAirProjectiles = GAME.particleSystem.initializeAirMissile();
		GAME.particleSystem.setParticlesThatHitCreeps( 
								  GAME.collisions.getArrowsThatHitCreeps(),
		 						  GAME.collisions.getCannonsThatHitCreeps(),
								  GAME.collisions.getAirMissilesThatHitCreeps() );
		
		//Initialize Collision Detection and connect creep health removal array
		GAME.collisionManager = GAME.collisions.initialize();
		GAME.collisions.setupCreeps( GAME.creeps.getGroundCreepInfo(),
									 GAME.creeps.getAirCreepInfo() );
		GAME.collisions.setupProjectiles( 
									 GAME.particleSystem.getArrowParticles(),
									 GAME.particleSystem.getCannonParticles(),
									 GAME.particleSystem.getCannonExplosions(),
									 GAME.particleSystem.getAirParticles() );
		
		//Initialize user input controls
		GAME.myMouse = GAME.mouse.initialize();
		
		//Initialize levels
		GAME.myLevel = GAME.levels.initialize();
		GAME.levels.setupCreeps( GAME.creeps.getGroundCreepInfo(),
								 GAME.creeps.getAirCreepInfo() );
		
		//Initialize player stats - Gold / Lives
		GAME.myStats = GAME.stats.initialize();
		GAME.stats.reset();
		
		GAME.myAirProjectiles.reset();
		GAME.myArrowProjectiles.reset();
		GAME.myCannonProjectiles.reset();
	},
	
	//----------------------------------------------------
	// 
	// This is the main gameloop render function.
	// Render all objects that need rendering.
	render: function() {
		GAME.graphics.drawImage(GAME.background);
		
		//For loop is used to render towers/creeps in the correct order
		//using a "zIndex" since they are not purely top-down view.
		for(var i = 0; i < GAME.myTowerGrid.getGridInfo().rows; i++){
			GAME.myTowerGrid.render(i);
			GAME.myWeapons.render(i);
			GAME.myCreeps.render(i);
		}
		
		GAME.myStats.render();
		GAME.myArrowProjectiles.render();
		GAME.myCannonProjectiles.render();
		GAME.myAirProjectiles.render();
		GAME.myCreeps.renderDeadAirCreeps();
		GAME.myGoldParticles.render();
		GAME.selectedTower.render();
		GAME.newTower.render();
		
		GAME.renderText();
	},
	
	//----------------------------------------------------
	// 
	// This is the main gameloop update function.
	// Update all objects that need updating.
	update: function(elapsedTime) {
		var i,
			divide = 4;
		
		//update more interations for objects where
		//collision detection is critical
		for(i = 0; i < divide; i++) {
			//GAME.myKeyboard.update(elapsedTime/divide);
			GAME.myCreeps.update(elapsedTime/divide);
			GAME.myWeapons.update(elapsedTime/divide);
			GAME.myArrowProjectiles.update(elapsedTime/divide);
			GAME.myCannonProjectiles.update(elapsedTime/divide);
			GAME.myAirProjectiles.update(elapsedTime/divide);
			GAME.collisionManager.update(elapsedTime/divide);
		}
		
		GAME.myGoldParticles.update(elapsedTime);
		GAME.myLevel.update(elapsedTime);
		GAME.myStats.update(elapsedTime);
		GAME.myMouse.update(elapsedTime);
		GAME.selectedTower.update(elapsedTime);
		GAME.newTower.update(elapsedTime);
		
		GAME.updateText(elapsedTime);
	},
	
	//----------------------------------------------------
	// 
	// This is the main gameloop function.
	// calculate the elapsedTime since last frame, call update(), render()
	gameloop: function(time) {
		GAME.elapsedTime = time - GAME.lastTimeStamp;
		GAME.lastTimeStamp = time;
		
		GAME.update(GAME.elapsedTime);
		GAME.render();
		
		if(GAME.won) {
			GAME.gameWonText.render();		//Game Won State
			GAME.checkScores();
		} else if(GAME.gameOver) {
			GAME.gameOverText.render();		//Game Over State
			GAME.checkScores();
		} else if(!GAME.cancelNextRequest) {
			requestAnimationFrame(GAME.gameloop);
		}
	},
	
	updateText: function(elapsedTime) {
		GAME.towerBlockingText.update(elapsedTime);
		GAME.orcSpottedText.update(elapsedTime);
		GAME.orcLocationText.update(elapsedTime);
		GAME.playerScoreText.changeText('Score: '+ GAME.myScore);
	},
	
	renderText: function() {
		GAME.orcSpottedText.render();
		GAME.orcLocationText.render();
		GAME.towerBlockingText.render();
		GAME.playerScoreText.render();
	},
	
	//----------------------------------------------------
	// 
	// Manage scores for a player that wins.
	// Check if score is a new high score that needs to persist.
	checkScores: function() {
		GAME.persistence.isANewHighScore(GAME.myScore)
	}
};

//------------------------------------------------------------------
//
// This is the GAME.game IIFE that handles all menu functions.
// Menu states are initialized and shown through here.
// Called from the IIFE return statement in GAME.initialization.
GAME.game = (function(screens) {
	'use strict';
	
	function showScreen(id) {
		var screen = 0,
			active = null;
		
		// Remove the active state from all screens.  There should only be one...
		active = document.getElementsByClassName('active');
		for (screen = 0; screen < active.length; screen++) {
			active[screen].classList.remove('active');
		}
		
		// Tell the screen to start actively running
		screens[id].run();
		
		// Then, set the new screen to be active
		document.getElementById(id).classList.add('active');
	}
	
	function showScreens(id1, id2) {
		var screen = 0,
			active = null;
		
		// Remove the active state from all screens.  There will be two active...
		active = document.getElementsByClassName('active');
		for (screen = 0; screen < active.length; screen++) {
			active[screen].classList.remove('active');
		}
		
		// Tell the screen to start actively running
		screens[id1].run();
		screens[id2].run();
		
		// Then, set the new screens to be active
		document.getElementById(id1).classList.add('active');
		document.getElementById(id2).classList.add('active');
	}
	
	//------------------------------------------------------------------
	//
	// This function performs the one-time game initialization.
	function initialize() {
		var screen = null;
		
		// Go through each of the screens and tell them to initialize
		for (screen in screens) {
			if (screens.hasOwnProperty(screen)) {
				screens[screen].initialize();
			}
		}
		
		// Make the main-menu screen the active one
		showScreen('main-menu');
	}
	
	return {
		initialize: initialize,
		showScreen: showScreen,
		showScreens: showScreens,
	};

}(GAME.screens));

//------------------------------------------------------------------
//
// Wait until the browser 'onload' is called before starting to load
// any external resources.  This is needed because a lot of JS code
// will want to refer to the HTML document.
window.addEventListener('load', function() {
	console.log('Loading image and script resources...');
	
	GAME.audioExt = '';
	//
	// Find out which kind of audio support we have
	if (Modernizr.audio.mp3 === 'probably') {
		console.log('We have MP3 support');
		GAME.audioExt = 'mp3';
	}
	else if (Modernizr.audio.wav === 'probably') {
		console.log('We have WAV support');
		GAME.audioExt = 'wav';
	}
	
	Modernizr.load([
		{
			load : [
				'preload!images/particles/projectile_arrow.png',
				'preload!images/particles/projectile_cannon.png',
				'preload!images/particles/projectile_air.png',
				'preload!images/particles/projectile_mixed.png',
				'preload!images/particles/explosion.png',
				'preload!images/particles/smoke.png',
				'preload!images/particles/fire.png',
				'preload!images/particles/blue_sparkle.png',
				'preload!images/particles/white_sparkle.png',
				'preload!images/particles/rotatingGold.png',
				'preload!images/towers/arrow_lvl1.png',
				'preload!images/towers/arrow_lvl2.png',
				'preload!images/towers/arrow_lvl3.png',
				'preload!images/towers/cannon_lvl1.png',
				'preload!images/towers/cannon_lvl2.png',
				'preload!images/towers/cannon_lvl3.png',
				'preload!images/towers/air_lvl1.png',
				'preload!images/towers/air_lvl2.png',
				'preload!images/towers/air_lvl3.png',
				'preload!images/towers/mixed_lvl1.png',
				'preload!images/towers/mixed_lvl2.png',
				'preload!images/towers/mixed_lvl3.png',
				'preload!images/weapons/tower_arrow.png',
				'preload!images/weapons/tower_cannon.png',
				'preload!images/weapons/tower_air.png',
				'preload!images/weapons/tower_air_ground_lvl1.png',
				'preload!images/weapons/tower_air_ground_lvl2.png',
				'preload!images/weapons/tower_air_ground_lvl3.png',
				'preload!images/buttons/arrow_lvl1.png',
				'preload!images/buttons/cannon_lvl1.png',
				'preload!images/buttons/air_lvl1.png',
				'preload!images/buttons/mixed_lvl1.png',
				'preload!images/creeps/ground_ogre.png',
				'preload!images/creeps/ground_grunt.png',
				'preload!images/creeps/air_dragon.png',
				'preload!images/creeps/dead_ground_grunt.png',
				'preload!images/creeps/dead_ground_ogre.png',
				'preload!images/creeps/dead_air_dragon.png',
				'preload!images/gameBackground.png',
				'preload!scripts/index.js',
				'preload!scripts/random.js',
				'preload!scripts/scorePersistance.js',
				'preload!scripts/mainMenu.js',
				'preload!scripts/towerMenu.js',
				'preload!scripts/game-play.js',
				'preload!scripts/userControls.js',
				'preload!scripts/about.js',
				'preload!scripts/highScores.js',
				'preload!scripts/input.js',
				'preload!scripts/mouse.js',
				'preload!scripts/graphics.js',
				'preload!scripts/particleSystem.js',
				'preload!scripts/text.js',
				'preload!scripts/pathing.js',
				'preload!scripts/playerStats.js',
				'preload!scripts/towerGrid.js',
				'preload!scripts/creeps.js',
				'preload!scripts/levels.js',
				'preload!scripts/towerInfo.js',
				'preload!scripts/towerWeapons.js',
				'preload!scripts/collisions.js',
				'preload!scripts/Initialize.js'
			],
			complete : function() {
				console.log('All files requested for loading...');
			}
		}
	]);
}, false);

// Extend yepnope with our own 'preload' prefix that...
// * Tracks how many have been requested to load
// * Tracks how many have been loaded
// * Places images into the 'images' object
yepnope.addPrefix('preload', function(resource) {
	console.log('preloading: ' + resource.url);
	
	GAME.status.preloadRequest += 1;
	var isImage = /.+\.(jpg|png|gif)$/i.test(resource.url);
	resource.noexec = isImage;
	resource.autoCallback = function(e) {
		if (isImage) {
			var image = new Image();
			image.src = resource.url;
			GAME.images[resource.url] = image;
		}
	
		GAME.status.preloadComplete += 1;
		
		//
		// When everything has finished preloading, go ahead and start the game
		if (GAME.status.preloadComplete === GAME.status.preloadRequest) {
			console.log('Preloading complete!');
			GAME.initialize();
		}
	};
	
	return resource;
});
