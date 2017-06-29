////////////////////////////////////////////////////////////	
// SET_UP_VARIABLES
////////////////////////////////////////////////////////////

var scene, camera, container, renderer, effect, stats;
var vrmanager;
var hemiLight, controls;
var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;
var time, clock;

var loadedCount = 0;

var myStartX = 0, myStartZ = 10, myStartY = 3.5; //y: 3.5, 100
var myPosition, myStartRotY, worldBubble, pplCount, pplCountTex, pplCountMat;

var model, texture;
var dummy;
var perlin = new ImprovedNoise(), noiseQuality = 1;

var basedURL = "assets/eat/";

var textureLoader, loadingManger;
var keyIsPressed;

// WAVE
	var timeWs = [0, Math.PI/2, Math.PI, -Math.PI/2, Math.PI+0.3, -Math.PI/5, Math.PI/1.1];
	var frequencyWs = [0.02, 0.01];
	var frequencyW = 0.02, amplitudeW = 1, offsetW = 0;
	var sinWave, sinWaves = [], cosWaves = [], tanWaves = [], spin;
	var sinWRun = [], cosWRun = [], tanWRun = [];

// RAYCAST
	var objects = [];
	var ray;
	var projector, eyerayCaster, eyeIntersects;
	var lookDummy, lookVector;

// PLAYERS
	var skinTexture;
	var guyBodyGeo, guyLAGeo, guyRAGeo, guyHeadGeo;
	var personTex;
	var player, playerBody, playerHead;
	var firstPlayer, secondPlayer;
	var firstGuy, firstGuyBody, firstGuyHead, secondGuy, secondGuyBody, secondGuyHead;
	var QforBodyRotation;
	var fGuyHandHigh = false, sGuyHandHigh = false;
	var bodyGeo;
	var dailyLifeME, colorME, dailyLifePlayers = [];
	var dailyLifePlayerDict = {};

	var person, personGeo, personMat, toiletTex, toiletMat;
	var persons = [], personIsWalking = [], personCircle, personAmount = 3;
	var personsAppeared = false, personsAnied = false, personsWalked = false;
	var personWalkTimeoutID, personAniInterval, personAniIntervalCounter=0, personAniSequence = [1,3,5,6];
	var poop, poopGeo, poopTex, poopMat, poopHat, poopHeartTex;
	var poopM, poopMGeo, poopMTex, poopMMat, poopHeartGeo, poopHeartMat, poopHeart;
	var personBody, personHead, personToilet;
	var keyframe, lastKeyframe, currentKeyframe;
	var animOffset = 1, keyduration = 28;
	var aniStep = 0, aniTime = 0, slowAni = 0.4;
	var personKeyframeSet =   [ 28, 15,  1,  8,  1, 12, 10, 1 ];
	var personAniOffsetSet = [  1, 30, 48, 50, 58, 60, 72, 82 ];	//2: sit freeze; 4: push freeze; 7: stand freeze
	var personFreeze = false;

// WEB_AUDIO_API!
	var usingWebAudio = true, bufferLoader, convolver, mixer;
	var source, buffer, audioBuffer, gainNode, convolverGain;
	var soundLoaded = false;
	var masterGain, sampleGain;
	var audioSources = [], gainNodes = [];

	var sound_sweet = {};
	var sweetSource;
	var vecZ = new THREE.Vector3(0,0,1);
	var vecY = new THREE.Vector3(0,-1,0);
	var sswM, sswX, sswY, sswZ;
	var camM, camMX, camMY, camMZ;	

	var _iOSEnabled = false;

	window.AudioContext = (window.AudioContext || window.webkitAudioContext || null);
	if (!AudioContext) {
	  throw new Error("AudioContext not supported!");
	} 

	var audioContext = new AudioContext();
	var sample = new SoundsSample(audioContext);

	var sound_fire, sound_bathroom, sound_stomach, sound_forest, sound_poop, sound_meditation, sound_opening;
	var initSound = false, yogaOver = false;

	var switchSound_1 = false;

// STAR
	var star, starMat, glowTexture, glowTextures = [], starAnimator, starAnimators = [], stars = [];
	var starFiles = [ basedURL + "images/sStar_1.png", basedURL + "images/sStar_2.png",
					  basedURL + "images/sStar_3.png", basedURL + "images/sStar_4.png" ];

// TREE
	var treeTexture, treeGeo, treeMat, trees = [];

// TRANSITION
	var initTime, meditationTime, celebrationTime, endTime;
	var descendTween;
	var audiosArePlayed = false, inScMeditation = false, inScCelebration = false, inScEnd = false;
	var isAllOver = false;
	var noScrolling;

// PARTICLES
	var emitter, particleGroup;
	var counter, particleTex;
	var portals = [], portalLights = []
	var portalPosition = [ new THREE.Vector3(-61,100,-15),
						   new THREE.Vector3(24,100,87),
						   new THREE.Vector3(58,100,37),
						   new THREE.Vector3(10,100,-67),
						   new THREE.Vector3(-47,100,36),
						   new THREE.Vector3(-71,100,-65),
						   new THREE.Vector3(96,100,-31)];
	var poopTower = [], poopTowers = [], portalPoopAnimation;
	var partyLightMat;

//
	var planet, truck, curtain, curtainGeo1, curtainGeo2, lanternGroup;
	var highChair, highChairMat, stomach, stomachTex;
	var table;
	var chewerA, chewerB, chewerC, chewerD, chewerTextures = [], chewers = [];
	var mealTimeIndex = 2;

	var mouth, mouthClosed = false;
	var looptime = 40 * 1000, monsterPath, monsterPathTube;
	var m_binormal = new THREE.Vector3();
	var m_normal = new THREE.Vector3(0,1,0);
	var intros = {}, introRoom, introRoomObject = {};

	var tablePositions = [];
	var worldTotal = 18, eaterPerTable = 6, tableAmount = 3;

////////////////////////////////////////////////////////////

// init();				// Init after CONNECTION
superInit();			// init automatically

// connectSocket();		// Init after superInit

///////////////////////////////////////////////////////////
// FUNCTIONS 
///////////////////////////////////////////////////////////
function superInit(){

	myColor = new THREE.Color();

	//Prevent scrolling for Mobile
	noScrolling = function(event){
		event.preventDefault();
	};

	time = Date.now();

	// THREE.JS -------------------------------------------
		clock = new THREE.Clock();

	// RENDERER
		container = document.getElementById('render-canvas');
		renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
		renderer.setPixelRatio(window.devicePixelRatio);
		if(mealTimeIndex == 0){
			renderer.setClearColor(0x77edda, 1); // daytime
		} else if (mealTimeIndex == 1){
			renderer.setClearColor(0xffe03e, 1); // noontime
		} else {
			renderer.setClearColor(0x34122a, 1);	// nighttime
		}
		container.appendChild(renderer.domElement);

	// VR_EFFECT
		effect = new THREE.VREffect(renderer);
		effect.setSize(window.innerWidth, window.innerHeight);

	// Create a VR manager helper to enter and exit VR mode.
		var params = {
		  hideButton: false, // Default: false.
		  isUndistorted: false // Default: false.
		};
		vrmanager = new WebVRManager(renderer, effect, params);

	// SCENE
		scene = new THREE.Scene();

	// LIGHT
		if(mealTimeIndex == 0){
			hemiLight = new THREE.HemisphereLight( 0xf9ff91, 0x3ac5b9, 1); // daytime
		} else if (mealTimeIndex == 1){
			hemiLight = new THREE.HemisphereLight( 0xffce91, 0xff9791, 1); // noontime
		} else {
			hemiLight = new THREE.HemisphereLight( 0x224659, 0x593522, 1);	// nighttime
		}
		hemiLight.intensity = 0.8;
		scene.add(hemiLight);

		light = new THREE.SpotLight( 0xffffff );
		light.position.set( 100, 100, -100);
		light.intensity = 0.3;
		scene.add(light);

	// CAMERA
		camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 10000);
		camera.position.z -= 0.6;

	// RAYCASTER!
		eyerayCaster = new THREE.Raycaster();	

	// for(var i=0; i<20; i++){
	// 	var pplanet = new THREE.Mesh( new THREE.SphereGeometry(0.5), new THREE.MeshBasicMaterial() );
	// 	pplanet.position.x = Math.sin(Math.PI*2/20*i)*20;
	// 	pplanet.position.z = Math.cos(Math.PI*2/20*i)*20;
	// 	scene.add( pplanet );
	// }
	

	//////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////
	/*
		START LOADING	                                                          
	*/
	//////////////////////////////////////////////////////////////////////////////////////////

	loadingManger = new THREE.LoadingManager();
	loadingManger.onProgress = function ( item, loaded, total ) {
	    // console.log( item, loaded, total );
	    var loadingPercentage = Math.floor(loaded/total*100);
	    //loadingTxt.innerHTML = "loading " + loadingPercentage +"%";
	    console.log("loading " + loadingPercentage +"%");
	};

	loadingManger.onError = function(err) {
		console.log(err);
	};

	loadingManger.onLoad = function () {
	    console.log("ALL LOADED!");
		// startLink.style.display = "";
		// loadingImg.style.display = "none";
		// loadingTxt.style.display = "none";
		readyToStart = true;

		whoIamInLife = 1;
		meInWorld = 0;
		AssignIndex();
		lateInit();
	};

	textureLoader = new THREE.TextureLoader( loadingManger );

	//
	// loadModelTruck( basedURL + "models/foodCarts_small/cart_cart.json",
	// 				basedURL + "models/foodCarts_small/cart_lantern.json",
	// 				basedURL + "models/foodCarts_small/cart_rooftop.json",
	// 				basedURL + "models/foodCarts_small/cart_supports.json",
	// 				basedURL + "models/foodCarts_small/cart_wheels.json",
	// 				basedURL + "models/foodCarts_small/cart_wood.json" );

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '5px';
	stats.domElement.style.zIndex = 100;
	stats.domElement.children[ 0 ].style.background = "transparent";
	stats.domElement.children[ 0 ].children[1].style.display = "none";
	container.appendChild( stats.domElement );
	
	// EVENTS
	window.addEventListener('resize', onWindowResize, false);

	// After trigger the loading functions
	// Connect to WebSocket!
		//connectSocket();

	//
	// lateInit();

	whoIamInLife = 1;
		meInWorld = 0;
		AssignIndex();
		lateInit();
}

function AssignIndex() {
	// console.log("whoIamInLife: " + whoIamInLife);

	// Assign position
	// meInWorld = Math.floor(whoIamInLife/18);			// which world
	meInBGroup = Math.floor(( (whoIamInLife-1)%worldTotal ) / eaterPerTable);		// which table (0~2)
	meInSGroup = ( (whoIamInLife-1)%worldTotal ) % eaterPerTable;					// which seat of the table (0~5)

	// var tableX = Math.sin(Math.PI*2/eaterPerTable * meInBGroup)*10 + 10;
	// var tableZ = Math.cos(Math.PI*2/eaterPerTable * meInBGroup)*10 + 10;
	myWorldCenter = new THREE.Vector3();
	//myWorldCenter = tablePositions[meInBGroup].clone();

	myStartX = Math.sin(Math.PI*2/eaterPerTable * meInSGroup)*2.5 + myWorldCenter.x;
	myStartZ = Math.cos(Math.PI*2/eaterPerTable * meInSGroup)*2.5 + myWorldCenter.z;
	
	// myStartX = 50;
	// myStartY = 50;
	// myStartZ = 50;
	myPosition = new THREE.Vector3( myStartX, myStartY, myStartZ );

	console.log("Me in world: " + meInWorld + ", table: " + meInBGroup + ", seat: " + meInSGroup);
}

// lateInit() happens after click "Start"
function lateInit() 
{	
	// console.log("late init!");
	document.body.addEventListener('touchmove', noScrolling, false);
	window.addEventListener('keydown', myKeyPressed, false);
	window.addEventListener('keyup', myKeyUp, false);

	clock.start();

	// build me!
	// myPosition = new THREE.Vector3( myStartX, myStartY, myStartZ-5 );
	console.log(myPosition);
	//firstGuy = new PersonEat( myPosition, myColor, whoIamInLife, "laura", mouth );
	//dailyLifePlayerDict[ whoIamInLife ] = firstGuy;

	// secGuy = new PersonEat( myPosition, new THREE.Color(), 1, "andy" );
	// secGuy.player.position.x = 5;

	// thirdGuy = new PersonEat( myPosition, new THREE.Color(), 2, "zoe" );
	// thirdGuy.player.position.x = -5;

	// fourthGuy = new PersonEat( myPosition, new THREE.Color(), 3, "corbin" );
	// fourthGuy.player.position.x = -5;
	// fourthGuy.player.position.z = 10;

	// create controls
	controls = new THREE.DeviceControls(camera, myWorldCenter, true);
	scene.add( controls.getObject() );

	// start to animate()!
	animate(performance ? performance.now() : Date.now());

	trulyFullyStart = true;
}

function geoFindMe() {
	if(!navigator.geolocation){
		console.log("Geolocation is not supported by your browser");
		return;
	}

	function success(position){
		var latitude = position.coords.latitude;
		var longitude = position.coords.longitude;
		console.log("geolocation - latitude: " + latitude + ", longitude: " + longitude);
	}

	function error(){
		console.log("Unable to retrieve your location");
	}

	navigator.geolocation.getCurrentPosition(success, error)
}

function myKeyPressed( event ){
	if(keyIsPressed)	return;
	keyIsPressed = true;

	switch ( event.keyCode ) {

		case 49: //1
			//
			break;
	}
}

function myKeyUp(event){
	keyIsPressed = false;
}

// v.2
// Request animation frame loop function
var lastRender = 0;

function animate(timestamp) {
	// if(!isAllOver){
		var delta = Math.min(timestamp - lastRender, 500);
		lastRender = timestamp;

		update();
		
		// Render the scene through the manager.
		vrmanager.render(scene, camera, timestamp);
		stats.update();
	// }
	requestAnimationFrame(animate);
}


function update()
{	
	controls.update( Date.now() - time );

	var dt = clock.getDelta();

	// eyeRay!
		var directionCam = controls.getDirection(1).clone();
		eyerayCaster.set( controls.position().clone(), directionCam );
		eyeIntersects = eyerayCaster.intersectObjects( scene.children, true );
		//console.log(intersects);

		if( eyeIntersects.length > 0 ){
			var iName = eyeIntersects[ 0 ].object.name;
			iName = iName.split(" ");
			if(iName.length==2){
				lookingAtSomeone = iName[0];
			} else {
				lookingAtSomeone = -1;
			}

			// if ( eyeIntersects[ 0 ].object == flushHandler ){
			// 	// ...
			// }

			// if ( eyeIntersects.length > 1 ) {
				// if(eyeIntersects[ 1 ].object.name == "miniPoop"){
				// 	// console.log("See mini poop!");
				// 	lookAtMiniPoop = true;
				// } else {
				// 	lookAtMiniPoop = false;
				// }
			// }
		} else {
			lookingAtSomeone = -1;
		}

	//
	time = Date.now();
}

function render() 
{	
	effect.render(scene, camera);
}

function fullscreen() {
	if (container.requestFullscreen) {
		container.requestFullscreen();
	} else if (container.msRequestFullscreen) {
		container.msRequestFullscreen();
	} else if (container.mozRequestFullScreen) {
		container.mozRequestFullScreen();
	} else if (container.webkitRequestFullscreen) {
		container.webkitRequestFullscreen();
	}
}

function onWindowResize() {
	effect.setSize( window.innerWidth, window.innerHeight );
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
}

function isTouchDevice() { 
	return 'ontouchstart' in window || !!(navigator.msMaxTouchPoints);
}
