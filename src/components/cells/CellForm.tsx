import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CellFormValues, cellSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cell, Profile } from "@/types";

interface CellFormProps {
  onSubmit: (data: CellFormValues) => void;
  defaultValues?: Cell;
  isSubmitting: boolean;
  profiles: Profile[];
}

const meetingDays = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
const locationTypes = ["Residencial", "Online", "Na Igreja"];
const ageGroups = ["Jovens", "Adolescentes", "Casais", "Mulheres", "Homens", "Todos os públicos"];

const CellForm = ({ onSubmit, defaultValues, isSubmitting, profiles }: CellFormProps) => {
  const form = useForm<CellFormValues>({
    resolver: zodResolver(cellSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      leader_id: defaultValues?.leader_id || "",
      supervisor_id: defaultValues?.supervisor_id || "",
      meeting_day: defaultValues?.meeting_day || "",
      meeting_time: defaultValues?.meeting_time || "",
      location_type: defaultValues?.location_type || "Residencial",
      address: defaultValues?.address || "",
      age_group: defaultValues?.age_group || "Todos os públicos",
      status: (defaultValues?.status as "Ativa" | "Inativa") || "Ativa",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Célula</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Célula Leão de Judá" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="leader_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Líder</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione o líder" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {profiles.length > 0 ? (
                      profiles.map(profile => (
                        <SelectItem key={profile.id} value={profile.id}>{profile.full_name || profile.id}</SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Nenhum líder encontrado.
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supervisor_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supervisor</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione o supervisor" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {profiles.length > 0 ? (
                      profiles.map(profile => (
                        <SelectItem key={profile.id} value={profile.id}>{profile.full_name || profile.id}</SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Nenhum supervisor encontrado.
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Descreva o propósito e o foco da célula..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="meeting_day"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dia da Reunião</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione o dia" /></SelectTrigger></FormControl>
                  <SelectContent>{meetingDays.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="meeting_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <FormControl><Input type="time" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço / Link da Reunião</FormLabel>
              <FormControl><Input placeholder="Rua, número, bairro ou link do Zoom/Meet" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="location_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Local</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Tipo de local" /></SelectTrigger></FormControl>
                  <SelectContent>{locationTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="age_group"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Público-Alvo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Público da célula" /></SelectTrigger></FormControl>
                  <SelectContent>{ageGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Status da célula" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Ativa">Ativa</SelectItem>
                    <SelectItem value="Inativa">Inativa</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar Célula"}
        </Button>
      </form>
    </Form>
  );
};

export default CellForm;