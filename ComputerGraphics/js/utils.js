const mvMatrixStack = [];

/**
 * Sets the model-view and projection matrix uniforms in the shader
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {mat4} mvMatrix - The model-view matrix
 * @param {mat4} pMatrix - The projection matrix
 */
function setMatrixUniforms(gl, mvMatrix, pMatrix) {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

/**
 * Pushes the current model-view matrix onto the stack
 * This saves the current transformation state
 * @param {mat4} mvMatrix - The current model-view matrix
 */
function mvPushMatrix(mvMatrix) {
    const copy = mat4.create();
    mat4.copy(copy, mvMatrix);
    mvMatrixStack.push(copy);
}

/**
 * Pops a matrix from the stack and returns it
 * This restores a previously saved transformation state
 * @returns {mat4} The popped matrix
 */
function mvPopMatrix() {
    if (mvMatrixStack.length === 0) {
        throw new Error("Invalid popMatrix - stack is empty!");
    }
    return mvMatrixStack.pop();
}

/**
 * Converts degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Clamps a value between min and max
 * @param {number} value - The value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} The clamped value
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Creates a WebGL context with error handling
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @returns {WebGLRenderingContext} The WebGL context
 */
function createWebGLContext(canvas) {
    const contextNames = ['webgl', 'experimental-webgl'];
    let gl = null;
    
    for (let i = 0; i < contextNames.length; i++) {
        try {
            gl = canvas.getContext(contextNames[i]);
            if (gl) break;
        } catch (e) {
            // Continue trying other context names
        }
    }
    
    if (!gl) {
        throw new Error('Unable to initialize WebGL. Your browser may not support it.');
    }
    
    // Store canvas dimensions on the context for easy access
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    
    return gl;
}

/**
 * Handles WebGL context loss
 * @param {Event} event - The context lost event
 */
function handleContextLost(event) {
    event.preventDefault();
    console.error('WebGL context lost. Trying to restore...');
}

/**
 * Handles WebGL context restoration
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {Function} initFunction - Function to reinitialize resources
 */
function handleContextRestored(gl, initFunction) {
    console.log('WebGL context restored. Reinitializing...');
    initFunction(gl);
}

/**
 * Logs WebGL errors for debugging
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {string} functionName - The name of the function that was called
 * @param {Array} args - The arguments passed to the function
 */
function logGLCall(functionName, args) {
    console.log(`gl.${functionName}(${args.map(arg => 
        typeof arg === 'string' ? `"${arg}"` : arg
    ).join(', ')})`);
}

/**
 * Creates a debug wrapper around WebGL context for development
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @returns {WebGLRenderingContext} The wrapped context
 */
function createDebugContext(gl) {
    // Only wrap in development mode
    if (typeof DEBUG === 'undefined' || !DEBUG) {
        return gl;
    }
    
    const wrapper = {};
    for (const prop in gl) {
        if (typeof gl[prop] === 'function') {
            wrapper[prop] = function() {
                const result = gl[prop].apply(gl, arguments);
                const error = gl.getError();
                if (error !== gl.NO_ERROR) {
                    throw new Error(`WebGL error ${error} in ${prop}`);
                }
                return result;
            };
        } else {
            wrapper[prop] = gl[prop];
        }
    }
    return wrapper;
}