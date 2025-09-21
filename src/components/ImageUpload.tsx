import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ColorThief from "colorthief";

interface ImageUploadProps {
  onColorsExtracted: (colors: { color: string; name: string; type: 'primary' | 'secondary' | 'accent' }[]) => void;
  disabled?: boolean;
}

const ImageUpload = ({ onColorsExtracted, disabled = false }: ImageUploadProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const generateColorName = (rgb: number[]): string => {
    const [r, g, b] = rgb;
    
    // Simple color naming based on RGB values
    if (r > 200 && g > 200 && b > 200) return "Light Gray";
    if (r < 50 && g < 50 && b < 50) return "Dark Gray";
    
    if (r > g && r > b) {
      if (g > 100) return "Orange";
      return "Red";
    } else if (g > r && g > b) {
      if (r > 100) return "Yellow";
      return "Green";
    } else if (b > r && b > g) {
      if (r > 100) return "Purple";
      return "Blue";
    }
    
    return "Mixed";
  };

  const extractColorsFromImage = useCallback(async (file: File) => {
    setIsExtracting(true);
    
    try {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const colorThief = new ColorThief();
        const dominantColors = colorThief.getPalette(img, 6);
        
        const extractedColors = dominantColors.map((rgb: number[], index: number) => {
          const [r, g, b] = rgb;
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
          const name = generateColorName(rgb);
          
          const types: ('primary' | 'secondary' | 'accent')[] = ['primary', 'secondary', 'accent'];
          const type = types[index % 3];
          
          return {
            color: hex,
            name: `${name} ${index + 1}`,
            type
          };
        });
        
        onColorsExtracted(extractedColors);
        setIsExtracting(false);
        
        toast({
          title: "Colors Extracted!",
          description: `Found ${extractedColors.length} dominant colors from your image`,
        });
      };
      
      img.src = URL.createObjectURL(file);
      setUploadedImage(img.src);
    } catch (error) {
      console.error('Error extracting colors:', error);
      toast({
        title: "Error",
        description: "Failed to extract colors from image",
        variant: "destructive",
      });
      setIsExtracting(false);
    }
  }, [onColorsExtracted]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }
    
    extractColorsFromImage(file);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Extract Colors from Image</span>
          </div>
          {uploadedImage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearImage}
              disabled={disabled || isExtracting}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {uploadedImage ? (
          <div className="space-y-3">
            <div className="relative">
              <img
                src={uploadedImage}
                alt="Uploaded"
                className="w-full h-32 object-cover rounded-lg border"
              />
              {isExtracting && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-white text-sm">Extracting colors...</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            className={`
              border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
              ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !disabled && document.getElementById('image-upload')?.click()}
          >
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              disabled={disabled}
            />
            
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Click to upload</span> or drag and drop
              </div>
              <div className="text-xs text-muted-foreground">
                PNG, JPG, WebP up to 10MB
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ImageUpload;