const controlState = {
    // Track if we need to redraw the scene
    needsRedraw: false,
    
    // Store previous values to detect changes
    previousValues: {
        fov: 60,
        distance: 8,
        preset: 'lft'
    }
};

/**
 * Initializes all UI event handlers
 * This function sets up the connections between HTML elements and JavaScript functions
 * Think of it as "wiring up" the control panel to the 3D scene
 */
function initControls() {
    console.log('Initializing controls...');
    
    // Camera control buttons
    initCameraControls();
    
    // Animation control buttons
    initAnimationControls();
    
    // Robot part selection
    initRobotPartControls();
    
    // Mouse controls for camera
    initMouseControls();
    
    // Keyboard shortcuts (optional enhancement)
    initKeyboardControls();
    
    console.log('Controls initialized successfully');
}

/**
 * Initializes camera-related controls
 * These controls affect how we view the scene
 */
function initCameraControls() {
    // Redraw button - applies camera changes
    const redrawBtn = document.getElementById('redrawBtn');
    if (redrawBtn) {
        redrawBtn.addEventListener('click', function() {
            console.log('Redraw button clicked');
            
            // Update camera from UI values
            updateCameraFromUI();
            
            // Force a scene redraw
            controlState.needsRedraw = true;
        });
    }
    
    // View angle input - changes field of view
    const viewAngleInput = document.getElementById('viewAngle');
    if (viewAngleInput) {
        // Validate input as user types
        viewAngleInput.addEventListener('input', function(e) {
            const value = parseFloat(e.target.value);
            
            // Ensure value is within reasonable bounds
            if (isNaN(value) || value <= 0 || value >= 180) {
                e.target.style.borderColor = 'red';
            } else {
                e.target.style.borderColor = '';
            }
        });
        
        // Apply changes when user presses Enter
        viewAngleInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                redrawBtn.click();
            }
        });
    }
    
    // Camera distance input
    const camDistanceInput = document.getElementById('camOrthoDistance');
    if (camDistanceInput) {
        camDistanceInput.addEventListener('input', function(e) {
            const value = parseFloat(e.target.value);
            
            // Validate distance is positive
            if (isNaN(value) || value <= 0) {
                e.target.style.borderColor = 'red';
            } else {
                e.target.style.borderColor = '';
            }
        });
        
        camDistanceInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                redrawBtn.click();
            }
        });
    }
    
    // Camera position preset radio buttons
    const camPosRadios = document.querySelectorAll('input[name="camPos"]');
    camPosRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            console.log(`Camera preset changed to: ${this.value}`);
            // Automatically apply preset changes
            updateCameraFromUI();
        });
    });
}

/**
 * Initializes animation control buttons
 * These start and stop the automatic movements
 */
function initAnimationControls() {
    // Start animation button
    const startBtn = document.getElementById('startAnimBtn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            startAnimation();
            
            // Update button states for visual feedback
            this.disabled = true;
            const stopBtn = document.getElementById('stopAnimBtn');
            if (stopBtn) stopBtn.disabled = false;
        });
    }
    
    // Stop animation button
    const stopBtn = document.getElementById('stopAnimBtn');
    if (stopBtn) {
        stopBtn.addEventListener('click', function() {
            stopAnimation();
            
            // Update button states
            this.disabled = true;
            const startBtn = document.getElementById('startAnimBtn');
            if (startBtn) startBtn.disabled = false;
        });
        
        // Initially disabled since animation starts stopped
        stopBtn.disabled = true;
    }
}

/**
 * Initializes robot part selection controls
 * These determine which part of the robot responds to mouse wheel input
 */
function initRobotPartControls() {
    const robotPartRadios = document.querySelectorAll('input[name="robotPart"]');
    
    robotPartRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            console.log(`Robot control changed to: ${this.value}`);
            
            // Special handling for animation modes
            if (this.value === 'parade' || this.value === 'robotMetal') {
                // Reset robot pose when switching to animation mode
                if (controlState.previousRobotMode !== 'parade' && 
                    controlState.previousRobotMode !== 'robotMetal') {
                    resetRobotPose();
                }
            }
            
            controlState.previousRobotMode = this.value;
        });
    });
}

/**
 * Initializes mouse controls for camera and robot
 * This includes click-and-drag for camera rotation and wheel for part control
 */
function initMouseControls() {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;
    
    // Mouse down - start camera rotation
    canvas.addEventListener('mousedown', function(e) {
        handleCameraMouseDown(e);
        
        // Change cursor to indicate dragging
        canvas.style.cursor = 'grabbing';
    });
    
    // Mouse up - stop camera rotation
    document.addEventListener('mouseup', function(e) {
        handleCameraMouseUp(e);
        
        // Reset cursor
        const canvas = document.getElementById('webgl-canvas');
        if (canvas) canvas.style.cursor = 'grab';
    });
    
    // Mouse move - rotate camera if dragging
    document.addEventListener('mousemove', function(e) {
        handleCameraMouseMove(e);
    });
    
    // Mouse wheel - control robot parts
    canvas.addEventListener('wheel', function(e) {
        e.preventDefault(); // Prevent page scrolling
        
        // Normalize wheel delta across browsers
        // Different browsers report wheel movement differently
        const delta = e.deltaY > 0 ? -1 : 1;
        
        // Handle animation based on selected part
        handleManualAnimation(delta);
    });
    
    // Context menu - prevent right-click menu on canvas
    canvas.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
}

/**
 * Initializes keyboard shortcuts for power users
 * These provide quick access to common functions
 */
function initKeyboardControls() {
    document.addEventListener('keydown', function(e) {
        // Only process shortcuts when not typing in input fields
        if (e.target.tagName === 'INPUT') return;
        
        switch(e.key.toLowerCase()) {
            case ' ': // Spacebar - toggle animation
                e.preventDefault();
                if (animationState.isRunning) {
                    document.getElementById('stopAnimBtn')?.click();
                } else {
                    document.getElementById('startAnimBtn')?.click();
                }
                break;
                
            case 'r': // R - reset camera
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    resetCamera();
                    console.log('Camera reset via keyboard shortcut');
                }
                break;
                
            case 'h': // H - show help
                if (e.shiftKey) {
                    showControlsHelp();
                }
                break;
                
            // Number keys 1-7 for quick robot part selection
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
                const partIndex = parseInt(e.key) - 1;
                const partRadios = document.querySelectorAll('input[name="robotPart"]');
                if (partRadios[partIndex]) {
                    partRadios[partIndex].checked = true;
                    partRadios[partIndex].dispatchEvent(new Event('change'));
                }
                break;
        }
    });
}

/**
 * Shows a help dialog with keyboard shortcuts
 * This improves user experience by making controls discoverable
 */
function showControlsHelp() {
    const helpText = `
Keyboard Shortcuts:
━━━━━━━━━━━━━━━━━━
Space - Toggle animation
Ctrl+R - Reset camera
1-7 - Select robot parts
Shift+H - Show this help

Mouse Controls:
━━━━━━━━━━━━━━
Click & Drag - Rotate camera
Scroll Wheel - Control selected part
    `;
    
    alert(helpText);
}

/**
 * Updates UI elements to reflect current state
 * This ensures the interface always shows accurate information
 */
function updateUIFromState() {
    // Update camera values
    const viewAngleInput = document.getElementById('viewAngle');
    if (viewAngleInput) {
        viewAngleInput.value = camera.fov;
    }
    
    const distanceInput = document.getElementById('camOrthoDistance');
    if (distanceInput) {
        distanceInput.value = camera.distance;
    }
    
    // Update animation button states
    const startBtn = document.getElementById('startAnimBtn');
    const stopBtn = document.getElementById('stopAnimBtn');
    
    if (startBtn && stopBtn) {
        startBtn.disabled = animationState.isRunning;
        stopBtn.disabled = !animationState.isRunning;
    }
}

/**
 * Validates all input fields
 * Returns true if all inputs are valid
 * @returns {boolean} Whether all inputs are valid
 */
function validateInputs() {
    let isValid = true;
    
    // Validate view angle
    const viewAngle = parseFloat(document.getElementById('viewAngle')?.value);
    if (isNaN(viewAngle) || viewAngle <= 0 || viewAngle >= 180) {
        console.error('Invalid view angle:', viewAngle);
        isValid = false;
    }
    
    // Validate camera distance
    const distance = parseFloat(document.getElementById('camOrthoDistance')?.value);
    if (isNaN(distance) || distance <= 0) {
        console.error('Invalid camera distance:', distance);
        isValid = false;
    }
    
    return isValid;
}

/**
 * Gets the current state of all controls
 * Useful for debugging or saving user preferences
 * @returns {Object} Current control state
 */
function getControlState() {
    return {
        camera: {
            fov: parseFloat(document.getElementById('viewAngle')?.value) || 60,
            distance: parseFloat(document.getElementById('camOrthoDistance')?.value) || 8,
            preset: document.querySelector('input[name="camPos"]:checked')?.value || 'lft'
        },
        animation: {
            isRunning: animationState.isRunning,
            mode: document.querySelector('input[name="robotPart"]:checked')?.value || 'rightArm'
        }
    };
}