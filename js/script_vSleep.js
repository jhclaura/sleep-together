var devMode = false;

////////////////////////////////////////////////////////////	
// SET_UP_VARIABLES
////////////////////////////////////////////////////////////

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

var sleepLang='', fontLoaded = false, textCreated = false;

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
var eyeCircleInTexture, eyeCircleOutTexture;

var isGazing = false,
    isGazeMoving = false,
    notifyGazeMax = false,
    isGazeTiming = false;
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
var announcement, announcementTexture, announcementTextureFront;
var nest, nestTex, nestStickGeos = [],
    nestSticks = []
var nestSticksPos = [],
    nestStickTween,
    nestSticksMovement = {
        x: [0.1, 0.1, -0.1, -0.1, 0.1],
        y: [0.1, -0.1, 0.1, 0.1, -0.1],
        z: [-0.1, 0.1, 0.1, -0.1, -0.1]
    };
var panelGroupt;

var breathingTimeline, practiceIntroDuration = 33500;	//v.1 23600, v.2 35500

var worldTotal = 18,
    eaterPerTable = 6,
    tableAmount = 3;

var optionGeo, optionMat, currentOption = previousGazeOption = '', optionLights = [],
    optionLightDicts = {},
    optionButtons = new THREE.Object3D(),
    optionTextures = {},
    optionTags = ["breath", "explore", "sleep"],
    optionTagTexts = ["breath", "explore", "sleep"];
var expStage = 0; // 0: intro, 1: breathing, 2: explore, 3: sleep, 4: choose_option
var isAllOver = false;
var doneTalkingAboutExplore = true, talkingAboutExploreID;

var breathingPracticeLights;

var tapIsVisible = true;

////////////////////////////////////////////////////////////

// init();				// Init after CONNECTION
superInit(); // init automatically
// connectSocket();		// Init after superInit

///////////////////////////////////////////////////////////
// FUNCTIONS 
///////////////////////////////////////////////////////////
function superInit() {

    // ================== WebVR-Polyfill ====================
    var WebVRConfig = {
        PROVIDE_MOBILE_VRDISPLAY: true,
        MOBILE_WAKE_LOCK: true,
        MOUSE_KEYBOARD_CONTROLS_DISABLED: true, // Default: false.
        BUFFER_SCALE: 0.5,
        predistorted: true,
        DIRTY_SUBMIT_FRAME_BINDINGS: false,
        TOUCH_PANNER_DISABLED: true
        // ROTATE_INSTRUCTIONS_DISABLED: false
    };
    var polyfill = new WebVRPolyfill(WebVRConfig);
    console.log("Using webvr-polyfill version: " + WebVRPolyfill.version);
    // ============== End of WebVR-Polyfill ==================

    // Determine Sleepers Start Positions (45, 50)
    var s_index = 1;
    for (var j = 0; j < 3; j++) {
        for (var i = 7; i < 13; i++) {
            var startPos = new THREE.Vector3(
                (i - 10) * 45 + GetRandomArbitrary(0, 15),
                j * 50 + GetRandomArbitrary(0, 5),
                (j - 1) * 4 - 400 + GetRandomArbitrary(0, 2)
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

    // HOWLER ==> move VOs to updateLang()
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
            if(onfHeader)
                onfHeader.style.display = "none";
            if(arteHeader)
                arteHeader.style.display = "none";
			if(chooseVRimg) {				
				vrEnterCircle.style.display = "none";
			}
            // for Android, if could be NonVR & fullScreen
			else {
				if(whichMobile == "android"){
					vrFullscreenCircle.style.display = "none";
				}
			}
		})
		.on("exit", function(){
			console.log("exit VR");
			
			if(chooseVRimg)
			{
				//onfHeader.style.display = "";
				vrEnterCircle.style.display = "";
			}
            // for Android, if could be NonVR & exitFullScreen
			else {
				if(whichMobile == "android"){
					vrFullscreenCircle.style.display = "";
				}
			}
		})
		.on("error", function(error){
			document.getElementById("vr-learn-more").style.display = "inline";
			console.log("error => no webvr");

			enterVR.hide();
		})
		.on("hide", function(){
			document.getElementById("vr-ui").style.display = "none";

			// On iOS there is no button to close fullscreen mode, so we need to provide one
            // if(enterVR.state == webvrui.State.PRESENTING_FULLSCREEN) document.getElementById("vr-exit").style.display = "initial";
            
            console.log("vr hide");
		})
		.on("show", function(){
			document.getElementById("vr-ui").style.display = "inherit";
			document.getElementById("vr-exit").style.display = "none";

			console.log("vr show");
		});

	// Add button to the #button element
	document.getElementById("vr-button").appendChild(enterVR.domElement);

	window.addEventListener('vrdisplaypresentchange', onResize, true);    
    window.addEventListener('resize', onResize, false);

	// Get the HMD
    //v.1
    //v.2
    enterVR.getVRDisplay()
    //navigator.getVRDisplays()
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
    eyeCircleInTexture = textureLoader.load(basedURL + "images/eye_circle_in.png");
    eyeCircleOutTexture = textureLoader.load(basedURL + "images/eye_circle_out.png");

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

    if(!devMode){
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
	            var glowMesh2 = new THREE.Mesh(glowGeo, glowMat2);

	            // Create Social Medai Wall
	            var screenIndex = 1;
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
	                        j * 50 + GetRandomArbitrary(0, 5), -400 + GetRandomArbitrary(0, 2)
	                    );

	                    socialMediaScreens.push(sm_screen);

	                    scene.add(sm_screen);
	                    screenIndex++;
	                }
	            }
	        });
	    });
    }

    nestTex = textureLoader.load(basedURL + 'images/nest.jpg');
    nestTex.wrapT = nestTex.wrapS = THREE.RepeatWrapping;
    //nestTex.repeat.set(2, 2);
    nestTex.repeat.set(4, 4);

    loadModelWholeNest(
        basedURL + "models/nest2.json", basedURL + "models/stick1.json", basedURL + "models/stick2_v2.json",
        basedURL + "models/stick3.json", basedURL + "models/stick4.json",
        basedURL + "models/stick5_v2.json"
    );

    // THINGS_TO_CREATE_AFTER_FONT_LOADED
    waitForWebfonts(['StupidFont'], () => {
        fontLoaded = true;
        AfterFontLoaded();
    });
}

// function requestEnterVRfromIcon() {
//     chooseVRimg = true;
//     enterVR.requestEnterVR();
// }

// function requestFullscreenFromIcon() {
//     // Still is NonVR mode, just fullscreen;
//     fullscreen();
// }

// function requestExitFromIcon() {
//     // 100% exit VR
//     console.log("requestExitFromIcon");
//     chooseVRimg = false;
//     enterVR.requestExit();
// }

function AfterFontLoaded() {

    // if doesn't know the lang yet, wait
    if(sleepLang=='')
        return;

    switch(sleepLang) {
        case 'en':
            //do nothing!
            break;

        case 'fr':
            optionTagTexts = langSwap.optionTags.fr;
            break;

        case 'de':
            optionTagTexts = langSwap.optionTags.de;
            break;
    }

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
        var optionTextTexture = new THREEx.DynamicTexture(512, 512); //256,128; 512,512; 1000,128
        optionTextTexture.context.font = "bolder 70px StupidFont";
        optionTextTexture.clear().drawText(optionTagTexts[i], undefined, 250, 'white'); //96
        var optionMaterial = new THREE.MeshBasicMaterial({ map: optionTextTexture.texture, transparent: true, side: THREE.DoubleSide });
        var optionTextMesh = new THREE.Mesh(new THREE.PlaneGeometry(optionTextTexture.canvas.width, optionTextTexture.canvas.height), optionMaterial);
        optionTextMesh.scale.multiplyScalar(0.02);
        optionTextMesh.rotation.x = Math.PI / 2;
        optionTextMesh.rotation.z = Math.PI / 2;
        optionTextMesh.position.x = 2.5;    //1.5
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
    announcement = new THREE.Object3D();
    announcementTexture = new THREEx.DynamicTexture(1024, 512); //512,512; 1000,128
    announcementTexture.context.font = "bolder 70px StupidFont";
    announcementTexture.clear().drawText(":", undefined, 96, 'white');
    announcementTexture.clear();
    announcementTextureFront = new THREEx.DynamicTexture(1024, 512); //512,512; 1000,128
    announcementTextureFront.context.font = "bolder 70px StupidFont";
    announcementTextureFront.clear().drawText(":", undefined, 96, 'white');
    announcementTextureFront.clear();
    var announcementMaterial = new THREE.MeshBasicMaterial({ map: announcementTexture.texture, transparent: true}); //depthTest: false
    var announcementMesh = new THREE.Mesh(new THREE.PlaneGeometry(announcementTexture.canvas.width, announcementTexture.canvas.height), announcementMaterial);
    announcementMesh.scale.multiplyScalar(0.01);
    announcementMesh.position.z = -20;
    announcement.add(announcementMesh);
    var announcementMaterialFront = new THREE.MeshBasicMaterial({ map: announcementTextureFront.texture, transparent: true, opacity: 0.2, depthTest: false});
    var announcementMeshFront = new THREE.Mesh(new THREE.PlaneGeometry(announcementTextureFront.canvas.width, announcementTextureFront.canvas.height), announcementMaterialFront);
    announcementMeshFront.scale.multiplyScalar(0.01);
    announcementMeshFront.position.z = -20;
    announcement.add(announcementMeshFront);
    scene.add(announcement);

    // PEOPLE_COUNT
    pplCountTex = new THREEx.DynamicTexture(1024, 1024);
    pplCountTex.context.font = "bolder 120px StupidFont";
    pplCountTex.clear();
    pplCountMat = new THREE.MeshBasicMaterial({ map: pplCountTex.texture, side: THREE.DoubleSide, transparent: true });
    var pCountMesh = new THREE.Mesh(new THREE.PlaneGeometry(pplCountTex.canvas.width, pplCountTex.canvas.height), pplCountMat);
    pCountMesh.rotation.x = Math.PI / 2;
    pplCount = new THREE.Object3D();
    pplCount.add(pCountMesh);
    pplCount.scale.set(0.04, 0.04, 0.04);
    pplCount.position.y = 110;
    scene.add(pplCount);

    textCreated = true;
}

function ScrollSocialMedia(el) {
    var intensity = GetRandomArbitrary(0, 0.8);
    //console.log(intensity);
    var sm_tween = TweenMax.to(el, 3, { y: "-=" + intensity, ease: Power4.easeOut, delay: GetRandomArbitrary(0.5, 1.5), onComplete: ScrollSocialMedia, onCompleteParams: [el] });
    socialMediaTweens.push(sm_tween);
}

function AssignIndex() {
    // console.log("whoIamInLife: " + whoIamInLife);

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
    nest.position.set(myPosition.x * 20 / 255, myPosition.y * 20 / 255, myPosition.z + 400);
    announcement.position.copy(nest.position);
    optionButtons.position.copy(nest.position);
    pplCount.position.copy(nest.position);
    pplCount.position.y = 110;

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
    	controls.setPosition(nest.position);
        return;
    }

    // AUDIOS
    sound_digital.play();
    sound_digital.fade(0, 0.5, 2000);

    // 1. Moving to NEST
    var nestPos = nest.position.clone();
    nestPos.z = GetRandomArbitrary(-5, 5);

    var waitingTimeBeforeStart = 5000;
    // In VR mode, give extra 5 sec to buffer time for setup viewer
    if(chooseVRimg)
    	waitingTimeBeforeStart = 10000;

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
    }, waitingTimeBeforeStart);
}

function playLetsAudio() {
    sound_lets.play();
    sound_lets.once('end', () => {
        startBreathingPractice(false);
    });
}

function startBreathingPractice(_redo) {
    expStage = 1;
    final_statistic.practiceCount ++;

    // Eye-level info
    UpdateFrontRotationWithMe(announcement);

    announcementTexture.clear().drawText(langSwap.startPractice[sleepLang][0], undefined, 130, 'white');
    announcementTexture.drawText(langSwap.startPractice[sleepLang][1], undefined, 220, 'white');
    announcementTexture.drawText(langSwap.startPractice[sleepLang][2], undefined, 310, 'white');
    announcementTextureFront.clear().drawText(langSwap.startPractice[sleepLang][0], undefined, 130, 'white');
    announcementTextureFront.drawText(langSwap.startPractice[sleepLang][1], undefined, 220, 'white');
    announcementTextureFront.drawText(langSwap.startPractice[sleepLang][2], undefined, 310, 'white');

    UpdateFrontRotationWithMe(pplCount);
    UpdateFrontRotationWithMe(optionButtons);

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
    }, practiceIntroDuration);	//v.1 23600, v.2 35500

    setTimeout(() => {
        // Option time!
        console.log('Option time!');
        nestPos = undefined;
        expStage = 4;
        
        sound_night.fade(0.3, 0.8, 2000);
        sound_options.play('intro');

        announcementTexture.clear();
        announcementTextureFront.clear();
        setTimeout(()=>{
            displayOptions();
        }, langSwap.soundOptionSprite[sleepLang].intro[1]);
    }, duration * 1000);
}

function displayOptions() {
    UpdateFrontRotationWithMe(announcement);
    announcementTexture.clear().drawText(langSwap.nextStep[sleepLang][0], undefined, 130, 'white');
    announcementTexture.drawText(langSwap.nextStep[sleepLang][1], undefined, 220, 'white');
    announcementTexture.drawText(langSwap.nextStep[sleepLang][2], undefined, 310, 'white');
    announcementTextureFront.clear().drawText(langSwap.nextStep[sleepLang][0], undefined, 130, 'white');
    announcementTextureFront.drawText(langSwap.nextStep[sleepLang][1], undefined, 220, 'white');
    announcementTextureFront.drawText(langSwap.nextStep[sleepLang][2], undefined, 310, 'white');
    
    optionButtons.visible = true;
    UpdateFrontRotationWithMe(pplCount);
    UpdateFrontRotationWithMe(optionButtons);
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
        //var delta = Math.min(timestamp - lastRender, 500);
        lastRender = timestamp;

        update();

        // v.1 - WebVR-Manager: Render the scene through the manager.
        // vrmanager.render(scene, camera, timestamp);

        // v.2 - WebVR-UI
        if(enterVR.isPresenting()){
        	//renderer.render(scene, camera);
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
    	if(expStage==3)
    	{
    		for (var i = 0; i < starAnimators.length; i++) {
	            starAnimators[i].updateLaura((135+15*i)*dt);
	        }
    	}
    	else
    	{
    		for (var i = 0; i < starAnimators.length; i++) {
	            starAnimators[i].updateLaura(300*dt);
	        }
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
            GazeToTimer();
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
            GazeToTimer();
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

function GazeToChoose() {
    for (var i = 0; i < optionLights.length; i++) {
        if (optionLights[i].name == currentOption) {
            if (optionLights[i].intensity < 1.04)
                optionLights[i].intensity += 0.04;

            if (optionButtons.children[i].children[2].visible == false){
                optionButtons.children[i].children[2].visible = true;
                sound_bamboo.play(GetRandomInt(11,20)+"");
            }

        } else if (optionLights[i].intensity >= 0.04) {
            optionLights[i].intensity -= 0.04;

            if (optionButtons.children[i].children[2].visible == true)
                optionButtons.children[i].children[2].visible = false;

        } else if (optionLights[i].intensity < 0.04) {
            optionLights[i].intensity = 0;

            if (optionButtons.children[i].children[2].visible == true)
                optionButtons.children[i].children[2].visible = false;
        }
    }
}

function GazeToTimer() {
    // first gaze?
    if(previousGazeOption != currentOption)
    {
        if(currentOption == '')
        {
            console.log("stop time gaze!");
            firstGuy.eyeTimer.visible = false;
            firstGuy.eyeTimerTarget.visible = false;
            firstGuy.eyeTimer.scale.set(0.01,0.01,0.01);
            isGazeTiming = false;
        }
        else
        {
            console.log("start time gaze!");
            firstGuy.eyeTimer.visible = true;
            firstGuy.eyeTimerTarget.visible = true;
            isGazeTiming = true;
        }
        previousGazeOption = currentOption;
    }

    // keep growing
    if (isGazeTiming)
    {
        if(isiPAD)
            firstGuy.eyeTimer.scale.lerp(new THREE.Vector3(1, 1, 1), 0.03);
        else
            firstGuy.eyeTimer.scale.lerp(new THREE.Vector3(1, 1, 1), 0.02);

        if (firstGuy.eyeTimer.scale.x >= 0.9)
        {
            // trigger thing as button click!
            OptionStartStage(optionLightDicts[currentOption].stageIndex);
            // reset
            currentOption = '';
            firstGuy.eyeTimer.visible = false;
            firstGuy.eyeTimerTarget.visible = false;
            firstGuy.eyeTimer.scale.set(0.01,0.01,0.01);
            isGazeTiming = false;
        }
    }    
}

function OptionStartStage(stageIndex) {
    expStage = stageIndex;
    switch (expStage) {
        // Redo breathing exercise
        case 1:
            announcementTexture.clear();
            announcementTextureFront.clear();
            controls.movingEnabled = false;
            optionButtons.visible = false;
            if(!optionButtons.children[1].visible)
	            optionButtons.children[1].visible = true;

            if(doneTalkingAboutExplore)
            {
	            var s_b_id = sound_options.play('breath');
	            var s_b_duration = sound_options.duration(s_b_id);
	            setTimeout(() => {
	                startBreathingPractice(true);
	            }, s_b_duration * 1000);
            }
            else {
            	delayBase = 1100;
            	sound_options.fade(1, 0, 1000, talkingAboutExploreID);
            	setTimeout(() => {
            		sound_options.stop(talkingAboutExploreID);
            		sound_options.volume(1, talkingAboutExploreID);
	                
	                var s_b_id = sound_options.play('breath');
		            var s_b_duration = sound_options.duration(s_b_id);
		            setTimeout(() => {
		                startBreathingPractice(true);
		            }, s_b_duration * 1000);

	            }, delayBase);
            }
            break;

            // Explore
        case 2:
            UpdateFrontRotationWithMe(announcement);

            announcementTexture.clear().drawText(langSwap.makeEye[sleepLang][0], undefined, 130, 'white');
            announcementTexture.drawText(langSwap.makeEye[sleepLang][1], undefined, 220, 'white');
            announcementTexture.drawText(langSwap.makeEye[sleepLang][2], undefined, 310, 'white');
            announcementTextureFront.clear().drawText(langSwap.makeEye[sleepLang][0], undefined, 130, 'white');
            announcementTextureFront.drawText(langSwap.makeEye[sleepLang][1], undefined, 220, 'white');
            announcementTextureFront.drawText(langSwap.makeEye[sleepLang][2], undefined, 310, 'white');

            optionButtons.children[1].visible = false;

            talkingAboutExploreID = sound_options.play('explore');
            controls.movingEnabled = true;
            doneTalkingAboutExplore = false;

            setTimeout(()=>{
            	doneTalkingAboutExplore = true;
            }, 9000);
            break;

            // Sleep
        case 3:
            controls.movingEnabled = false;
            optionButtons.visible = false;

            UpdateFrontRotationWithMe(announcement);

            announcementTexture.clear().drawText(langSwap.goodNight[sleepLang], undefined, 200, 'white');
            announcementTexture.drawText(":)", undefined, 290, 'white');
            announcementTextureFront.clear().drawText(langSwap.goodNight[sleepLang], undefined, 200, 'white');
            announcementTextureFront.drawText(":)", undefined, 290, 'white');

            // Move up to be out of the nest
            pplCountTex.clear();
            pplCount.visible = false;
            firstGuy.player.visible = false;
            controls.setMovYAnimation(90, 8, false, false);//8

            sound_night.fade(0.8, 0.3, 4 * 1000);

            TweenMax.to(hemiLight.groundColor, 4, { r: 0.569, g: 0.506, b: 0.1 });

            // play good night audio
            var delayBase = 0;
            if(doneTalkingAboutExplore) {
	            sound_options.play('sleep');
            } else {
            	delayBase = 1100;
            	sound_options.fade(1, 0, 1000, talkingAboutExploreID);
            	setTimeout(() => {
            		sound_options.stop(talkingAboutExploreID);
            		sound_options.volume(1, talkingAboutExploreID);
	                sound_options.play('sleep');
	            }, delayBase);
            }

            var starIndex = 0;
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
                            (k - 2) * 100 + GetRandomArbitrary(-45, 45)
                        );
                        scene.add(dupNest);

                        stars[starIndex].position.copy(dupNest.position);
                        stars[starIndex].scale.multiplyScalar(15);
                        starIndex++;
                    }
                }
            }

            setTimeout(() => {
                renderCanvas.style.opacity = 0;
            }, delayBase + 18000);

            setTimeout(() => {
                isAllOver = true;

                //nestStickTween.kill();
                TweenMax.killAll();

                // DISPOSE_TO_RELEASE_MEMORY!
                DoDispose(scene);

                DoEnding();

            }, delayBase + 20500);

            // Save Data
            saveStatistics();

            break;
    }
}

function saveStatistics() {
	fbDatabaseRef.push(final_statistic);
}

function DoEnding() {
	enterVR.requestExit();

	infoBG.style.display = "block";
	goodbyeMsg.style.display = "block";
	//document.getElementById("goodbyeText").innerHTML = "Sleep tight.<br />See you another sleepless night.. Z z z";

	setTimeout(function () {
		infoBG.style.opacity = 1;
		goodbyeMsg.style.opacity = 1;
		renderCanvas.style.opacity = 0;
	}, 100);
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
    // 5) do/sync breathing cycle as long as keep min distance & gazing (local)

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

                var h_f_n = dailyLifePlayerDict[ lookingAtSomeone ].nname;
				if( final_statistic.lookAtOthers[ h_f_n ] == undefined ){
					final_statistic.lookAtOthers[ h_f_n ] = 1;
				} else {
					final_statistic.lookAtOthers[ h_f_n ] ++;
				}
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

                        final_statistic.totalEyeContact ++;

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

    switch(sleepLang) {
        case 'en':
            pplCountTex.clear().drawText("Sleepyhead Counter", undefined, 100, 'white');
            //pplCountTex.drawText("", undefined, 250, 'white');
            pplCountTex.drawText("In this nest: " + thisWorldCount, undefined, 320, 'white');
            pplCountTex.drawText("Currently: " + totalCount, undefined, 470, 'white');
            pplCountTex.drawText("Total visit: " + totalVisit, undefined, 620, 'white');
            break;

        case 'fr':
            pplCountTex.clear().drawText("Compteur d'endormis", undefined, 100, 'white');
            //pplCountTex.drawText("", undefined, 250, 'white');
            pplCountTex.drawText("Dans ce nid: " + thisWorldCount, undefined, 320, 'white');
            pplCountTex.drawText("En ligne: " + totalCount, undefined, 470, 'white');
            pplCountTex.drawText("Total: " + totalVisit, undefined, 620, 'white');
            break;

        case 'de':
            pplCountTex.clear().drawText("Zahl der Schlafmützen", undefined, 100, 'white');
            //pplCountTex.drawText("", undefined, 250, 'white');
            pplCountTex.drawText("In diesem Nest: " + thisWorldCount, undefined, 320, 'white');
            pplCountTex.drawText("Zurzeit: " + totalCount, undefined, 470, 'white');
            pplCountTex.drawText("Insgesamt: " + totalVisit, undefined, 620, 'white');
            break;
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

function onResize() {
    if(!onResize.resizeDelay) {
        onResize.resizeDelay = setTimeout(function() {
            onResize.resizeDelay = null;
            console.log('Resizing to %s x %s.', window.innerWidth, window.innerHeight);
            effect.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }, 250);
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

function updateLang() {
    var enTexts = document.getElementsByClassName("en_text");//.style.display = "none";
    var deTexts = document.getElementsByClassName("de_text");//.style.display = "none";
    var frTexts = document.getElementsByClassName("fr_text");    

	switch(sleepLang) {
		case 'en':
            //do nothing!
    		break;

		case 'fr':
            for(var i=0; i<enTexts.length; i++)
            {
                enTexts[i].style.display = "none";
                frTexts[i].style.display = "inline";
                deTexts[i].style.display = "none";
            }
            byId("credit_text").innerHTML = langSwap.credit.fr;
            byId("playerName").placeholder = langSwap.home.input.fr;
            byId("startLink").text = langSwap.home.button.fr;
            byId("aboutPageTitle").text = langSwap.home.aboutPage.fr;
            byId("insTap").src = langSwap.home.insTap.fr;
            byId("insMov").src = langSwap.home.insMov.fr;
            byId("vrToStart").text = langSwap.home.reallyStart.fr;
            byId("restartLink").text = langSwap.exp.restartLink.fr;

            practiceIntroDuration = 37668;
    		break;

		case 'de':
            for(var i=0; i<enTexts.length; i++)
            {
                enTexts[i].style.display = "none";
                frTexts[i].style.display = "none";
                deTexts[i].style.display = "inline";
            }
            byId("credit_text").innerHTML = langSwap.credit.de;
            byId("playerName").placeholder = langSwap.home.input.de;
            byId("startLink").text = langSwap.home.button.de;
            byId("aboutPageTitle").text = langSwap.home.aboutPage.de;
            byId("insTap").src = langSwap.home.insTap.de;
            byId("insMov").src = langSwap.home.insMov.de;
            byId("vrToStart").text = langSwap.home.reallyStart.de;
            byId("restartLink").text = langSwap.exp.restartLink.de;

            practiceIntroDuration = 40779;
    		break;
	}

    switch(whichMobile) {
        case 'iOS_mobile':
            for(var i=0; i<androidTexts.length; i++) {
                androidTexts[i].style.display = "none";
            }
        break;

        case '':
            for(var i=0; i<androidTexts.length; i++) {
                androidTexts[i].style.display = "none";
            }
        break;

        case 'android':
            for(var i=0; i<iosTexts.length; i++) {
                iosTexts[i].style.display = "none";
            }
        break;
    }

    // Load sound files accordingly    
    sound_hello = new Howl({
        src: [basedURL + 'audios/voice/' + sleepLang + '/sleep_hello.webm', basedURL + 'audios/voice/' + sleepLang + '/sleep_hello.mp3'],
        volume: 1
    });
    sound_visitor_alone = new Howl({
        src: [basedURL + 'audios/voice/' + sleepLang + '/sleep_only.webm', basedURL + 'audios/voice/' + sleepLang + '/sleep_only.mp3'],
        volume: 1
    });
    sound_visitor_others = new Howl({
        src: [basedURL + 'audios/voice/' + sleepLang + '/sleep_others.webm', basedURL + 'audios/voice/' + sleepLang + '/sleep_others.mp3'],
        volume: 1
    });
    sound_lets = new Howl({
        src: [basedURL + 'audios/voice/' + sleepLang + '/sleep_lets.webm', basedURL + 'audios/voice/' + sleepLang + '/sleep_lets.mp3'],
        volume: 1
    });
    sound_practice = new Howl({
        src: [basedURL + 'audios/voice/' + sleepLang + '/sleep_practice.webm', basedURL + 'audios/voice/' + sleepLang + '/sleep_practice.mp3'],
        volume: 1
    });
    sound_options = new Howl({
        src: [basedURL + 'audios/voice/' + sleepLang + '/sleep_options.webm', basedURL + 'audios/voice/' + sleepLang + '/sleep_options.mp3'],
        volume: 1,
        sprite: {
            /*
            //v.1
            intro: [0, 11327],
            breath: [12310, 3290], //12310, 15600
            explore: [16500, 8000], //16500, 24500
            sleep: [25300, 10250] //25300, 35550            
            //v.2
            intro: [0, 8126],
            breath: [8506, 4871], //8506, 13377
            explore: [13683, 9477], //13683, 23160
            sleep: [23620, 12114] //23620, 35743            
            //v.3
            intro: [0, 8268],
            breath: [8398, 4970], //8398, 13368
            explore: [13683, 9873], //13872, 23745
            sleep: [23620, 14601] //24456, 39057
            */
            intro: langSwap.soundOptionSprite[sleepLang].intro,
            breath: langSwap.soundOptionSprite[sleepLang].breath,
            explore: langSwap.soundOptionSprite[sleepLang].explore,
            sleep: langSwap.soundOptionSprite[sleepLang].sleep
        }
    });

    // if font is loaded, but haven't created the texts with font yet, created it
    if(fontLoaded && !textCreated)
        AfterFontLoaded();
}

// Page Visibility API
// use visibility API to check if current tab is active or not
// reference: https://greensock.com/forums/topic/9887-tween-paused-when-switch-to-other-tabs/
var vis = (function(){
    var stateKey, 
        eventKey, 
        keys = {
                hidden: "visibilitychange",
                webkitHidden: "webkitvisibilitychange",
                mozHidden: "mozvisibilitychange",
                msHidden: "msvisibilitychange"
    };
    for (stateKey in keys) {
        if (stateKey in document) {
            eventKey = keys[stateKey];
            break;
        }
    }
    return function(c) {
        if (c) document.addEventListener(eventKey, c);
        return !document[stateKey];
    }
})();

// check if current tab is active or not
vis(function(){
    if(vis()){
        // tween resume() code goes here
        // the setTimeout() is used due to a delay 
        // before the tab gains focus again, very important!	
		setTimeout(function(){            
	            console.log("tab is visible - has focus");
	            tapIsVisible = true;

	            Howler.mute(false);

	            if(expStage==1)
	        		sound_practice.play();

	        },300);		
    } else {
        // tween pause() code goes here
        console.log("tab is invisible - has blur");
        tapIsVisible = false;

        Howler.mute(true);

        if(expStage==1)
	        sound_practice.pause();
    }
});