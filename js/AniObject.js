// THE ANI PERSON OBJECT
function AniObject( _speed, _keyframeSet, _aniOffsetSet, _geo, _mat, _pos, _scale ) {

	// animation parameters
	this.aniStep = 0, this.aniTime = 0, this.aniSpeed = _speed;
	this.aniOffset = _aniOffsetSet[0], this.keyduration = _keyframeSet[0];
	this.keyframe = 0, this.lastKeyframe = 0, this.currentKeyframe = 0;
	this.keyframeSet = _keyframeSet;
	this.aniOffsetSet = _aniOffsetSet;

	// construct physical existence
	this.body = new THREE.Mesh( _geo, _mat );
	this.body.scale.set( _scale, _scale, _scale );
	this.body.position.copy( _pos );
	scene.add( this.body );
}

AniObject.prototype.update = function( _newPosition ) {

	this.aniStep++;
	this.aniTime = this.aniStep * this.aniSpeed % (this.keyduration+1);
	this.keyframe = Math.floor( this.aniTime ) + this.aniOffset;

	if ( this.keyframe != this.currentKeyframe ) {
		this.body.morphTargetInfluences[ this.lastKeyframe ] = 0;
		this.body.morphTargetInfluences[ this.currentKeyframe ] = 1;
		this.body.morphTargetInfluences[ this.keyframe ] = 0;

		this.lastKeyframe = this.currentKeyframe;
		this.currentKeyframe = this.keyframe;
	}

	if(_newPosition != null){
		this.body.position.copy( _newPosition );
	}
}

AniObject.prototype.changeAni = function( aniIndex ){
	this.aniOffset = this.aniOffsetSet[ aniIndex ];
	this.keyframe = this.aniOffsetSet[ aniIndex ];
	this.currentKeyframe = this.keyframe;
	this.keyduration = this.keyframeSet[ aniIndex ];
	this.aniStep = 0;
}

// ----------------------------------------------------
// ANI PERSON
function AniPerson(_speed, _keyframeSet, _aniOffsetSet, _geo, _mat, _pos, _scale){
	AniObject.call(this, _speed, _keyframeSet, _aniOffsetSet, _geo, _mat, _pos, _scale);
}

AniPerson.prototype = Object.create(AniObject.prototype);
AniPerson.prototype.constructor = AniPerson;

AniPerson.prototype.switchAni = function(){

	// end of standUp, start to walk
	// if ( this.keyframe == (this.aniOffsetSet[6]+this.keyframeSet[6]-1) ) {
	// 	this.changeAni( 0 );
	// }

	// end of standUp, stand freeze
	if ( this.keyframe == (this.aniOffsetSet[6]+this.keyframeSet[6]-1) ) {
		this.changeAni( 7 );
	}

	// end of sit down, sit freeze
	if ( this.keyframe == (this.aniOffsetSet[1]+this.keyframeSet[1]-1) ) {
		this.changeAni( 2 );
	}
	// end of push, push freeze
	if ( this.keyframe == (this.aniOffsetSet[3]+this.keyframeSet[3]-1) ) {
		this.changeAni( 4 );
	}
	// end of release, sit freeze
	if ( this.keyframe == (this.aniOffsetSet[5]+this.keyframeSet[5]-1) ) {
		this.changeAni( 2 );
	}
}

// ANI PERSON - CHILDREN
function AniPersonBeAdded(_speed, _keyframeSet, _aniOffsetSet, _geo, _mat, _pos, _scale ){
	AniPerson.call(this, _speed, _keyframeSet, _aniOffsetSet, _geo, _mat, _pos, _scale);
}
AniPersonBeAdded.prototype = Object.create(AniPerson.prototype);
AniPersonBeAdded.prototype.constructor = AniPerson;

function AniPersonBeAdded( _speed, _keyframeSet, _aniOffsetSet, _geo, _mat, _pos, _scale ) {

	// animation parameters
	this.aniStep = 0, this.aniTime = 0, this.aniSpeed = _speed;
	this.aniOffset = _aniOffsetSet[0], this.keyduration = _keyframeSet[0];
	this.keyframe = 0, this.lastKeyframe = 0, this.currentKeyframe = 0;
	this.keyframeSet = _keyframeSet;
	this.aniOffsetSet = _aniOffsetSet;

	// construct physical existence
	this.body = new THREE.Mesh( _geo, _mat );
	this.body.scale.set( _scale, _scale, _scale );
	this.body.position.copy( _pos );

	// scene.add( this.body );
	return this;
}

// ----------------------------------------------------
// ANI OBJECT PHYSIJS
function AniObjectPhysijs(_speed, _keyframeSet, _aniOffsetSet, _geo, _mat, _pos, _scale){
	AniObject.call(this, _speed, _keyframeSet, _aniOffsetSet, _geo, _mat, _pos, _scale);
}
AniObjectPhysijs.prototype = Object.create(AniObject.prototype);
AniObjectPhysijs.prototype.constructor = AniObjectPhysijs;
function AniObjectPhysijs( _speed, _keyframeSet, _aniOffsetSet, _geo, _mat, _pos, _scale ) {

	// animation parameters
	this.aniStep = 0, this.aniTime = 0, this.aniSpeed = _speed;
	this.aniOffset = _aniOffsetSet[0], this.keyduration = _keyframeSet[0];
	this.keyframe = 0, this.lastKeyframe = 0, this.currentKeyframe = 0;
	this.keyframeSet = _keyframeSet;
	this.aniOffsetSet = _aniOffsetSet;

	// construct physical existence
	this.body = new Physijs.ConvexMesh( _geo, _mat, 0 );
	this.body.scale.set( _scale, _scale, _scale );
	this.body.position.copy( _pos );
	scene.add( this.body );
}
