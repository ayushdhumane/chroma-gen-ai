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

// NOTE: Replace 'YOUR_GEMINI_API_KEY' with your actual key from a secure source like an environment variable.
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY; 

const PaletteGenerator = ({ onGenerate }: PaletteGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // The mock data is still useful for the random button.
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

    if (!GEMINI_API_KEY) {
      toast({
        title: "API Key Not Found",
        description: "Please set your Gemini API key in the environment variables.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const structuredPrompt = `Generate a color palette based on the following description. The palette must contain exactly 6 colors. For each color, provide a hex code, a name, and a type which must be one of 'primary', 'secondary', or 'accent'. Return the result as a single JSON object with a 'palette' key, and do not include any other text or explanation.

Description: ${prompt}

JSON format example:
{
  "palette": [
    { "color": "#000000", "name": "Dark Black", "type": "primary" },
    { "color": "#FFFFFF", "name": "Pure White", "type": "primary" },
    { "color": "#FF0000", "name": "Vivid Red", "type": "secondary" },
    { "color": "#00FF00", "name": "Vivid Green", "type": "secondary" },
    { "color": "#0000FF", "name": "Bright Blue", "type": "accent" },
    { "color": "#FFFF00", "name": "Bright Yellow", "type": "accent" }
  ]
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${AIzaSyBq2llYQ-DlBmzb42afjyHAmEw9JZhhuPo}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: structuredPrompt }],
            }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      const rawText = data.candidates[0].content.parts[0].text;
      const jsonStart = rawText.indexOf('{');
      const jsonEnd = rawText.lastIndexOf('}') + 1;
      const jsonString = rawText.substring(jsonStart, jsonEnd);
      
      const parsedData = JSON.parse(jsonString);
      const generatedPalette = parsedData.palette;

      if (!generatedPalette || generatedPalette.length === 0) {
        throw new Error("Could not extract a valid palette from the response.");
      }

      onGenerate(generatedPalette);
      
      toast({
        title: "Palette Generated!",
        description: "A new color palette has been created using Google's Gemini.",
      });
    } catch (error: any) {
      console.error("LLM API call failed:", error);
      toast({
        title: "Generation Failed",
        description: `There was an error generating the palette: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRandomPalette = async () => {
    setIsGenerating(true);
    
    // Simulate generation with existing mock data
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
