const camera = {
    // Position in 3D space (x, y, z coordinates)
    position: vec3.fromValues(8, 8, 8),
    
    // The point the camera is looking at (always the origin in our case)
    target: vec3.fromValues(0, 0, 0),
    
    // Which direction is "up" for the camera (Z-axis in our coordinate system)
    up: vec3.fromValues(0, 0, 1),
    
    // Field of view angle in degrees (like zooming in/out on a camera lens)
    fov: 60,
    
    // Distance from origin when using preset positions
    distance: 8,
    
    // Rotation angle for animated camera movement
    rotationAngle: 0,
    
    // Height offset for spiral animation
    heightOffset: 0,
    
    // Near and far clipping planes
    // Objects closer than 'near' or farther than 'far' won't be rendered
    near: 0.001,
    far: 8000
};

// Mouse control state
// These variables track the mouse interaction with the camera
const mouseControl = {
    isActive: false,
    lastX: null,
    lastY: null,
    sensitivity: {
        rotation: 0.01,  // How fast the camera rotates with mouse movement
        height: 0.1      // How fast the camera moves up/down
    }
};

/**
 * Updates the camera position based on preset configurations
 * These presets follow the naming convention from the assignment:
 * Left/Right = X axis, Front/Back = Y axis, Top/Bottom = Z axis
 * @param {string} preset - The preset position code (e.g., 'lft' for Left-Front-Top)
 */
function setCameraPreset(preset) {
    const d = camera.distance;
    
    // Map preset codes to actual positions
    // Think of this as different viewpoints around a cube
    const presets = {
        'lft': [-d, -d,  d],  // Left-Front-Top
        'lfb': [-d, -d, -d],  // Left-Front-Bottom
        'lbt': [-d,  d,  d],  // Left-Back-Top
        'lbb': [-d,  d, -d],  // Left-Back-Bottom
        'rft': [ d, -d,  d],  // Right-Front-Top
        'rfb': [ d, -d, -d],  // Right-Front-Bottom
        'rbt': [ d,  d,  d],  // Right-Back-Top
        'rbb': [ d,  d, -d]   // Right-Back-Bottom
    };
    
    if (presets[preset]) {
        vec3.set(camera.position, ...presets[preset]);
    }
}

/**
 * Updates camera position for spiral animation
 * This creates a cinematic rotating view around the scene
 * @param {number} deltaTime - Time elapsed since last frame
 */
function updateCameraAnimation(deltaTime) {
    // Increment rotation angle
    camera.rotationAngle += deltaTime * 0.02; // Rotation speed
    
    // Calculate new position on a circle
    const radius = camera.distance;
    camera.position[0] = radius * Math.cos(camera.rotationAngle);
    camera.position[1] = radius * Math.sin(camera.rotationAngle);
    
    // Add vertical oscillation for spiral effect
    camera.heightOffset += deltaTime * 0.01;
    camera.position[2] = camera.distance + 2 * Math.sin(camera.heightOffset);
}

/**
 * Creates the view matrix for the current camera configuration
 * The view matrix transforms world coordinates to camera coordinates
 * @returns {mat4} The view matrix
 */
function getViewMatrix() {
    const viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, camera.position, camera.target, camera.up);
    return viewMatrix;
}

/**
 * Creates the projection matrix based on camera settings
 * This matrix creates the perspective effect (things farther away appear smaller)
 * @param {number} aspectRatio - The width/height ratio of the viewport
 * @returns {mat4} The projection matrix
 */
function getProjectionMatrix(aspectRatio) {
    const projMatrix = mat4.create();
    
    // Convert field of view to radians
    const fovRad = camera.fov * Math.PI / 180;
    
    // Calculate far plane based on camera distance
    // This ensures we can always see the entire scene
    const dynamicFar = camera.distance * 10;
    
    mat4.perspective(projMatrix, fovRad, aspectRatio, camera.near, dynamicFar);
    return projMatrix;
}

/**
 * Handles mouse down events for camera control
 * @param {MouseEvent} event - The mouse event
 */
function handleCameraMouseDown(event) {
    mouseControl.isActive = true;
    mouseControl.lastX = event.clientX;
    mouseControl.lastY = event.clientY;
}

/**
 * Handles mouse up events
 * @param {MouseEvent} event - The mouse event
 */
function handleCameraMouseUp(event) {
    mouseControl.isActive = false;
}

/**
 * Handles mouse move events for camera rotation
 * This allows the user to orbit the camera around the scene
 * @param {MouseEvent} event - The mouse event
 */
function handleCameraMouseMove(event) {
    if (!mouseControl.isActive) return;
    
    // Calculate mouse movement delta
    const deltaX = event.clientX - mouseControl.lastX;
    const deltaY = event.clientY - mouseControl.lastY;
    
    // Update camera rotation based on horizontal mouse movement
    camera.rotationAngle += deltaX * mouseControl.sensitivity.rotation;
    
    // Update camera height based on vertical mouse movement
    const newHeight = camera.position[2] + deltaY * mouseControl.sensitivity.height;
    
    // Clamp height to reasonable bounds
    // This prevents the camera from going underground or too high
    camera.position[2] = clamp(newHeight, 1, 20);
    
    // Recalculate camera position on the circle
    const radius = camera.distance;
    camera.position[0] = radius * Math.cos(camera.rotationAngle);
    camera.position[1] = radius * Math.sin(camera.rotationAngle);
    
    // Update last mouse position
    mouseControl.lastX = event.clientX;
    mouseControl.lastY = event.clientY;
}

/**
 * Updates camera settings from UI controls
 * This is called when the user changes values in the control panel
 */
function updateCameraFromUI() {
    // Get field of view from input
    const fovInput = document.getElementById('viewAngle');
    if (fovInput) {
        const newFov = parseFloat(fovInput.value);
        if (!isNaN(newFov) && newFov > 0 && newFov < 180) {
            camera.fov = newFov;
        }
    }
    
    // Get camera distance from input
    const distInput = document.getElementById('camOrthoDistance');
    if (distInput) {
        const newDist = parseFloat(distInput.value);
        if (!isNaN(newDist) && newDist > 0) {
            camera.distance = newDist;
            
            // Update camera position to maintain current angle
            const radius = camera.distance;
            camera.position[0] = radius * Math.cos(camera.rotationAngle);
            camera.position[1] = radius * Math.sin(camera.rotationAngle);
            camera.position[2] = camera.distance; // Reset height to match distance
        }
    }
    
    // Get selected preset position
    const selectedPreset = document.querySelector('input[name="camPos"]:checked');
    if (selectedPreset) {
        setCameraPreset(selectedPreset.value);
    }
}

/**
 * Resets camera to default position
 * Useful for recovering from disorienting camera positions
 */
function resetCamera() {
    camera.position = vec3.fromValues(8, 8, 8);
    camera.rotationAngle = 0;
    camera.heightOffset = 0;
    camera.fov = 60;
    camera.distance = 8;
}