let gl = null;
let mvMatrix = mat4.create();
let pMatrix = mat4.create();

// Performance monitoring
const performance = {
    frameCount: 0,
    lastFpsUpdate: 0,
    fps: 0
};

/**
 * Main initialization function
 * This is where our application begins its journey
 */
function init() {
    console.log('Initializing WebGL Robot Scene...');
    
    try {
        // Get the canvas element
        const canvas = document.getElementById('webgl-canvas');
        if (!canvas) {
            throw new Error('Canvas element not found');
        }
        
        // Create WebGL context
        gl = createWebGLContext(canvas);
        
        // Set up WebGL state
        initWebGL();
        
        // Initialize all subsystems
        initShaders(gl);
        initAllGeometry(gl);
        initTextures(gl, {
            // Paths to texture images - update these with your actual file paths
            metal: 'textures/metal.jpg',
            head: 'textures/head.jpg',
            floor: 'textures/floor.jpg',
            skybox: 'textures/skybox.jpg'
        });
        initControls();
        
        // Set initial camera position
        updateCameraFromUI();
        
        // Handle context loss (GPU reset, etc.)
        canvas.addEventListener('webglcontextlost', handleContextLost, false);
        canvas.addEventListener('webglcontextrestored', function() {
            handleContextRestored(gl, init);
        }, false);
        
        console.log('Initialization complete!');
        
        // Start the render loop
        requestAnimationFrame(render);
        
    } catch (error) {
        console.error('Failed to initialize WebGL:', error);
        showErrorMessage(error.message);
    }
}

/**
 * Initializes WebGL settings
 * These settings determine how our 3D scene is rendered
 */
function initWebGL() {
    // Set the clear color (dark gray background)
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    
    // Enable depth testing
    // This ensures that closer objects appear in front of farther objects
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    
    // Enable back-face culling for performance
    // This skips drawing faces that face away from the camera
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    
    // Set the viewport to match canvas size
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    
    console.log(`WebGL initialized: ${gl.viewportWidth}x${gl.viewportHeight}`);
}

/**
 * Main render loop
 * This function is called ~60 times per second to draw each frame
 * @param {number} currentTime - Current timestamp in milliseconds
 */
function render(currentTime) {
    // Schedule next frame
    requestAnimationFrame(render);
    
    // Update animations
    updateAnimation(currentTime);
    
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Set up projection matrix (camera lens)
    const aspectRatio = gl.viewportWidth / gl.viewportHeight;
    pMatrix = getProjectionMatrix(aspectRatio);
    
    // Set up view matrix (camera position and orientation)
    mvMatrix = getViewMatrix();
    
    // Draw the scene
    drawScene();
    
    // Update performance counter
    updatePerformanceStats(currentTime);
}

/**
 * Draws the complete 3D scene
 * This is where all our objects come together to create the final image
 */
function drawScene() {
    // Draw skybox first (with depth writing disabled)
    // This ensures the skybox appears behind everything else
    gl.depthMask(false);
    drawSkybox(gl, mvMatrix, pMatrix);
    gl.depthMask(true);
    
    // Draw floor
    drawFloor(gl, mvMatrix, pMatrix);
    
    // Draw robot
    drawRobot(gl, mvMatrix, pMatrix);
}

/**
 * Draws the skybox
 * The skybox is a large cube that surrounds the entire scene
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {mat4} mvMatrix - Model-view matrix
 * @param {mat4} pMatrix - Projection matrix
 */
function drawSkybox(gl, mvMatrix, pMatrix) {
    // Bind skybox geometry
    gl.bindBuffer(gl.ARRAY_BUFFER, geometryBuffers.skybox.vertex);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                          geometryBuffers.skybox.vertex.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, geometryBuffers.skybox.textureCoord);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, 
                          geometryBuffers.skybox.textureCoord.itemSize, gl.FLOAT, false, 0, 0);
    
    // Use skybox texture
    gl.uniform1i(shaderProgram.useTextureUniform, true);
    bindTexture(gl, textures.skybox);
    
    // Draw
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometryBuffers.skybox.index);
    setMatrixUniforms(gl, mvMatrix, pMatrix);
    gl.drawElements(gl.TRIANGLES, geometryBuffers.skybox.index.numItems, gl.UNSIGNED_SHORT, 0);
}

/**
 * Draws the floor
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {mat4} mvMatrix - Model-view matrix
 * @param {mat4} pMatrix - Projection matrix
 */
function drawFloor(gl, mvMatrix, pMatrix) {
    // Bind floor geometry
    gl.bindBuffer(gl.ARRAY_BUFFER, geometryBuffers.floor.vertex);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                          geometryBuffers.floor.vertex.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, geometryBuffers.floor.textureCoord);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, 
                          geometryBuffers.floor.textureCoord.itemSize, gl.FLOAT, false, 0, 0);
    
    // Use floor texture
    gl.uniform1i(shaderProgram.useTextureUniform, true);
    bindTexture(gl, textures.floor);
    
    // Draw
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometryBuffers.floor.index);
    setMatrixUniforms(gl, mvMatrix, pMatrix);
    gl.drawElements(gl.TRIANGLES, geometryBuffers.floor.index.numItems, gl.UNSIGNED_SHORT, 0);
}

/**
 * Updates performance statistics
 * This helps us monitor if our application is running smoothly
 * @param {number} currentTime - Current timestamp
 */
function updatePerformanceStats(currentTime) {
    performance.frameCount++;
    
    // Update FPS every second
    if (currentTime - performance.lastFpsUpdate >= 1000) {
        performance.fps = performance.frameCount;
        performance.frameCount = 0;
        performance.lastFpsUpdate = currentTime;
        
        // Uncomment to show FPS in console
        // console.log(`FPS: ${performance.fps}`);
    }
}

/**
 * Shows an error message to the user
 * @param {string} message - The error message to display
 */
function showErrorMessage(message) {
    // Create error overlay
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #ff5555;
        color: white;
        padding: 20px;
        border-radius: 10px;
        font-family: Arial, sans-serif;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        max-width: 400px;
        text-align: center;
    `;
    
    errorDiv.innerHTML = `
        <h3 style="margin-top: 0;">WebGL Error</h3>
        <p>${message}</p>
        <p>Please ensure you're using a WebGL-compatible browser (Firefox recommended).</p>
    `;
    
    document.body.appendChild(errorDiv);
}

/**
 * Window resize handler
 * Ensures our scene adapts to window size changes
 */
function handleResize() {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas || !gl) return;
    
    // Update canvas size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Update WebGL viewport
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    console.log(`Viewport resized to: ${canvas.width}x${canvas.height}`);
}

// Set up event listeners
window.addEventListener('load', init);
window.addEventListener('resize', handleResize);

// Development/Debug utilities
// These can be accessed from the browser console for testing
window.debugWebGL = {
    // Get current FPS
    getFPS: () => performance.fps,
    
    // Get robot state
    getRobotState: () => robotState,
    
    // Get camera info
    getCameraInfo: () => ({
        position: camera.position,
        fov: camera.fov,
        distance: camera.distance
    }),
    
    // Force redraw
    forceRedraw: () => render(performance.now()),
    
    // Toggle wireframe mode (useful for debugging geometry)
    toggleWireframe: (() => {
        let wireframe = false;
        return () => {
            wireframe = !wireframe;
            // Note: Wireframe mode would need to be implemented in the drawing functions
            console.log(`Wireframe mode: ${wireframe ? 'ON' : 'OFF'}`);
        };
    })()
};

console.log('WebGL Robot Scene - Ready to initialize');
console.log('Debug utilities available via window.debugWebGL');