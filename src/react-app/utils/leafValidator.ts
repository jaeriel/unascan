import * as tf from '@tensorflow/tfjs';

// Real TensorFlow.js-based leaf validation model
class LeafValidatorModel {
  private model: tf.LayersModel | null = null;
  private isLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  async loadModel(): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = this._loadModel();
    return this.loadingPromise;
  }

  private async _loadModel(): Promise<void> {
    try {
      console.log('Loading sugarcane leaf detection model...');
      
      // Set TensorFlow.js backend (prefer WebGL for performance)
      await tf.ready();
      
      // Load the trained model
      this.model = await tf.loadLayersModel('/models/model.json');
      
      // Warm up the model with a dummy prediction
      const dummyInput = tf.zeros([1, 224, 224, 3]);
      const warmupPrediction = this.model.predict(dummyInput) as tf.Tensor;
      await warmupPrediction.data();
      dummyInput.dispose();
      warmupPrediction.dispose();
      
      this.isLoaded = true;
      console.log('Sugarcane leaf detection model loaded successfully');
      console.log('Model summary:', this.model.summary);
    } catch (error) {
      console.error('Failed to load leaf validation model:', error);
      this.loadingPromise = null;
      throw new Error(`Model loading failed: ${error}`);
    }
  }

  async validateLeaf(imageElement: HTMLImageElement): Promise<{
    isSugarcaneLeaf: boolean;
    confidence: number;
    message: string;
  }> {
    try {
      // Ensure model is loaded
      await this.loadModel();
      
      if (!this.model) {
        throw new Error('Model not loaded');
      }

      // Preprocess the image for the model
      const preprocessed = this.preprocessImage(imageElement);
      
      // Run prediction
      const prediction = this.model.predict(preprocessed) as tf.Tensor;
      const probabilities = await prediction.data();
      
      // Clean up tensors
      preprocessed.dispose();
      prediction.dispose();
      
      // Extract probabilities for each class
      const notSugarcaneProb = probabilities[0];
      const sugarcaneProb = probabilities[1];
      
      // Determine if it's a sugarcane leaf
      const isSugarcaneLeaf = sugarcaneProb > notSugarcaneProb;
      const confidence = Math.max(notSugarcaneProb, sugarcaneProb);
      
      console.log(`Prediction: not_sugarcane=${notSugarcaneProb.toFixed(3)}, sugarcane=${sugarcaneProb.toFixed(3)}`);
      
      if (isSugarcaneLeaf && confidence > 0.7) {
        return {
          isSugarcaneLeaf: true,
          confidence: confidence,
          message: 'Sugarcane leaf detected successfully'
        };
      } else if (isSugarcaneLeaf && confidence > 0.5) {
        return {
          isSugarcaneLeaf: true,
          confidence: confidence,
          message: 'Sugarcane leaf detected with moderate confidence'
        };
      } else {
        return {
          isSugarcaneLeaf: false,
          confidence: confidence,
          message: 'This does not appear to be a sugarcane leaf. Please capture an image of a sugarcane leaf.'
        };
      }
    } catch (error) {
      console.error('Leaf validation error:', error);
      
      // Fallback to basic image analysis if model fails
      return this.fallbackValidation(imageElement);
    }
  }

  private preprocessImage(imageElement: HTMLImageElement): tf.Tensor {
    return tf.tidy(() => {
      // Convert image to tensor
      let tensor = tf.browser.fromPixels(imageElement);
      
      // Resize to model input size (224x224)
      tensor = tf.image.resizeBilinear(tensor, [224, 224]);
      
      // Add batch dimension
      tensor = tensor.expandDims(0);
      
      // Convert to float32 and normalize to [0, 1]
      tensor = tensor.cast('float32');
      tensor = tensor.div(255.0);
      
      return tensor;
    });
  }

  private fallbackValidation(imageElement: HTMLImageElement): {
    isSugarcaneLeaf: boolean;
    confidence: number;
    message: string;
  } {
    console.log('Using fallback validation method');
    
    // Basic image analysis as fallback
    const analysis = this.analyzeImageForLeafFeatures(imageElement);
    
    // Calculate probability based on multiple factors
    let leafProbability = 0;
    
    // Green color content (sugarcane leaves are predominantly green)
    leafProbability += analysis.greenRatio * 0.4;
    
    // Edge density (leaves have moderate edge density)
    leafProbability += analysis.edgeDensity * 0.3;
    
    // Aspect ratio (sugarcane leaves are elongated)
    leafProbability += analysis.aspectRatioScore * 0.2;
    
    // Color variance (leaves have some texture variation)
    leafProbability += analysis.colorVariance * 0.1;
    
    // Apply threshold for classification
    const isLeaf = leafProbability > 0.6;
    const confidence = Math.min(0.85, Math.max(0.6, leafProbability));
    
    if (isLeaf) {
      return {
        isSugarcaneLeaf: true,
        confidence: confidence,
        message: 'Sugarcane leaf detected using fallback analysis'
      };
    } else {
      return {
        isSugarcaneLeaf: false,
        confidence: 1 - confidence,
        message: 'This does not appear to be a sugarcane leaf. Please capture an image of a sugarcane leaf.'
      };
    }
  }

  private analyzeImageForLeafFeatures(imageElement: HTMLImageElement): {
    greenRatio: number;
    edgeDensity: number;
    aspectRatioScore: number;
    colorVariance: number;
  } {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    ctx.drawImage(imageElement, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Analyze green color content
    let greenPixels = 0;
    let totalPixels = 0;
    let redSum = 0, greenSum = 0, blueSum = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Count green-dominant pixels
      if (g > r && g > b && g > 80) {
        greenPixels++;
      }
      
      totalPixels++;
      redSum += r;
      greenSum += g;
      blueSum += b;
    }
    
    const greenRatio = greenPixels / totalPixels;
    
    // Calculate color variance
    const avgR = redSum / totalPixels;
    const avgG = greenSum / totalPixels;
    const avgB = blueSum / totalPixels;
    
    let variance = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      variance += Math.pow(r - avgR, 2) + Math.pow(g - avgG, 2) + Math.pow(b - avgB, 2);
    }
    variance = Math.sqrt(variance / (totalPixels * 3)) / 255;
    
    // Calculate edge density
    let edgeCount = 0;
    const width = canvas.width;
    const height = canvas.height;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const current = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        const right = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3;
        const bottom = (data[idx + width * 4] + data[idx + width * 4 + 1] + data[idx + width * 4 + 2]) / 3;
        
        if (Math.abs(current - right) > 30 || Math.abs(current - bottom) > 30) {
          edgeCount++;
        }
      }
    }
    
    const edgeDensity = Math.min(1, edgeCount / (width * height * 0.1));
    
    // Calculate aspect ratio score
    const aspectRatio = Math.max(width, height) / Math.min(width, height);
    const aspectRatioScore = aspectRatio > 1.5 && aspectRatio < 4 ? 1 : Math.max(0, 1 - Math.abs(aspectRatio - 2.5) / 2.5);
    
    return {
      greenRatio: Math.min(1, greenRatio * 2),
      edgeDensity,
      aspectRatioScore,
      colorVariance: Math.min(1, variance * 3)
    };
  }

  // Method to check TensorFlow.js backend status
  async getModelInfo(): Promise<{
    isLoaded: boolean;
    backend: string;
    modelSize?: number;
    inputShape?: number[];
  }> {
    await tf.ready();
    
    return {
      isLoaded: this.isLoaded,
      backend: tf.getBackend(),
      modelSize: this.model ? this.model.countParams() : undefined,
      inputShape: this.model ? this.model.inputs[0].shape as number[] : undefined
    };
  }

  // Method to check if the image has good quality for analysis
  async checkImageQuality(imageElement: HTMLImageElement): Promise<{
    isGoodQuality: boolean;
    suggestions: string[];
  }> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    ctx.drawImage(imageElement, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Calculate average brightness
    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      totalBrightness += (r + g + b) / 3;
    }
    const avgBrightness = totalBrightness / (data.length / 4);
    
    const suggestions: string[] = [];
    let isGoodQuality = true;
    
    // Check if image is too dark
    if (avgBrightness < 50) {
      isGoodQuality = false;
      suggestions.push('Image appears too dark. Try better lighting.');
    }
    
    // Check if image is too bright (overexposed)
    if (avgBrightness > 200) {
      isGoodQuality = false;
      suggestions.push('Image appears overexposed. Reduce direct lighting.');
    }
    
    // Check image resolution
    if (imageElement.width < 200 || imageElement.height < 200) {
      isGoodQuality = false;
      suggestions.push('Image resolution is too low. Move closer to the leaf.');
    }
    
    if (isGoodQuality) {
      suggestions.push('Image quality is good for analysis.');
    }
    
    return { isGoodQuality, suggestions };
  }

  // Cleanup method to dispose of the model
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isLoaded = false;
      this.loadingPromise = null;
    }
  }
}

// Export singleton instance
export const leafValidator = new LeafValidatorModel();

// Utility function to convert image source to HTMLImageElement
export const createImageElement = (imageSrc: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });
};
