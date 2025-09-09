import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Member } from "@/types";
import { Cake, FileDown } from "lucide-react";
import { useMemo } from "react";
import { Button } from "../ui/button";
import { generateBirthdaysPDF } from "@/lib/pdfGenerator";

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
        return birthDate.getUTCMonth() === currentMonth;
      })
      .sort((a, b) => {
        const dayA = new Date(a.date_of_birth!).getUTCDate();
        const dayB = new Date(b.date_of_birth!).getUTCDate();
        return dayA - dayB;
      });
  }, [members]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cake className="h-5 w-5 text-primary" />
          Aniversariantes do Mês
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
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
      {birthdaysThisMonth.length > 0 && (
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full" onClick={() => generateBirthdaysPDF(birthdaysThisMonth)}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default BirthdaysWidget;