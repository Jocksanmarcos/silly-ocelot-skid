import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Member } from '@/types';

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