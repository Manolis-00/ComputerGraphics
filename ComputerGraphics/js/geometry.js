const geometryBuffers = {
    cube: {},
    floor: {},
    skybox: {}
};

/**
 * Creates vertex buffer data for a unit cube centered at origin
 * The cube has different colors on each face and texture coordinates
 * @param {WebGLRenderingContext} gl - The WebGL context
 */
function initCubeBuffers(gl) {
    // Vertex positions for a unit cube
    // Each face needs its own vertices to have different colors/textures
    // This means we have 24 vertices (4 per face × 6 faces) instead of just 8
    const vertices = [
        // Front face (Z+) - facing viewer
        -0.5, -0.5,  0.5,  // Bottom-left
         0.5, -0.5,  0.5,  // Bottom-right
         0.5,  0.5,  0.5,  // Top-right
        -0.5,  0.5,  0.5,  // Top-left
        
        // Back face (Z-) - facing away
        -0.5, -0.5, -0.5,  // Bottom-left
        -0.5,  0.5, -0.5,  // Top-left
         0.5,  0.5, -0.5,  // Top-right
         0.5, -0.5, -0.5,  // Bottom-right
        
        // Top face (Y+) - facing up
        -0.5,  0.5, -0.5,  // Back-left
        -0.5,  0.5,  0.5,  // Front-left
         0.5,  0.5,  0.5,  // Front-right
         0.5,  0.5, -0.5,  // Back-right
        
        // Bottom face (Y-) - facing down
        -0.5, -0.5, -0.5,  // Back-left
         0.5, -0.5, -0.5,  // Back-right
         0.5, -0.5,  0.5,  // Front-right
        -0.5, -0.5,  0.5,  // Front-left
        
        // Right face (X+) - facing right
         0.5, -0.5, -0.5,  // Back-bottom
         0.5,  0.5, -0.5,  // Back-top
         0.5,  0.5,  0.5,  // Front-top
         0.5, -0.5,  0.5,  // Front-bottom
        
        // Left face (X-) - facing left
        -0.5, -0.5, -0.5,  // Back-bottom
        -0.5, -0.5,  0.5,  // Front-bottom
        -0.5,  0.5,  0.5,  // Front-top
        -0.5,  0.5, -0.5   // Back-top
    ];
    
    // Create and bind vertex position buffer
    geometryBuffers.cube.vertex = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, geometryBuffers.cube.vertex);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    geometryBuffers.cube.vertex.itemSize = 3; // 3 components per vertex (x, y, z)
    geometryBuffers.cube.vertex.numItems = 24; // 24 vertices total
    
    // Define colors for each face
    // Each color has 4 components (RGBA)
    const faceColors = [
        [1.0, 0.0, 0.0, 1.0], // Front - Red
        [0.0, 1.0, 0.0, 1.0], // Back - Green
        [0.0, 0.0, 1.0, 1.0], // Top - Blue
        [1.0, 1.0, 0.0, 1.0], // Bottom - Yellow
        [1.0, 0.0, 1.0, 1.0], // Right - Magenta
        [0.0, 1.0, 1.0, 1.0]  // Left - Cyan
    ];
    
    // Expand face colors to vertex colors
    // Each face color is applied to all 4 vertices of that face
    let colors = [];
    for (let i = 0; i < 6; i++) {
        const color = faceColors[i];
        for (let j = 0; j < 4; j++) {
            colors = colors.concat(color);
        }
    }
    
    // Create and bind color buffer
    geometryBuffers.cube.color = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, geometryBuffers.cube.color);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    geometryBuffers.cube.color.itemSize = 4; // 4 components per color (RGBA)
    geometryBuffers.cube.color.numItems = 24;
    
    // Texture coordinates for cube faces
    // These map the 2D texture onto each face of the cube
    const textureCoords = [
        // Front face
        0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
        // Back face
        1.0, 0.0,  1.0, 1.0,  0.0, 1.0,  0.0, 0.0,
        // Top face
        0.0, 1.0,  0.0, 0.0,  1.0, 0.0,  1.0, 1.0,
        // Bottom face
        1.0, 1.0,  0.0, 1.0,  0.0, 0.0,  1.0, 0.0,
        // Right face
        1.0, 0.0,  1.0, 1.0,  0.0, 1.0,  0.0, 0.0,
        // Left face
        0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0
    ];
    
    // Create and bind texture coordinate buffer
    geometryBuffers.cube.textureCoord = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, geometryBuffers.cube.textureCoord);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    geometryBuffers.cube.textureCoord.itemSize = 2; // 2 components per coord (u, v)
    geometryBuffers.cube.textureCoord.numItems = 24;
    
    // Index buffer defines which vertices form triangles
    // Each face is made of 2 triangles, so 6 indices per face
    const indices = [
        0,  1,  2,    0,  2,  3,    // Front face
        4,  5,  6,    4,  6,  7,    // Back face
        8,  9,  10,   8,  10, 11,   // Top face
        12, 13, 14,   12, 14, 15,   // Bottom face
        16, 17, 18,   16, 18, 19,   // Right face
        20, 21, 22,   20, 22, 23    // Left face
    ];
    
    // Create and bind index buffer
    geometryBuffers.cube.index = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometryBuffers.cube.index);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    geometryBuffers.cube.index.itemSize = 1;
    geometryBuffers.cube.index.numItems = 36; // 36 indices (6 faces × 2 triangles × 3 vertices)
}

/**
 * Creates special texture coordinates for the robot head
 * This allows different parts of the texture to appear on different faces
 * @returns {Float32Array} The texture coordinates for the head
 */
function createHeadTextureCoords() {
    // Special mapping for head texture to show face features correctly
    // Assumes texture is laid out with face in center, ears on sides
    return new Float32Array([
        // Front face - eyes region (center of texture)
        0.25, 0.33,  0.5, 0.33,  0.5, 0.66,  0.25, 0.66,
        
        // Back face - back of head
        0.5, 0.33,   0.75, 0.33,  0.75, 0.66,  0.5, 0.66,
        
        // Top face - top of head
        0.25, 0.0,   0.5, 0.0,   0.5, 0.33,   0.25, 0.33,
        
        // Bottom face - chin area
        0.25, 0.66,  0.5, 0.66,  0.5, 1.0,    0.25, 1.0,
        
        // Right face - right ear
        0.0, 0.33,   0.25, 0.33,  0.25, 0.66,  0.0, 0.66,
        
        // Left face - left ear
        0.75, 0.33,  1.0, 0.33,  1.0, 0.66,   0.75, 0.66
    ]);
}

/**
 * Creates vertex buffer data for the floor
 * @param {WebGLRenderingContext} gl - The WebGL context
 */
function initFloorBuffers(gl) {
    // Floor vertices - a large square in the XY plane at Z=0
    const vertices = [
        -30.0, -30.0, 0.0,  // Bottom-left
         30.0, -30.0, 0.0,  // Bottom-right
         30.0,  30.0, 0.0,  // Top-right
        -30.0,  30.0, 0.0   // Top-left
    ];
    
    geometryBuffers.floor.vertex = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, geometryBuffers.floor.vertex);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    geometryBuffers.floor.vertex.itemSize = 3;
    geometryBuffers.floor.vertex.numItems = 4;
    
    // Floor color (gray) - not used when texturing
    const colors = [
        0.5, 0.5, 0.5, 1.0,
        0.5, 0.5, 0.5, 1.0,
        0.5, 0.5, 0.5, 1.0,
        0.5, 0.5, 0.5, 1.0
    ];
    
    geometryBuffers.floor.color = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, geometryBuffers.floor.color);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    geometryBuffers.floor.color.itemSize = 4;
    geometryBuffers.floor.color.numItems = 4;
    
    // Texture coordinates - repeat texture 5 times in each direction
    const textureCoords = [
        0.0, 0.0,
        5.0, 0.0,
        5.0, 5.0,
        0.0, 5.0
    ];
    
    geometryBuffers.floor.textureCoord = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, geometryBuffers.floor.textureCoord);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    geometryBuffers.floor.textureCoord.itemSize = 2;
    geometryBuffers.floor.textureCoord.numItems = 4;
    
    // Indices for two triangles making up the floor
    const indices = [0, 1, 2, 0, 2, 3];
    
    geometryBuffers.floor.index = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometryBuffers.floor.index);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    geometryBuffers.floor.index.itemSize = 1;
    geometryBuffers.floor.index.numItems = 6;
}

/**
 * Creates vertex buffer data for the skybox
 * @param {WebGLRenderingContext} gl - The WebGL context
 */
function initSkyboxBuffers(gl) {
    // Skybox is a large cube that surrounds the entire scene
    const size = 1000.0;
    
    // Generate vertices for a cube of the specified size
    const vertices = [];
    const positions = [
        // Front, Back, Top, Bottom, Right, Left faces
        [[-1,-1, 1], [ 1,-1, 1], [ 1, 1, 1], [-1, 1, 1]], // Front
        [[-1,-1,-1], [-1, 1,-1], [ 1, 1,-1], [ 1,-1,-1]], // Back
        [[-1, 1,-1], [-1, 1, 1], [ 1, 1, 1], [ 1, 1,-1]], // Top
        [[-1,-1,-1], [ 1,-1,-1], [ 1,-1, 1], [-1,-1, 1]], // Bottom
        [[ 1,-1,-1], [ 1, 1,-1], [ 1, 1, 1], [ 1,-1, 1]], // Right
        [[-1,-1,-1], [-1,-1, 1], [-1, 1, 1], [-1, 1,-1]]  // Left
    ];
    
    for (let face of positions) {
        for (let vertex of face) {
            vertices.push(vertex[0] * size, vertex[1] * size, vertex[2] * size);
        }
    }
    
    geometryBuffers.skybox.vertex = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, geometryBuffers.skybox.vertex);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    geometryBuffers.skybox.vertex.itemSize = 3;
    geometryBuffers.skybox.vertex.numItems = 24;
    
    // Sky blue color for all vertices
    const colors = [];
    for (let i = 0; i < 24; i++) {
        colors.push(0.4, 0.6, 0.9, 1.0);
    }
    
    geometryBuffers.skybox.color = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, geometryBuffers.skybox.color);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    geometryBuffers.skybox.color.itemSize = 4;
    geometryBuffers.skybox.color.numItems = 24;
    
    // Simple texture coordinates for skybox
    const textureCoords = [];
    for (let i = 0; i < 6; i++) {
        textureCoords.push(
            0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0
        );
    }
    
    geometryBuffers.skybox.textureCoord = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, geometryBuffers.skybox.textureCoord);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    geometryBuffers.skybox.textureCoord.itemSize = 2;
    geometryBuffers.skybox.textureCoord.numItems = 24;
    
    // Indices for skybox triangles
    const indices = [];
    for (let i = 0; i < 6; i++) {
        const offset = i * 4;
        indices.push(
            offset, offset + 1, offset + 2,
            offset, offset + 2, offset + 3
        );
    }
    
    geometryBuffers.skybox.index = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometryBuffers.skybox.index);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    geometryBuffers.skybox.index.itemSize = 1;
    geometryBuffers.skybox.index.numItems = 36;
}

/**
 * Initializes all geometry buffers
 * @param {WebGLRenderingContext} gl - The WebGL context
 */
function initAllGeometry(gl) {
    initCubeBuffers(gl);
    initFloorBuffers(gl);
    initSkyboxBuffers(gl);
}