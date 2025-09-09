import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Cell } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CellInterestForm from "@/components/cells/CellInterestForm";
import { Users, MapPin, Clock, User } from "lucide-react";

const fetchActiveCells = async (): Promise<Cell[]> => {
  const { data, error } = await supabase
    .from("cells")
    .select("*")
    .eq("status", "Ativa")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

const PublicCellsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: cells, isLoading } = useQuery<Cell[]>({
    queryKey: ["publicCells"],
    queryFn: fetchActiveCells,
  });

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Encontre uma Célula</h1>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
            Conecte-se, cresça e viva em comunidade. Nossas células são o coração da nossa igreja.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent><CardFooter><Skeleton className="h-10 w-28" /></CardFooter></Card>
            ))
          ) : cells && cells.length > 0 ? (
            cells.map((cell) => (
              <Card key={cell.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{cell.name}</CardTitle>
                  <CardDescription>{cell.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 text-sm"><User className="h-4 w-4 text-muted-foreground" /><span>Líder: {cell.leader_name}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-muted-foreground" /><span>{cell.meeting_day} às {cell.meeting_time}</span></div>
                  <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{cell.location_type}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-muted-foreground" /><span>{cell.age_group}</span></div>
                </CardContent>
                <CardFooter>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">Tenho Interesse</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Participar da Célula {cell.name}</DialogTitle>
                      </DialogHeader>
                      <CellInterestForm cellId={cell.id} onFinished={() => setIsDialogOpen(false)} />
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">Nenhuma célula ativa encontrada no momento.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default PublicCellsPage;