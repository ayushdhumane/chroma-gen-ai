import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ColorCardProps {
  color: string;
  name: string;
  type: 'primary' | 'secondary' | 'accent';
}

const ColorCard = ({ color, name, type }: ColorCardProps) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Convert hex to RGB and HSL
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return { r, g, b };
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;

  const colorFormats = {
    hex: color.toUpperCase(),
    rgb: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '',
    hsl: hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : ''
  };

  const copyToClipboard = async (format: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedCode(format);
      setTimeout(() => setCopiedCode(null), 1500);
      toast({
        title: "Copied to clipboard",
        description: `${format.toUpperCase()}: ${value}`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const typeLabels = {
    primary: 'Primary',
    secondary: 'Secondary', 
    accent: 'Accent'
  };

  const getTextColor = () => {
    if (!rgb) return '#000000';
    
    // Calculate luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-medium group">
      <div 
        className="h-32 w-full relative transition-all duration-300 group-hover:h-36"
        style={{ backgroundColor: color }}
      >
        <div 
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ color: getTextColor() }}
        >
          <span className="text-sm font-medium">{typeLabels[type]}</span>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground">{name}</h3>
          <span className="text-xs px-2 py-1 bg-accent rounded-full text-accent-foreground">
            {typeLabels[type]}
          </span>
        </div>
        
        <div className="space-y-2">
          {Object.entries(colorFormats).map(([format, value]) => (
            <div key={format} className="flex items-center justify-between bg-muted rounded-md p-2">
              <div className="flex-1">
                <span className="text-xs text-muted-foreground uppercase font-medium">
                  {format}
                </span>
                <p className="text-sm font-mono text-foreground">{value}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(format, value)}
                className="h-8 w-8 p-0 hover:bg-background"
              >
                {copiedCode === format ? (
                  <Check className="h-3 w-3 text-primary" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ColorCard;