
WebVRConfig = {
	// ROTATE_INSTRUCTIONS_DISABLED: true,
	MOUSE_KEYBOARD_CONTROLS_DISABLED: true, // Default: false.
	TOUCH_PANNER_DISABLED: true,
	
	BUFFER_SCALE: 0.5, // Default: 0.5.
	// PREVENT_DISTORTION: true,
	predistorted: true,
	// Allow VRDisplay.submitFrame to change gl bindings, which is more
	// efficient if the application code will re-bind its resources on the
	// next frame anyway.
	DIRTY_SUBMIT_FRAME_BINDINGS: true,
	DISABLE_ORI_CHANGE_AFTER_ONCE: false
};

// PointerLockControls
// http://www.html5rocks.com/en/tutorials/pointerlock/intro/
	var element = document.body;
	var blocker, instructions;

	var havePointerLock = 
				'pointerLockElement' in document || 
				'mozPointerLockElement' in document || 
				'webkitPointerLockElement' in document;

	if( !isMobile ) {
		if ( havePointerLock ) {
			blocker = document.getElementById('blocker');
			instructions = document.getElementById('instructions');
		
			var pointerlockchange = function ( event ) {

				if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
					// console.log("enable pointerControls");

					controls.enabled = true;
					// console.log("controls.enabled = true");
					blocker.style.display = 'none';

				} else {
					controls.enabled = false;
					// console.log("controls.enabled = false");
					blocker.style.display = '-webkit-box';
					blocker.style.display = '-moz-box';
					blocker.style.display = 'box';

					instructions.style.display = '';
				}
			}

			var pointerlockerror = function(event){
				instructions.style.display = '';
			}

			// Hook pointer lock state change events
			document.addEventListener( 'pointerlockchange', pointerlockchange, false );
			document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
			document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

			document.addEventListener( 'pointerlockerror', pointerlockerror, false );
			document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
			document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

			instructions.addEventListener( 'click', funToCall, false );
		} else {
				instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
		}
	}

	function funToCall(event){
		// console.log("click or touch!");
		instructions.style.display = 'none';

		// Ask the browser to lock the pointer
		element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

		controls.enabled = true;

		element.requestPointerLock();
	}