import { useState } from "react";
import PaletteGenerator from "@/components/PaletteGenerator";
import ColorCard from "@/components/ColorCard";
import AccessibilityPanel from "@/components/AccessibilityPanel";
import { Button } from "@/components/ui/button";
import { Download, Share2, Github } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [currentPalette, setCurrentPalette] = useState<
    { color: string; name: string; type: 'primary' | 'secondary' | 'accent' }[]
  >([]);

  const handlePaletteGenerated = (palette: { color: string; name: string; type: 'primary' | 'secondary' | 'accent' }[]) => {
    setCurrentPalette(palette);
  };

  const exportPalette = () => {
    if (currentPalette.length === 0) {
      toast({
        title: "No palette to export",
        description: "Generate a palette first",
        variant: "destructive",
      });
      return;
    }

    const paletteData = {
      palette: currentPalette,
      exported: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(paletteData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chromagen-palette.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Palette exported!",
      description: "JSON file downloaded successfully",
    });
  };

  const sharePalette = async () => {
    if (currentPalette.length === 0) {
      toast({
        title: "No palette to share",
        description: "Generate a palette first",
        variant: "destructive",
      });
      return;
    }

    const shareText = `Check out this beautiful color palette I generated with ChromaGen:\n\n${currentPalette
      .map(color => `${color.name}: ${color.color}`)
      .join('\n')}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ChromaGen Color Palette',
          text: shareText,
        });
      } catch (err) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to clipboard!",
          description: "Share your palette anywhere",
        });
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard!",
        description: "Share your palette anywhere",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                ChromaGen
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              AI-powered generative palettes for designers. Create beautiful, accessible color schemes 
              that meet WCAG standards with natural language prompts.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generator Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <PaletteGenerator onGenerate={handlePaletteGenerated} />
              
              {currentPalette.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={exportPalette}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button
                      variant="outline"
                      onClick={sharePalette}
                      className="flex-1"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2 space-y-8">
            {currentPalette.length > 0 ? (
              <>
                {/* Color Cards Grid */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Generated Palette</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {currentPalette.map((color, index) => (
                      <div key={index} className="animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                        <ColorCard
                          color={color.color}
                          name={color.name}
                          type={color.type}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accessibility Panel */}
                <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
                  <AccessibilityPanel palette={currentPalette} />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4 animate-fade-in">
                  <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full opacity-20"></div>
                  <h3 className="text-xl font-semibold text-muted-foreground">
                    Ready to create amazing palettes?
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Enter a description of your ideal color palette and let AI generate 
                    beautiful, accessible color schemes for your next project.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border text-center">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              <span>Open Source</span>
            </div>
            <span>•</span>
            <span>Built with AI</span>
            <span>•</span>
            <span>WCAG Compliant</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;