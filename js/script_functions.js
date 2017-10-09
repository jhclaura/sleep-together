// GEOMETRY
function transX(geo, n){
	for(var i=0; i<geo.vertices.length; i++){
		geo.vertices[i].x += n;
	}
}

function transZ(geo, n){
	for(var i=0; i<geo.vertices.length; i++){
		geo.vertices[i].z += n;
	}
}

function transY(geo, n){
	for(var i=0; i<geo.vertices.length; i++){
		geo.vertices[i].y += n;
	}
}

function scaleGeo(geo, s){
	for(var i=0; i<geo.vertices.length; i++){
		var gg = geo.vertices[i];
		// console.log(gg);
		gg.multiplyScalar(s);
	}
	geo.__dirtyVertices = true;
}

// MATH
LauraMath = function(x) {
	this.x = x || 0;
}

LauraMath.prototype = {

	constructor: LauraMath,

	lerpValue: function (end, amount) {
		this.x += ((end - this.x) * amount);
		return this.x;
	}
}
	
function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}


/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 * source: http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomIntPN(min, max) {
	var value = Math.floor(Math.random() * (max - min + 1)) + min;
	if(Math.random()>0.5)
	    return value;
	else
		return value*-1;
}


// function built based on Stemkoski's
// http://stemkoski.github.io/Three.js/Texture-Animation.html
function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration, order) 
{	
	// note: texture passed by reference, will be updated by the update function.
		
	this.tilesHorizontal = tilesHoriz;
	this.tilesVertical = tilesVert;
	// how many images does this spritesheet contain?
	//  usually equals tilesHoriz * tilesVert, but not necessarily,
	//  if there at blank tiles at the bottom of the spritesheet. 
	this.numberOfTiles = numTiles;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
	texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );

	// how long should each image be displayed?
	this.tileDisplayDuration = tileDispDuration;

	// how long has the current image been displayed?
	this.currentDisplayTime = 0;

	// which image is currently being displayed?
	this.currentTile = 0;

	// order of the pic
	this.displayOrder = order;

		
	this.updateLaura = function( milliSec )
	{
		this.currentDisplayTime += milliSec;
		while (this.currentDisplayTime > this.tileDisplayDuration)
		{
			var currentColumn = this.displayOrder[ this.currentTile ] % this.tilesHorizontal;
			texture.offset.x = currentColumn / this.tilesHorizontal;
			var currentRow = Math.floor( this.displayOrder[ this.currentTile ] / this.tilesHorizontal );
			texture.offset.y = currentRow / this.tilesVertical;

			this.currentDisplayTime -= this.tileDisplayDuration;
			this.currentTile++;

			if (this.currentTile == this.numberOfTiles)
				this.currentTile = 0;

			// console.log(this.displayOrder[ this.currentTile ]);
		}
	};

	this.update = function( milliSec )
	{
		this.currentDisplayTime += milliSec;
		while (this.currentDisplayTime > this.tileDisplayDuration)
		{
			this.currentDisplayTime -= this.tileDisplayDuration;
			this.currentTile++;

			if (this.currentTile == this.numberOfTiles)
				this.currentTile = 0;


			var currentColumn = this.currentTile % this.tilesHorizontal;
			texture.offset.x = currentColumn / this.tilesHorizontal;
			var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
			texture.offset.y = currentRow / this.tilesVertical;

			console.log('currentTile: ' + this.currentTile + ', offset.x: ' + texture.offset.x);
		}
	};
}

// function adapted from Stemkoski
// http://stemkoski.github.io/Three.js/Texture-Animation.html
function TexturesAnimator(material, allTextures, numTiles, tileDispDuration, order) 
{	
	// note: texture passed by reference, will be updated by the update function.

	// array of textures
	this.textures = allTextures;

	// how many animation frames
	this.numberOfTiles = numTiles;

	// how long should each image be displayed?
	this.tileDisplayDuration = tileDispDuration;

	// how long has the current image been displayed?
	this.currentDisplayTime = 0;

	// which image is currently being displayed?
	this.currentTile = 0;

	// order of the pic
	this.displayOrder = order;

		
	this.updateLaura = function( milliSec )
	{
		this.currentDisplayTime += milliSec;
		while (this.currentDisplayTime > this.tileDisplayDuration)
		{
			// var currentColumn = this.displayOrder[ this.currentTile ] % this.tilesHorizontal;
			// texture.offset.x = currentColumn / this.tilesHorizontal;
			// var currentRow = Math.floor( this.displayOrder[ this.currentTile ] / this.tilesHorizontal );
			// texture.offset.y = currentRow / this.tilesVertical;

			material.map = this.textures[ this.displayOrder[ this.currentTile ] ];
			// texture.needsUpdate = true;

			this.currentDisplayTime -= this.tileDisplayDuration;
			this.currentTile++;

			if (this.currentTile == this.numberOfTiles)
				this.currentTile = 0;

			// console.log(this.displayOrder[ this.currentTile ]);
		}
	};
}

function GetGeoData()
{
	var request = new XMLHttpRequest();
	request.open('GET', 'http://freegeoip.net/json/', true);

	request.onload = function() {
	  if (request.status >= 200 && request.status < 400) {
	    // Success!
	    var data = JSON.parse(request.responseText);

		if(data.city!="") {
			sleeperOrigin = data.city;
		}
		else if(data.region_name!="") {
			sleeperOrigin = data.region_name;
		}
		else if(data.country_name!="") {
			sleeperOrigin = data.country_name;
		}
		console.log("Sleeper is from: " + sleeperOrigin);
		
	  } else {
	    // We reached our target server, but it returned an error
	  }
	};

	request.onerror = function() {
	  // There was a connection error of some sort
	};

	request.send();
}

function GetRidOfSec(str) {
  return str.slice(0,-6) + str.slice(-3);
}

// Canvas Wrap Text tutorial
function WrapText( context, text, x, y, maxWidth, lineHeight)
{
	var words = text.split(' ');
	var line = '';

	for(var i=0; i<words.length; i++)
	{
		var testLine = line + words[i] + ' ';
		var metrics = context.measureText(testLine);
		var testWidth = metrics.width;
		if(testWidth > maxWidth && i>0){
			context.fillText(line, x, y);
			line = words[i] + ' ';
			y += lineHeight;
		}
		else {
			line = testLine;
		}
	}
	context.fillText(line,x,y);
}

function GetRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function GetRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function GetRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

// on THREE.Object3D
function DoDispose(obj) {
	if(obj !== null){
		for(var i=0; i<obj.children.length; i++){
			DoDispose(obj.children[i]);
		}
		if(obj.geometry){
			obj.geometry.dispose();
			obj.geometry = undefined;
		}
		if(obj.material){
			if(obj.material.materials){
				for(i=0; i<obj.material.materials.length; i++){
					obj.material.materials[i].dispose();
				}
			}
			if(obj.material.map){
				obj.material.map.dispose();
				obj.material.map = undefined;
			}
			obj.material.dispose();
			obj.material = undefined;
		}
		if(obj.texture){
			obj.texture.dispose();
			obj.texture = undefined;
		}
	}
	obj = undefined;
}

// source: https://stackoverflow.com/questions/4383226/using-jquery-to-know-when-font-face-fonts-are-loaded
function waitForWebfonts(fonts, callback) {
    var loadedFonts = 0;
    for(var i = 0, l = fonts.length; i < l; ++i) {
        (function(font) {
            var node = document.createElement('span');
            // Characters that vary significantly among different fonts
            node.innerHTML = 'giItT1WQy@!-/#';
            // Visible - so we can measure it - but not on the screen
            node.style.position      = 'absolute';
            node.style.left          = '-10000px';
            node.style.top           = '-10000px';
            // Large font size makes even subtle changes obvious
            node.style.fontSize      = '300px';
            // Reset any font properties
            node.style.fontFamily    = 'sans-serif';
            node.style.fontVariant   = 'normal';
            node.style.fontStyle     = 'normal';
            node.style.fontWeight    = 'normal';
            node.style.letterSpacing = '0';
            document.body.appendChild(node);

            // Remember width with no applied web font
            var width = node.offsetWidth;

            node.style.fontFamily = font + ', sans-serif';

            var interval;
            function checkFont() {
                // Compare current width with original width
                if(node && node.offsetWidth != width) {
                    ++loadedFonts;
                    node.parentNode.removeChild(node);
                    node = null;
                }

                // If all fonts have been loaded
                if(loadedFonts >= fonts.length) {
                    if(interval) {
                        clearInterval(interval);
                    }
                    if(loadedFonts == fonts.length) {
                        callback();
                        return true;
                    }
                }
            };

            if(!checkFont()) {
                interval = setInterval(checkFont, 50);
            }
        })(fonts[i]);
    }
};