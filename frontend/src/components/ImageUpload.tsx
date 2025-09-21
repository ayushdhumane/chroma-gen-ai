import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onColorsExtracted: (palette: { color: string; name: string; type: 'primary' | 'secondary' | 'accent' }[]) => void;
}

// Color extraction function using canvas
const extractDominantColors = (imageElement: HTMLImageElement): Promise<{ color: string; name: string; type: 'primary' | 'secondary' | 'accent' }[]> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      resolve([]);
      return;
    }

    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    ctx.drawImage(imageElement, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Sample colors from the image
    const colorMap = new Map<string, number>();
    const step = 4; // Sample every nth pixel for performance
    
    for (let i = 0; i < data.length; i += step * 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = data[i + 3];
      
      // Skip transparent or very light/dark pixels
      if (alpha < 128 || (r + g + b) < 50 || (r + g + b) > 700) continue;
      
      // Round colors to reduce variations
      const roundedR = Math.round(r / 15) * 15;
      const roundedG = Math.round(g / 15) * 15;
      const roundedB = Math.round(b / 15) * 15;
      
      const colorKey = `${roundedR},${roundedG},${roundedB}`;
      colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
    }

    // Sort colors by frequency and get top 6
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    // Convert to hex and create color objects
    const palette = sortedColors.map((colorData, index) => {
      const [r, g, b] = colorData[0].split(',').map(Number);
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      
      // Generate color names based on HSL
      const colorName = generateColorName(r, g, b);
      
      // Assign types
      const type = index < 2 ? 'primary' : index < 4 ? 'secondary' : 'accent';
      
      return {
        color: hex,
        name: colorName,
        type: type as 'primary' | 'secondary' | 'accent'
      };
    });

    resolve(palette);
  });
};

const generateColorName = (r: number, g: number, b: number): string => {
  // Convert RGB to HSL for better color naming
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const diff = max - min;
  
  let hue = 0;
  if (diff !== 0) {
    if (max === rNorm) {
      hue = ((gNorm - bNorm) / diff) % 6;
    } else if (max === gNorm) {
      hue = (bNorm - rNorm) / diff + 2;
    } else {
      hue = (rNorm - gNorm) / diff + 4;
    }
  }
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;
  
  const lightness = (max + min) / 2;
  const saturation = diff === 0 ? 0 : diff / (1 - Math.abs(2 * lightness - 1));
  
  // Generate names based on hue ranges
  if (saturation < 0.2) {
    if (lightness < 0.3) return "Charcoal";
    if (lightness < 0.6) return "Gray";
    return "Light Gray";
  }
  
  if (hue < 15 || hue >= 345) return "Red";
  if (hue < 45) return "Orange";
  if (hue < 75) return "Yellow";
  if (hue < 135) return "Green";
  if (hue < 195) return "Cyan";
  if (hue < 255) return "Blue";
  if (hue < 285) return "Purple";
  if (hue < 315) return "Magenta";
  return "Pink";
};

const ImageUpload = ({ onColorsExtracted }: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create image URL for preview
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);

      // Load image for color extraction
      const img = new Image();
      img.onload = async () => {
        try {
          const colors = await extractDominantColors(img);
          onColorsExtracted(colors);
          
          toast({
            title: "Colors extracted!",
            description: `Found ${colors.length} dominant colors from your image`,
          });
        } catch (error) {
          toast({
            title: "Error extracting colors",
            description: "Failed to analyze the image colors",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      };
      
      img.onerror = () => {
        toast({
          title: "Error loading image",
          description: "Failed to load the uploaded image",
          variant: "destructive",
        });
        setIsProcessing(false);
      };
      
      img.src = imageUrl;
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to process the uploaded image",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Extract from Image</h3>
          {uploadedImage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearImage}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {uploadedImage ? (
          <div className="space-y-3">
            <div className="relative rounded-lg overflow-hidden">
              <img 
                src={uploadedImage} 
                alt="Uploaded" 
                className="w-full h-32 object-cover"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-sm">Extracting colors...</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
              }
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {isProcessing ? 'Processing...' : 'Drop an image here'}
                </p>
                <p className="text-xs text-muted-foreground">
                  or click to browse
                </p>
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />

        {!uploadedImage && (
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            Choose Image
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ImageUpload;