// shader.js - WebGL Shader Programs and Initialization

// Vertex shader source code
const VERTEX_SHADER_SOURCE = `
    attribute vec3 aVertexPosition;
    attribute vec4 aVertexColor;
    attribute vec2 aTextureCoord;
    
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform bool uUseTexture;
    
    varying vec4 vColor;
    varying vec2 vTextureCoord;
    
    void main(void) {
        // Transform the vertex position
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
        
        // Pass color and texture coordinates to fragment shader
        vColor = aVertexColor;
        vTextureCoord = aTextureCoord;
    }
`;

// Fragment shader source code
// This shader determines the final color of each pixel
const FRAGMENT_SHADER_SOURCE = `
    precision mediump float;
    
    varying vec4 vColor;
    varying vec2 vTextureCoord;
    
    uniform sampler2D uSampler;
    uniform bool uUseTexture;
    
    void main(void) {
        if (uUseTexture) {
            // Use texture color
            gl_FragColor = texture2D(uSampler, vTextureCoord);
        } else {
            // Use vertex color
            gl_FragColor = vColor;
        }
    }
`;

// Global shader program variable
let shaderProgram = null;

/**
 * Compiles a shader from source code
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {string} source - The shader source code
 * @param {number} type - The shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
 * @returns {WebGLShader} The compiled shader
 */
function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    // Check for compilation errors
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error('Shader compilation failed: ' + error);
    }
    
    return shader;
}

/**
 * Creates and links a shader program
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @returns {WebGLProgram} The linked shader program
 */
function createShaderProgram(gl) {
    // Compile individual shaders
    const vertexShader = compileShader(gl, VERTEX_SHADER_SOURCE, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, FRAGMENT_SHADER_SOURCE, gl.FRAGMENT_SHADER);
    
    // Create and link the shader program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    // Check for linking errors
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const error = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error('Shader program linking failed: ' + error);
    }
    
    // Clean up individual shaders (they're now part of the program)
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    
    return program;
}

/**
 * Initializes shaders and sets up attribute/uniform locations
 * @param {WebGLRenderingContext} gl - The WebGL context
 */
function initShaders(gl) {
    // Create the shader program
    shaderProgram = createShaderProgram(gl);
    gl.useProgram(shaderProgram);
    
    // Get and enable vertex attributes
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    
    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
    
    // Get uniform locations
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    shaderProgram.useTextureUniform = gl.getUniformLocation(shaderProgram, "uUseTexture");
    
    // Set the texture sampler to use texture unit 0
    gl.uniform1i(shaderProgram.samplerUniform, 0);
}