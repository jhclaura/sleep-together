/*
 * Made by @jhclaura (Laura Chen, jhclaura.com)
 */

// PointerLockControls
// http://www.html5rocks.com/en/tutorials/pointerlock/intro/
	var element = document.body;
	var pointerControls, dateTime = Date.now();
	var objects = [];
	var rays = [];
	var blocker, instructions;

	var havePointerLock = 
				'pointerLockElement' in document || 
				'mozPointerLockElement' in document || 
				'webkitPointerLockElement' in document;

	if ( havePointerLock ) {
		// console.log("havePointerLock");
		blocker = document.getElementById('blocker');
		instructions = document.getElementById('instructions');

		var pointerlockchange = function ( event ) {

			if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
				console.log("enable pointerControls");

				controls.enabled = true;
				blocker.style.display = 'none';

			} else {

				controls.enabled = false;
				blocker.style.display = '-webkit-box';
				blocker.style.display = '-moz-box';
				blocker.style.display = 'box';

				instructions.style.display = '';
			}

		}

		var pointerlockerror = function(event){
			instructions.style.display = '';
		}

		// Hook pointer lock state change events
		document.addEventListener( 'pointerlockchange', pointerlockchange, false );
		document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

		document.addEventListener( 'pointerlockerror', pointerlockerror, false );
		document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
		document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );


		if(isTouchDevice()) {
			console.log("isTouchDevice");
			// instructions.addEventListener( 'touchend', funToCall, false );
		} else {
			instructions.addEventListener( 'click', funToCall, false );
		}

	} else {
		//instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
	}

	function funToCall(event){

		console.log("click or touch!");
		instructions.style.display = 'none';

		// Ask the browser to lock the pointer
		element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

		controls.enabled = true;

		if ( /Firefox/i.test( navigator.userAgent ) ) {
			var fullscreenchange = function ( event ) {
				if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
					document.removeEventListener( 'fullscreenchange', fullscreenchange );
					document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
					element.requestPointerLock();
				}
			}
			document.addEventListener( 'fullscreenchange', fullscreenchange, false );
			document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

			element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
			element.requestFullscreen();
		} else {
			element.requestPointerLock();
		}
	}



////////////////////////////////////////////////////////////	
// SET_UP_VARIABLES
////////////////////////////////////////////////////////////

var scene, camera, container, renderer, effect, stats;
var light,controls;
var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;
var time, clock;

var myStartX = 0, myStartZ = 0, myStartY = 2; //2

var model, texture;
var dummy;
var perlin = new ImprovedNoise(), noiseQuality = 1;

// WAVE
	var timeWs = [0, Math.PI/2, Math.PI, -Math.PI/2, Math.PI+0.3, -Math.PI/5, Math.PI/1.1];
	var frequencyWs = [0.02, 0.01];
	var frequencyW = 0.02, amplitudeW = 0.1, offsetW = 0;
	var sinWaves = [], cosWaves = [], tanWaves = [];
	var sinWRun = [], cosWRun = [], tanWRun = [];

// RAYCAST
	var objects = [];
	var ray;
	var projector, eyerayCaster;
	var lookDummy, lookVector;

// WEBCAM
	var videoImageContext, videoTexture;
	var videoWidth = 480, videoHeight = 320;
	var eye, eyeGeo, eyeDummy, eyePos;
	var remoteImageContext, remoteTexture;
	var otherEye, otherEyeGeo, otherEyeDummy, otherEyePos;
	var otherEyes=[], otherEyesPos=[], otherEyesRot=[];
	var myMat, yourMat;

// PLAYERS
	var skinTexture;
	var firstGuy, firstGuyBody, firstGuyHead, secondGuy, secondGuyBody, secondGuyHead;
	var QforBodyRotation;
	var fGuyHandHigh = false, sGuyHandHigh = false;
	var bodyGeo;

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


////////////////////////////////////////////////////////////

// init();		// Init after the CONNECTION thing




///////////////////////////////////////////////////////////
// FUNCTIONS 
///////////////////////////////////////////////////////////
			
function init() 
{	
	//Prevent scrolling for Mobile
	document.body.addEventListener('touchmove', function(event) {
	  event.preventDefault();
	}, false);

	// WEB_AUDIO_API --------------------------------------
		bufferLoader = new BufferLoader(
			audioContext, [ '../audios/duet/nightForest.mp3',
						    '../audios/duet/firecrack.mp3',
						    '../audios/duet/monsters.mp3' ], 
					  finishedLoading
		);
		bufferLoader.load();


	time = Date.now();
	clock = new THREE.Clock();
	clock.start();

	// THREE.JS -------------------------------------------
	// RENDERER
		container = document.getElementById('render-canvas');
		renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0xc1ede5, 1);
		container.appendChild(renderer.domElement);

	// EFFECT
		// effect = new THREE.StereoEffect(renderer);
		// effect.seperation = 0.2;
		// effect.targetDistance = 50;
		// effect.setSize(window.innerWidth, window.innerHeight);

	// SCENE
		scene = new THREE.Scene();

	// LIGHT
		// light = new THREE.DirectionalLight( 0xffffff, 1);
		// light.position.set(1,1,1);
		// scene.add(light);
		// light = new THREE.DirectionalLight( 0xffffff, 1);
		// light.position.set(-1,1,-1);
		// scene.add(light);
		light = new THREE.HemisphereLight( 0xf9ff91, 0x3ac5b9, 1);
		scene.add(light);

	// CAMERA
		camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 10000);

		controls = new THREE.DeviceControls(camera, true);
		scene.add( controls.getObject() );

	// MY_CAMERA
		videoImageContext = videoImage.getContext('2d');
		videoImageContext.fillStyle = '0xffffff';
		videoImageContext.fillRect(0, 0, videoWidth, videoHeight);

		videoTexture = new THREE.Texture( videoImage );
		videoTexture.minFilter = THREE.LinearFilter;
		videoTexture.magFilter = THREE.LinearFilter;
		videoTexture.format = THREE.RGBFormat;
		videoTexture.generateMipmaps = false;

		videoTexture.wrapS = videoTexture.wrapT = THREE.ClampToEdgeWrapping;
		videoTexture.needsUpdate = true;

	// REMOTE_CAMERA
		remoteImageContext = remoteImage.getContext('2d');
		remoteImageContext.fillStyle = '0xffff00';
		remoteImageContext.fillRect(0,0,videoWidth, videoHeight);

		remoteTexture = new THREE.Texture( remoteImage );
		remoteTexture.minFilter = THREE.LinearFilter;
		remoteTexture.magFilter = THREE.LinearFilter;
		remoteTexture.format = THREE.RGBFormat;
		remoteTexture.generateMipmaps = false;

		remoteTexture.wrapS = remoteTexture.wrapT = THREE.ClampToEdgeWrapping;
		remoteTexture.needsUpdate = true;

		myMat = new THREE.MeshBasicMaterial({map: videoTexture, side: THREE.DoubleSide});
		yourMat = new THREE.MeshBasicMaterial({map: remoteTexture, side: THREE.DoubleSide});

	// PLAYERS
		// skinTexture = THREE.ImageUtils.loadTexture('images/guyW.png');
		var loader = new THREE.TextureLoader();
		loader.load('images/guyW.png', function(texture){
			skinTexture = texture;
		});

		firstGuy = new THREE.Object3D();
		firstGuyBody = new THREE.Object3D();
		firstGuyHead = new THREE.Object3D();
		secondGuy = new THREE.Object3D();
		secondGuyBody = new THREE.Object3D();
		secondGuyHead = new THREE.Object3D();

		eyeGeo = new THREE.PlaneGeometry(2, 1.5, 1, 1);

		loader = new THREE.JSONLoader();
		loader.load( "models/Guy2/GuyB.js", function( geometry ){
			bodyGeo = geometry.clone();

			// add body --> body's children[0]
			var fGuy = new THREE.Mesh( geometry.clone(), new THREE.MeshLambertMaterial( { map: skinTexture, color: 0xff0000 } ) );				
			fGuy.name = "body";
			firstGuyBody.add(fGuy);

			var sGuy = new THREE.Mesh( geometry.clone(), new THREE.MeshLambertMaterial( { map: skinTexture, color: 0x00ff00 } ) );
			sGuy.name = "body";
			secondGuyBody.add(sGuy);

			loader.load( "models/Guy2/GuyLA.js", function( geometry2 ){
				var tmpLA = geometry2.clone();
				transY(tmpLA, -0.2);
				transZ(tmpLA, -0.1);

				// add LA --> body's children[1]
				fGuy = new THREE.Mesh( tmpLA.clone(), new THREE.MeshLambertMaterial( { map: skinTexture, color: 0xff0000 } ) );
				fGuy.name = "LA";
				fGuy.position.y = 0.2;
				fGuy.position.z = 0.1;
				firstGuyBody.add(fGuy);

				sGuy = new THREE.Mesh( tmpLA.clone(), new THREE.MeshLambertMaterial( { map: skinTexture, color: 0x00ff00 } ) );
				sGuy.name = "LA";
				sGuy.position.y = 0.2;
				sGuy.position.z = 0.1;
				secondGuyBody.add(sGuy);

				loader.load( "models/Guy2/GuyRA.js", function(geometry3){
					var tmpRA = geometry3.clone();
					transY(tmpRA, -0.2);
					transZ(tmpRA, -0.1);

					fGuy = new THREE.Mesh( tmpRA.clone(), new THREE.MeshLambertMaterial( { map: skinTexture, color: 0xff0000 } ) );
					fGuy.name = "RA";
					fGuy.position.y = 0.2; //0.2
					fGuy.position.z = 0.1;
					// add RA --> body's children[2]
					firstGuyBody.add(fGuy);
					// add body --> GUY's children[0]
					firstGuy.add( firstGuyBody );

					sGuy = new THREE.Mesh( tmpRA.clone(), new THREE.MeshLambertMaterial( { map: skinTexture, color: 0x00ff00 } ) );
					sGuy.name = "RA";
					sGuy.position.y = 0.2;
					sGuy.position.z = 0.1;
					secondGuyBody.add(sGuy);
					secondGuy.add( secondGuyBody );

					loader.load( "models/Guy2/GuyH.js", function(geometry4){
						var myHead = new THREE.Mesh( geometry4.clone(), new THREE.MeshLambertMaterial({map: skinTexture, color: 0xff0000}));
						var eyeScreen = new THREE.Mesh(eyeGeo.clone(), myMat);
						eyeScreen.scale.set(0.5,0.5,0.5);
						eyeScreen.position.y = 1;
						eyeScreen.position.z = 1;

						// MYSELF - Should have head or not? No head thus no blocking!
						firstGuyHead.add(myHead);
						firstGuyHead.add(eyeScreen);
						firstGuyHead.name = "head";

						// add head --> GUY's children[1]
						firstGuy.add(firstGuyHead);
						firstGuy.position.z = 3;
						scene.add( firstGuy );

						var yourHead = new THREE.Mesh( geometry4.clone(), new THREE.MeshLambertMaterial( { map: skinTexture, color: 0x00ff00 } ) );
						eyeScreen = new THREE.Mesh( eyeGeo.clone(), yourMat );
						eyeScreen.scale.set(0.5,0.5,0.5);
						eyeScreen.position.y = 1;
						eyeScreen.position.z = 1;

						// OTHERS - yes head cuz blocking is fine!
						secondGuyHead.add(yourHead);
						secondGuyHead.add(eyeScreen);
						secondGuyHead.name = "head";

						secondGuy.add(secondGuyHead);
						secondGuy.position.z = -3;
						scene.add( secondGuy );
					});
				});
			});

		});

	// // Loading External Texture & Model
	// var manager = new THREE.LoadingManager();
	// // TEXTURE
	// texture = new THREE.Texture();
	// var loader = new THREE.ImageLoader( manager );
	// loader.load( 'images/tree.png', function ( image ) {
	// 	texture.image = image;
	// 	texture.needsUpdate = true;
	// } );

	// // MODLE (MESH)
	// // - Import using OBJLoader.js
	// // - reference: http://threejs.org/examples/webgl_loader_obj.html
	// var onProgress = function ( xhr ) {
	// 	if ( xhr.lengthComputable ) {
	// 		var percentComplete = xhr.loaded / xhr.total * 100;
	// 		console.log( Math.round(percentComplete, 2) + '% downloaded' );
	// 	}
	// };

	// var onError = function ( xhr ) {
	// };
	// var loader = new THREE.OBJLoader( manager );
	// loader.load( 'models/bed.obj', function (object) {

	// 	object.traverse( function ( child ) {
	// 		if ( child instanceof THREE.Mesh ) {
	// 			child.material.map = texture;
	// 		}
	// 	} );

	// 	model = object;
	// 	model.scale.set(7,7,7);
	// 	scene.add( model );

	// }, onProgress, onError );


	///////////////////////////////////////////////////////

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '5px';
	stats.domElement.style.zIndex = 100;
	stats.domElement.children[ 0 ].style.background = "transparent";
	stats.domElement.children[ 0 ].children[1].style.display = "none";
	container.appendChild(stats.domElement);

	//////////////////////////////////////////////////////
	
	
	// EVENTS
	// automatically resize renderer
	window.addEventListener( 'resize', onWindowResize, false );
	window.addEventListener('click', fullscreen, false);

	
	// CONTROLS
	// controls = new THREE.OrbitControls( camera, renderer.domElement );

	//
	animate();	
}

// web audio api
function finishedLoading(bufferList){

	for(var i=0; i<bufferList.length; i++){
		var s = audioContext.createBufferSource();
		audioSources.push(s);

		var g = audioContext.createGain();
		gainNodes.push(g);

		audioSources[i].buffer = bufferList[i];
		audioSources[i].loop = true;
		audioSources[i].connect(gainNodes[i]);
		gainNodes[i].connect(audioContext.destination);
		
		audioSources[i].start(0);
	}
	gainNodes[0].gain.value = 1;
	gainNodes[1].gain.value = 0.2;
	gainNodes[2].gain.value = 0;

	audioAllLoaded = true;
}

function animate() 
{
    requestAnimationFrame( animate );				//http://creativejs.com/resources/requestanimationframe/
	update();
	render();		
}

function update()
{	
	// WEB_CAM
		if(video.readyState === video.HAVE_ENOUGH_DATA){
			videoImageContext.drawImage(video, 0, 0, videoWidth, videoHeight);

			if(videoTexture){
				videoTexture.flipY = true;
				videoTexture.needsUpdate = true;
			}
		}

		if(remote.readyState === remote.HAVE_ENOUGH_DATA){
			remoteImageContext.drawImage(remote, 0, 0, videoWidth, videoHeight);

			if(remoteTexture){
				remoteTexture.flipY = true;
				remoteTexture.needsUpdate = true;
			}
		}

	controls.update( Date.now() - time );
	stats.update();

	//
	time = Date.now();
}

function render() 
{	
	renderer.render( scene, camera );
	
	// VR
		// effect.render(scene, camera);
}

function updatePlayer(playerIndex, playerLocX, playerLocZ, playerRotY, playerQ){

	// if(playerID<myID)
	// 	var index = playerID-1+storkPlayers.length;
	// else //playerID>myID
	// 	var index = playerID-2+storkPlayers.length-1;

	if(playerIndex==0){
		firstGuy.position.x = playerLocX;
		firstGuy.position.z = playerLocZ;

		// head
		if(firstGuy.children[1])
			firstGuy.children[1].rotation.setFromQuaternion( playerQ );
		
		// body
		// firstGuy.children[0].rotation.setFromQuaternion( playerQ );
		// firstGuy.children[0].rotation.x = 0;
		// firstGuy.children[0].rotation.z = 0;
		var ahhRotation = new THREE.Euler().setFromQuaternion( playerQ, 'YXZ' );

		if(firstGuy.children[0])
			firstGuy.children[0].rotation.y = ahhRotation.y;

	}
	
	if(playerIndex==1){
		secondGuy.position.x = playerLocX;
		secondGuy.position.z = playerLocZ;

		//head
		if(secondGuy.children[1])
			secondGuy.children[1].rotation.setFromQuaternion( playerQ );

		//body
		var ahhRotation2 = new THREE.Euler().setFromQuaternion( playerQ, 'YXZ' );

		if(secondGuy.children[0])
			secondGuy.children[0].rotation.y = ahhRotation2.y;
	}
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
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	// effect.setSize( window.innerWidth, window.innerHeight );
}

function isTouchDevice() { 
	return 'ontouchstart' in window || !!(navigator.msMaxTouchPoints);
}
