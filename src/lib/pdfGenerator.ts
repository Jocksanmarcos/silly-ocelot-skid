import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Member, Family, Contribution } from '@/types';

// Definindo um tipo mais específico para a função de famílias
type FamilyWithDetails = Family & {
    members: Member[];
    head?: { first_name: string; last_name: string } | null;
};

// Função para formatar a data para o padrão brasileiro
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  // A data vem como YYYY-MM-DD, então garantimos o fuso horário UTC na conversão
  const date = new Date(`${dateString}T00:00:00Z`);
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

// Gera o PDF da lista completa de membros
export const generateMembersListPDF = (members: Member[]) => {
  const doc = new jsPDF();
  doc.text("Relatório de Membros", 14, 16);
  
  const tableData = members.map(member => [
    `${member.first_name} ${member.last_name}`,
    member.email || 'N/A',
    member.phone || 'N/A',
    formatDate(member.membership_date),
  ]);

  autoTable(doc, {
    head: [['Nome', 'Email', 'Telefone', 'Membro Desde']],
    body: tableData,
    startY: 20,
  });

  doc.save('relatorio_membros.pdf');
};

// Gera o PDF dos aniversariantes do mês
export const generateBirthdaysPDF = (members: Member[]) => {
    const doc = new jsPDF();
    doc.text("Relatório de Aniversariantes do Mês", 14, 16);
    
    const tableData = members.map(member => [
      `${member.first_name} ${member.last_name}`,
      formatDate(member.date_of_birth),
    ]);
  
    autoTable(doc, {
      head: [['Nome', 'Data de Nascimento']],
      body: tableData,
      startY: 20,
    });
  
    doc.save('aniversariantes_do_mes.pdf');
};

// Gera o PDF com os dados de crescimento de membros
export const generateGrowthChartPDF = (chartData: { name: string; "Novos Membros": number }[]) => {
    const doc = new jsPDF();
    doc.text("Relatório de Crescimento de Membros", 14, 16);
    
    const tableData = chartData.map(data => [
      data.name,
      data['Novos Membros'],
    ]);
  
    autoTable(doc, {
      head: [['Mês/Ano', 'Novos Membros']],
      body: tableData,
      startY: 20,
    });
  
    doc.save('crescimento_de_membros.pdf');
};

// Gera o PDF da lista de famílias e seus membros
export const generateFamiliesPDF = (families: FamilyWithDetails[]) => {
    const doc = new jsPDF();
    doc.text("Relatório de Núcleos Familiares", 14, 16);

    const tableData: any[] = [];
    families.forEach(family => {
        if (family.members.length > 0) {
            family.members.forEach((member, index) => {
                tableData.push([
                    index === 0 ? family.name : '',
                    index === 0 ? (family.head ? `${family.head.first_name} ${family.head.last_name}` : 'N/D') : '',
                    `${member.first_name} ${member.last_name}`,
                    member.family_role || 'N/A'
                ]);
            });
        } else {
            tableData.push([
                family.name,
                family.head ? `${family.head.first_name} ${family.head.last_name}` : 'N/D',
                '(Nenhum membro associado)',
                ''
            ]);
        }
    });

    autoTable(doc, {
        head: [['Nome da Família', 'Responsável', 'Membro', 'Vínculo']],
        body: tableData,
        startY: 20,
        didParseCell: function (data) {
            // Lógica para mesclar células da família e responsável
            if (data.cell.raw === '') {
                data.cell.styles.fillColor = '#ffffff'; // Cor de fundo para células vazias
            }
        }
    });

    doc.save('relatorio_familias.pdf');
};

// Gera o PDF do relatório financeiro
export const generateFinancialReportPDF = (contributions: Contribution[], startDate: Date, endDate: Date) => {
    const doc = new jsPDF();
    const formattedStartDate = formatDate(startDate.toISOString());
    const formattedEndDate = formatDate(endDate.toISOString());
    const total = contributions.reduce((sum, c) => sum + c.amount, 0);

    doc.text("Relatório Financeiro", 14, 16);
    doc.setFontSize(10);
    doc.text(`Período: ${formattedStartDate} a ${formattedEndDate}`, 14, 22);
    doc.text(`Total Arrecadado: R$ ${total.toFixed(2).replace('.', ',')}`, 14, 28);

    const tableData = contributions.map(c => [
        c.members ? `${c.members.first_name} ${c.members.last_name}` : c.contributor_name || 'Anônimo',
        formatDate(c.contribution_date),
        `R$ ${c.amount.toFixed(2).replace('.', ',')}`,
        c.fund,
        c.payment_method || 'N/A',
    ]);

    autoTable(doc, {
        head: [['Contribuinte', 'Data', 'Valor', 'Fundo', 'Método']],
        body: tableData,
        startY: 35,
    });

    doc.save(`relatorio_financeiro_${formattedStartDate}_${formattedEndDate}.pdf`);
};