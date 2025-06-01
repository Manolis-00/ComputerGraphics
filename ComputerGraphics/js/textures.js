const textures = {
    metal: null,
    head: null,
    floor: null,
    skybox: null
};

/**
 * Creates a simple solid color texture as a placeholder
 * This is useful for testing when actual texture files aren't available yet
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {Array} color - RGBA color values [0-255]
 * @returns {WebGLTexture} The created texture
 */
function createSolidColorTexture(gl, color) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    // Create a 1x1 pixel texture with the specified color
    const pixel = new Uint8Array(color);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    
    return texture;
}

/**
 * Loads a texture from an image file
 * This function handles the asynchronous loading process and sets up proper filtering
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {string} url - The URL of the image to load
 * @param {Function} callback - Optional callback when texture is loaded
 * @returns {WebGLTexture} The texture object (will be updated when image loads)
 */
function loadTexture(gl, url, callback) {
    const texture = gl.createTexture();
    const image = new Image();
    
    // Set up a temporary 1x1 blue pixel until the image loads
    // This prevents the object from being invisible while loading
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, 
                  gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
    
    // Define what happens when the image loads
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        // Upload the image to the GPU
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        
        // Check if the image dimensions are powers of 2
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Generate mipmaps for better quality at different distances
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        } else {
            // Non-power-of-2 textures can't use mipmaps or repeat wrapping
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        
        // Set magnification filter
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        
        // Call the callback if provided
        if (callback) {
            callback(texture);
        }
    };
    
    // Handle loading errors
    image.onerror = function() {
        console.error(`Failed to load texture: ${url}`);
        // Keep the blue placeholder texture
    };
    
    // Start loading the image
    image.src = url;
    
    return texture;
}

/**
 * Checks if a value is a power of 2
 * WebGL 1.0 has restrictions on non-power-of-2 textures
 * @param {number} value - The value to check
 * @returns {boolean} True if the value is a power of 2
 */
function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

/**
 * Creates a texture suitable for the floor with repeating pattern
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {string} url - Optional URL for floor texture image
 * @returns {WebGLTexture} The floor texture
 */
function createFloorTexture(gl, url) {
    if (url) {
        const texture = loadTexture(gl, url);
        
        // Set up repeating texture coordinates
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        
        return texture;
    } else {
        // Create a simple gray texture for the floor
        return createSolidColorTexture(gl, [100, 100, 100, 255]);
    }
}

/**
 * Creates a simple procedural texture for the robot head
 * This demonstrates how to create textures programmatically
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @returns {WebGLTexture} The head texture
 */
function createProceduralHeadTexture(gl) {
    const size = 256;
    const data = new Uint8Array(size * size * 4);
    
    // Create a simple face pattern
    // This is a placeholder - in practice you'd load an actual image
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const index = (y * size + x) * 4;
            
            // Base skin color
            data[index] = 255;     // Red
            data[index + 1] = 200; // Green
            data[index + 2] = 150; // Blue
            data[index + 3] = 255; // Alpha
            
            // Simple eyes (black dots)
            const eyeY = size * 0.4;
            const leftEyeX = size * 0.35;
            const rightEyeX = size * 0.65;
            const eyeRadius = size * 0.05;
            
            const leftEyeDist = Math.sqrt(Math.pow(x - leftEyeX, 2) + Math.pow(y - eyeY, 2));
            const rightEyeDist = Math.sqrt(Math.pow(x - rightEyeX, 2) + Math.pow(y - eyeY, 2));
            
            if (leftEyeDist < eyeRadius || rightEyeDist < eyeRadius) {
                data[index] = 0;
                data[index + 1] = 0;
                data[index + 2] = 0;
            }
            
            // Simple mouth (horizontal line)
            const mouthY = size * 0.6;
            const mouthWidth = size * 0.3;
            const mouthHeight = size * 0.02;
            
            if (Math.abs(y - mouthY) < mouthHeight && 
                Math.abs(x - size * 0.5) < mouthWidth / 2) {
                data[index] = 100;
                data[index + 1] = 50;
                data[index + 2] = 50;
            }
        }
    }
    
    // Create texture from the data
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    return texture;
}

/**
 * Initializes all textures for the scene
 * This should be called during application startup
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {Object} paths - Object containing paths to texture images
 */
function initTextures(gl, paths = {}) {
    // Metal texture for robot body parts
    if (paths.metal) {
        textures.metal = loadTexture(gl, paths.metal);
    } else {
        // Fallback: gray metallic color
        textures.metal = createSolidColorTexture(gl, [128, 128, 128, 255]);
    }
    
    // Head texture with face features
    if (paths.head) {
        textures.head = loadTexture(gl, paths.head);
    } else {
        // Fallback: procedural face texture
        textures.head = createProceduralHeadTexture(gl);
    }
    
    // Floor texture with names and student IDs
    if (paths.floor) {
        textures.floor = createFloorTexture(gl, paths.floor);
    } else {
        // Fallback: dark gray floor
        textures.floor = createSolidColorTexture(gl, [80, 80, 80, 255]);
    }
    
    // Skybox texture
    if (paths.skybox) {
        textures.skybox = loadTexture(gl, paths.skybox);
    } else {
        // Fallback: sky blue color
        textures.skybox = createSolidColorTexture(gl, [100, 150, 220, 255]);
    }
}

/**
 * Binds a texture for use in rendering
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {WebGLTexture} texture - The texture to bind
 * @param {number} unit - The texture unit to use (default: 0)
 */
function bindTexture(gl, texture, unit = 0) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
}