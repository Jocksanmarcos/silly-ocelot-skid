import { PageElement } from "@/pages/EditorPage";
import { cn } from "@/lib/utils";

interface CanvasProps {
  elements: PageElement[];
  selectedElementId: number | null;
  onSelectElement: (id: number) => void;
}

const Canvas = ({ elements, selectedElementId, onSelectElement }: CanvasProps) => {
  return (
    <div className="bg-white dark:bg-gray-950 p-8 shadow-lg rounded-lg w-full max-w-4xl mx-auto h-full">
      {elements.map(element => {
        const isSelected = element.id === selectedElementId;
        const commonProps = {
          key: element.id,
          onClick: () => onSelectElement(element.id),
          className: cn(
            "cursor-pointer transition-all p-2 rounded",
            isSelected ? "ring-2 ring-blue-500" : "hover:bg-blue-50 dark:hover:bg-blue-950/50"
          ),
        };

        switch (element.type) {
          case 'heading':
            return <h1 {...commonProps} className={cn(commonProps.className, "text-4xl font-bold")}>{element.content}</h1>;
          case 'paragraph':
            return <p {...commonProps} className={cn(commonProps.className, "text-base mt-4")}>{element.content}</p>;
          default:
            return null;
        }
      })}
    </div>
  );
};

export default Canvas;