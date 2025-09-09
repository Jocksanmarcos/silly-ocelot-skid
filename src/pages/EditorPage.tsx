import { useState } from 'react';
import Canvas from '@/components/editor/Canvas';
import PropertiesPanel from '@/components/editor/PropertiesPanel';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Definindo a estrutura de um elemento da página
export type PageElement = {
  id: number;
  type: 'heading' | 'paragraph';
  content: string;
};

// Conteúdo inicial de exemplo para a página
const initialElements: PageElement[] = [
  { id: 1, type: 'heading', content: 'Bem-vindo ao Seu Novo Site' },
  { id: 2, type: 'paragraph', content: 'Este é um parágrafo que você pode editar. Clique em qualquer texto para começar a personalizá-lo usando o painel à esquerda.' },
];

const EditorPage = () => {
  const [elements, setElements] = useState<PageElement[]>(initialElements);
  const [selectedElementId, setSelectedElementId] = useState<number | null>(null);

  const handleUpdateElement = (id: number, newContent: string) => {
    setElements(prevElements =>
      prevElements.map(el =>
        el.id === id ? { ...el, content: newContent } : el
      )
    );
  };

  const selectedElement = elements.find(el => el.id === selectedElementId) || null;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <PropertiesPanel
        element={selectedElement}
        onUpdateElement={handleUpdateElement}
      />
      <main className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-800 border-b p-2 flex justify-end">
            <Button asChild>
                <Link to="/">Voltar para o Site</Link>
            </Button>
        </header>
        <div className="flex-1 p-8 overflow-auto">
          <Canvas
            elements={elements}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
          />
        </div>
      </main>
    </div>
  );
};

export default EditorPage;