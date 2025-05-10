// Main application code
let fractalGenerator;
let canvas;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let animationId = null;

// Initialize the application when the page loads
function setup() {
    // Create a canvas that fills the canvas container
    const container = document.getElementById('canvas-container');
    const containerRect = container.getBoundingClientRect();
    
    // Set willReadFrequently attribute to true for better performance with getImageData
    canvas = createCanvas(containerRect.width, containerRect.height);
    canvas.canvas.setAttribute('willReadFrequently', 'true');
    canvas.parent('canvas-container');
    
    // Initialize the fractal generator
    fractalGenerator = new FractalGenerator();
    fractalGenerator.setDimensions(width, height);
    
    // Set up event listeners for UI controls
    setupEventListeners();
    
    // Start the animation loop
    draw();
}

// p5.js draw function - called in a loop
function draw() {
    // Update animation if enabled
    fractalGenerator.updateAnimation();
    
    // Render the fractal
    loadPixels();
    fractalGenerator.render(pixels);
    updatePixels();
    
    // Request next frame if animation is enabled
    if (fractalGenerator.animate) {
        animationId = requestAnimationFrame(draw);
    }
}

// p5.js mouse event functions
function mousePressed() {
    // Only handle left mouse button and check if mouse is within canvas
    if (mouseButton === LEFT && mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
        isDragging = true;
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        return false; // Prevent default behavior
    }
}

function mouseDragged() {
    if (isDragging) {
        const dx = mouseX - lastMouseX;
        const dy = mouseY - lastMouseY;
        
        fractalGenerator.pan(-dx, -dy);
        
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        
        redraw();
        return false; // Prevent default behavior
    }
}

function mouseReleased() {
    isDragging = false;
    return false; // Prevent default behavior
}

function mouseWheel(event) {
    // Only handle wheel events when mouse is over the canvas
    if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
        const factor = event.delta < 0 ? 1.1 : 0.9;
        fractalGenerator.zoomAt(mouseX, mouseY, factor);
        redraw();
        return false; // Prevent default behavior
    }
}

// Set up event listeners for UI controls
function setupEventListeners() {
    // Helper function for updating UI values
    function updateUIValue(elementId, value, decimals = 0) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = decimals > 0 ? value.toFixed(decimals) : value;
        }
    }
    
    // Fractal type selection
    document.getElementById('fractal-type').addEventListener('change', function() {
        fractalGenerator.setParameters({ fractalType: this.value });
        
        // Show/hide Julia set parameters
        const juliaParams = document.getElementById('julia-params');
        juliaParams.classList.toggle('hidden', this.value !== 'julia');
        
        redraw();
    });
    
    // Max iterations slider
    document.getElementById('max-iterations').addEventListener('input', function() {
        const value = parseInt(this.value);
        updateUIValue('max-iterations-value', value);
        fractalGenerator.setParameters({ maxIterations: value });
        redraw();
    });
    
    // Zoom slider
    document.getElementById('zoom').addEventListener('input', function() {
        const value = parseFloat(this.value);
        updateUIValue('zoom-value', value, 1);
        fractalGenerator.setParameters({ zoom: value });
        redraw();
    });
    
    // Julia set parameters
    document.getElementById('julia-real').addEventListener('input', function() {
        const value = parseFloat(this.value);
        updateUIValue('julia-real-value', value, 2);
        fractalGenerator.setParameters({ juliaReal: value });
        redraw();
    });
    
    document.getElementById('julia-imag').addEventListener('input', function() {
        const value = parseFloat(this.value);
        updateUIValue('julia-imag-value', value, 2);
        fractalGenerator.setParameters({ juliaImag: value });
        redraw();
    });
    
    // Color scheme selection
    document.getElementById('color-scheme').addEventListener('change', function() {
        fractalGenerator.setParameters({ colorScheme: this.value });
        redraw();
    });
    
    // Animation controls
    document.getElementById('animate').addEventListener('change', function() {
        const isAnimated = this.checked;
        fractalGenerator.setParameters({ animate: isAnimated });
        
        // Enable/disable animation speed slider
        const speedSlider = document.getElementById('animation-speed');
        if (speedSlider) {
            speedSlider.disabled = !isAnimated;
        }
        
        if (isAnimated) {
            // Start animation loop if it's not already running
            if (!animationId) {
                draw();
            }
        } else {
            // Stop animation loop
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }
    });
    
    document.getElementById('animation-speed').addEventListener('input', function() {
        const value = parseInt(this.value);
        fractalGenerator.setParameters({ animationSpeed: value });
    });
    
    // Reset view button
    document.getElementById('reset-view').addEventListener('click', function() {
        fractalGenerator.resetView();
        
        // Reset zoom slider to default value
        const zoomSlider = document.getElementById('zoom');
        if (zoomSlider) {
            zoomSlider.value = 1;
            updateUIValue('zoom-value', 1, 1);
        }
        
        redraw();
    });
    
    // Export image button
    document.getElementById('export-image').addEventListener('click', function() {
        try {
            // Create a temporary link element
            const link = document.createElement('a');
            link.download = `fractal-${fractalGenerator.fractalType}-${Date.now()}.png`;
            
            // Convert canvas to data URL and set as link href
            link.href = canvas.canvas.toDataURL('image/png');
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting image:', error);
            alert('Failed to export image. Please try again.');
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        const container = document.getElementById('canvas-container');
        const containerRect = container.getBoundingClientRect();
        resizeCanvas(containerRect.width, containerRect.height);
        fractalGenerator.setDimensions(width, height);
        redraw();
    });
    
    // Initialize UI values
    updateUIValue('max-iterations-value', fractalGenerator.maxIterations);
    updateUIValue('zoom-value', fractalGenerator.zoom, 1);
    updateUIValue('julia-real-value', fractalGenerator.juliaReal, 2);
    updateUIValue('julia-imag-value', fractalGenerator.juliaImag, 2);
}

// Helper function to redraw the canvas
function redraw() {
    if (!fractalGenerator.animate) {
        draw();
    }
} 