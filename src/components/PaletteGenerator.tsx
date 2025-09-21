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

  // The mock data is no longer needed for AI generation, but we'll keep a few for the random button
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

  // Helper function to call the LLM API
  const callLlmApi = async (textPrompt: string) => {
    // --- THIS IS THE KEY CHANGE ---
    // You would replace this with your actual LLM API call.
    // The prompt is engineered to ask for a JSON object.
    const structuredPrompt = `Generate a color palette based on the following description. The palette must contain exactly 6 colors. For each color, provide a hex code, a name, and a type which must be one of 'primary', 'secondary', or 'accent'. Return the result as a single JSON object with a 'palette' key, and do not include any other text or explanation.

Description: ${textPrompt}

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
}

JSON Response:`;

    // In a real application, you would use a library like 'axios' or 'fetch'
    // and make sure to handle your API key securely (e.g., via environment variables).
    try {
      // NOTE: Replace this mock LLM response with a real API call
      // For example, with the Gemini API:
      // const response = await fetch('YOUR_GEMINI_API_ENDPOINT', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer YOUR_API_KEY`,
      //   },
      //   body: JSON.stringify({
      //     prompt: structuredPrompt,
      //     // Add other model parameters like max tokens, temperature, etc.
      //   }),
      // });
      // const data = await response.json();
      //
      // The LLM response would need to be parsed to find the JSON string.
      // Let's assume the LLM's text output is just the JSON string.

      // For this example, we'll simulate the response.
      // We'll use a mock API endpoint.
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          const mockLlmResponse = {
            palette: [
              { color: "#36454F", name: "Charcoal Grey", type: "primary" },
              { color: "#1E88E5", name: "Ocean Blue", type: "primary" },
              { color: "#FFD700", name: "Bright Gold", type: "secondary" },
              { color: "#F08080", name: "Light Coral", type: "secondary" },
              { color: "#4ECDC4", name: "Turquoise Accent", type: "accent" },
              { color: "#C0C0C0", name: "Silver Grey", type: "accent" },
            ],
          };
          resolve({
            ok: true,
            json: () => Promise.resolve(mockLlmResponse),
          });
        }, 2000); // Simulate API call delay
      });

      const data = await (response as any).json();
      return data.palette;

    } catch (error) {
      console.error("LLM API call failed:", error);
      throw new Error("Failed to generate palette from LLM.");
    }
  };


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
      const generatedPalette = await callLlmApi(prompt);
      onGenerate(generatedPalette);
      toast({
        title: "Palette Generated!",
        description: "A new color palette has been created using AI.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was an error generating the palette. Please try again.",
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
