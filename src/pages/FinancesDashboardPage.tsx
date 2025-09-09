import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Contribution } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays, startOfMonth } from "date-fns";
import { FileDown } from "lucide-react";
import FinancialSummary from "@/components/finances/FinancialSummary";
import ContributionsByFundChart from "@/components/finances/ContributionsByFundChart";
import ContributionsOverTimeChart from "@/components/finances/ContributionsOverTimeChart";
import { generateFinancialReportPDF } from "@/lib/pdfGenerator";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const fetchContributions = async (): Promise<Contribution[]> => {
  const { data, error } = await supabase.from("contributions").select("*, members(first_name, last_name)").order("contribution_date", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const FinancesDashboardPage = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  const { data: contributions, isLoading } = useQuery<Contribution[]>({
    queryKey: ["contributions"],
    queryFn: fetchContributions,
  });

  const filteredContributions = useMemo(() => {
    if (!contributions || !date?.from) return [];
    const toDate = date.to || date.from;
    return contributions.filter(c => {
      const contributionDate = new Date(c.contribution_date);
      return contributionDate >= date.from! && contributionDate <= addDays(toDate, 1);
    });
  }, [contributions, date]);

  const totalRevenue = useMemo(() => {
    return filteredContributions.reduce((sum, c) => sum + c.amount, 0);
  }, [filteredContributions]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/dashboard/finances" className="flex items-center gap-2 text-sm text-muted-foreground hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Lançamentos
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Painel Financeiro</h1>
            <p className="mt-2 text-muted-foreground">
              Visualize e analise as contribuições da sua comunidade.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DatePickerWithRange date={date} setDate={setDate} />
            <Button 
              variant="outline" 
              onClick={() => generateFinancialReportPDF(filteredContributions, date?.from!, date?.to || date?.from!)}
              disabled={filteredContributions.length === 0}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </div>

      <FinancialSummary totalRevenue={totalRevenue} totalContributions={filteredContributions.length} />

      <div className="grid gap-4 md:grid-cols-2">
        <ContributionsByFundChart contributions={filteredContributions} />
        <ContributionsOverTimeChart contributions={contributions || []} />
      </div>
    </div>
  );
};

export default FinancesDashboardPage;