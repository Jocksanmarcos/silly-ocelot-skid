import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Member } from "@/types";
import { Cake } from "lucide-react";
import { useMemo } from "react";

interface BirthdaysWidgetProps {
  members: Member[];
}

const BirthdaysWidget = ({ members }: BirthdaysWidgetProps) => {
  const birthdaysThisMonth = useMemo(() => {
    const currentMonth = new Date().getMonth();
    return members
      .filter(member => {
        if (!member.date_of_birth) return false;
        const birthDate = new Date(member.date_of_birth);
        // Adiciona 1 ao getMonth() do membro porque o construtor de Date é 0-indexado
        return birthDate.getUTCMonth() === currentMonth;
      })
      .sort((a, b) => {
        const dayA = new Date(a.date_of_birth!).getUTCDate();
        const dayB = new Date(b.date_of_birth!).getUTCDate();
        return dayA - dayB;
      });
  }, [members]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cake className="h-5 w-5 text-primary" />
          Aniversariantes do Mês
        </CardTitle>
      </CardHeader>
      <CardContent>
        {birthdaysThisMonth.length > 0 ? (
          <ul className="space-y-3">
            {birthdaysThisMonth.map(member => (
              <li key={member.id} className="flex justify-between items-center text-sm">
                <span>{member.first_name} {member.last_name}</span>
                <span className="font-medium text-muted-foreground">
                  {new Date(member.date_of_birth!).getUTCDate()}/{new Date(member.date_of_birth!).getUTCMonth() + 1}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum aniversariante este mês.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default BirthdaysWidget;