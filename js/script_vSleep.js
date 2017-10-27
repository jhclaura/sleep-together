////////////////////////////////////////////////////////////	
// SET_UP_VARIABLES
////////////////////////////////////////////////////////////

var devMode = false;

var scene, camera, container, renderer, effect, stats;
var vrmanager;
var enterVR, animationDisplay;
var hemiLight, controls;
var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;
var time, clock;

var loadedCount = 0;

var myStartX = 0,
    myStartZ = 10,
    myStartY = 3.5; //y: 3.5, 100
var myPosition, myStartRotY, worldBubble, pplCount, pplCountTex, pplCountMat;
var myWorldCenter = new THREE.Vector3();

var basedURL = "assets/sleep/";

var textureLoader, loadingManger;
var keyIsPressed;

// RAYCAST
var eyerayCaster, eyeIntersects;

// PLAYERS
var firstGuy;
var dailyLifePlayerDict = {},
    dailyLifePlayerObject = new THREE.Object3D();

// SOUND

// var sound_sweet = {};
// var sweetSource;
// var vecZ = new THREE.Vector3(0,0,1);
// var vecY = new THREE.Vector3(0,-1,0);
// var sswM, sswX, sswY, sswZ;
// var camM, camMX, camMY, camMZ;	

// var _iOSEnabled = false;

// var audioContext = new AudioContext();
// var sample = new SoundsSample(audioContext);

var sound_digital, sound_opening, sound_practice, sound_night;
var sound_hello, sound_visitor_alone, sound_visitor_others, sound_lets, sound_options, sound_bamboo;
var initSound = false,
    practiceOver = false;

// STAR
var star, starMat, glowTexture, glowTextures = [],
    starAnimator, starAnimators = [],
    stars = [];
var starFiles = [
    basedURL + "images/sStar_1.png", basedURL + "images/sStar_2.png",
    basedURL + "images/sStar_3.png", basedURL + "images/sStar_4.png"
];

// SLEEPER
// Geo
var sleeperOrigin = "Earth";
// Time
var currMinute, startTimestamp, endTimestamp;
var sleeper, sleeperGeo, sleeperTexture, sleep_test, sleeperGeo_test;
var breathLightTexture;

var isGazing = false,
    isGazeMoving = false,
    notifyGazeMax = false;
var gazeDotTex, gazeDotMat, gazeDotGeo;
var EyeMaxSize = 5,
    gazeTargetIndex = -1;
var lookingAtSomeone = -1,
    someoneLookingAtMe = -1;
var sleeperStartPositions = {};
var gazePlayerFrom = new THREE.Vector3(),
    gazePlayerTo = new THREE.Vector3();

var socialMediaMat, socialMediaTex, socialMediaScreens = [],
    socialMediaTweens = [],
    sm_materials = [];
var sm_screenGeo, glowGeo, glowMat1, glowMat2, sm_glow;
var annoucement, annoucementTexture;
var nest, nestTex, nestStickGeos = [],
    nestSticks = []
var nestSticksPos = [],
    nestStickTween,
    nestSticksMovement = {
        x: [0.1, 0.1, -0.1, -0.1, 0.1],
        y: [0.1, -0.1, 0.1, 0.1, -0.1],
        z: [-0.1, 0.1, 0.1, -0.1, -0.1]
    };

var breathingTimeline;

var worldTotal = 18,
    eaterPerTable = 6,
    tableAmount = 3;

var optionGeo, optionMat, currentOption, optionLights = [],
    optionLightDicts = {},
    optionButtons = new THREE.Object3D(),
    optionTextures = {},
    optionTags = ["breath", "explore", "sleep"];
var expStage = 0; // 0: intro, 1: breathing, 2: explore, 3: sleep, 4: choose_option
var isAllOver = false;

var breathingPracticeLights;

////////////////////////////////////////////////////////////

// init();				// Init after CONNECTION
superInit(); // init automatically
// connectSocket();		// Init after superInit

///////////////////////////////////////////////////////////
// FUNCTIONS 
///////////////////////////////////////////////////////////
function superInit() {

    // Determine Sleepers Start Positions (45, 50)
    var s_index = 0;
    for (var j = 0; j < 3; j++) {
        for (var i = 7; i < 13; i++) {
            var startPos = new THREE.Vector3(
                (i - 10) * 45 + GetRandomArbitrary(0, 15),
                j * 50 + GetRandomArbitrary(0, 10), -400 + GetRandomArbitrary(0, 2)
            );
            sleeperStartPositions[s_index] = startPos;
            s_index++;
        }
    }

    // Use http://freegeoip.net in script_functions.js
    if(hasInternet)
	    GetGeoData();

    myColor = new THREE.Color();
    time = Date.now();

    //Prevent scrolling for Mobile
    noScrolling = function(event) {
        event.preventDefault();
    };

    // HOWLER
    sound_night = new Howl({
        src: [basedURL + 'audios/night_lower.mp3'],
        loop: true,
        volume: 0
    });
    sound_digital = new Howl({
        src: [basedURL + 'audios/digitaltrech.mp3'],
        loop: true,
        volume: 0
    });
    sound_hello = new Howl({
        src: [basedURL + 'audios/voice/V2/sleep_hello.mp3'],
        volume: 1.3
    });
    sound_visitor_alone = new Howl({
        src: [basedURL + 'audios/voice/V2/sleep_onlyone.mp3'],
        volume: 1.3
    });
    sound_visitor_others = new Howl({
        src: [basedURL + 'audios/voice/V2/sleep_other.mp3'],
        volume: 1.3
    });
    sound_lets = new Howl({
        src: [basedURL + 'audios/voice/V2/sleep_lets.mp3'],
        volume: 1.3
    });
    sound_practice = new Howl({
        src: [basedURL + 'audios/voice/V2/sleep_practice.mp3'],
        volume: 1.3
    });
    sound_options = new Howl({
        src: [basedURL + 'audios/voice/V2/sleep_options.mp3'],
        volume: 1.3,
        sprite: {
        	/*
        	//v.1
            intro: [0, 11327],
            breath: [12310, 3290], //12310, 15600
            explore: [16500, 8000], //16500, 24500
            sleep: [25300, 10250] //25300, 35550
            */
            //v.2
            intro: [0, 8126],
            breath: [8506, 4871], //8506, 13377
            explore: [13683, 9477], //13683, 23160
            sleep: [23620, 12114] //23620, 35743
        }
    });
    sound_bamboo = new Howl({
    	src: [basedURL + 'audios/bamboo.mp3'],
    	volume: .8,
    	sprite: {
    		1: [635, 2000],
    		2: [3715, 2000],
    		3: [8433, 2000],
    		4: [13243, 2000],
    		5: [19707, 2000],
    		6: [21936, 2000],
    		7: [25223, 2000],
    		8: [28708, 2000],
    		9: [37356, 2000],
    		10: [40472, 2000],
    		11: [1892, 500],
    		12: [9265, 500],
    		13: [17172, 500],
    		14: [20053, 500],
    		15: [24091, 500],
    		16: [33718, 500],
    		17: [34689, 500],
    		18: [38788, 500],
    		19: [44000, 500]
    	}
    });

    // THREE.JS -------------------------------------------
    clock = new THREE.Clock();

    // RENDERER
    container = document.getElementById('render-canvas');
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.floor(window.devicePixelRatio));
    renderer.setClearColor(0x34122a, 1); // nighttime
    container.appendChild(renderer.domElement);

    // VR_EFFECT
    effect = new THREE.VREffect(renderer);
    effect.setSize(window.innerWidth, window.innerHeight);

    // DEPRECATED(?) - WebVR Manager
    /*
    // Create a VR manager helper to enter and exit VR mode.
    var params = {
        hideButton: false, // Default: false.
        isUndistorted: false // Default: false.
    };
    vrmanager = new WebVRManager(renderer, effect, params);
	*/

	// =============== WebVR-UI =================
	// reference: https://github.com/googlevr/webvr-ui/blob/master/examples/basic.html
	var vrUIOptions = {
		color: 'white',
		background: false,
		corners: 'square'
	};

	enterVR = new webvrui.EnterVRButton(renderer.domElement, vrUIOptions)
		.on("ready", function(){
			// enterVR.hide();
		})
		.on("enter", function(){
			console.log("enter VR");
		})
		.on("exit", function(){
			console.log("exit VR");
			// enterVR.show();
		})
		.on("error", function(error){
			document.getElementById("vr-learn-more").style.display = "inline";
			console.log("error => no webvr");

			enterVR.hide();
		})
		.on("hide", function(){
			document.getElementById("vr-ui").style.display = "none";
			// On iOS there is no button to close fullscreen mode, so we need to provide one
            if(enterVR.state == webvrui.State.PRESENTING_FULLSCREEN) document.getElementById("vr-exit").style.display = "initial";
            
            console.log("vr hide");
		})
		.on("show", function(){
			document.getElementById("vr-ui").style.display = "inherit";
			document.getElementById("vr-exit").style.display = "none";

			console.log("vr show");
		});

	// Add button to the #button element
	document.getElementById("vr-button").appendChild(enterVR.domElement);

	window.addEventListener('vrdisplaypresentchange', onWindowResize, true);

	// Get the HMD
	enterVR.getVRDisplay()
		.then(function(display){
			animationDisplay = display;
			// display.requestAnimationFrame(animate);
		})
		.catch(function(){
			// If there is no display available, fallback to window
			animationDisplay = window;
			// window.requestAnimationFrame(animate);
		});

	// ==========================================

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

    scene.add(dailyLifePlayerObject);

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
        CreateNest();

        console.log("ALL LOADED!");
        startLink.style.display = "";
        loadingImg.style.display = "none";
        loadingTxt.style.display = "none";

        readyToStart = true;
    };

    textureLoader = new THREE.TextureLoader(loadingManger);
    var modelLoader = new THREE.JSONLoader(loadingManger);

    LoadStarTexture();

    sleeper_test_Texture = textureLoader.load(basedURL + 'images/chef2.jpg');
    breathLightTexture = textureLoader.load("images/glow_edit.png");

    gazeDotTex = textureLoader.load(basedURL + 'images/gazeDot.png');
    gazeDotTex.wrapT = THREE.RepeatWrapping;
    //gazeDotMat = new THREE.MeshBasicMaterial({ map: gazeDotTex.clone(), side: THREE.DoubleSide, transparent: true });
    gazeDotGeo = new THREE.PlaneGeometry(1, 1);

    modelLoader.load(basedURL + "models/sleeper3.json", function(geometry, material) {
        sleeperGeo_test = geometry;
        sleep_test = new THREE.SkinnedMesh(sleeperGeo_test, new THREE.MeshLambertMaterial({ map: sleeper_test_Texture, skinning: true, side: THREE.DoubleSide }));
    });

    if(devMode){
	    stats = new Stats();
	    stats.domElement.style.position = 'absolute';
	    stats.domElement.style.bottom = '5px';
	    stats.domElement.style.zIndex = 100;
	    stats.domElement.children[0].style.background = "transparent";
	    stats.domElement.children[0].children[1].style.display = "none";
	    container.appendChild(stats.domElement);
	}

    // EVENTS
    window.addEventListener('resize', onWindowResize, false);

    // After trigger the loading functions
    // Connect to WebSocket!
    connectSocket();

    // lateInit();

    //pageIsReadyToStart = true;

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

    modelLoader.load(basedURL + "models/sm_screen.json", function(geometry, material) {
        sm_screenGeo = geometry;

        modelLoader.load(basedURL + "models/glow.json", function(geometryB, material) {
            glowGeo = geometryB;
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
            //glowMesh.scale.multiplyScalar(4);
            var glowMesh2 = new THREE.Mesh(glowGeo, glowMat2);
            //glowMesh2.scale.multiplyScalar(4);

            // Create Social Medai Wall
            var screenIndex = 0;
            // --- Real for indexing (6*3=18 total)
            for (var j = 0; j < 3; j++) {
                for (var i = 7; i < 13; i++) {
                    var sm_screen = new THREE.Mesh(sm_screenGeo, sm_materials[GetRandomInt(0, sm_materials.length)]);
                    sm_screen.add(glowMesh.clone());
                    sm_screen.add(glowMesh2.clone());
                    sm_screen.scale.multiplyScalar(4);

                    sm_screen.position.copy(sleeperStartPositions[screenIndex]);
                    sm_screen.position.z -= 4;
                    sm_screen.position.y += 10;

                    socialMediaScreens.push(sm_screen);

                    scene.add(sm_screen);
                    screenIndex++;
                }
            }
            // --- Fake
            for (var j = 0; j < 5; j++) {
                for (var i = 0; i < 20; i++) {

                    if ((j >= 0 && j < 3) && (i >= 7 && i < 13))
                        continue;

                    var sm_screen = new THREE.Mesh(sm_screenGeo, sm_materials[GetRandomInt(0, sm_materials.length)]);
                    sm_screen.add(glowMesh.clone());
                    sm_screen.add(glowMesh2.clone());
                    sm_screen.scale.multiplyScalar(4);

                    sm_screen.position.set(
                        (i - 10) * 45 + GetRandomArbitrary(0, 15),
                        j * 50 + GetRandomArbitrary(0, 10), -400 + GetRandomArbitrary(0, 2)
                    );

                    socialMediaScreens.push(sm_screen);

                    scene.add(sm_screen);
                    screenIndex++;
                }
            }
        });
    });

    nestTex = textureLoader.load(basedURL + 'images/nest.jpg');
    nestTex.wrapT = nestTex.wrapS = THREE.RepeatWrapping;
    nestTex.repeat.set(2, 2);

    loadModelWholeNest(
        basedURL + "models/nest2.json", basedURL + "models/stick1.json", basedURL + "models/stick2.json",
        basedURL + "models/stick3.json", basedURL + "models/stick4.json",
        basedURL + "models/stick5.json"
    );

    // THINGS_TO_CREATE_AFTER_FONT_LOADED
    waitForWebfonts(['StupidFont'], () => {
        AfterFontLoaded();
    });
}

function AfterFontLoaded() {

    // OPTIONS_AFTER_BREATHING
    optionGeo = new THREE.CylinderGeometry(1, 1, 1, 20);
    for (var i = 0; i < optionTags.length; i++) {
        optionTextures[i] = textureLoader.load(basedURL + 'images/options_' + optionTags[i] + '.jpg');
    }
    for (var i = 0; i < 3; i++) {
        var dummyButton = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 6), new THREE.MeshBasicMaterial({ visible: false }));
        var optionMesh = new THREE.Mesh(optionGeo, new THREE.MeshLambertMaterial({ map: optionTextures[i] }));
        var optionLight = new THREE.PointLight(0xffff00, 0, 5); //intensity: 0.2
        optionLight.position.y = -2;
        optionLight.name = optionTags[i];
        optionLight.stageIndex = i + 1;
        optionLights.push(optionLight);
        optionLightDicts[optionTags[i]] = optionLight;

        // label
        var optionTextTexture = new THREEx.DynamicTexture(256, 128); //512,512; 1000,128
        optionTextTexture.context.font = "bolder 70px StupidFont";
        optionTextTexture.clear().drawText(optionTags[i], undefined, 96, 'white');
        var optionMaterial = new THREE.MeshBasicMaterial({ map: optionTextTexture.texture, transparent: true, side: THREE.DoubleSide });
        var optionTextMesh = new THREE.Mesh(new THREE.PlaneGeometry(optionTextTexture.canvas.width, optionTextTexture.canvas.height), optionMaterial);
        optionTextMesh.scale.multiplyScalar(0.02);
        optionTextMesh.rotation.x = Math.PI / 2;
        optionTextMesh.rotation.z = Math.PI / 2;
        optionTextMesh.position.x = 1.5;
        optionTextMesh.visible = false;

        dummyButton.add(optionMesh);
        dummyButton.add(optionLight);
        dummyButton.add(optionTextMesh);
        dummyButton.position.set((i - 1) * 8, 30, -8); //0, 30, (i - 1) * 8
        dummyButton.name = 'option_' + optionTags[i];

        dummyButton.rotation.y = Math.PI / 2;

        optionButtons.add(dummyButton);
    }
    scene.add(optionButtons);
    optionButtons.visible = false;

    // INFO_TEXT_DISPLY
    annoucement = new THREE.Object3D();
    annoucementTexture = new THREEx.DynamicTexture(1024, 128); //512,512; 1000,128
    annoucementTexture.context.font = "bolder 70px StupidFont";
    annoucementTexture.clear().drawText("annoucement:", undefined, 96, 'white');
    annoucementTexture.clear();
    var annoucementMaterial = new THREE.MeshBasicMaterial({ map: annoucementTexture.texture, transparent: true, depthTest: false }); //depthTest: false
    var annoucementMesh = new THREE.Mesh(new THREE.PlaneGeometry(annoucementTexture.canvas.width, annoucementTexture.canvas.height), annoucementMaterial);
    annoucementMesh.scale.multiplyScalar(0.01);
    annoucementMesh.position.z = -20;
    annoucement.add(annoucementMesh);
    scene.add(annoucement);

    // PEOPLE_COUNT
    pplCountTex = new THREEx.DynamicTexture(1024, 1024);
    pplCountTex.context.font = "bolder 150px StupidFont";
    pplCountTex.clear();
    pplCountMat = new THREE.MeshBasicMaterial({ map: pplCountTex.texture, side: THREE.DoubleSide, transparent: true });
    var pCountMesh = new THREE.Mesh(new THREE.PlaneGeometry(pplCountTex.canvas.width, pplCountTex.canvas.height), pplCountMat);
    pCountMesh.rotation.x = Math.PI / 2;
    pplCount = new THREE.Object3D();
    pplCount.add(pCountMesh);
    pplCount.scale.set(0.04, 0.04, 0.04);
    pplCount.position.y = 120;
    scene.add(pplCount);
}

function ScrollSocialMedia(el) {
    var intensity = GetRandomArbitrary(0, 0.8);
    //console.log(intensity);
    var sm_tween = TweenMax.to(el, 3, { y: "-=" + intensity, ease: Power4.easeOut, delay: GetRandomArbitrary(0.5, 1.5), onComplete: ScrollSocialMedia, onCompleteParams: [el] });
    socialMediaTweens.push(sm_tween);
}

function AssignIndex() {
    // console.log("whoIamInLife: " + whoIamInLife);

    if (devMode)
        myPosition = new THREE.Vector3();
    else
        myPosition = sleeperStartPositions[whoIamInLife];

    myStartX = myPosition.x;
    myStartY = myPosition.y;
    myStartZ = myPosition.z;

    myWorldCenter.copy(myPosition);
    myWorldCenter.z -= 20;
}

// lateInit() happens after click "Start"
function lateInit() {
    console.log("late init!");

    // FIREBASE_TOTAL_VISTI
    if(hasInternet){
	    visitDataRef.once("value", function(snapshot) {
	        fireVisit = snapshot.val().visit_count;
	        fireVisit++;
	        visitDataRef.set({
	            visit_count: fireVisit
	        });
	    });
	}

    document.body.addEventListener('touchmove', noScrolling, false);
    window.addEventListener('keydown', myKeyPressed, false);
    window.addEventListener('keyup', myKeyUp, false);

    clock.start();

    // build me!
    // myPosition = new THREE.Vector3( myStartX, myStartY, myStartZ-5 );
    console.log(myPosition);
    firstGuy = new PersonSleep(myPosition, myColor, whoIamInLife, playerNName);
    dailyLifePlayerDict[whoIamInLife] = firstGuy;

    // create controls
    controls = new THREE.DeviceControls(camera, myWorldCenter, true);
    scene.add(controls.getObject());

    // update things position based on myPosition
    nest.position.set(myPosition.x * 20 / 255, myPosition.y * 20 / 255, 0);
    annoucement.position.copy(nest.position);
    // UpdateRotationWithMe( introRoom );

    // start to animate()!
    //animate(performance ? performance.now() : Date.now());
    animationDisplay.requestAnimationFrame(animate);

    trulyFullyStart = true;

    // Timestamp
    startTimestamp = Date.now();
    currMinute = Math.floor(startTimestamp / 60);
    // ------ SEND_TO_SERVER => PLAYER_TIME ------
    var msg = {
        'type': 'timestamp',
        'index': whoIamInLife,
        'time': new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        'origin': sleeperOrigin,
        'worldId': meInWorld
    };

    if (ws) {
        sendMessage(JSON.stringify(msg));
    }
    // --------------------------------------------

    // Hide player body
    // firstGuy.player.visible = false;

    // WebVR-UI
    if(animationDisplay != window)
	    enterVR.show();

    // --------------------------------------------
    // EXPERIENCE_START
    // -------------------------------------------- 

    if (devMode){
    	expStage = 4;
    	optionButtons.visible = true;
        return;
    }

    // AUDIOS
    sound_digital.play();
    sound_digital.fade(0, 0.5, 2000);

    // 1. Moving to NEST
    //var nestPos = controls.position().clone();
    //nestPos.multiplyScalar(20 / 225);
    var nestPos = nest.position.clone();
    nestPos.z = GetRandomArbitrary(-5, 5);

    setTimeout(() => {
        controls.createTweenForMove(nestPos, 25, true);

        sound_digital.fade(0.5, 0, 10 * 1000);
        sound_digital.once('fade', function() {
            console.log('digital finishes fading');
        });

        sound_night.play();
        sound_night.fade(0, 0.8, 10 * 1000);

        nestStickTween = TweenMax.to(nestSticksPos, 3, {
            x: nestSticksMovement.x,
            y: nestSticksMovement.y,
            z: nestSticksMovement.z,
            ease: Power1.easeInOut,
            yoyo: true,
            repeat: -1
        });

        setTimeout(() => {
            UpdatePplCount(Object.keys(dailyLifePlayerDict).length, totalPplInWorldsCount, totalVisitCount);

            TweenMax.to(nest.rotation, 3, {
                y: -Math.PI / 2,
                ease: Back.easeInOut.config(1),
                onComplete: () => {

                    disposeSocialMedia();

                    sound_night.fade(0.8, 0.3, 1000);

                    sound_digital.unload();
                    sound_digital = undefined;

                    sound_hello.play();
                    console.log('play sound');

                    sound_hello.once('end', () => {
                        var size = Object.keys(dailyLifePlayerDict).length;
                        if (size > 1) {
                            sound_visitor_others.play();
                            sound_visitor_others.once('end', () => {
                                playLetsAudio();
                            });
                        } else {
                            sound_visitor_alone.play();
                            sound_visitor_alone.once('end', () => {
                                playLetsAudio();
                            });
                        }
                    });
                }
            });
        }, 26000);
    }, 5000);
}

function playLetsAudio() {
    sound_lets.play();
    sound_lets.once('end', () => {
        startBreathingPractice(false);
    });
}

function startBreathingPractice(_redo) {
    expStage = 1;

    // Eye-level info
    UpdateFrontRotationWithMe(annoucement);
    annoucementTexture.clear().drawText("Follow the voice and light to breath.", undefined, 96, 'white');

    //sound_night.fade(0.8, 0.4, 1000);

    sound_practice.play();
    var duration = sound_practice.duration() + 0.5;
    console.log(duration);

    firstGuy.prepForBreathing();

    // ------ SEND_TO_SERVER => START_BREATHING ------
    var msg = {
        'type': 'startBreathing',
        'index': whoIamInLife,
        'worldId': meInWorld,
        'redo': _redo
    };
    if (ws) {
        sendMessage(JSON.stringify(msg));
    }
    // --------------------------------------------

    // Start animating the light
    setTimeout(() => {
        firstGuy.startBreathing(_redo);
    }, 35500);	//v.1 23600

    setTimeout(() => {
        // Option time!
        console.log('Option time!');
        nestPos = undefined;
        expStage = 4;
        optionButtons.visible = true;

        sound_night.fade(0.3, 0.8, 2000);
        sound_options.play('intro');

        UpdateFrontRotationWithMe(annoucement);
        annoucementTexture.clear().drawText("Look at the sky", undefined, 60, 'white');
        annoucementTexture.drawText("Gaze upon options to choose next step", undefined, 120, 'white');

    }, duration * 1000);
}

function disposeSocialMedia() {
    // tweenMax
    for (var i = 0; i < socialMediaTweens.length; i++) {
        socialMediaTweens[i].kill();
    }
    socialMediaTweens = undefined;

    // mesh
    for (var i = 0; i < socialMediaScreens.length; i++) {
        scene.remove(socialMediaScreens[i]);
        DoDispose(socialMediaScreens[i]);
    }
    socialMediaScreens = undefined;

    // geometry
    glowGeo.dispose();
    glowGeo = undefined;
    sm_screenGeo.dispose();
    sm_screenGeo = undefined;

    // texture
    for (var i = 0; i < sm_materials.length; i++) {
        if (sm_materials[i].map) {
            sm_materials[i].map.dispose();
            sm_materials[i].map = undefined;
        }
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
        sm_materials[i] = undefined;
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
    if (!isAllOver) {
        var delta = Math.min(timestamp - lastRender, 500);
        lastRender = timestamp;

        update();

        // v.1 - WebVR-Manager: Render the scene through the manager.
        // vrmanager.render(scene, camera, timestamp);

        // v.2 - WebVR-UI
        if(enterVR.isPresenting()){
        	renderer.render(scene, camera);
        	effect.render(scene, camera);
        }else{
        	renderer.render(scene, camera);
        }
    
        if(devMode)
	        stats.update();
    }
    animationDisplay.requestAnimationFrame(animate);
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
    var directionCam = controls.getDirection(1); //.clone()
    eyerayCaster.set(controls.position(), directionCam); //.clone()

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

    // INTERACTIONS
    switch (expStage) {
        // Options
        case 4:
            eyeIntersects = eyerayCaster.intersectObject(optionButtons, true);
            if (eyeIntersects.length > 0) {
                var iName = eyeIntersects[0].object.name;
                iName = iName.split("_");
                if (iName.length == 2) {
                    currentOption = iName[1];
                } else {
                    currentOption = '';
                }
            } else {
                currentOption = '';
            }
            GazeToChoose();
            break;

            // Explore mode: Gaze-to-move
        case 2:
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

            eyeIntersects = eyerayCaster.intersectObject(optionButtons, true);
            if (eyeIntersects.length > 0) {
                var iName = eyeIntersects[0].object.name;
                iName = iName.split("_");
                if (iName.length == 2) {
                    currentOption = iName[1];
                } else {
                    currentOption = '';
                }
            } else {
                currentOption = '';
            }
            GazeToChoose();
            break;
    }


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
            'origin': sleeperOrigin,
            'worldId': meInWorld
        };

        if (ws) {
            sendMessage(JSON.stringify(msg));
        }
        //-----------------------------------------------
        currMinute = newMinute;
    }
}

function render() {
    effect.render(scene, camera);
}

function removePlayer(playerID) {
    if (dailyLifePlayerDict[playerID]) {

        dailyLifePlayerObject.remove(dailyLifePlayerDict[playerID].player);

        DoDispose(dailyLifePlayerDict[playerID].player);

        delete dailyLifePlayerDict[playerID];
    }
}

function UpdatePplCount(thisWorldCount, totalCount, totalVisit) {
    if (bathroom.visible) return;

    pplCountTex.clear().drawText("Sleepers", undefined, 100, 'white');
    pplCountTex.drawText("Counter", undefined, 250, 'white');
    pplCountTex.drawText("this world: " + thisWorldCount, undefined, 400, 'white');
    pplCountTex.drawText("current: " + totalCount, undefined, 550, 'white');
    pplCountTex.drawText("total slept: " + totalVisit, undefined, 700, 'white');
}

function GazeToChoose() {
    for (var i = 0; i < optionLights.length; i++) {
        if (optionLights[i].name == currentOption) {
            if (optionLights[i].intensity < 1.02)
                optionLights[i].intensity += 0.02;

            if (optionButtons.children[i].children[2].visible == false){
                optionButtons.children[i].children[2].visible = true;
                sound_bamboo.play(GetRandomInt(11,20)+"");
            }

        } else if (optionLights[i].intensity >= 0.04) {
            optionLights[i].intensity -= 0.04;

            if (optionButtons.children[i].children[2].visible == true)
                optionButtons.children[i].children[2].visible = false;
        }
    }
}

function OptionStartStage(stageIndex) {
    expStage = stageIndex;
    switch (expStage) {
        // Redo breathing exercise
        case 1:
            annoucementTexture.clear();
            controls.movingEnabled = false;
            optionButtons.visible = false;

            var s_b_id = sound_options.play('breath');
            var s_b_duration = sound_options.duration(s_b_id);

            setTimeout(() => {
                startBreathingPractice(true);
            }, s_b_duration * 1000);
            break;

            // Explore
        case 2:
            UpdateFrontRotationWithMe(annoucement);
            annoucementTexture.clear().drawText("Make eye contact to navigate the world", undefined, 96, 'white');

            sound_options.play('explore');
            controls.movingEnabled = true;
            break;

            // Sleep
        case 3:
            controls.movingEnabled = false;

            UpdateFrontRotationWithMe(annoucement);
            annoucementTexture.clear().drawText("Good night :)", undefined, 96, 'white');

            // Move up to be out of the nest
            pplCountTex.clear();
            pplCount.visible = false;
            firstGuy.player.visible = false;
            controls.setMovYAnimation(90, 5, false, false);

            sound_night.fade(0.8, 0.3, 2 * 1000);

            TweenMax.to(hemiLight.groundColor, 2, { r: 0.569, g: 0.506, b: 0.1 });

            // play good night audio
            sound_options.play('sleep');

            // Populate several Nests around
            for (var i = 0; i < 6; i++) {
                for (var j = 0; j < 4; j++) {
                    for (var k = 0; k < 4; k++) {

                        if (i == 4 || j == 2 || k == 2)
                            continue;

                        var dupNest = nest.clone();
                        dupNest.position.set(
                            (j - 2) * 100 + GetRandomArbitrary(-45, 45),
                            (i - 4) * 60 + GetRandomArbitrary(0, 20),
                            (k - 2) * 100 + GetRandomArbitrary(-45, 45),
                        );
                        scene.add(dupNest);
                    }
                }
            }

            setTimeout(() => {
                renderCanvas.style.opacity = 0;
            }, 14000);

            setTimeout(() => {
                isAllOver = true;

                //nestStickTween.kill();
                TweenMax.killAll();

                // DISPOSE_TO_RELEASE_MEMORY!
                DoDispose(scene);
            }, 16500);
            break;
    }
}

function GazeToMove() {
    // Gaze-To-Move
    // 1) Look at someone => CreateBigEye (from_index_look: true, to_index_look: false), startGazeTime
    // 2) BigEyeGrow - if not look away, size max: 5
    // 2.5) If other looks back: CreateYellowLine
    // 3) if both EyeSize all 5 (from_index_look: true, to_index_look: true), start moving toward the center point
    // 4) once move, keep moving eventhough look away
    // 5) sync breathing tempo (true for local player)

    //v.2
    // 1) Look at someone => Extend GazeDot
    // 2) Once reach, notify target
    // 3) If target looks back, extend GazeDot
    // 3) if both GazeDot reach scale, start moving toward the center point
    // 4) once moved, keep moving eventhough look away, play audio (local)
    // 5) sync breathing cycle once (local)

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

            // GazeDot
            firstGuy.setGazeDotsRotation(dailyLifePlayerDict[lookingAtSomeone].player.position);
            firstGuy.gazeDotTargetLength = firstGuy.player.position.distanceTo(dailyLifePlayerDict[lookingAtSomeone].player.position);

            // ------ SEND_TO_SERVER_GAZING_TARGET_LENGTH ------
            if (trulyFullyStart) {
                var msg = {
                    'type': 'gazeLength',
                    'index': whoIamInLife,
                    'length': firstGuy.gazeDotTargetLength,
                    'target': lookingAtSomeone,
                    'worldId': meInWorld
                };

                if (ws) {
                    sendMessage(JSON.stringify(msg));
                }
            }
            // ----------------------------------------------------
        }

        // Keep gazing!

        // v.1 grow eye size ++
        firstGuy.eye.scale.lerp(new THREE.Vector3(1, 1, 1), 0.01);

        // v.2 extend GazeDot
        // firstGuy.gazeDots.scale.lerp(new THREE.Vector3(1, 1, firstGuy.gazeDotTargetLength), 0.008);
        // firstGuy.gazeDots.children[0].material.map.repeat.lerp(new THREE.Vector2(1,firstGuy.gazeDotTargetLength), 0.008);

        // if my eye size >= 1
        if (firstGuy.eye.scale.x >= 0.9) {
            // ------ SEND_TO_SERVER_ME_MAX_EYE / READY ------
            if (!notifyGazeMax) {
                var msg = {
                    'type': 'gaze',
                    'index': whoIamInLife,
                    'toWhom': lookingAtSomeone,
                    'worldId': meInWorld
                };

                if (ws) {
                    sendMessage(JSON.stringify(msg));
                    notifyGazeMax = true;
                }
                console.log("ME_MAX_EYE");
            }

            if (lookingAtSomeone == someoneLookingAtMe) {
                if (!isGazeMoving && controls.movingEnabled) {
                    gazePlayerFrom.copy(firstGuy.player.position);
                    gazePlayerTo.copy(dailyLifePlayerDict[lookingAtSomeone].player.position);
                    var dist_T = gazePlayerFrom.distanceTo(gazePlayerTo);
                    //console.log(dist_T);

                    if (dist_T > 4.5) {
                        var midPoint = new THREE.Vector3();
                        midPoint.addVectors(gazePlayerFrom, gazePlayerTo).multiplyScalar(1 / 2);
                        var myTarget = new THREE.Vector3().subVectors(gazePlayerFrom, midPoint).normalize().multiplyScalar(2);
                        myTarget.add(midPoint);
                        dist_T = gazePlayerFrom.distanceTo(midPoint) * 0.5;

                        controls.createTweenForMove(myTarget, dist_T, false);
                        isGazeMoving = true;
                        console.log("GAZE_TO_MOVE! time: " + dist_T);

                        firstGuy.wordTexture.clear();
                        firstGuy.wordBubble.visible = false;
                        firstGuy.resetGazeDots();

                        setTimeout(function() {
                            console.log("reset isGazeMoving");
                            isGazeMoving = false;
                        }, dist_T * 1050);

                        // ------ SEND_TO_SERVER_GAZING_TARGET_LENGTH ------
                        var msg = {
                            'type': 'gazeLength',
                            'index': whoIamInLife,
                            'length': -1,
                            'target': -1,
                            'worldId': meInWorld
                        };

                        if (ws) {
                            sendMessage(JSON.stringify(msg));
                        }
                        // ----------------------------------------------------
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
                'length': -1,
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
            firstGuy.resetGazeDots();

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

function CreateStars() {
    for (var i = 0; i < 50; i++) {
        mat = new THREE.SpriteMaterial({ map: glowTextures[i % 4], color: 0xffef3b, transparent: false, blending: THREE.AdditiveBlending });
        var st = new THREE.Sprite(mat);
        //st.position.set(Math.random() * (myStartX + 400) - (myStartX + 200), Math.random() * -100 + 400, Math.random() * (myStartZ + 400) - (myStartZ + 200));
        st.position.set(Math.random() * (0 + 700) - (0 + 350), Math.random() * -100 + 400, Math.random() * (0 + 700) - (0 + 350));
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
        nest.add(n_stick);
        nestSticks.push(n_stick);
        nestSticksPos.push(n_stick.position);
    }
    scene.add(nest);
}

function UpdatePplCount(thisWorldCount, totalCount, totalVisit) {
    if (expStage == 3) return;

    pplCountTex.clear().drawText("Sleeper", undefined, 100, 'white');
    pplCountTex.drawText("Counter", undefined, 250, 'white');
    pplCountTex.drawText("this nest: " + thisWorldCount, undefined, 400, 'white');
    pplCountTex.drawText("current: " + totalCount, undefined, 550, 'white');
    pplCountTex.drawText("visited: " + totalVisit, undefined, 700, 'white');
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

function onWindowResize(e) {
    effect.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function isTouchDevice() {
    return 'ontouchstart' in window || !!(navigator.msMaxTouchPoints);
}