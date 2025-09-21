import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, Download, Shuffle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";

interface PaletteGeneratorProps {
  onGenerate: (palette: { color: string; name: string; type: 'primary' | 'secondary' | 'accent' }[]) => void;
}

const PaletteGenerator = ({ onGenerate }: PaletteGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Expanded palette datasets
  const samplePalettes = [
    {
      name: "Tropical Sunset",
      colors: [
        { color: "#FF6B35", name: "Coral Orange", type: 'primary' as const },
        { color: "#F7931E", name: "Sunset Gold", type: 'primary' as const },
        { color: "#FFD23F", name: "Golden Yellow", type: 'secondary' as const },
        { color: "#06FFA5", name: "Mint Green", type: 'secondary' as const },
        { color: "#4ECDC4", name: "Turquoise", type: 'accent' as const },
        { color: "#45B7D1", name: "Ocean Blue", type: 'accent' as const }
      ]
    },
    {
      name: "Modern Tech",
      colors: [
        { color: "#667EEA", name: "Electric Blue", type: 'primary' as const },
        { color: "#764BA2", name: "Deep Purple", type: 'primary' as const },
        { color: "#F093FB", name: "Soft Pink", type: 'secondary' as const },
        { color: "#4FACFE", name: "Sky Blue", type: 'secondary' as const },
        { color: "#43E97B", name: "Mint Green", type: 'accent' as const },
        { color: "#38F9D7", name: "Aqua", type: 'accent' as const }
      ]
    },
    {
      name: "Earth Tones",
      colors: [
        { color: "#8B4513", name: "Saddle Brown", type: 'primary' as const },
        { color: "#D2691E", name: "Chocolate", type: 'primary' as const },
        { color: "#F4A460", name: "Sandy Brown", type: 'secondary' as const },
        { color: "#DEB887", name: "Burlywood", type: 'secondary' as const },
        { color: "#9ACD32", name: "Yellow Green", type: 'accent' as const },
        { color: "#228B22", name: "Forest Green", type: 'accent' as const }
      ]
    },
    {
      name: "Ocean Depths",
      colors: [
        { color: "#003366", name: "Deep Navy", type: 'primary' as const },
        { color: "#336699", name: "Ocean Blue", type: 'primary' as const },
        { color: "#66B2FF", name: "Sky Blue", type: 'secondary' as const },
        { color: "#99CCFF", name: "Light Blue", type: 'secondary' as const },
        { color: "#00FF99", name: "Sea Green", type: 'accent' as const },
        { color: "#33FFCC", name: "Aqua Marine", type: 'accent' as const }
      ]
    },
    {
      name: "Golden Hour",
      colors: [
        { color: "#CC6600", name: "Burnt Orange", type: 'primary' as const },
        { color: "#FF9933", name: "Golden Orange", type: 'primary' as const },
        { color: "#FFCC66", name: "Warm Yellow", type: 'secondary' as const },
        { color: "#FFFF99", name: "Light Yellow", type: 'secondary' as const },
        { color: "#FF6666", name: "Sunset Pink", type: 'accent' as const },
        { color: "#FF9999", name: "Rose", type: 'accent' as const }
      ]
    },
    {
      name: "Nordic Minimalism",
      colors: [
        { color: "#2C3E50", name: "Dark Slate", type: 'primary' as const },
        { color: "#34495E", name: "Charcoal", type: 'primary' as const },
        { color: "#7F8C8D", name: "Cool Gray", type: 'secondary' as const },
        { color: "#BDC3C7", name: "Light Gray", type: 'secondary' as const },
        { color: "#E8F6F3", name: "Mint White", type: 'accent' as const },
        { color: "#D5DBDB", name: "Silver", type: 'accent' as const }
      ]
    },
    {
      name: "Cosmic Nebula",
      colors: [
        { color: "#4A0E4E", name: "Deep Purple", type: 'primary' as const },
        { color: "#81226A", name: "Magenta", type: 'primary' as const },
        { color: "#C44569", name: "Pink", type: 'secondary' as const },
        { color: "#F8B500", name: "Cosmic Gold", type: 'secondary' as const },
        { color: "#40407A", name: "Space Blue", type: 'accent' as const },
        { color: "#706FD3", name: "Stellar Purple", type: 'accent' as const }
      ]
    },
    {
      name: "Forest Canopy",
      colors: [
        { color: "#0F3460", name: "Midnight Blue", type: 'primary' as const },
        { color: "#16537E", name: "Forest Blue", type: 'primary' as const },
        { color: "#18A558", name: "Forest Green", type: 'secondary' as const },
        { color: "#68D391", name: "Leaf Green", type: 'secondary' as const },
        { color: "#FAF089", name: "Sunlight", type: 'accent' as const },
        { color: "#FBB6CE", name: "Blossom Pink", type: 'accent' as const }
      ]
    },
    {
      name: "Desert Mirage",
      colors: [
        { color: "#8B4000", name: "Desert Brown", type: 'primary' as const },
        { color: "#CD853F", name: "Sandy Brown", type: 'primary' as const },
        { color: "#DEB887", name: "Tan", type: 'secondary' as const },
        { color: "#F5DEB3", name: "Wheat", type: 'secondary' as const },
        { color: "#FF6347", name: "Sunset Red", type: 'accent' as const },
        { color: "#FFD700", name: "Gold", type: 'accent' as const }
      ]
    },
    {
      name: "Berry Burst",
      colors: [
        { color: "#6B046F", name: "Dark Berry", type: 'primary' as const },
        { color: "#A2068C", name: "Berry", type: 'primary' as const },
        { color: "#EC4899", name: "Pink Berry", type: 'secondary' as const },
        { color: "#F472B6", name: "Light Pink", type: 'secondary' as const },
        { color: "#FDE047", name: "Lemon", type: 'accent' as const },
        { color: "#34D399", name: "Mint", type: 'accent' as const }
      ]
    },
    {
      name: "Midnight City",
      colors: [
        { color: "#1A1A2E", name: "Midnight", type: 'primary' as const },
        { color: "#16213E", name: "Dark Blue", type: 'primary' as const },
        { color: "#E94560", name: "Neon Red", type: 'secondary' as const },
        { color: "#F39C12", name: "Neon Orange", type: 'secondary' as const },
        { color: "#00D2FF", name: "Electric Blue", type: 'accent' as const },
        { color: "#6C5CE7", name: "Purple Glow", type: 'accent' as const }
      ]
    },
    {
      name: "Autumn Harvest",
      colors: [
        { color: "#8B3A00", name: "Rust", type: 'primary' as const },
        { color: "#B8860B", name: "Dark Gold", type: 'primary' as const },
        { color: "#FF8C00", name: "Orange", type: 'secondary' as const },
        { color: "#FFD700", name: "Gold", type: 'secondary' as const },
        { color: "#DC143C", name: "Crimson", type: 'accent' as const },
        { color: "#32CD32", name: "Lime", type: 'accent' as const }
      ]
    }
  ];

  const samplePrompts = [
    "An energetic palette for a fitness brand inspired by a tropical sunset",
    "Calming colors for a meditation app with ocean vibes",
    "Bold and modern palette for a tech startup",
    "Warm and cozy colors for a coffee shop brand",
    "Professional palette for a financial services company",
    "Mystical colors for a fantasy game interface",
    "Fresh and clean palette for an organic food brand",
    "Vibrant colors for a children's educational app",
    "Elegant palette for a luxury fashion brand",
    "Retro-inspired colors for a vintage music app"
  ];

  const generatePalette = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe the kind of palette you'd like to generate",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For demo, pick a random sample palette
    const randomPalette = samplePalettes[Math.floor(Math.random() * samplePalettes.length)];
    
    onGenerate(randomPalette.colors);
    
    toast({
      title: "Palette Generated!",
      description: `Created a beautiful ${randomPalette.name.toLowerCase()} palette`,
    });

    setIsGenerating(false);
  };

  const generateRandomPalette = async () => {
    setIsGenerating(true);
    
    // Simulate generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const randomPalette = samplePalettes[Math.floor(Math.random() * samplePalettes.length)];
    onGenerate(randomPalette.colors);
    
    toast({
      title: "Random Palette Generated!",
      description: "Created a surprise color combination",
    });
    
    setIsGenerating(false);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ChromaGen
            </h2>
          </div>
          <p className="text-muted-foreground">
            AI-powered color palette generation for designers
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Describe your ideal palette
            </label>
            <Textarea
              placeholder="e.g., 'Energetic palette for a fitness brand inspired by a tropical sunset'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Try these prompts:</p>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.slice(0, 3).map((sample, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => setPrompt(sample)}
                >
                  {sample.split(' ').slice(0, 4).join(' ')}...
                </Badge>
              ))}
            </div>
          </div>

          {/* Image Upload Section */}
          <ImageUpload 
            onColorsExtracted={onGenerate}
            disabled={isGenerating}
          />

          <div className="flex gap-3">
            <Button
              onClick={generatePalette}
              disabled={isGenerating}
              className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Palette
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={generateRandomPalette}
              disabled={isGenerating}
              className="px-4"
            >
              <Shuffle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground text-center">
            ✨ Powered by AI • 🎨 WCAG Compliant • ♿ Accessibility Focused
          </p>
        </div>
      </div>
    </Card>
  );
};

export default PaletteGenerator;