const animationState = {
    // Whether the main animation loop is running
    isRunning: false,
    
    // Time tracking for smooth animations
    lastTime: 0,
    deltaTime: 0,
    
    // Specific animation modes
    currentMode: 'none', // Can be: 'none', 'parade', 'robotMetal'
    
    // Frame counter for timing-based events
    frameCount: 0
};

/**
 * Starts the animation system
 * This is like pressing "play" on a video - it begins the continuous update loop
 */
function startAnimation() {
    animationState.isRunning = true;
    animationState.lastTime = performance.now();
    console.log('Animation started');
}

/**
 * Stops the animation system
 * This pauses all automatic movements but preserves the current state
 */
function stopAnimation() {
    animationState.isRunning = false;
    console.log('Animation stopped');
}

/**
 * Main animation update function
 * This is called every frame (ideally 60 times per second) to update all moving parts
 * @param {number} currentTime - Current timestamp in milliseconds
 */
function updateAnimation(currentTime) {
    // Calculate time elapsed since last frame
    // This ensures smooth animation regardless of frame rate
    animationState.deltaTime = (currentTime - animationState.lastTime) / 1000;
    animationState.lastTime = currentTime;
    
    if (!animationState.isRunning) return;
    
    // Update camera animation (spiral movement)
    updateCameraAnimation(animationState.deltaTime);
    
    // Update robot animations based on selected mode
    const selectedMode = document.querySelector('input[name="robotPart"]:checked');
    if (selectedMode) {
        const mode = selectedMode.value;
        
        switch (mode) {
            case 'parade':
                updateParadeAnimation();
                break;
            case 'robotMetal':
                updateRobotMetalAnimation();
                break;
            // Individual part controls are handled by mouse wheel
        }
    }
    
    // Update easter egg animation if active
    if (robotState.animation.easterEggActive) {
        updateEasterEggAnimation();
    }
    
    animationState.frameCount++;
}

/**
 * Updates the parade animation
 * This creates a marching motion with coordinated arm and leg movements
 * Think of it like a toy soldier marching in place
 */
function updateParadeAnimation() {
    // Increment the phase of the march cycle
    robotState.animation.paradePhase += animationState.deltaTime * 2; // Speed of marching
    
    // Create a marching pattern:
    // When right arm goes forward, left leg goes forward (and vice versa)
    // This mimics natural human walking
    const phase = robotState.animation.paradePhase;
    
    // Sine wave creates smooth back-and-forth motion
    // Right arm and left leg move together
    robotState.angles.rightArm = Math.sin(phase) * Math.PI; // Full swing (180°)
    robotState.angles.leftLeg = Math.sin(phase) * Math.PI / 2; // Half swing (90°)
    
    // Left arm and right leg move opposite (phase shifted by π)
    robotState.angles.leftArm = Math.sin(phase + Math.PI) * Math.PI;
    robotState.angles.rightLeg = Math.sin(phase + Math.PI) * Math.PI / 2;
}

/**
 * Updates the Robot Metal animation
 * This creates a "headbanging" motion popular in heavy metal music
 */
function updateRobotMetalAnimation() {
    // Left arm stays raised at 45 degrees (rock gesture)
    robotState.angles.leftArm = Math.PI / 4;
    
    // Right arm rotates continuously (windmill motion)
    robotState.angles.rightArm += animationState.deltaTime * 2; // Rotation speed
    
    // Normalize angle to prevent numerical overflow
    if (robotState.angles.rightArm > 2 * Math.PI) {
        robotState.angles.rightArm -= 2 * Math.PI;
        robotState.animation.robotMetalCycles++;
        
        // Trigger easter egg after 5 complete rotations
        if (robotState.animation.robotMetalCycles >= 5 && !robotState.animation.easterEggActive) {
            console.log('Easter egg activated!');
            robotState.animation.easterEggActive = true;
        }
    }
    
    // Head movement synchronized with arm rotation
    // Creates a headbanging motion that follows the arm
    const armCycle = robotState.angles.rightArm / (2 * Math.PI);
    robotState.angles.head = Math.sin(armCycle * 2 * Math.PI) * (Math.PI / 2);
}

/**
 * Updates the easter egg animation
 * This special animation triggers after 5 cycles of Robot Metal
 * The robot falls backward and its head pulsates
 */
function updateEasterEggAnimation() {
    // Make the robot fall backward gradually
    if (robotState.animation.fallAngle < Math.PI / 2) {
        robotState.animation.fallAngle += animationState.deltaTime;
    }
    
    // Pulsating head effect
    // Uses sine wave to smoothly scale the head up and down
    const pulsateSpeed = 3; // How fast the head pulsates
    robotState.animation.headScale = 1.0 + 0.5 * Math.sin(animationState.frameCount * 0.1 * pulsateSpeed);
    
    // Clamp head scale to prevent it from going inside the body
    robotState.animation.headScale = Math.max(0.5, Math.min(2.0, robotState.animation.headScale));
}

/**
 * Handles mouse wheel input for manual joint control
 * This allows fine-grained control of robot parts when animation is paused
 * @param {number} delta - Wheel delta (positive = up, negative = down)
 */
function handleManualAnimation(delta) {
    const selectedPart = document.querySelector('input[name="robotPart"]:checked');
    if (!selectedPart) return;
    
    const part = selectedPart.value;
    const rotationSpeed = 0.05; // Radians per wheel tick
    
    // If animation is running, only manual control works for individual parts
    if (animationState.isRunning && 
        (part === 'parade' || part === 'robotMetal')) {
        return; // These are automated when animation is running
    }
    
    // Handle manual control based on selected part
    switch (part) {
        case 'rightArm':
        case 'leftArm':
        case 'head':
        case 'rightLeg':
        case 'leftLeg':
            updateRobotJoint(part, delta * rotationSpeed);
            break;
            
        case 'parade':
            // Manual parade control when animation is stopped
            if (!animationState.isRunning) {
                robotState.animation.paradePhase += delta * 0.1;
                updateParadeAnimation();
            }
            break;
            
        case 'robotMetal':
            // Manual robot metal control when animation is stopped
            if (!animationState.isRunning) {
                robotState.angles.leftArm = Math.PI / 4;
                robotState.angles.rightArm += delta * rotationSpeed;
                
                // Update head based on arm position
                const armCycle = robotState.angles.rightArm / (2 * Math.PI);
                robotState.angles.head = Math.sin(armCycle * 2 * Math.PI) * (Math.PI / 2);
                
                // Check for easter egg activation
                const prevCycles = Math.floor((robotState.angles.rightArm - delta * rotationSpeed) / (2 * Math.PI));
                const currCycles = Math.floor(robotState.angles.rightArm / (2 * Math.PI));
                
                if (currCycles > prevCycles) {
                    robotState.animation.robotMetalCycles++;
                    if (robotState.animation.robotMetalCycles >= 5 && !robotState.animation.easterEggActive) {
                        robotState.animation.easterEggActive = true;
                    }
                }
            }
            break;
    }
}

/**
 * Gets a human-readable description of the current animation state
 * Useful for debugging and user feedback
 * @returns {string} Description of current animation
 */
function getAnimationStatus() {
    if (!animationState.isRunning) {
        return "Animation paused - Use mouse wheel for manual control";
    }
    
    const selectedMode = document.querySelector('input[name="robotPart"]:checked');
    if (!selectedMode) return "No animation mode selected";
    
    switch (selectedMode.value) {
        case 'parade':
            return "Parade march animation active";
        case 'robotMetal':
            return `Robot Metal animation active (Cycle ${robotState.animation.robotMetalCycles + 1}/5)`;
        default:
            return "Camera animation active - Use mouse wheel to control selected part";
    }
}

/**
 * Resets all animations to their initial state
 * This is like a "reset" button that returns everything to the beginning
 */
function resetAnimations() {
    // Reset animation state
    animationState.currentMode = 'none';
    animationState.frameCount = 0;
    
    // Reset robot animation state
    robotState.animation = {
        paradePhase: 0,
        robotMetalCycles: 0,
        easterEggActive: false,
        fallAngle: 0,
        headScale: 1.0
    };
    
    // Reset all joint angles
    resetRobotPose();
    
    console.log('All animations reset');
}