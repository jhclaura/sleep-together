// THE SLEEP PERSON OBJECT
function PersonSleep(_pos, _color, _id, _name) {

    var scope = this;

    this.color = _color;
    this.whoIam = _id;
    this.ahhRotation;
    this.nname = _name;
    this.sleeperOrigin = 'Earth';

    this.lookAt = -1;
    this.gazeDotTargetLength = -1;

    // for interpolation
    this.realPosition = new THREE.Vector3();
    this.realRotation = new THREE.Quaternion();
    this.realBillboardRotation = new THREE.Quaternion();
    this.yaxisInQ = new THREE.Quaternion(0, Math.PI / 2, 0, 0);

    this.tmpPlayerQ = new THREE.Quaternion();
    this.tmpTargetVector = new THREE.Vector3();

    // construct physical existence
    this.player = new THREE.Object3D();
    this.pSkinnedMat = new THREE.MeshLambertMaterial({ skinning: true, map: sleeper_test_Texture, color: this.color, side: THREE.DoubleSide });

    // 2-body
    //this.playerBody = new THREE.Mesh( sleeperGeo, this.pSkinnedMat);
    this.playerBody = new THREE.SkinnedMesh(sleeperGeo_test, this.pSkinnedMat);
    //this.playerBody.visible = true;
    this.playerBody.name = _id + " body";

    // if it's ME, create inner stuff
    if (this.whoIam == whoIamInLife) {
        // 1-0: stomach
        this.poopMini = new THREE.Object3D();
        this.poopMini.name = "miniPoop";
        this.playerBody.add(this.poopMini);

        // 1-1: message!
        scope.wordTexture = new THREEx.DynamicTexture(1024, 128); //512,512; 1000,128
        scope.wordTexture.context.font = "bolder 70px StupidFont";
        // scope.wordTexture.clear('#dc5e64').drawText("You got a poop heart from --- <3", undefined, 96, 'white');
        scope.wordTexture.clear();
        scope.wordMaterial = new THREE.MeshBasicMaterial({ map: this.wordTexture.texture, side: THREE.DoubleSide, transparent: true, depthTest: false });
        scope.wordBubble = new THREE.Mesh(new THREE.PlaneGeometry(this.wordTexture.canvas.width, this.wordTexture.canvas.height), this.wordMaterial);
        scope.wordBubble.scale.set(0.002, 0.002, 0.002);
        scope.wordBubble.position.z = 3;
        scope.wordBubble.position.y = 0;
        scope.wordBubble.rotation.y = Math.PI;
        scope.wordBubble.name = "wordBubble";
        scope.wordBubble.visible = false;
        scope.playerBody.skeleton.bones[0].add(scope.wordBubble);
    }

    // 2-2: message_name!
    this.nameTexture = new THREEx.DynamicTexture(512, 64); //512,128
    this.nameTexture.context.font = "bolder 70px StupidFont"; //100px
    this.nameTexture.clear('#31393c').drawText(this.nname, undefined, 50, 'grey'); //96
    this.nameMaterial = new THREE.MeshBasicMaterial({ map: this.nameTexture.texture, side: THREE.DoubleSide });
    this.nameMaterial.transparent = false;
    this.nameBubble = new THREE.Mesh(new THREE.PlaneGeometry(this.nameTexture.canvas.width, this.nameTexture.canvas.height), this.nameMaterial);
    this.nameBubble.scale.set(0.005, 0.005, 0.005);
    this.nameBubble.position.z = -0.4;
    this.nameBubble.position.y = 2;
    this.nameBubble.name = "nameBubble";

    this.dataTexture = new THREEx.DynamicTexture(512, 64); //512,128
    this.dataTexture.context.font = "bolder 50px StupidFont"; //100px
    this.dataTexture.clear().drawText("time from geolocation", undefined, 50, 'grey'); //96
    this.dataMaterial = new THREE.MeshBasicMaterial({ map: this.dataTexture.texture, side: THREE.DoubleSide });
    this.dataMaterial.transparent = true;
    this.dataBubble = new THREE.Mesh(new THREE.PlaneGeometry(this.dataTexture.canvas.width, this.dataTexture.canvas.height), this.dataMaterial);
    this.dataBubble.position.y = -80;
    this.dataBubble.name = "dataBubble";

    this.nameBubble.add(this.dataBubble);
    this.playerBody.skeleton.bones[0].add(this.nameBubble);

    // 2-3: eye
    this.eye = new THREE.Object3D();
    this.eye.name = "eye";
    this.eye.scale.multiplyScalar(0.01);
    this.eye.visible = false;
    this.playerBody.add(this.eye);

    // 2-3: light
    this.breathLight = new THREE.PointLight(0xffff00, 0, 50); //intensity: 0.2
    this.breathLight.name = _id + " breathLight";
    // ori color: 0xffef3b
    var mat = new THREE.SpriteMaterial({ map: breathLightTexture, color: 0x8a7512, transparent: false, blending: THREE.AdditiveBlending });
    this.breathSprite = new THREE.Sprite(mat);
    this.breathSprite.name = _id + " breathSprite";
    this.breathSprite.scale.multiplyScalar(0.05);
    this.breathSprite.visible = false;

    this.breathLight.add(this.breathSprite);
    this.breathLight.position.set(0, 0.5, 2);
    // DEMO_not_real
    /*
    TweenMax.to(this.breathSprite.scale, 7.5, {
        x:3, y: 3, z: 3,
        ease: Power1.easeInOut, yoyo: true, repeat: -1, repeatDelay: 1});
    */
    this.playerBody.skeleton.bones[0].add(this.breathLight);

    // Gaze Dots
    this.gazeDots = new THREE.Object3D();
    // new texture for manipulating UV
    var g_d_tex = gazeDotTex.clone();
    g_d_tex.needsUpdate = true;
    var g_d_mesh = new THREE.Mesh(gazeDotGeo, new THREE.MeshBasicMaterial({ map: g_d_tex, side: THREE.DoubleSide, transparent: true }));
    g_d_mesh.rotation.x = Math.PI / 2;
    g_d_mesh.position.set(0.1, -0.5, 0.5);
    g_d_mesh.scale.x = 0.1;
    this.gazeDots.add(g_d_mesh);
    this.player.add(this.gazeDots); //skeleton.bones[1]
    this.gazeDots.visible = false;

    this.playerBody.position.y -= 1; //0.6

    // 1-DummyBox for easy raycasting
    this.playerBodyParent = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 4), new THREE.MeshBasicMaterial({ visible: false }));
    this.playerBodyParent.name = _id + " parentBody";
    this.playerBodyParent.add(this.playerBody);

    // UPDATE_FOR_FACING_FRONT
    var tempEuler = new THREE.Euler(0, -Math.PI, 0, 'YXZ');
    if (this.whoIam == whoIamInLife)
        this.playerBodyParent.quaternion.setFromEuler(tempEuler);
    else
        this.playerBody.skeleton.bones[0].quaternion.setFromEuler(tempEuler);

    this.player.add(this.playerBodyParent);

    this.player.position.copy(_pos);

    if (this.whoIam == whoIamInLife) {
        scene.add(this.player);
    } else {
        dailyLifePlayerObject.add(this.player);
    }

    // Setup breathing
    //v.1
    /*
    this.breathingTimeline = new TimelineMax({
        repeat: 3,
        repeatDelay: 2,
        paused: true,
        onComplete: () => {
            TweenMax.to(this.breathLight, 0.5, {
                intensity: 0,
                onComplete: () => {
                    this.breathSprite.visible = false;
                }
            });
        }
    });
    // inhale through nose for 4
    this.breathingTimeline
        .to(this.breathSprite.scale, 4, {
            x: 3,
            y: 3,
            z: 3,
            ease: Power1.easeInOut
        })
        .addLabel("exhale", "+=7") // hold for 7
        .to(this.breathSprite.scale, 8, { // exhale through mouth for 8
            x: .05,
            y: .05,
            z: .05,
            ease: Power1.easeInOut
        }, "exhale");
    */

    //v.2
    this.breathingSetting = {
        timeGaps: langSwap.breathLight[sleepLang].timeGaps,   //v.1: timeGaps: [0, 2.3, 8.8, 5.9, 2.9, 1.8]; v.2: [0, 3.1, 11.1, 7.5, 4.7, 2.5]; v.3: [0, 3, 10.9, 6.9, 4, 1.8]
        durations: langSwap.breathLight[sleepLang].durations,    //v.1: durations: [3.8, 4.2, 3.3, 4.3, 3.4, 3.9]; v.2: [4.3, 4.7, 4.2, 5.3, 3.8, 4]; v.3: [4.3, 4.6, 5.4, 5.1, 4.2, 4.4]
        labels: ['inhale_1', 'exhale_1', 'inhale_2', 'exhale_2', 'inhale_3', 'exhale_3'],
        seq: [0,1,0,1,0,1]
    };
    this.setupBreathing();
}

PersonSleep.prototype.update = function(_playerLocX, _playerLocY, _playerLocZ, _playerRotY, _playerQ) {

    this.player.position.set(_playerLocX, _playerLocY, _playerLocZ);

    // head
    // if(this.player.children[1]) {
    //  this.player.children[1].quaternion.copy(_playerQ);
    // }

    // body
    this.tmpPlayerQ.copy(_playerQ);
    this.tmpPlayerQ._x = 0;
    this.tmpPlayerQ._z = 0;
    this.tmpPlayerQ.normalize();

    if (this.playerBodyParent) {
        this.playerBodyParent.quaternion.copy(this.tmpPlayerQ);
    }

    this.realRotation = _playerQ;

    // gazeDot
    if (this.gazeDotTargetLength > 0) {
        this.gazeDots.scale.lerp(new THREE.Vector3(1, 1, this.gazeDotTargetLength), 0.008);
        this.gazeDots.children[0].material.map.repeat.lerp(new THREE.Vector2(1, this.gazeDotTargetLength), 0.008);
        this.gazeDots.children[0].material.map.offset.y -= 0.01;
    }
}

PersonSleep.prototype.updateReal = function(_playerLocX, _playerLocY, _playerLocZ, _playerQ) {

    this.realPosition.set(_playerLocX, _playerLocY, _playerLocZ);
    this.realRotation.copy(_playerQ);
    this.tmpPlayerQ.copy(_playerQ);
    this.tmpPlayerQ._x = 0;
    this.tmpPlayerQ._z = 0;
    this.tmpPlayerQ.normalize();
    this.realBillboardRotation.copy(this.tmpPlayerQ);
}

PersonSleep.prototype.transUpdate = function() {
    this.player.position.lerp(this.realPosition, 0.1);

    // v.1
    /*
    // head
    if(this.player.children[1]) {
        this.player.children[1].quaternion.slerp( this.realRotation, 0.2 );
    }   
    // body
    if(this.player.children[0]){
        this.player.children[0].quaternion.slerp( this.realBillboardRotation, 0.2 );
    }
    */

    // v.2 - Bones  
    if (this.playerBody) {
        // head
        this.playerBody.skeleton.bones[1].quaternion.slerp(this.realRotation, 0.2);
        // body
        this.playerBody.skeleton.bones[0].quaternion.slerp(this.realBillboardRotation, 0.2);
    }

    // gazeDot
    if (this.gazeDotTargetLength > 0) {
        this.gazeDots.scale.lerp(new THREE.Vector3(1, 1, this.gazeDotTargetLength), 0.008);
        this.gazeDots.children[0].material.map.repeat.lerp(new THREE.Vector2(1, this.gazeDotTargetLength), 0.008);
        this.gazeDots.children[0].material.map.offset.y -= 0.01;
    }
}

PersonSleep.prototype.openEye = function() {
    //this.eye.visible = true;
    //TweenMax.to(this.eye.scale, 1, { x: 1, y: 1, z: 1, ease: Back.easeOut.config(2) });
    this.eye.scale.set(1, 1, 1);
}

PersonSleep.prototype.closeEye = function() {
    // TweenMax.to(this.eye.scale, 0.7, {
    //     x: 0.01,
    //     y: 0.01,
    //     z: 0.01,
    //     ease: Back.easeIn.config(2),
    //     onComplete: () => {
    //         this.eye.visible = false;
    //     }
    // });
    this.eye.scale.set(0.01, 0.01, 0.01);
}

PersonSleep.prototype.updateTimetag = function(_time) {
    this.dataTexture.clear().drawText(_time + ", " + this.sleeperOrigin, undefined, 50, 'grey');
}

PersonSleep.prototype.prepForBreathing = function() {
    this.breathSprite.visible = true;
    TweenMax.to(this.breathLight, 1, { intensity: 0.2 });
}

PersonSleep.prototype.startBreathing = function(_redo) {
    if (_redo)
        this.breathingTimeline.restart();
    else
        this.breathingTimeline.play();
}

PersonSleep.prototype.setGazeDotsRotation = function(targetVector) {
    this.tmpTargetVector.copy(targetVector);
    this.player.worldToLocal(this.tmpTargetVector);
    this.gazeDots.lookAt(this.tmpTargetVector);
    this.gazeDots.visible = true;
}

PersonSleep.prototype.resetGazeDots = function() {
    this.gazeDotTargetLength = -1;
    this.gazeDots.scale.set(1, 1, 1);
    this.gazeDots.children[0].material.map.repeat.y = 1;
    this.gazeDots.children[0].material.map.offset.y = 0;
    this.gazeDots.visible = false;
}

PersonSleep.prototype.setupBreathing = function() {

    this.breathingTimeline = new TimelineMax({
        paused: true,
        onComplete: () => {
            TweenMax.to(this.breathLight, 0.5, {
                intensity: 0,
                onComplete: () => {
                    this.breathSprite.visible = false;
                }
            });
        }
    });

    for (var i = 0; i < this.breathingSetting.labels.length; i++) {
        var tweenLabelTime = "+=" + this.breathingSetting.timeGaps[i];
        this.breathingTimeline.add( this.breathingSetting.labels[i], tweenLabelTime );

        var tweenToBeAdded = this.selectBreathAnimation(this.breathingSetting.seq[i], this.breathingSetting.durations[i]);
        this.breathingTimeline.add( tweenToBeAdded, this.breathingSetting.labels[i] );
    }
}

PersonSleep.prototype.selectBreathAnimation = function(aniIndex, duration) {
    switch (aniIndex) {
        case 0:
            return this.breathInhale(duration);
            break;

        case 1:
            return this.breathExhale(duration);
            break;
    }
}

PersonSleep.prototype.breathInhale = function(duration) {
    return TweenMax.to(this.breathSprite.scale, duration, { x: 3, y: 3, z: 3, ease: Power1.easeInOut });
}

PersonSleep.prototype.breathExhale = function(duration) {
    return TweenMax.to(this.breathSprite.scale, duration, { x: .05, y: .05, z: .05, ease: Power1.easeInOut });
}