class FractalGenerator {
    constructor() {
        // Default parameters
        this.maxIterations = 100;
        this.fractalType = 'mandelbrot';
        this.colorScheme = 'rainbow';
        this.juliaReal = -0.7;
        this.juliaImag = 0.27;
        this.animate = false;
        this.animationSpeed = 5;
        this.animationOffset = 0;
        
        // View parameters
        this.zoom = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        
        // Canvas dimensions
        this.width = 0;
        this.height = 0;
    }
    
    setDimensions(width, height) {
        this.width = width;
        this.height = height;
    }
    
    setParameters(params) {
        if (params.maxIterations !== undefined) this.maxIterations = params.maxIterations;
        if (params.fractalType !== undefined) this.fractalType = params.fractalType;
        if (params.colorScheme !== undefined) this.colorScheme = params.colorScheme;
        if (params.juliaReal !== undefined) this.juliaReal = params.juliaReal;
        if (params.juliaImag !== undefined) this.juliaImag = params.juliaImag;
        if (params.animate !== undefined) this.animate = params.animate;
        if (params.animationSpeed !== undefined) this.animationSpeed = params.animationSpeed;
        if (params.zoom !== undefined) this.zoom = params.zoom;
    }
    
    resetView() {
        this.zoom = 1;
        this.offsetX = 0;
        this.offsetY = 0;
    }
    
    pan(dx, dy) {
        // Convert screen coordinates to fractal coordinates based on zoom level
        this.offsetX += dx / (this.width / 4) / this.zoom;
        this.offsetY += dy / (this.height / 4) / this.zoom;
    }
    
    zoomAt(x, y, factor) {
        // Get coordinates before zoom
        const fractalX = this.screenToFractalX(x);
        const fractalY = this.screenToFractalY(y);
        
        // Apply zoom
        this.zoom *= factor;
        
        // Adjust offset to keep the point under the mouse
        const newFractalX = this.screenToFractalX(x);
        const newFractalY = this.screenToFractalY(y);
        
        this.offsetX += fractalX - newFractalX;
        this.offsetY += fractalY - newFractalY;
    }
    
    screenToFractalX(x) {
        const aspect = this.width / this.height;
        return (x / this.width * 4 - 2) * aspect / this.zoom + this.offsetX;
    }
    
    screenToFractalY(y) {
        return (y / this.height * 4 - 2) / this.zoom + this.offsetY;
    }
    
    mandelbrotIterations(x0, y0) {
        let x = 0;
        let y = 0;
        let iteration = 0;
        
        while (x*x + y*y <= 4 && iteration < this.maxIterations) {
            const xTemp = x*x - y*y + x0;
            y = 2*x*y + y0;
            x = xTemp;
            iteration++;
        }
        
        return iteration;
    }
    
    juliaIterations(x0, y0) {
        let x = x0;
        let y = y0;
        let iteration = 0;
        
        while (x*x + y*y <= 4 && iteration < this.maxIterations) {
            const xTemp = x*x - y*y + this.juliaReal;
            y = 2*x*y + this.juliaImag;
            x = xTemp;
            iteration++;
        }
        
        return iteration;
    }
    
    burningShipIterations(x0, y0) {
        let x = 0;
        let y = 0;
        let iteration = 0;
        
        while (x*x + y*y <= 4 && iteration < this.maxIterations) {
            const xTemp = x*x - y*y + x0;
            y = Math.abs(2*x*y) + y0;
            x = xTemp;
            iteration++;
        }
        
        return iteration;
    }
    
    getIterations(x, y) {
        switch(this.fractalType) {
            case 'mandelbrot':
                return this.mandelbrotIterations(x, y);
            case 'julia':
                return this.juliaIterations(x, y);
            case 'burningShip':
                return this.burningShipIterations(x, y);
            default:
                return this.mandelbrotIterations(x, y);
        }
    }
    
    mapColor(iteration) {
        if (iteration === this.maxIterations) {
            return [0, 0, 0]; // Black for points inside the set
        }
        
        // Normalized iteration count (smooth coloring)
        const normalized = iteration / this.maxIterations;
        
        // Animation offset
        let offset = 0;
        if (this.animate) {
            offset = this.animationOffset;
        }
        
        switch(this.colorScheme) {
            case 'rainbow':
                return this.rainbowColor(normalized, offset);
            case 'fire':
                return this.fireColor(normalized, offset);
            case 'ocean':
                return this.oceanColor(normalized, offset);
            case 'grayscale':
                return this.grayscaleColor(normalized);
            default:
                return this.rainbowColor(normalized, offset);
        }
    }
    
    rainbowColor(normalized, offset) {
        const hue = (normalized * 360 + offset) % 360;
        return this.hsvToRgb(hue, 1, 1);
    }
    
    fireColor(normalized, offset) {
        const hue = ((normalized * 60) + offset) % 60;
        return this.hsvToRgb(hue, 1, Math.min(1, normalized * 2));
    }
    
    oceanColor(normalized, offset) {
        const hue = ((normalized * 60) + 180 + offset) % 60 + 180;
        return this.hsvToRgb(hue, 1, Math.min(1, normalized * 2));
    }
    
    grayscaleColor(normalized) {
        const value = Math.floor(normalized * 255);
        return [value, value, value];
    }
    
    hsvToRgb(h, s, v) {
        let r, g, b;
        const i = Math.floor(h / 60) % 6;
        const f = h / 60 - Math.floor(h / 60);
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        
        switch(i) {
            case 0: [r, g, b] = [v, t, p]; break;
            case 1: [r, g, b] = [q, v, p]; break;
            case 2: [r, g, b] = [p, v, t]; break;
            case 3: [r, g, b] = [p, q, v]; break;
            case 4: [r, g, b] = [t, p, v]; break;
            case 5: [r, g, b] = [v, p, q]; break;
        }
        
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
    
    updateAnimation() {
        if (this.animate) {
            this.animationOffset = (this.animationOffset + this.animationSpeed) % 360;
        }
    }
    
    render(pixels) {
        const aspect = this.width / this.height;
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // Map pixel coordinates to fractal coordinates
                const fractalX = this.screenToFractalX(x);
                const fractalY = this.screenToFractalY(y);
                
                // Calculate iterations for this point
                const iteration = this.getIterations(fractalX, fractalY);
                
                // Map iteration count to color
                const [r, g, b] = this.mapColor(iteration);
                
                // Set pixel color in the provided pixels array
                const idx = (y * this.width + x) * 4;
                pixels[idx] = r;
                pixels[idx + 1] = g;
                pixels[idx + 2] = b;
                pixels[idx + 3] = 255; // Alpha
            }
        }
    }
} 