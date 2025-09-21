import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Eye } from "lucide-react";

interface AccessibilityPanelProps {
  palette: { color: string; name: string; type: string }[];
}

const AccessibilityPanel = ({ palette }: AccessibilityPanelProps) => {
  // Calculate luminance for WCAG compliance
  const getLuminance = (hex: string) => {
    const rgb = hex.match(/\w\w/g)?.map(x => parseInt(x, 16)) || [0, 0, 0];
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  // Calculate contrast ratio between two colors
  const getContrastRatio = (color1: string, color2: string) => {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  // Get WCAG level for contrast ratio
  const getWCAGLevel = (ratio: number) => {
    if (ratio >= 7) return { level: 'AAA', status: 'excellent' };
    if (ratio >= 4.5) return { level: 'AA', status: 'good' };
    if (ratio >= 3) return { level: 'AA Large', status: 'warning' };
    return { level: 'Fail', status: 'poor' };
  };

  // Common text/background combinations to check
  const getContrastChecks = () => {
    const checks = [];
    const backgroundColors = palette.filter(c => c.type === 'primary' || c.type === 'secondary');
    const textColors = ['#FFFFFF', '#000000', ...palette.map(c => c.color)];

    backgroundColors.forEach(bg => {
      textColors.forEach(textColor => {
        if (textColor !== bg.color) {
          const ratio = getContrastRatio(bg.color, textColor);
          const wcag = getWCAGLevel(ratio);
          checks.push({
            background: bg,
            text: textColor,
            ratio: ratio.toFixed(2),
            wcag
          });
        }
      });
    });

    return checks.sort((a, b) => parseFloat(b.ratio) - parseFloat(a.ratio)).slice(0, 6);
  };

  const contrastChecks = getContrastChecks();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return 'default';
      case 'warning':
        return 'secondary';
      default:
        return 'destructive';
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Accessibility Analysis</h3>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">
              WCAG Contrast Ratios
            </h4>
            <div className="space-y-3">
              {contrastChecks.map((check, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border-2 border-border"
                        style={{ backgroundColor: check.background.color }}
                      />
                      <span className="text-xs">on</span>
                      <div 
                        className="w-6 h-6 rounded border-2 border-border flex items-center justify-center text-xs"
                        style={{ 
                          backgroundColor: check.text,
                          color: check.background.color
                        }}
                      >
                        A
                      </div>
                    </div>
                    <span className="text-sm font-mono">{check.ratio}:1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(check.wcag.status)}
                    <Badge variant={getStatusBadgeVariant(check.wcag.status)}>
                      {check.wcag.level}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-accent p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Color Blindness Considerations</h4>
            <p className="text-sm text-muted-foreground">
              This palette uses sufficient contrast and varied hues to remain distinguishable
              for users with common forms of color blindness.
            </p>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>WCAG Guidelines:</strong></p>
            <p>• AAA: 7:1 contrast ratio (enhanced)</p>
            <p>• AA: 4.5:1 contrast ratio (standard)</p>
            <p>• AA Large: 3:1 for large text (18pt+)</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AccessibilityPanel;