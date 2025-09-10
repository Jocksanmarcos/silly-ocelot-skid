import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types";
import { EventFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Users } from "lucide-react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { showSuccess, showError } from "@/utils/toast";
import EventForm from "@/components/events/EventForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const fetchEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

interface DataTableProps {
  columns: ColumnDef<Event>[];
  data: Event[];
}

function EventsDataTable({ columns, data }: DataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum evento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Próximo
        </Button>
      </div>
    </div>
  );
}

const EventsPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const mutation = useMutation({
    mutationFn: async (formData: { event: EventFormValues; id?: string }) => {
      const { event, id } = formData;
      const { image_file, gallery_files, ...eventData } = event;

      let imageUrl = selectedEvent?.image_url;
      let galleryUrls = selectedEvent?.gallery_urls || [];

      if (image_file?.[0]) {
        const file = image_file[0];
        const fileExt = file.name.split('.').pop();
        const filePath = `public/${id || crypto.randomUUID()}/cover.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('event_images').upload(filePath, file, { upsert: true });
        if (uploadError) throw new Error(`Upload da imagem principal falhou: ${uploadError.message}`);
        const { data: { publicUrl } } = supabase.storage.from('event_images').getPublicUrl(filePath);
        imageUrl = `${publicUrl}?t=${new Date().getTime()}`;
      }

      if (gallery_files && gallery_files.length > 0) {
        const uploadPromises = Array.from(gallery_files).map(async (file: any, index: number) => {
          const fileExt = file.name.split('.').pop();
          const filePath = `public/${id || crypto.randomUUID()}/gallery_${index}_${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('event_images').upload(filePath, file);
          if (uploadError) throw new Error(`Upload da galeria falhou: ${uploadError.message}`);
          const { data: { publicUrl } } = supabase.storage.from('event_images').getPublicUrl(filePath);
          return `${publicUrl}?t=${new Date().getTime()}`;
        });
        galleryUrls = await Promise.all(uploadPromises);
      }

      const submissionData = { ...eventData, image_url: imageUrl, gallery_urls: galleryUrls };

      const { error } = id
        ? await supabase.from("events").update(submissionData).eq("id", id)
        : await supabase.from("events").insert(submissionData);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      showSuccess(`Evento ${selectedEvent ? 'atualizado' : 'criado'} com sucesso!`);
      setIsDialogOpen(false);
      setSelectedEvent(null);
    },
    onError: (error) => {
      showError(`Erro: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      showSuccess("Evento removido com sucesso!");
      setIsAlertOpen(false);
      setSelectedEvent(null);
    },
    onError: (error) => {
      showError(`Erro: ${error.message}`);
    },
  });

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const handleDelete = (event: Event) => {
    setSelectedEvent(event);
    setIsAlertOpen(true);
  };

  const columns: ColumnDef<Event>[] = [
    { accessorKey: "title", header: "Título" },
    {
      accessorKey: "event_date",
      header: "Data",
      cell: ({ row }) => new Date(row.original.event_date).toLocaleString('pt-BR', { timeZone: 'UTC' }),
    },
    {
      accessorKey: "price",
      header: "Preço",
      cell: ({ row }) => `R$ ${row.original.price?.toFixed(2).replace('.', ',') || '0,00'}`,
    },
    { accessorKey: "capacity", header: "Capacidade" },
    { accessorKey: "type", header: "Tipo" },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to={`/dashboard/events/${row.original.id}/registrations`} className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Ver Inscrições
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>Editar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(row.original)} className="text-red-600">
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleSubmit = (data: EventFormValues) => {
    mutation.mutate({ event: data, id: selectedEvent?.id });
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Eventos</h1>
          <p className="mt-2 text-muted-foreground">Crie e gerencie os eventos e atividades da sua comunidade.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedEvent(null);
        }}>
          <DialogTrigger asChild>
            <Button>Criar Evento</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>{selectedEvent ? "Editar Evento" : "Criar Novo Evento"}</DialogTitle>
            </DialogHeader>
            <EventForm 
              onSubmit={handleSubmit} 
              defaultValues={selectedEvent || undefined}
              isSubmitting={mutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <EventsDataTable columns={columns} data={events || []} />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso removerá permanentemente o evento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedEvent(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedEvent && deleteMutation.mutate(selectedEvent.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventsPage;