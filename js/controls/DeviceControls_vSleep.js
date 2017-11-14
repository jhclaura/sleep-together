/**
 * Based on 
 * 		THREE.PointerLockControls by mrdoob
 * 		OculusRiftControls by benvanik
 * 		DeviceOrientationControls by richt / http://richt.me
 * 									 WestLangley / http://github.com/WestLangley
 * 									 jonobr1 / http://jonobr1.com
 * 									 arodic / http://aleksandarrodic.com
 * 									 doug / http://github.com/doug
 */

var deviceOrientation = {};
var screenOrientation = window.orientation || 0;

var eyeFinalQ = new THREE.Quaternion(); // for screen in front of eyes
var eyeFinalQ2 = new THREE.Quaternion(); // for others
var eyeFinalQ3 = new THREE.Quaternion(); // for others & only Y axis

var toLookAtCenter = true;
var updateInterval = 0;

function onDeviceOrientationChangeEvent(evt) {
    deviceOrientation = evt;
}
window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);

function getOrientation() {
    switch (window.screen.orientation || window.screen.mozOrientation) {
        case 'landscape-primary':
            return 90;
        case 'landscape-secondary':
            return -90;
        case 'portrait-secondary':
            return 180;
        case 'portrait-primary':
            return 0;
    }
    // this returns 90 if width is greater then height
    // and window orientation is undefined OR 0
    // if (!window.orientation && window.innerWidth > window.innerHeight)
    //   return 90;
    return window.orientation || 0;
}

// portrait or landscape
function onScreenOrientationChangeEvent() {
    screenOrientation = getOrientation();
}
window.addEventListener('orientationchange', onScreenOrientationChangeEvent, false);

var mouseActive = false,
    keyActive = false,
    touchActive = false;
var mouseTimeOut;
var rotatable = true;
var quaternionChanged = false;

var smoothBeta = {},
    smoothAlpha = {},
    smoothGamma = {};
var betaRecordings = [],
    gammaRecordings = [],
    alphaRecordings = [];

var thisIsTouchDevice = false;
if (isTouchDevice()) thisIsTouchDevice = true;

//
var xAxis = new THREE.Vector3(1, 0, 0);
var yAxis = new THREE.Vector3(0, 1, 0);
var zAxis = new THREE.Vector3(0, 0, 1);

//
var deviceDirection;

THREE.DeviceControls = function(camera, worldCenter) {

    var scope = this;

    // Use the method of THREE.PointerLockControls
    var pitchObject = new THREE.Object3D();
    pitchObject.add(camera);

    var yawObject = new THREE.Object3D();
    var yawObjectOriginal = new THREE.Object3D();

    yawObject.position.set(myStartX, myStartY, myStartZ);
    yawObject.add(pitchObject);

    yawObjectOriginal.position.copy(yawObject.position);

    //
    this.lookAtCenterQ = new THREE.Quaternion();
    this.worldCenter = worldCenter.clone();

    var tempEuler = new THREE.Euler(0, -Math.PI, 0, 'YXZ');
    eyeFinalQ2.setFromEuler(tempEuler);

    //LOOKAT_CENTER
    if (toLookAtCenter) {
        var m1 = new THREE.Matrix4();
        m1.lookAt(yawObject.position, scope.worldCenter, yawObject.up);

        if (thisIsTouchDevice) {
            this.lookAtCenterQ.setFromRotationMatrix(m1);
        } else {
            var tmpQ = new THREE.Quaternion();
            tmpQ.setFromRotationMatrix(m1);
            var tmpE = new THREE.Euler(0, 0, 0, 'YXZ');
            tmpE.setFromQuaternion(tmpQ);

            tmpE.set(0, tmpE.y, 0);
            yawObject.rotation.copy(tmpE);
            // yawObject.quaternion.setFromRotationMatrix( m1 );
        }
        console.log("look at center");
    }

    // FOR_REAL: false, FOR_DEV: true
    if (devMode)
        this.movingEnabled = true;
    else
        this.movingEnabled = false;

    this.clickingTouchingEnabled = true;

    var moveForward = false;
    var moveBackward = false;
    var moveLeft = false;
    var moveRight = false;

    var isOnObject = false;
    var canJump = false;

    var velocity = new THREE.Vector3();

    var PI_2 = Math.PI / 2;

    this.moveSpeed = 0.003;
    this.jumpSpeed = 5;

    var _q1 = new THREE.Quaternion();
    var axisX = new THREE.Vector3(1, 0, 0);
    var axisZ = new THREE.Vector3(0, 0, 1);

    //TOUCH
    var touchStartLoc = new THREE.Vector2();
    var touchCurrentLoc = new THREE.Vector2();
    var touch2ndStartLoc = new THREE.Vector2();
    var touch2ndCurrentLoc = new THREE.Vector2();

    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    // WEBSOCKET
    // if( !addNewPlayerYet && trulyFullyStart ){
    if (!addNewPlayerYet) {
        var msg = {
            'type': 'addNewPlayer',
            'camID': camID,
            // 'peerid': peer_id,
            'id': -1,
            'playerStartX': myStartX,
            'playerStartY': myStartY,
            'playerStartZ': myStartZ,
            'playerStartRotY': yawObject.rotation.y,
            'myHex': myColor,
            'nname': playerNName,
            'worldId': -1
        };

        sendMessage(JSON.stringify(msg));
        addNewPlayerYet = true;
    }
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////

    // DEVICE_ORIENTATION_CONTROL
    this.freeze = false; // origin: true
    this.rollSpeed = 0.005;
    this.autoAlign = true;
    this.autoForward = false;

    this.alpha = 0;
    this.beta = 0;
    this.gamma = 0;
    this.orient = 0;

    this.alignQuaternion = new THREE.Quaternion();
    var alignQuaternionPublic = new THREE.Quaternion();
    this.orientationQuaternion = new THREE.Quaternion();
    var orientationQuaternionPublic = new THREE.Quaternion();
    var orientationQuaternionPublic2 = new THREE.Quaternion();

    this.finalQ = new THREE.Quaternion();
    this.finalQ2 = new THREE.Quaternion(); // for rotate things other than eyeScreen

    this.screenOrientationQuaternion = new THREE.Quaternion();

    var quaternion = new THREE.Quaternion(),
        quaternion2 = new THREE.Quaternion();
    var quaternionLerp = new THREE.Quaternion(),
        quaternionLerp2 = new THREE.Quaternion();

    var zee = new THREE.Vector3(0, 0, 1);
    var up = new THREE.Vector3(0, 1, 0);
    var v0 = new THREE.Vector3(0, 0, 0);
    var euler = new THREE.Euler();
    var euler2 = new THREE.Euler();
    var screenTransform = new THREE.Quaternion();
    var worldTransform = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
    var worldTransform2 = new THREE.Quaternion(Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
    var minusHalfAngle = 0;

    this.neckAngle = new THREE.Euler();

    //
    this.calQ = function() {
        this.alpha = deviceOrientation.alpha ? THREE.Math.degToRad(deviceOrientation.alpha) : 0; // Z
        this.beta = deviceOrientation.beta ? THREE.Math.degToRad(deviceOrientation.beta) : 0; // X'
        this.gamma = deviceOrientation.gamma ? THREE.Math.degToRad(deviceOrientation.gamma) : 0; // Y''
        this.orient = screenOrientation ? THREE.Math.degToRad(screenOrientation) : 0; // O

        // The angles alpha, beta and gamma
        // form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

        // 'ZXY' for the device, but 'YXZ' for us
        // euler.set(bTmp, aTmp, - gTmp, 'YXZ');
        euler.set(this.beta, this.alpha, -this.gamma, 'YXZ');

        quaternion.setFromEuler(euler);
        quaternionLerp.slerp(quaternion, 0.5); // interpolate

        // for re-orient the device
        // make the orientation accessible
        if (this.autoAlign) orientationQuaternionPublic.copy(quaternion); // interpolation breaks the auto alignment
        else orientationQuaternionPublic.copy(quaternionLerp);

        // camera looks out the back of the device, not the top
        orientationQuaternionPublic.multiply(worldTransform);

        // adjust for screen orientation
        orientationQuaternionPublic.multiply(screenTransform.setFromAxisAngle(zee, -this.orient));

        // this.finalQ.copy(this.lookAtCenterQ);
        this.finalQ.copy(alignQuaternionPublic);
        this.finalQ.multiply(orientationQuaternionPublic);

        ////////////
        ////////////
        ////////////

        // for rotate things other than eyeScreen
        if (this.autoAlign) orientationQuaternionPublic2.copy(quaternion); // interpolation breaks the auto alignment
        else orientationQuaternionPublic2.copy(quaternionLerp);

        orientationQuaternionPublic2.multiply(worldTransform2);
        orientationQuaternionPublic2.multiply(screenTransform.setFromAxisAngle(zee, -this.orient));

        this.finalQ2.copy(alignQuaternionPublic);
        this.finalQ2.multiply(orientationQuaternionPublic2);

        if (this.autoAlign && this.alpha !== 0) {
            this.autoAlign = false;
            scope.align();
        }
    };

    // align
    // v2
    this.align = function() {

        var tempQuaternion = new THREE.Quaternion();
        var tempVector3 = new THREE.Vector3();
        var tempMatrix4 = new THREE.Matrix4();
        var tempEuler = new THREE.Euler(0, 0, 0, 'YXZ');
        var currentCenter = myWorldCenter.clone();
        currentCenter.y = yawObject.position.y;

        tempVector3.copy(yawObject.position).applyQuaternion(tempQuaternion.copy(orientationQuaternionPublic).inverse(), 'ZXY');
        tempMatrix4.lookAt(tempVector3, currentCenter, up);
        tempQuaternion.setFromRotationMatrix(tempMatrix4);
        tempEuler.setFromQuaternion(tempQuaternion);

        var ttt = tempEuler.y; // + Math.PI
        tempEuler.set(0, ttt, 0);
        alignQuaternionPublic.setFromEuler(tempEuler);

        console.log("aligneddd!");
    };

    var onMouseMove = function(event) {

        if (scope.enabled === false) return;
        if (rotatable === false) return;

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        mousemove = true;
        mouseActive = true;

        yawObjectOriginal.rotation.y -= movementX * 0.001;

        if (quaternionChanged)
            yawObject.rotation.y += movementX * 0.001;
        else
            yawObject.rotation.y -= movementX * 0.001;

        pitchObject.rotation.x -= movementY * 0.001;
        pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2+PI_2/20, pitchObject.rotation.x));

        if (!thisIsTouchDevice) {

            // if you're not mobile phone
            // create quaternion from rotation created by mouseMove
            var tempEuler = new THREE.Euler();
            tempEuler.set(pitchObject.rotation.x, yawObject.rotation.y, 0, 'YXZ');
            eyeFinalQ.setFromEuler(tempEuler);

            // for rotating things other than fixed eyeScreen
            // v.1
            tempEuler.set(-pitchObject.rotation.x, yawObject.rotation.y - Math.PI, 0, 'YXZ');
            // v.2
            // tempEuler.set(-pitchObject.rotation.x, yawObject.rotation.y, 0, 'YXZ');
            eyeFinalQ2.setFromEuler(tempEuler);
            //
            eyeFinalQ3.copy(yawObject.quaternion);
        }

        //TIMEOUT_detect mouse stop
        clearTimeout(mouseTimeOut);
        mouseTimeOut = setTimeout(function() {
            mouseActive = false;
        }, 50);
    };

    function myMouseDown(event) {

        if (scope.clickingTouchingEnabled === false) return;

        //interact();
        getInput();
    }

    var onKeyDown = function(event) {
        if (scope.movingEnabled === false) return;
        if (scope.enabled === false) return;

        keyActive = true;
        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                moveForward = true;
                break;

            case 37: // left
            case 65: // a
                moveLeft = true;
                break;

            case 40: // down
            case 83: // s
                moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                moveRight = true;
                break;

            case 32: // space
                // if ( canJump === true ) velocity.y += this.jumpSpeed;
                // canJump = false;
                break;
        }
    }.bind(this);

    var onKeyUp = function(event) {
        if (scope.movingEnabled === false) return;
        if (scope.enabled === false) return;

        keyActive = false;

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                moveForward = false;
                break;

            case 37: // left
            case 65: // a
                moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                moveRight = false;
                break;
        }
    };

    // DEVICE
    var onTouchStart = function(event) {

        if (scope.clickingTouchingEnabled === false) return;
        if (scope.enabled === false) return;
        if (rotatable === false) return;

        touchActive = true;

        // setTimeout(function(){
        // 	if(touchActive){
        // 		moveForward = true;
        // 	}
        // }, 1500);

        var touch = event.touches[0];

        var startPointX = touch.clientX;
        var startPointY = touch.clientY;

        touchStartLoc.set(startPointX, startPointY);
        // console.log("startX: " + startPointX + ", startY: " + startPointY);

        // CHEW!!
        // firstGuy.chew();		

        if (event.touches.length == 2) {
            var touch2nd = event.touches[1];
            touch2ndStartLoc.set(touch2nd.clientX, touch2nd.clientY);
        }

        //interact();
        getInput();

        //scope.align();
        //alignBody(firstGuy);
    };

    var alignBody = function(guy) {
        guy.player.children[0].rotation.y = guy.player.children[1].rotation.y;
    }

    var onTouchMove = function(event) {

        if (scope.movingEnabled === false) return;
        if (scope.enabled === false) return;
        if (rotatable === false) return;

        var touchFirst = event.touches[0];

        var currentLocX = touchFirst.clientX;
        var currentLocY = touchFirst.clientY;

        touchCurrentLoc.set(currentLocX, currentLocY);

        var movementX = touchCurrentLoc.clone().sub(touchStartLoc).x;
        var movementY = touchCurrentLoc.clone().sub(touchStartLoc).y;

        // v.2
        if (movementY < -20) {
            moveForward = true;
            moveBackward = false;
        } else if (movementY > 20) {
            moveForward = false;
            moveBackward = true;
        } else {
            moveForward = false;
            moveBackward = false;
        }
        // console.log(event.touches.length);
    };

    var onTouchEnd = function(event) {
        if (scope.clickingTouchingEnabled === false) return;
        if (scope.movingEnabled === false) return;
        if (scope.enabled === false) return;

        touchActive = false;

        moveLeft = false;
        moveRight = false;
        moveBackward = false;
        moveForward = false;
    };

    //TOUCH
    if (thisIsTouchDevice) {
        document.addEventListener('touchstart', onTouchStart, false);
        // document.addEventListener( 'touchmove', onTouchMove, false );
        document.addEventListener('touchend', onTouchEnd, false);
    } else {
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mousedown', myMouseDown, false);
        document.addEventListener('keydown', onKeyDown, false);
        document.addEventListener('keyup', onKeyUp, false);
    }

    if (!isMobile)
        this.enabled = false;
    else
        this.enabled = true;

    var getInput = function() {

        switch (expStage) {
            // Explore Mode
            case 2:
                optionOnInput();
                break;

            // Options Mode
            case 4:
                optionOnInput();
                break;
        }
    }

    var optionOnInput = function() {
        if (currentOption != '') {

            if (optionLightDicts[currentOption].intensity > 1) {
                console.log('choose option: ' + currentOption);
                currentOption == '';
                OptionStartStage(optionLightDicts[currentOption].stageIndex);
            }
        };
    }

    var interact = function() {
        if (lookingAtSomeone != -1 && lookingAtSomeone != whoIamInLife) {
            createHeart(whoIamInLife, lookingAtSomeone);

            var h_f_n = dailyLifePlayerDict[lookingAtSomeone].nname;

            if (final_statistic.meToOthers[h_f_n] == undefined) {
                final_statistic.meToOthers[h_f_n] = 1;
            } else {
                final_statistic.meToOthers[h_f_n]++;
            }
            poopHeartFromMeCount++;
            final_statistic.totalHeart++;
        } else {
            //firstGuy.chew();
        }

        if (trulyFullyStart) {
            var msg = {
                'type': 'chew',
                'index': whoIamInLife,
                'toWhom': lookingAtSomeone,
                'playerPos': yawObject.position,
                'playerDir': scope.getDirection(),
                'worldId': meInWorld
            };

            if (ws) {
                sendMessage(JSON.stringify(msg));
            }
        }
    }

    this.getObject = function() {
        return yawObject;
    };

    this.isOnObject = function(boolean) {
        isOnObject = boolean;
        canJump = boolean;
    };

    // FOR_DEBUGGING
    this.getDirection = function(_null) {

        // assumes the camera itself is not rotated
        // var direction = new THREE.Vector3( 0, 0, -1 );
        var rotation = new THREE.Euler(0, 0, 0, "YXZ");

        return function(v) {
            var v = new THREE.Vector3(0, 0, -1);

            if (thisIsTouchDevice) {
                if (_null == 1) // for mobile to eye raycast
                    rotation.setFromQuaternion(eyeFinalQ2, 'YXZ');
                else
                    rotation.setFromQuaternion(eyeFinalQ, 'YXZ');

                // rotation.set( yawObject.rotation.x, yawObject.rotation.y, 0 );
            } else
                rotation.set(pitchObject.rotation.x, yawObject.rotation.y, 0);

            v.applyEuler(rotation);

            return v;
        }
    }();

    this.rotation = function() {
        var rr = new THREE.Vector3(yawObject.rotation.x, yawObject.rotation.y, yawObject.rotation.z);
        return rr;
    };

    this.setRotation = function(newRotation) {
        yawObject.rotation.x = newRotation.x;
        yawObject.rotation.y = newRotation.y;
        yawObject.rotation.z = newRotation.z;
    };

    this.setRotationByQ = function(newRotationQ) {
        yawObject.rotation.setFromQuaternion(newRotationQ);
    };

    this.setPosX = function(newPosX) {
        yawObject.position.x = newPosX;
    };

    this.setPosY = function(newPosY) {
        yawObject.position.y = newPosY;
    };

    this.setPosZ = function(newPosZ) {
        yawObject.position.z = newPosZ;
    };

    this.setPosition = function(newPositin) {
        yawObject.position.copy(newPositin);
    };

    this.dirF = function() {
        return moveForward;
    };

    this.posX = function() {
        return yawObject.position.x;
    };

    this.posY = function() {
        return yawObject.position.y;
    };

    this.posZ = function() {
        return yawObject.position.z;
    };

    this.position = function() {
        return yawObject.position;
    };

    this.rotX = function() {
        return yawObject.rotation.x;
    };

    this.rotY = function() {
        return yawObject.rotation.y;
    };

    this.rotZ = function() {
        return yawObject.rotation.z;
    };

    // FOR_MOVING
    this.setMoveF = function(moveF) {
        moveForward = moveF;
    };

    this.setMoveB = function(moveB) {
        moveBackward = moveB;
    };

    this.setMoveL = function(moveL) {
        moveLeft = moveL;
    };

    this.setMoveR = function(moveR) {
        moveRight = moveR;
    };

    //
    this.setMovXAnimation = function(_distance, _time, _followEyeDirection, _toHide) {
        var v1 = new THREE.Vector3();
        var v2 = new THREE.Vector3();
        v2.copy(yawObject.position);
        if (_followEyeDirection)
            v1.copy(xAxis).applyQuaternion(eyeFinalQ3);
        else
            v1.copy(xAxis);
        v2.add(v1.multiplyScalar(_distance));

        this.createTweenForMove(v2, _time, _toHide);
    };
    this.setMovYAnimation = function(_distance, _time, _followEyeDirection, _toHide) {
        var v1 = new THREE.Vector3();
        var v2 = new THREE.Vector3();
        v2.copy(yawObject.position);
        if (_followEyeDirection)
            v1.copy(yAxis).applyQuaternion(eyeFinalQ3);
        else
            v1.copy(yAxis);
        v2.add(v1.multiplyScalar(_distance));

        this.createTweenForMove(v2, _time, _toHide);
    };
    this.setMovZAnimation = function(_distance, _time, _followEyeDirection, _toHide) {
        var v1 = new THREE.Vector3();
        var v2 = new THREE.Vector3();
        v2.copy(yawObject.position);
        if (_followEyeDirection)
            v1.copy(zAxis).applyQuaternion(eyeFinalQ3);
        else
            v1.copy(zAxis);
        v2.add(v1.multiplyScalar(_distance));

        this.createTweenForMove(v2, _time, _toHide);
    };

    this.createTweenForMove = function(_newPos, _time, _toHide) {
        TweenMax.to(
            yawObject.position,
            _time, {
                x: _newPos.x,
                y: _newPos.y,
                z: _newPos.z,
                ease: Power1.easeInOut,
                onStart: () => {
                    if (_toHide)
                        firstGuy.player.visible = false;
                },
                onComplete: () => {
                    if (_toHide)
                        firstGuy.player.visible = true;
                }
                /*
                ,onUpdate: ()=>{
                	var msg = {
                		'type': 'updatePlayer',
                		'index': whoIamInLife,
                		'playerPosX': yawObject.position.x,
                		'playerPosY': yawObject.position.y,
                		'playerPosZ': yawObject.position.z,
                		'playerRotY': yawObject.rotation.y,
                		'playerQ' : eyeFinalQ2,
                		'eyeQ' : eyeFinalQ,
                		'playerQ3' : eyeFinalQ3,
                		'worldId': meInWorld
                	};

                	if(ws){
                		sendMessage( JSON.stringify(msg) );
                	}
                }*/
            }
        );
    };

    //
    this.update = function(delta) {

        if (scope.enabled === false) return;
        if (scope.freeze) return;

        updateInterval += delta;

        delta *= 0.5;

        velocity.x += (-velocity.x) * 0.08 * delta;
        velocity.z += (-velocity.z) * 0.08 * delta;

        // velocity.y -= 0.10 * delta;

        if (moveForward) velocity.z -= this.moveSpeed * delta;
        if (moveBackward) velocity.z += this.moveSpeed * delta;

        if (moveLeft) velocity.x -= this.moveSpeed * delta;
        if (moveRight) velocity.x += this.moveSpeed * delta;

        // if ( isOnObject === true ) {
        // 	velocity.y = Math.max( 0, velocity.y );
        // }

        // Rotate by Device
        if (thisIsTouchDevice) {
            // calculate the Quaternion
            this.calQ();

            eyeFinalQ.copy(this.finalQ); //.clone()
            eyeFinalQ2.copy(this.finalQ2); //.clone()

            // rotate camera
            yawObject.rotation.setFromQuaternion(this.finalQ);

            //
            eyeFinalQ3.copy(yawObject.quaternion);
            eyeFinalQ3._x = 0;
            eyeFinalQ3._z = 0;
            eyeFinalQ3.normalize();
        }

        yawObject.translateY(velocity.y);
        yawObject.translateX(velocity.x);

        if (thisIsTouchDevice) {
            translateOnZAxis(yawObject, velocity.z);
        } else {
            yawObject.translateZ(velocity.z);
        }

        // === if can move up & down
        // if ( yawObject.position.y < 1 ) {
        // 	velocity.y = 0;
        // 	yawObject.position.y = 1;
        // 	canJump = true;
        // }

        eyeFinalQ3.copy(yawObject.quaternion);
        eyeFinalQ3._x = 0;
        eyeFinalQ3._z = 0;
        eyeFinalQ3.normalize();

        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////
        //WEB_SOCKET

        if (updateInterval > 110) {
            updateInterval = 0;

            if (trulyFullyStart) {
                var msg = {
                    'type': 'updatePlayer',
                    'index': whoIamInLife,
                    'playerPosX': yawObject.position.x,
                    'playerPosY': yawObject.position.y,
                    'playerPosZ': yawObject.position.z,
                    'playerRotY': yawObject.rotation.y,
                    'playerQ': eyeFinalQ2,
                    'eyeQ': eyeFinalQ,
                    'playerQ3': eyeFinalQ3,
                    'worldId': meInWorld
                };

                if (ws) {
                    sendMessage(JSON.stringify(msg));
                }
            }
        }

        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////

        if (firstGuy) {
            // console.log(eyeFinalQ2);
            firstGuy.update(yawObject.position.x, yawObject.position.y, yawObject.position.z, yawObject.rotation.y, eyeFinalQ2);
        }
    };

    // //debug
    // window.addEventListener('click', (function(){
    //   this.align();
    // }).bind(this));

    this.connect = function() {
        this.freeze = false;
    };

    this.disconnect = function() {
        this.freze = true;
    };

    // translate object by distance along axis in world space
    // axis is assumed to be normalized
    var translateOnZAxis = function(obj, distance) {
        var v1 = new THREE.Vector3(0, 0, 1);
        var q1 = obj.quaternion.clone();
        q1._x = 0;
        q1._z = 0;
        q1.normalize();
        v1.applyQuaternion(q1);
        obj.position.add(v1.multiplyScalar(distance));
    };
};

function UpdateRotationWithMe(item) {
    var vv1 = new THREE.Vector3();
    vv1 = new THREE.Euler().setFromQuaternion(eyeFinalQ3, 'YXZ');
    item.rotation.y = vv1.y + Math.PI;
}

function UpdateFrontRotationWithMe(item) {
    var vv1 = new THREE.Vector3();
    vv1 = new THREE.Euler().setFromQuaternion(eyeFinalQ3, 'YXZ');
    item.rotation.y = vv1.y;
}

function smooth(target, readings, input) {

    target.total -= readings[target.index];
    readings[target.index] = input;
    target.total += readings[target.index];
    target.index++;

    if (target.index >= target.sampleNumber)
        target.index = 0;

    target.average = target.total / target.sampleNumber;

    return target.average;
}

function isTouchDevice() {
    return 'ontouchstart' in window || !!(navigator.msMaxTouchPoints);
}