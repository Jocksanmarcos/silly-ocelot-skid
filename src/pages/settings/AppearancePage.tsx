import { useTheme } from "@/contexts/ThemeProvider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const AppearancePage = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Aparência</h3>
        <p className="text-sm text-muted-foreground">
          Personalize a aparência da plataforma.
        </p>
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Tema</h4>
        <RadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value as any)}
          className="space-y-2"
        >
          <Label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="light" />
            Claro
          </Label>
          <Label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="dark" />
            Escuro
          </Label>
          <Label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="system" />
            Padrão do Sistema
          </Label>
        </RadioGroup>
      </div>
    </div>
  );
};

export default AppearancePage;