function loadModelSticks(_S1, _S2, _S3, _S4, _S5) {
    var loader = new THREE.JSONLoader(loadingManger);

    loader.load(_S1, function(geoA1) {
        nestStickGeos.push(geoA1);
    });

    loader.load(_S2, function(geoA2) {
        nestStickGeos.push(geoA2);
    });

    loader.load(_S3, function(geoA3) {
        nestStickGeos.push(geoA3);
    });

    loader.load(_S4, function(geoA4) {
        nestStickGeos.push(geoA4);
    });

    loader.load(_S5, function(geoA5) {
        nestStickGeos.push(geoA5);
    });
}