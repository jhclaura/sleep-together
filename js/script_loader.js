function loadModelPlayer( _body, _left_arm, _right_arm, _head ){
	var loader = new THREE.JSONLoader();

	// BODY
	loader.load( _body, function( geometry ){
		guyBodyGeo = geometry.clone();
	});

	// LEFT_ARM
	loader.load( _left_arm, function( geometry2 ){
		var tmpLA = geometry2.clone();
		transY(tmpLA, -0.2);
		transZ(tmpLA, -0.1);
		guyLAGeo = tmpLA;
	});

	// RIGHT_ARM
	loader.load( _right_arm, function(geometry3){
		var tmpRA = geometry3.clone();
		transY(tmpRA, -0.2);
		transZ(tmpRA, -0.1);
		guyRAGeo = tmpRA;
	});

	// HEAD
	loader.load( _head, function(geometry4){
		geometry4.center();
		guyHeadGeo = geometry4.clone();

		// loadingCount();
		loadingCountText("head");
	});
}

function loadSitModelPlayer( _head, _body, _toilet ){
	var sp_loader = new THREE.JSONLoader( br_mat_loadingManager );

	// BODY
	sp_loader.load( _body, function( geometry ){
		personBody = geometry.clone();
	});

	// HEAD
	sp_loader.load( _head, function( geometry2 ){
		geometry2.center();
		personHead = geometry2.clone();
	});

	// TOILET
	sp_loader.load( _toilet, function( geometry3 ){
		personToilet = geometry3.clone();

		// loadModelBathroomsV2( "models/bathroom/b_door.js",
		// 					  "models/bathroom/b_sides.js",
		// 					  "models/bathroom/b_floor.js",
		// 					  "models/bathroom/b_smallStuff.js",
		// 					  "models/bathroom/b_smallWhite.js",
		// 					  "models/bathroom/paper_bottom.js",
		// 					  "models/bathroom/paper_top.js",
		// 					  "models/bathroom2.js",
		// 					  "models/poster.js" );
	});
}

// need to clone toilet_paper and person_toilet
function loadModelBathroomsV2( _door, _side, _floor, _s, s_white, p_b, p_t, _t, _pst ){
	var loader = new THREE.JSONLoader();
	bathroom = new THREE.Object3D();
	bathroom_stuff = new THREE.Object3D();

	var br;
	var whiteMat = new THREE.MeshLambertMaterial({color: 0xcccccc});

	// loader.load( s_white, function( geometry1 ){
	// 	br = new THREE.Mesh(geometry1, whiteMat);
	// 	bathroom_stuff.add(br);

		// back panel
		br = new THREE.Mesh(new THREE.PlaneGeometry(14,10,1,1), whiteMat);
		br.rotation.y = Math.PI;
		br.position.z += 3.3;
		bathroom_stuff.add(br);

		loader.load( _door, function( geometry2 ){
			br = new THREE.Mesh(geometry2, new THREE.MeshLambertMaterial({map: doorTex}));
			// br = new THREE.Mesh(geometry2, bathroomMat);
			bathroom_stuff.add(br);

			loader.load( _side, function( geometry4 ){
				br = new THREE.Mesh(geometry4, new THREE.MeshLambertMaterial({map: graffitiTex}));	//0xfffac4
				// br = new THREE.Mesh(geometry4, bathroomMat);
				bathroom_stuff.add(br);

				loader.load( _floor, function( geometry5 ){
					br = new THREE.Mesh(geometry5, new THREE.MeshLambertMaterial({map: floorTex}));	//0xfffac4
					// br = new THREE.Mesh(geometry4, bathroomMat);
					bathroom_stuff.add(br);

					// small stuff
					loader.load( _s, function( geometry3 ){
						br = new THREE.Mesh(geometry3, new THREE.MeshLambertMaterial({color: 0xffea00}));
						// br = new THREE.Mesh(geometry3, bathroomMat);
						bathroom_stuff.add(br);

						var tp = toilet_paper.clone();
						tp.scale.set(0.5,0.5,0.5);
						tp.rotation.y = -Math.PI/2;
						//3.3,-1,0
						var tp2 = tp.clone();
						tp.position.set(3.1,-1.5,-3.5);
						//3.3,-1,1.5
						tp2.position.set(3.1,-1.5,-2);
						bathroom_stuff.add(tp);
						bathroom_stuff.add(tp2);

						var fakeT = new THREE.Mesh( personToilet, toiletMat );
						fakeT.scale.set(3,3,3);
						fakeT.rotation.y = Math.PI;
						var ft = fakeT.clone();
						ft.position.set(6.5,0,0);
						bathroom_stuff.add(ft);
						ft = fakeT.clone();
						ft.position.set(-6.5,0,0);
						bathroom_stuff.add(ft);

						// intestine
						loader.load( _t, function( geometry4 ){

							// geometry4.faceVertexUvs[ 1 ] = geometry4.faceVertexUvs[ 0 ];

							br = new THREE.Mesh(geometry4, intestineMat);

							bathroom_stuff.add(br);

							bathroom.add(bathroom_stuff);
							bathroom.scale.set(1.5,1.5,1.5);

							// LIGHT!
								bathroomLight = new THREE.Object3D();

								geo = new THREE.TetrahedronGeometry(1.5);
								mat = new THREE.MeshLambertMaterial({color: 0xfffac4});
								var meshTemp = new THREE.Mesh( geo, mat );
								meshTemp.rotation.x = -35 * Math.PI/180;
								meshTemp.rotation.z = 30 * Math.PI/180;
								meshTemp.position.y = -29.;
								bathroomLight.add(meshTemp);

								geo = new THREE.BoxGeometry(0.2,30,0.2);
								transY(geo, -14);	// -14.5
								meshTemp = new THREE.Mesh(geo, mat);
								bathroomLight.add(meshTemp);

								light = new THREE.PointLight(0xffff00, 1, 50);
								textureLoader = new THREE.TextureLoader();
								glowTexture = textureLoader.load( "images/glow_edit.png" );
								mat = new THREE.SpriteMaterial({map: glowTexture, color: 0xffef3b, transparent: false, blending: THREE.AdditiveBlending});
								meshTemp = new THREE.Sprite(mat);
								meshTemp.scale.set(2,2,2);	//big
								light.add(meshTemp);
								light.position.y = -30;
								bathroomLight.add(light);

								bathroomLight.position.set(0,35,-5);

								bathroom.add(bathroomLight);

							loader.load( _pst, function( geometry6 ){
								var poster = new THREE.Mesh( geometry6, posterMat );
								bathroom.add(poster);

								scene.add(bathroom);

								// loadingCount();
								loadingCountText("bathroomsss");
							});
						});
					});
				});
			});
		});	
	// });
}

function loadModelPoop( _poop ){
	var loader = new THREE.JSONLoader();
	var poopStickGeo = new THREE.BoxGeometry(0.1,1,0.1);
	transY(poopStickGeo, 0.5);
	var poopStick = new THREE.Mesh( poopStickGeo, new THREE.MeshBasicMaterial({color: 0x000000}) );
	
	// BODY
	loader.load( _poop, function( geometry ){
		poopGeo = geometry.clone();
		// poopGeo.computeBoundingBox();
		poopGeo.computeBoundingSphere();

		poop = new THREE.Mesh(poopGeo, poopMat);
		poopHat = poop.clone();
		// poop.rotation.y += Math.PI;
		// poop.position.y += 0.3;

		var ps_RA = poopStick.clone();
		ps_RA.name = "right arm";
		ps_RA.position.set(0.6,0.3,0);
		ps_RA.rotation.z += Math.PI;
		poop.add(ps_RA);

		var ps_LA = poopStick.clone();
		ps_LA.name = "left arm";
		ps_LA.position.set(-0.6,0.3,0);
		poop.add(ps_LA);

		var ps_RL = poopStick.clone();
		ps_RL.position.set(0.3,-1,0);
		poop.add(ps_RL);

		var ps_LL = poopStick.clone();
		ps_LL.position.set(-0.3,-1,0);
		poop.add(ps_LL);

		// createBox();
		// loadingCount();
		loadingCountText("poop");

		CreatePoopRing();
	});
}

function loadModelPoopMacaron( _poop ){
	var loader = new THREE.JSONLoader();
	
	loader.load( _poop, function( geometry ){
		poopMGeo = geometry.clone();
		poopMGeo.computeBoundingSphere();

		poopM = new THREE.Mesh(poopMGeo, poopMMat);

		// loadingCount();
		loadingCountText("poop macaron");
	});
}

function loadModelPoopHeart( _poopH ){
	var loader = new THREE.JSONLoader();
	
	loader.load( _poopH, function( geometry ){
		poopHeartGeo = geometry.clone();
		poopHeartGeo.computeBoundingSphere();

		poopHeart = new THREE.Mesh(poopHeartGeo, poopHeartMat);

		// loadingCount();
		loadingCountText("poop heart");
	});
}

function LoadStarTexture() {
	// var textureLoader = new THREE.TextureLoader( starLoadingManager );
	var textureLoader = new THREE.TextureLoader( loadingManger );
	
	for(var i=0; i<starFiles.length; i++){
		textureLoader.load( starFiles[i], function(texture){
			glowTexture = texture;
			glowTextures.push(glowTexture);
			starAnimator = new TextureAnimator( glowTexture, 4, 1, 8, 60, [0,1,2,3,2,1,3,2] );
			starAnimators.push(starAnimator);

			// if(index==3)
			// 	CreateStars();
		} );
	}	
}

function CreateStars() {
	for(var i=0; i<50; i++){
		mat = new THREE.SpriteMaterial({map: glowTextures[i%4], color: 0xffef3b, transparent: false, blending: THREE.AdditiveBlending});
		var st = new THREE.Sprite(mat);
		st.position.set( Math.random()*(myStartX+400)-(myStartX+200), Math.random()*-100+400, Math.random()*(myStartZ+400)-(myStartZ+200) );
		st.rotation.y = Math.random()*Math.PI;
		st.scale.set(7,7,7);
		scene.add(st);
		stars.push(st);
	}
}

function LoadTexBathroom( intestine, poster ) {

	function graffiti_TLM (txt){
		txt.wrapS = txt.wrapT = THREE.RepeatWrapping;
		txt.repeat.set( 4, 4 );
	};
	var textureLoader = new THREE.TextureLoader( br_mat_loadingManager );
	graffitiTex = textureLoader.load('images/graffitiS.png', graffiti_TLM);
	floorTex = textureLoader.load('images/floor.jpg', graffiti_TLM);
	doorTex = textureLoader.load('images/door.png');

	// var texLoader = new THREE.TextureLoader( br_mat_loadingManager );
	textureLoader.load(intestine, function(texture){
		intestineTex = texture;
		intestineAnimator = new TextureAnimator( intestineTex, 3, 1, 4, 60, [0,1,2,1] );
		intestineMat = new THREE.MeshBasicMaterial({map: intestineTex});
		bigToiletAniMat = new THREE.MeshBasicMaterial({ map: intestineTex, transparent: true, opacity: 0.0, side: THREE.DoubleSide });

		// need intestineAniMat
		loadModelToiletTube();
	});

	// var texLoader2 = new THREE.TextureLoader( br_mat_loadingManager );
	textureLoader.load(poster, function(texture2){
		posterTex = texture2;
		posterMat = new THREE.MeshLambertMaterial({map: posterTex});
	});
}

function LoadTexModelWave( tex, model ){
	var textureLoader = new THREE.TextureLoader( loadingManger );
	textureLoader.load(tex, function(texture){
		waterwaveTex = texture;
		
		var loader = new THREE.JSONLoader( loadingManger );
		loader.load( model, function( geometry ) {
			var waterPos = 	new THREE.Vector3(0,-7,3);
			waterPos.add( toiletCenters[0] );

			waterwave = new AniObject( 0.3, waterKeyframeSet, waterAniOffsetSet, geometry,
									   new THREE.MeshBasicMaterial({ map: waterwaveTex, morphTargets: true, transparent: true, opacity: 0.5, side: THREE.DoubleSide }),
									   new THREE.Vector3(0,-12,3), 1.7 );

			// loadingCount();
			loadingCountText("water wave");
		});
	});
}

function LoadTexModelPoopHeart( tex, model ){
	var textureLoader = new THREE.TextureLoader( loadingManger );
	textureLoader.load(tex, function(texture){
		poopHeartTex = texture;
		poopHeartMat = new THREE.MeshLambertMaterial({map: poopHeartTex});
		
		// MODEL_BODY
		var loader = new THREE.JSONLoader( loadingManger );
		loader.load( model, function( geometry ){
			poopHeartGeo = geometry.clone();
			// poopHeartGeo.computeBoundingSphere();

			poopHeart = new THREE.Mesh(poopHeartGeo, poopHeartMat);

			// then create person!

			// loadingCount();
			loadingCountText("poop heart");
		});
	});
}

function LoadTexModelPoop( tex, model ){
	
	var poopStickGeo = new THREE.BoxGeometry(0.1,1,0.1);
	transY(poopStickGeo, 0.5);
	var poopStick = new THREE.Mesh( poopStickGeo, new THREE.MeshBasicMaterial({color: 0x000000}) );

	// TEXTURE
	var textureLoader = new THREE.TextureLoader( loadingManger );
	textureLoader.load(tex, function(texture){
		poopTex = texture;
		poopMat = new THREE.MeshLambertMaterial({map: poopTex});
		
		// MODEL_BODY
		var loader = new THREE.JSONLoader( loadingManger );
		loader.load( model, function( geometry ){
			poopGeo = geometry.clone();
			poopGeo.computeBoundingBox();
			// poopGeo.computeBoundingSphere();

			poop = new THREE.Mesh(poopGeo, poopMat);
			poopHat = poop.clone();
			// poop.rotation.y += Math.PI;
			// poop.position.y += 0.3;

			var ps_RA = poopStick.clone();
			ps_RA.name = "right arm";
			ps_RA.position.set(0.6,0.3,0);
			ps_RA.rotation.z += Math.PI;
			poop.add(ps_RA);

			var ps_LA = poopStick.clone();
			ps_LA.name = "left arm";
			ps_LA.position.set(-0.6,0.3,0);
			poop.add(ps_LA);

			var ps_RL = poopStick.clone();
			ps_RL.position.set(0.3,-1,0);
			poop.add(ps_RL);

			var ps_LL = poopStick.clone();
			ps_LL.position.set(-0.3,-1,0);
			poop.add(ps_LL);

			// createBox();
			// loadingCount();
			loadingCountText("poop");

			CreatePoopRing();
		});
	});
}