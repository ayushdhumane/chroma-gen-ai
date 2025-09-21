import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, Download, Shuffle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ImageUpload from "./ImageUpload";

interface PaletteGeneratorProps {
  onGenerate: (palette: { color: string; name: string; type: 'primary' | 'secondary' | 'accent' }[]) => void;
}

const PaletteGenerator = ({ onGenerate }: PaletteGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Sample palettes for demonstration
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
    }
  ];

  const samplePrompts = [
    "An energetic palette for a fitness brand inspired by a tropical sunset",
    "Calming colors for a meditation app with ocean vibes",
    "Bold and modern palette for a tech startup",
    "Warm and cozy colors for a coffee shop brand",
    "Professional palette for a financial services company"
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

  try {
    const res = await fetch("http://localhost:8000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) throw new Error("API error");

    const data = await res.json();
    onGenerate(data.colors);

    toast({
      title: "Palette Generated!",
      description: `Created a beautiful ${data.name.toLowerCase()} palette`,
    });
  } catch (err) {
    toast({
      title: "Error",
      description: "Failed to generate palette. Please try again.",
      variant: "destructive",
    });
  }

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

        <div className="border-t pt-4 space-y-4">
          <ImageUpload onColorsExtracted={onGenerate} />
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