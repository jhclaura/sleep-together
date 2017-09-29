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

var myStartX = 0,
    myStartZ = 10,
    myStartY = 3.5; //y: 3.5, 100
var myPosition, myStartRotY, worldBubble, pplCount, pplCountTex, pplCountMat;

var model, texture;
var dummy;
var perlin = new ImprovedNoise(),
    noiseQuality = 1;

var basedURL = "assets/sleep/";

var textureLoader, loadingManger;
var keyIsPressed;

// WAVE
var timeWs = [0, Math.PI / 2, Math.PI, -Math.PI / 2, Math.PI + 0.3, -Math.PI / 5, Math.PI / 1.1];
var frequencyWs = [0.02, 0.01];
var frequencyW = 0.02,
    amplitudeW = 1,
    offsetW = 0;
var sinWave, sinWaves = [],
    cosWaves = [],
    tanWaves = [],
    spin;
var sinWRun = [],
    cosWRun = [],
    tanWRun = [];

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
var fGuyHandHigh = false,
    sGuyHandHigh = false;
var bodyGeo;
var dailyLifeME, colorME;
var dailyLifePlayerDict = {},
    dailyLifePlayerObject = new THREE.Object3D();

var person, personGeo, personMat, toiletTex, toiletMat;
var persons = [],
    personIsWalking = [],
    personCircle, personAmount = 3;
var personsAppeared = false,
    personsAnied = false,
    personsWalked = false;
var personWalkTimeoutID, personAniInterval, personAniIntervalCounter = 0,
    personAniSequence = [1, 3, 5, 6];
var poop, poopGeo, poopTex, poopMat, poopHat, poopHeartTex;
var poopM, poopMGeo, poopMTex, poopMMat, poopHeartGeo, poopHeartMat, poopHeart;
var personBody, personHead, personToilet;
var keyframe, lastKeyframe, currentKeyframe;
var animOffset = 1,
    keyduration = 28;
var aniStep = 0,
    aniTime = 0,
    slowAni = 0.4;
var personKeyframeSet = [28, 15, 1, 8, 1, 12, 10, 1];
var personAniOffsetSet = [1, 30, 48, 50, 58, 60, 72, 82]; //2: sit freeze; 4: push freeze; 7: stand freeze
var personFreeze = false;

// SOUND
// var usingWebAudio = true, bufferLoader, convolver, mixer;
// var source, buffer, audioBuffer, gainNode, convolverGain;
// var soundLoaded = false;
// var masterGain, sampleGain;
// var audioSources = [], gainNodes = [];

// var sound_sweet = {};
// var sweetSource;
// var vecZ = new THREE.Vector3(0,0,1);
// var vecY = new THREE.Vector3(0,-1,0);
// var sswM, sswX, sswY, sswZ;
// var camM, camMX, camMY, camMZ;	

// var _iOSEnabled = false;

// window.AudioContext = (window.AudioContext || window.webkitAudioContext || null);
// if (!AudioContext) {
//   throw new Error("AudioContext not supported!");
// } 

// var audioContext = new AudioContext();
// var sample = new SoundsSample(audioContext);

// var sound_fire, sound_bathroom, sound_stomach, sound_forest, sound_poop, sound_meditation, sound_opening;
// var initSound = false, yogaOver = false;

// var switchSound_1 = false;

// STAR
var star, starMat, glowTexture, glowTextures = [],
    starAnimator, starAnimators = [],
    stars = [];
var starFiles = [basedURL + "images/sStar_1.png", basedURL + "images/sStar_2.png",
    basedURL + "images/sStar_3.png", basedURL + "images/sStar_4.png"
];

// SLEEPER
// Geo
var sleeperOrigin = "Earth";
// Time
var currMinute, startTimestamp, endTimestamp;
var sleeper, sleeperGeo, sleeperTexture, sleep_test, sleeperGeo_test;
var breathLightTexture;
var chewerA, chewerTextures = [],
    chewers = [];
var isGazing = false,
    isGazeMoving = false,
    notifyGazeMax = false;
var eyeTex, eyeGeo, eyeGaze;
var EyeMaxSize = 5,
    gazeTargetIndex = -1;
var lookingAtSomeone = -1,
    someoneLookingAtMe = -1;
var sleeperStartPositions = {};

var socialMediaGroup, socialMediaMat, socialMediaTex, socialMediaScreens = [],
    socialMediaTweens = [],
    sm_materials = [];
var glowGeo, glowMat1, glowMat2, sm_glow;

var nestTex, nestStickGeos = [],
    nestSticks = [];


// Gaze-To-Move:
// 1) Look at someone => CreateBigEye (from_index_look: true, to_index_look: false), startGazeTime
// 2) BigEyeGrow - if not look away, size max: 5
// 2.5) If other looks back: CreateYellowLine
// 3) if both EyeSize all 5 (from_index_look: true, to_index_look: true), start moving toward the center point
// 4) once move, keep moving eventhough look away
// 5) sync breathing tempo (true for local player)

var worldTotal = 18,
    eaterPerTable = 6,
    tableAmount = 3;

////////////////////////////////////////////////////////////

// init();				// Init after CONNECTION
superInit(); // init automatically
// connectSocket();		// Init after superInit

///////////////////////////////////////////////////////////
// FUNCTIONS 
///////////////////////////////////////////////////////////
function superInit() {

    // Determine Sleepers Start Positions
    var s_index = 0;
    for (var j = 0; j < 3; j++) {
        for (var i = 7; i < 13; i++) {
            var startPos = new THREE.Vector3(
                (i - 10) * 45 + GetRandomArbitrary(0, 15),
                j * 50 + GetRandomArbitrary(0, 13), -500 + GetRandomArbitrary(0, 3)
            );
            sleeperStartPositions[s_index] = startPos;
            s_index++;
        }
    }

    // Use http://freegeoip.net in script_functions.js
    GetGeoData();

    myColor = new THREE.Color();

    //Prevent scrolling for Mobile
    noScrolling = function(event) {
        event.preventDefault();
    };

    // HOWLER
    sound_forest = new Howl({
        urls: ['../audios/duet/nightForest.mp3'],
        loop: true,
        volume: 0.2
    });


    time = Date.now();

    // THREE.JS -------------------------------------------
    clock = new THREE.Clock();

    // RENDERER
    container = document.getElementById('render-canvas');
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x34122a, 1); // nighttime
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
    hemiLight = new THREE.HemisphereLight(0x224659, 0x593522, 0.8); // nighttime
    scene.add(hemiLight);

    // light = new THREE.SpotLight( 0xffffff );
    // light.position.set( 100, 100, -100);
    // light.intensity = 0.3;
    // scene.add(light);

    // CAMERA
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.z -= 0.6;

    // RAYCASTER!
    eyerayCaster = new THREE.Raycaster();

    // Sinwave
    sinWave = new SinWave(timeWs[0], frequencyW, amplitudeW, offsetW);

    for (var i = 0; i < timeWs.length; i++) {
        var sw = new SinWave(timeWs[i], frequencyW, amplitudeW, offsetW);
        sinWaves.push(sw);
    }

    planet = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshLambertMaterial({ color: 0xff0000, side: THREE.DoubleSide }));
    scene.add(planet);

    scene.add(dailyLifePlayerObject);

    //////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////
    /*
    	START LOADING	                                                          
    */
    //////////////////////////////////////////////////////////////////////////////////////////

    loadingManger = new THREE.LoadingManager();
    loadingManger.onProgress = function(item, loaded, total) {
        // console.log( item, loaded, total );
        var loadingPercentage = Math.floor(loaded / total * 100);
        // loadingTxt.innerHTML = "loading " + loadingPercentage +"%";
        console.log("loading " + loadingPercentage + "%");
    };

    loadingManger.onError = function(err) {
        console.log(err);
    };

    loadingManger.onLoad = function() {

        CreateStars();
        //CreateNest();

        console.log("ALL LOADED!");
        startLink.style.display = "";
        loadingImg.style.display = "none";
        loadingTxt.style.display = "none";

        readyToStart = true;
    };

    textureLoader = new THREE.TextureLoader(loadingManger);
    var modelLoader = new THREE.JSONLoader(loadingManger);

    //loadSitModelPlayer(basedURL + "models/personHead.js", basedURL + "models/sleepBody2.json");

    LoadStarTexture();

    sleeper_test_Texture = textureLoader.load(basedURL + 'images/chef2.jpg');
    breathLightTexture = textureLoader.load("images/glow_edit.png");

    eyeTex = textureLoader.load(basedURL + 'images/eyeGaze.jpg');
    modelLoader.load(basedURL + "models/eye.json", function(geometry, material) {
        eyeGeo = geometry;
        eyeGaze = new THREE.Mesh(eyeGeo, new THREE.MeshBasicMaterial({ map: eyeTex }));
    });

    modelLoader.load(basedURL + "models/sleeper3.json", function(geometry, material) {
        sleeperGeo_test = geometry;
        sleep_test = new THREE.SkinnedMesh(sleeperGeo_test, new THREE.MeshLambertMaterial({ map: sleeper_test_Texture, skinning: true, side: THREE.DoubleSide }));
        //scene.add(sleep_test);
    });

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '5px';
    stats.domElement.style.zIndex = 100;
    stats.domElement.children[0].style.background = "transparent";
    stats.domElement.children[0].children[1].style.display = "none";
    container.appendChild(stats.domElement);

    // EVENTS
    window.addEventListener('resize', onWindowResize, false);

    // After trigger the loading functions
    // Connect to WebSocket!
    connectSocket();

    // lateInit();

    //pageIsReadyToStart = true;

    // Create social media clone
    /*
	var socialMediaDiv = byId("sm-div");
	var canvas1 = document.createElement('canvas');
	var context1 = canvas1.getContext('2d');
	canvas1.id = "sm-canvas";
	context1.font = "Bold 40px Arial";
	context1.fillStyle = "rgba(255,0,0,0.95)";
    context1.fillText('Hello, world! sdkfjlsakjdhf;asldjf;lskdjf;lskdjf;siajdf;lsakdjf;lsakdf;lksadf;lskadh;a', 0, 50);
    socialMediaDiv.appendChild(canvas1);

    var testImg = document.createElement("img");
    testImg.src = "assets/sleep/images/sStar_1.png";
    socialMediaDiv.appendChild(testImg);

    var testImg2 = new Image();
    testImg2.src = "assets/sleep/images/sStar_2.png";
    testImg2.onload = function(){
    	context1.drawImage(testImg2, 100, 100);
    };

    // Canvas as texture test
    var canvasTex = new THREE.CanvasTexture(canvas1);
    var canvasMat = new THREE.MeshBasicMaterial({map: canvasTex, side: THREE.DoubleSide});
    canvasMat.transparent = true;
    var canvasMesh = new THREE.Mesh(
    	new THREE.PlaneGeometry(canvas1.width, canvas1.height),
    	canvasMat
    );
    canvasMesh.scale.multiplyScalar(0.01);
    scene.add(canvasMesh);
    */

    // Social Media Wall
    socialMediaTex = textureLoader.load(basedURL + 'images/socialScreen.jpg');
    socialMediaTex.wrapT = THREE.RepeatWrapping;
    socialMediaTex.repeat.set(1, 0.4);
    sm_glow = textureLoader.load(basedURL + 'images/glow_sm2.png');
    sm_glow.needsUpdate = true;

    // 5 differnet textures and materials to share
    for (var i = 0; i < 5; i++) {
        var cloneTex = socialMediaTex.clone();
        cloneTex.needsUpdate = true;

        var sm_mat = new THREE.MeshBasicMaterial({
            map: cloneTex,
            side: THREE.DoubleSide
        });

        sm_materials.push(sm_mat);

        ScrollSocialMedia(sm_mat.map.offset);
    }

    //socialMediaGroup = new THREE.Object3D();
    modelLoader.load(basedURL + "models/glow.json", function(geometry, material) {
        glowGeo = geometry;
        glowMat1 = new THREE.MeshBasicMaterial({
            map: sm_glow,
            transparent: true // side: THREE.DoubleSide//, color: 0x8ff9f5
        });
        glowMat2 = new THREE.MeshBasicMaterial({
            map: sm_glow,
            transparent: true,
            side: THREE.BackSide
        });
        var glowMesh = new THREE.Mesh(glowGeo, glowMat1);
        glowMesh.scale.multiplyScalar(4);
        var glowMesh2 = new THREE.Mesh(glowGeo, glowMat2);
        glowMesh2.scale.multiplyScalar(4);

        // Create Social Medai Wall
        var sm_plane = new THREE.PlaneGeometry(16, 28);
        var screenIndex = 0;
        // --- Real for indexing (6*3=18 total)
        for (var j = 0; j < 3; j++) {
            for (var i = 7; i < 13; i++) {
                var sm_screen = new THREE.Mesh(sm_plane, sm_materials[GetRandomInt(0, sm_materials.length)]);
                sm_screen.position.copy(sleeperStartPositions[screenIndex]);

                sm_screen.add(glowMesh.clone());
                sm_screen.add(glowMesh2.clone());

                socialMediaScreens.push(sm_screen);

                scene.add(sm_screen);
                //socialMediaGroup.add(sm_screen);
                screenIndex++;
            }
        }
        // --- Fake
        for (var j = 0; j < 5; j++) {
            for (var i = 0; i < 20; i++) {

                if ((j >= 0 && j < 3) && (i >= 7 && i < 13))
                    continue;

                var sm_screen = new THREE.Mesh(sm_plane, sm_materials[GetRandomInt(0, sm_materials.length)]);
                sm_screen.position.set(
                    (i - 10) * 45 + GetRandomArbitrary(0, 15),
                    j * 50 + GetRandomArbitrary(0, 13), -500 + GetRandomArbitrary(0, 3)
                );

                sm_screen.add(glowMesh.clone());
                sm_screen.add(glowMesh2.clone());

                socialMediaScreens.push(sm_screen);

                scene.add(sm_screen);
                //socialMediaGroup.add(sm_screen);
                screenIndex++;
            }
        }
        //scene.add(socialMediaGroup);
        //TweenMax.to(glowMeshScales, 2, {x:4.3,y:4.3,z:4.3, yoyo: true, repeat:-1});
    });

    nestTex = textureLoader.load(basedURL + 'images/grassDead.jpg');
    modelLoader.load(basedURL + "models/nest.json", function(geometry, material) {
        var nest = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
            map: nestTex
        }));
        nest.scale.multiplyScalar(2);
        scene.add(nest);
    });
    // loadModelSticks(
    //     basedURL + "models/stick1.json", basedURL + "models/stick2.json",
    //     basedURL + "models/stick3.json", basedURL + "models/stick4.json",
    //     basedURL + "models/stick5.json"
    // );
}

function ScrollSocialMedia(el) {
    var intensity = GetRandomArbitrary(0, 0.8);
    //console.log(intensity);
    var sm_tween = TweenMax.to(el, 3, { y: "-=" + intensity, ease: Power4.easeOut, delay: GetRandomArbitrary(0.5, 1.5), onComplete: ScrollSocialMedia, onCompleteParams: [el] });
    socialMediaTweens.push(sm_tween);
}

function AssignIndex() {
    // console.log("whoIamInLife: " + whoIamInLife);

    // Assign position
    // meInWorld = Math.floor(whoIamInLife/18);			// which world <== dealt at Server


    // myStartX = 50;
    // myStartY = 50;
    // myStartZ = 50;
    //myPosition = new THREE.Vector3(myStartX, myStartY, myStartZ);
    myPosition = sleeperStartPositions[whoIamInLife];
    myStartX = myPosition.x;
    myStartY = myPosition.y;
    myStartZ = myPosition.z;

    myWorldCenter = myPosition.clone();
    myWorldCenter.z -= 10;
}

// lateInit() happens after click "Start"
function lateInit() {
    // console.log("late init!");
    document.body.addEventListener('touchmove', noScrolling, false);
    window.addEventListener('keydown', myKeyPressed, false);
    window.addEventListener('keyup', myKeyUp, false);

    clock.start();

    // build me!
    // myPosition = new THREE.Vector3( myStartX, myStartY, myStartZ-5 );
    console.log(myPosition);
    firstGuy = new PersonSleep(myPosition, myColor, whoIamInLife, playerNName);
    dailyLifePlayerDict[whoIamInLife] = firstGuy;

    // secGuy = new PersonSleep( myPosition, new THREE.Color(), 8, "andy" );
    // secGuy.player.position.x = 5;

    // create controls
    controls = new THREE.DeviceControls(camera, myWorldCenter, true);
    scene.add(controls.getObject());

    // update stuff position based on myPosition
    // introRoom.position.set( myPosition.x, myPosition.y-3.5, myPosition.z );
    // UpdateRotationWithMe( introRoom );


    // start to animate()!
    animate(performance ? performance.now() : Date.now());

    trulyFullyStart = true;

    // Timestamp
    startTimestamp = Date.now();
    currMinute = Math.floor(startTimestamp / 60);
    // ------ SEND_TO_SERVER => PLAYER_TIME ------
    var msg = {
        'type': 'timestamp',
        'index': whoIamInLife,
        'time': new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        'worldId': meInWorld
    };

    if (ws) {
        sendMessage(JSON.stringify(msg));
    }
    // --------------------------------------------

    // Moving
    var nestPos = controls.position().clone();
    nestPos.multiplyScalar(20 / 225);
    nestPos.z = GetRandomArbitrary(-7, 7);

    setTimeout(() => {
        controls.createTweenForMove(nestPos, 6);

        // TweenMax.to(socialMediaGroup.position, 3, {z:-5000, delay:7, onComplete: ()=>{
        // 	disposeSocialMedia();
        // }});
        // TweenMax.staggerTo(socialMediaScreens, 0, {
        //     opacity: 0,
        //     delay: 4,
        //     onStartParams: ["{self}"],
        //     onStart: (tween) => {
        //         tween.target.visible = 0;
        //     }
        // }, 0.05, disposeSocialMedia);
        setTimeout(()=>{
        	disposeSocialMedia();
        }, 6500);

    }, 5000);
}

function disposeSocialMedia() {
    // tweenMax
    for (var i = 0; i < socialMediaTweens.length; i++) {
        socialMediaTweens[i].kill();
    }
    socialMediaTweens = undefined;

    // mesh
    // scene.remove(socialMediaGroup);
    for (var i = 0; i < socialMediaScreens.length; i++) {
        scene.remove(socialMediaScreens[i]);
    }
    socialMediaScreens = undefined;
    //socialMediaGroup = undefined;

    // geometry
    glowGeo.dispose();

    // texture
    for (var i = 0; i < sm_materials.length; i++) {
        sm_materials[i].map.dispose();
    }
    socialMediaTex.dispose();
    socialMediaTex = undefined;
    sm_glow.dispose();
    sm_glow = undefined;

    // material
    glowMat1.dispose();
    glowMat1 = undefined;
    glowMat2.dispose();
    glowMat2 = undefined;
    for (var i = 0; i < sm_materials.length; i++) {
        sm_materials[i].dispose();
    }
    sm_materials = undefined;
}

function createHeart(fromIndex, toIndex) {
    // Needs: camera position, camera direction

    var position_from = dailyLifePlayerDict[fromIndex].player.position.clone();
    var position_to = dailyLifePlayerDict[toIndex].player.position.clone();

    position_to.subVectors(position_to, position_from).multiplyScalar(4 / 6).add(position_from);
    // position_to = dailyLifePlayerDict[ fromIndex ].player.worldToLocal( position_to );

    var shootT = position_from.distanceTo(position_to);

    var poopH = poopHeart.clone();
    poopH.scale.set(0.5, 0.5, 0.5);
    poopH.position.copy(dailyLifePlayerDict[fromIndex].player.position);
    poopH.lookAt(dailyLifePlayerDict[toIndex].player.position);
    scene.add(poopH);

    // var mHOut = new TWEEN.Tween(poopH.position)
    // 			.to( {x: position_to.x,
    // 				  y: position_to.y-1,
    // 				  z: position_to.z}, Math.floor(shootT)*400 )
    // 			.easing( TWEEN.Easing.Quadratic.InOut );

    // var mHGone = new TWEEN.Tween(poopH.scale)
    // 			.to( {x: 0.01, y: 0.01, z: 0.01}, 1000 )
    // 			.easing( TWEEN.Easing.Elastic.In )
    // 			.onComplete(function(){
    // 				scene.remove(poopH);
    // 			});

    TweenMax.to(poopH.position, Math.floor(shootT) * 0.4, {
        x: position_to.x,
        y: position_to.y - 1,
        z: position_to.z,
        ease: Power1.easeInOut,
        onComplete: () => {

            TweenMax.to(poopH.scale, 1, {
                x: 0.01,
                y: 0.01,
                z: 0.01,
                ease: Back.easeIn,
                onComplete: () => {
                    scene.remove(poopH);
                }
            });
        }
    });

    // mHOut.chain(mHGone);
    // mHOut.start();

    // sample.trigger( 4, 1 );

    console.log("send heart from " + fromIndex + " to " + toIndex);
}

function myKeyPressed(event) {
    if (keyIsPressed) return;
    keyIsPressed = true;

    switch (event.keyCode) {

        case 49: //1
            // firstGuy.chew();
            break;

        case 50: //2
            // secGuy.chew();
            break;

        case 51: //3
            // thirdGuy.chew();
            break;

        case 52: //4
            // fourthGuy.chew();
            break;

        case 53: //5 --> day time
            // daytimeChange( 1 );
            break;

        case 54: //6 --> night time
            // daytimeChange( 0 );
            break;

        case 55: //7 --> mouth close
            // CloseMouth();
            break;

        case 56: //8 --> mouth open
            // OpenMouth();
            break;

        case 57: //9 --> mouth wide open
            // OpenMouthWide();
            break;
    }
}

function myKeyUp(event) {
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


function update() {
    // TWEEN.update();
    controls.update(Date.now() - time);

    var dt = clock.getDelta();

    // STAR
    if (starAnimators.length > 0) {
        for (var i = 0; i < starAnimators.length; i++) {
            starAnimators[i].updateLaura(300 * dt);
        }
    }

    // eyeRay!
    var directionCam = controls.getDirection(1).clone();
    eyerayCaster.set(controls.position().clone(), directionCam);

    // v.1
    /*
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
    */

    // v.2 - PLAYERS_ONLY
    eyeIntersects = eyerayCaster.intersectObject(dailyLifePlayerObject, true);
    if (eyeIntersects.length > 0) {
        var iName = eyeIntersects[0].object.name;
        iName = iName.split(" ");
        if (iName.length == 2) {
            lookingAtSomeone = iName[0];
        } else {
            lookingAtSomeone = -1;
        }
    } else {
        lookingAtSomeone = -1;
    }

    if (!isGazeMoving)
        GazeToMove();

    // Update all the player
    for (var p in dailyLifePlayerDict) {
        if (p != whoIamInLife)
            dailyLifePlayerDict[p].transUpdate();
    }
    //
    time = Date.now();

    // Keep track of time, send to server if minute changes
    var newMinute = Math.floor(time / 60);
    if (newMinute != currMinute) {
        // -------------- SEND_TO_SERVER ---------------
        var msg = {
            'type': 'timestamp',
            'index': whoIamInLife,
            'time': new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
            'worldId': meInWorld
        };

        if (ws) {
            sendMessage(JSON.stringify(msg));
        }
        //-----------------------------------------------
        currMinute = newMinute;
    }

    // social media scrolling
    // socialMediaTex.offset.y -= 0.001;
}

function render() {
    effect.render(scene, camera);
}

function removePlayer(playerID) {
    if (dailyLifePlayerDict[playerID]) {

        // v.1
        //scene.remove( dailyLifePlayerDict[playerID].player );
        // v.2
        dailyLifePlayerObject.remove(dailyLifePlayerDict[playerID].player);

        delete dailyLifePlayerDict[playerID];
    }
}

function UpdatePplCount(thisWorldCount, totalCount, totalVisit) {
    if (bathroom.visible) return;

    pplCountTex.clear().drawText("Pooper", undefined, 100, 'white');
    pplCountTex.drawText("Counter", undefined, 250, 'white');
    pplCountTex.drawText("this world: " + thisWorldCount, undefined, 400, 'white');
    pplCountTex.drawText("current: " + totalCount, undefined, 550, 'white');
    pplCountTex.drawText("visited: " + totalVisit, undefined, 700, 'white');
}

function GazeToMove() {
    // Gaze-To-Move
    // 1) Look at someone => CreateBigEye (from_index_look: true, to_index_look: false), startGazeTime
    // 2) BigEyeGrow - if not look away, size max: 5
    // 2.5) If other looks back: CreateYellowLine
    // 3) if both EyeSize all 5 (from_index_look: true, to_index_look: true), start moving toward the center point
    // 4) once move, keep moving eventhough look away
    // 5) sync breathing tempo (true for local player)
    if (lookingAtSomeone != -1 && lookingAtSomeone != whoIamInLife) {
        // First gaze!
        if (!isGazing) {
            // ------ SEND_TO_SERVER_ME_START_GAZING (Nah..) ------
            // if(trulyFullyStart){
            // 	var msg = {
            // 		'type': 'gaze',
            // 		'index': whoIamInLife,
            // 		'toWhom': lookingAtSomeone,
            // 		'playerPos': controls.position,
            // 		'playerDir': controls.getDirection(),
            // 		'worldId': meInWorld
            // 	};

            // 	if(ws){
            // 		sendMessage( JSON.stringify(msg) );
            // 	}
            // }
            // ----------------------------------------------------

            firstGuy.lookAt = lookingAtSomeone;
            isGazing = true;

            console.log("start gaze!");

            // if this "lookingAtSomeone" already looking at me
            if (lookingAtSomeone == someoneLookingAtMe) {
                firstGuy.wordTexture.clear();
                firstGuy.wordBubble.visible = false;
            }
        }

        // Keep gazing!
        // grow eye size ++
        firstGuy.eye.visible = true;
        firstGuy.eye.scale.lerp(new THREE.Vector3(1, 1, 1), 0.01);

        // if my eye size >= 1
        if (firstGuy.eye.scale.x >= 0.9) {
            // ------ SEND_TO_SERVER_ME_MAX_EYE / READY ------
            if (!notifyGazeMax) {
                var msg = {
                    'type': 'gaze',
                    'index': whoIamInLife,
                    'toWhom': lookingAtSomeone,
                    // 'playerPos': controls.position,
                    // 'playerDir': controls.getDirection(),
                    'worldId': meInWorld
                };

                if (ws) {
                    sendMessage(JSON.stringify(msg));
                    notifyGazeMax = true;
                }
                console.log("ME_MAX_EYE");
            }

            if (lookingAtSomeone == someoneLookingAtMe) {
                if (!isGazeMoving) {
                    var p_from = firstGuy.player.position.clone();
                    var p_to = dailyLifePlayerDict[lookingAtSomeone].player.position.clone();
                    var dist_T = p_from.distanceTo(p_to);

                    if (dist_T > 3) {
                        var midPoint = new THREE.Vector3();
                        midPoint.addVectors(p_from, p_to).multiplyScalar(1 / 2);
                        var myTarget = new THREE.Vector3().subVectors(p_from, midPoint).normalize().multiplyScalar(2);
                        dist_T = p_from.distanceTo(midPoint) * 1.5;

                        controls.createTweenForMove(myTarget, dist_T);
                        console.log("GAZE_TO_MOVE! time: " + dist_T);

                        firstGuy.wordTexture.clear();
                        firstGuy.wordBubble.visible = false;

                        setTimeout(function() {
                            console.log("reset isGazeMoving");
                            isGazeMoving = false;
                        }, dist_T * 1000);

                        isGazeMoving = true;
                    }

                }
            }
        }
    } else {
        // First stop gaze!
        if (isGazing) {
            // ------ SEND_TO_SERVER_ME_STOP_GAZING ------
            var msg = {
                'type': 'gaze',
                'index': whoIamInLife,
                'toWhom': -1,
                // 'playerPos': yawObject.position,
                // 'playerDir': scope.getDirection(),
                'worldId': meInWorld
            };

            if (ws) {
                sendMessage(JSON.stringify(msg));
            }
            // --------------------------------------------

            // RESET
            firstGuy.lookAt = -1;
            isGazing = false;
            notifyGazeMax = false;
            isGazeMoving = false;

            firstGuy.closeEye();

            console.log("stop gaze!");
        }
    }
}

function LoadStarTexture() {
    // var textureLoader = new THREE.TextureLoader( starLoadingManager );
    var textureLoader = new THREE.TextureLoader(loadingManger);

    for (var i = 0; i < starFiles.length; i++) {
        textureLoader.load(starFiles[i], function(texture) {
            glowTexture = texture;
            glowTextures.push(glowTexture);
            starAnimator = new TextureAnimator(glowTexture, 4, 1, 8, 60, [0, 1, 2, 3, 2, 1, 3, 2]);
            starAnimators.push(starAnimator);
            // console.log(i);
            // if(index==3)
            // 	CreateStars();
        });
    }
}

function LoadTexModelPoopHeart(_tex, _model) {
    var h_texLoader = new THREE.TextureLoader(loadingManger);
    // h_texLoader.load(_tex, function(texture){
    // poopHeartTex = texture;
    // poopHeartMat = new THREE.MeshLambertMaterial({map: poopHeartTex});
    poopHeartTex = h_texLoader.load(_tex);
    poopHeartMat = new THREE.MeshLambertMaterial({ map: poopHeartTex });

    // MODEL_BODY
    var h_loader = new THREE.JSONLoader(loadingManger);
    h_loader.load(_model, function(geometry) {
        poopHeartGeo = geometry.clone();
        // poopHeartGeo.computeBoundingSphere();

        poopHeart = new THREE.Mesh(poopHeartGeo, poopHeartMat);

        // then create person!

        // loadingCountText("poop heart");
    });
    // });
}

function CreateStars() {
    for (var i = 0; i < 50; i++) {
        mat = new THREE.SpriteMaterial({ map: glowTextures[i % 4], color: 0xffef3b, transparent: false, blending: THREE.AdditiveBlending });
        var st = new THREE.Sprite(mat);
        st.position.set(Math.random() * (myStartX + 400) - (myStartX + 200), Math.random() * -100 + 400, Math.random() * (myStartZ + 400) - (myStartZ + 200));
        st.rotation.y = Math.random() * Math.PI;
        st.scale.set(7, 7, 7);
        scene.add(st);
        stars.push(st);
    }
}

function CreateNest() {
    var stickMat = new THREE.MeshLambertMaterial({ map: nestTex });
    for (var i = 0; i < nestStickGeos.length; i++) {
        var n_stick = new THREE.Mesh(nestStickGeos[i], stickMat);
        n_stick.scale.multiplyScalar(2);
        scene.add(n_stick);
        nestSticks.push(n_stick);
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
    effect.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function isTouchDevice() {
    return 'ontouchstart' in window || !!(navigator.msMaxTouchPoints);
}