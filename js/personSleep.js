
// THE SIT PERSON OBJECT
function PersonSleep( _pos, _color, _id, _name ) {

	var scope = this;

	this.color = _color;
	this.whoIam = _id;
	this.ahhRotation;
	this.nname = _name;

	this.lookAt = -1;

	// for interpolation
	this.realPosition = new THREE.Vector3();
	this.realRotation = new THREE.Quaternion();
	this.realBillboardRotation = new THREE.Quaternion();
	this.yaxisInQ = new THREE.Quaternion(0,Math.PI/2,0,0);

	// construct physical existence
	this.player = new THREE.Object3D();
	//this.pMat = new THREE.MeshLambertMaterial( { map: personTex, color: this.color, side: THREE.DoubleSide } );
	this.pMat = new THREE.MeshLambertMaterial( { map: sleeperTexture, color: this.color, side: THREE.DoubleSide } );
	this.pSkinnedMat = new THREE.MeshLambertMaterial( { skinning: true, map: sleeperTexture, color: this.color, side: THREE.DoubleSide } );

	// 1-body
	//this.playerBody = new THREE.Mesh( personBody, this.pMat);
	this.playerBody = new THREE.Mesh( sleeperGeo, this.pSkinnedMat);
	this.playerBody.name = _id + " body";

	// if it's ME, create inner stuff
	if( this.whoIam == whoIamInLife ){
		// 1-0: stomach
		this.poopMini = new THREE.Mesh( stomach, new THREE.MeshBasicMaterial({map: stomachTex,  morphTargets: true}) );		
		this.poopMini.morphTargetInfluences[0] = 0.5;
		this.poopMini.name = "miniPoop";
		this.poopMini.scale.set(0.1,0.1,0.1);
		this.poopMini.rotation.y += Math.PI;
		this.poopMini.rotation.x += Math.PI/2;
		this.poopMini.position.set( 0, -1.06, -0.04);
		this.playerBody.add( this.poopMini );

		// 1-1: message_name!
		scope.wordTexture = new THREEx.DynamicTexture(1024,128);	//512,512; 1000,128
		scope.wordTexture.context.font = "bolder 70px StupidFont";
		// scope.wordTexture.clear('#dc5e64').drawText("You got a poop heart from --- <3", undefined, 96, 'white');
		scope.wordTexture.clear();
		scope.wordMaterial = new THREE.MeshBasicMaterial({map: this.wordTexture.texture, side: THREE.DoubleSide, transparent: true});
		scope.wordBubble = new THREE.Mesh(new THREE.PlaneGeometry( this.wordTexture.canvas.width, this.wordTexture.canvas.height), this.wordMaterial);
		scope.wordBubble.scale.set(0.002,0.002,0.002);
		scope.wordBubble.position.z = 2;
		scope.wordBubble.position.y = -0.2;
		scope.wordBubble.rotation.y = Math.PI;
		scope.wordBubble.name = "wordBubble";
		scope.playerBody.add( scope.wordBubble );
	}
	// else {
	// 	// attach toilet to body
	// 	this.playerToilet = new THREE.Mesh( personToilet, toiletMat );
	// 	this.playerToilet.name = _id + " toilet";
	// 	this.playerBody.add( this.playerToilet );
	// }

	// 1-2: message_name!
	this.nameTexture = new THREEx.DynamicTexture(512,128);	//512,512
	this.nameTexture.context.font = "bolder 100px StupidFont";
	this.nameTexture.clear('cyan').drawText(this.nname, undefined, 96, 'red');
	this.nameMaterial = new THREE.MeshBasicMaterial({map: this.nameTexture.texture, side: THREE.DoubleSide});
	this.nameMaterial.transparent = true;
	this.nameBubble = new THREE.Mesh(new THREE.PlaneGeometry( this.nameTexture.canvas.width, this.nameTexture.canvas.height), this.nameMaterial);
	this.nameBubble.scale.set(0.005,0.005,0.005);
	this.nameBubble.position.z = -0.4;
	this.nameBubble.position.y = 2;
	this.nameBubble.name = "nameBubble";
	this.playerBody.add( this.nameBubble );

	// 1-3: highChair! (Eat version)
		// this.highChair = highChair.clone();
		// this.highChair.position.set(0, -3.17, 0);
		// this.playerBody.add( this.highChair );

		// this.miniMe = new THREE.Mesh( chewers[ _id%4 ], this.pMorphMiniMat );
		// this.miniMe.scale.multiplyScalar(0.3);
		// this.miniMe.position.set(0,-0.5,1.2);
		// this.miniMe.rotation.y = Math.PI;
		// this.miniMe.visible = false;
		// this.playerBody.add( this.miniMe );

	// 1-3: eye
	this.eye = eyeGaze.clone();
	this.eye.name = "eye";
	this.eye.rotation.x = 45*Math.PI/180;
	this.eye.position.set(0,-0.5,2.4);
	this.eye.scale.multiplyScalar(0.01);
	this.eye.visible = false;
	this.playerBody.add( this.eye );

	this.playerBody.position.y -= 0.6;
	this.playerBodyParent = new THREE.Mesh(new THREE.BoxGeometry(3,2,4), new THREE.MeshBasicMaterial({visible: false}));
	this.playerBodyParent.name = _id + " parentBody";
	this.playerBodyParent.add( this.playerBody );
	this.player.add( this.playerBodyParent );

	// 2-head
	//if it's ME, create empty head
	if( this.whoIam == whoIamInLife ){
		this.playerHead = new THREE.Object3D();

		var headMesh = planet.clone();
		//headMesh.position.y -= 0.6;
		this.playerHead.add(headMesh);

		this.playerHead.name = _id + " head";
	} else {
		//this.playerHead = new THREE.Mesh( personHead, this.pMat );
		this.playerHead = new THREE.Object3D();

		var headMesh = new THREE.Mesh( chewerA, this.pMat );
		//headMesh.position.y -= 0.6;
		this.playerHead.add(headMesh);

		this.playerHead.name = _id + " head";
		// this.playerHead.position.z = -2;
		// this.playerHead.rotation.y = Math.PI;

		// 	// create poop hat
		// 	var pHat = poopHat.clone();
		// 	pHat.rotation.y += Math.PI;
		// 	pHat.position.y += 0.3;
		// 	this.playerHead.add( pHat );
	}
	this.playerHead.position.y -= 0.6;
	this.player.add( this.playerHead );

	// this.player.scale.multiplyScalar(2);
	this.player.position.copy( _pos );

	if( this.whoIam == whoIamInLife ){
		scene.add( this.player );
	} else {
		dailyLifePlayerObject.add( this.player );
	}
}

PersonSleep.prototype.update = function( _playerLocX, _playerLocY, _playerLocZ, _playerRotY, _playerQ ) {

	this.player.position.set(_playerLocX, _playerLocY, _playerLocZ);

	// head
	if(this.player.children[1]) {
		this.player.children[1].quaternion.copy(_playerQ);
	}
	
	// body
	var newQ = _playerQ.clone();
	newQ._x = 0;
	// newQ._y = 0;
	newQ._z = 0;	
	newQ.normalize();

	//this.ahhRotation = new THREE.Euler().setFromQuaternion( newQ, 'YXZ');
	//this.ahhRotation = new THREE.Euler().setFromQuaternion( newQ );

	if(this.player.children[0]){
		this.player.children[0].quaternion.copy(newQ);
		// this.player.children[0].rotation.copy(this.ahhRotation);
	}
	// if(this.player.children[2]){
	// 	this.player.children[2].rotation.y = this.ahhRotation.y;
	// }
}

PersonSleep.prototype.updateReal = function( _playerLocX, _playerLocY, _playerLocZ, _playerQ ) {

	this.realPosition.set(_playerLocX, _playerLocY, _playerLocZ);
	this.realRotation.copy(_playerQ);
	var newQ = _playerQ.clone();
	newQ._x = 0;
	newQ._z = 0;
	newQ.normalize();
	this.realBillboardRotation.copy(newQ);
}

PersonSleep.prototype.transUpdate = function() {
	this.player.position.lerp(this.realPosition, 0.1);
	
	// head
	if(this.player.children[1]) {
		this.player.children[1].quaternion.slerp( this.realRotation, 0.2 );
	}
	
	// body
	if(this.player.children[0]){
		this.player.children[0].quaternion.slerp( this.realBillboardRotation, 0.2 );
	}
}

PersonSleep.prototype.openEye = function() {
	this.eye.visible = true;
	TweenMax.to( this.eye.scale, 1,
		{ x: 1, y: 1, z: 1, ease: Back.easeOut.config(2) } );
}

PersonSleep.prototype.closeEye = function() {
	TweenMax.to( this.eye.scale, 0.7,
		{ x: 0.01, y: 0.01, z: 0.01, ease: Back.easeIn.config(2), onComplete:()=>{
			this.eye.visible = false;
		} } );
}