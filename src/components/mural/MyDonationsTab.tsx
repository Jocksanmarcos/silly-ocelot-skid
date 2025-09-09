import { GenerosityItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "../ui/badge";

interface MyDonationsTabProps {
  items: GenerosityItem[];
  onEdit: (item: GenerosityItem) => void;
  onDelete: (item: GenerosityItem) => void;
  onStatusChange: (itemId: string, status: GenerosityItem['status']) => void;
}

const MyDonationsTab = ({ items, onEdit, onDelete, onStatusChange }: MyDonationsTabProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Você ainda não ofereceu nenhuma doação.</p>
        <p className="text-sm text-muted-foreground">Clique em "Oferecer Doação" para começar.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="font-medium">{item.title}</div>
                {item.status === 'Reservado' && (
                  <div className="text-xs text-muted-foreground mt-1">
                    <p><strong>Interessado(a):</strong> {item.reserved_by?.full_name}</p>
                    <p><strong>Contato:</strong> {item.requester_contact}</p>
                  </div>
                )}
              </TableCell>
              <TableCell><Badge variant="secondary">{item.category}</Badge></TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onEdit(item)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(item)}>Excluir</DropdownMenuItem>
                    <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onStatusChange(item.id, 'Disponível')} disabled={item.status === 'Disponível'}>
                      Marcar como Disponível
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange(item.id, 'Doado')} disabled={item.status === 'Doado'}>
                      Marcar como Doado
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MyDonationsTab;