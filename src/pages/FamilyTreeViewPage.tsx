import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Family, Member } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Users } from "lucide-react";
import { Link } from "react-router-dom";

type FamilyWithDetails = Family & {
  members: Member[];
  head?: { first_name: string; last_name: string } | null;
};

const fetchFamiliesAndMembers = async (): Promise<FamilyWithDetails[]> => {
  const familiesPromise = supabase.from('families').select('*');
  const membersPromise = supabase.from('members').select('*');

  const [{ data: families, error: familiesError }, { data: members, error: membersError }] = await Promise.all([familiesPromise, membersPromise]);

  if (familiesError) throw new Error(familiesError.message);
  if (membersError) throw new Error(membersError.message);

  const membersById = new Map(members.map(m => [m.id, m]));

  const familiesWithDetails = families.map(family => {
    const head = family.head_of_family_id ? membersById.get(family.head_of_family_id) : null;
    return {
      ...family,
      head: head ? { first_name: head.first_name, last_name: head.last_name } : null,
      members: members.filter(member => member.family_id === family.id)
    };
  });

  return familiesWithDetails as FamilyWithDetails[];
};

// Define a logical order for family roles
const roleOrder: { [key: string]: number } = {
  "Pai/Responsável": 1,
  "Mãe": 2,
  "Cônjuge": 3,
  "Filho(a)": 4,
  "Outro": 5,
};

const FamilyTreeViewPage = () => {
  const { data: families, isLoading } = useQuery({
    queryKey: ['familiesWithMembers'],
    queryFn: fetchFamiliesAndMembers,
  });

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-1/4 mb-2" />
        <Skeleton className="h-6 w-3/4 mb-6" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/dashboard/families" className="flex items-center gap-2 text-sm text-muted-foreground hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Gestão de Famílias
        </Link>
        <h1 className="text-3xl font-bold">Visão Genealógica</h1>
        <p className="mt-2 text-muted-foreground">
          Visualize os núcleos familiares da comunidade. Total de {families?.length || 0} famílias cadastradas.
        </p>
      </div>

      {families && families.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {families.map(family => (
            <Card key={family.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{family.name}</CardTitle>
                <CardDescription>
                  Responsável: {family.head ? `${family.head.first_name} ${family.head.last_name}` : 'Não definido'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <h4 className="font-semibold mb-2">Membros ({family.members.length})</h4>
                {family.members.length > 0 ? (
                    <ul className="space-y-2">
                    {family.members
                        .sort((a, b) => (roleOrder[a.family_role || 'Outro'] || 99) - (roleOrder[b.family_role || 'Outro'] || 99))
                        .map(member => (
                        <li key={member.id} className="flex items-center gap-3 text-sm">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div>
                            <span>{member.first_name} {member.last_name}</span>
                            <p className="text-xs text-muted-foreground">{member.family_role || 'Vínculo não definido'}</p>
                        </div>
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum membro associado a esta família.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma família encontrada</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Comece criando famílias e associando membros a elas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FamilyTreeViewPage;