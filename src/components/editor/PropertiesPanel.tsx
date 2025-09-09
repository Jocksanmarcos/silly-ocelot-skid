import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageElement } from "@/pages/EditorPage";

interface PropertiesPanelProps {
  element: PageElement | null;
  onUpdateElement: (id: number, newContent: string) => void;
}

const PropertiesPanel = ({ element, onUpdateElement }: PropertiesPanelProps) => {
  return (
    <aside className="w-80 bg-white dark:bg-gray-800 border-r p-4 space-y-6">
      <h2 className="text-xl font-bold">Propriedades</h2>
      
      {element ? (
        <div>
          <h3 className="font-semibold capitalize mb-4">Editar {element.type === 'heading' ? 'Título' : 'Parágrafo'}</h3>
          <div className="space-y-2">
            <Label htmlFor="content">Texto</Label>
            <Textarea
              id="content"
              value={element.content}
              onChange={(e) => onUpdateElement(element.id, e.target.value)}
              className="min-h-[150px]"
            />
          </div>
        </div>
      ) : (
        <div className="text-center text-sm text-muted-foreground mt-10">
          <p>Selecione um elemento na tela para começar a editar.</p>
        </div>
      )}
    </aside>
  );
};

export default PropertiesPanel;