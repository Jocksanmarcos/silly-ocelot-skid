import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const statusConfig = {
  success: {
    icon: <CheckCircle className="h-16 w-16 text-green-500" />,
    title: "Pagamento Aprovado!",
    message: "Sua inscrição está confirmada. Em breve você receberá um email com os detalhes e seu QR Code de acesso. Você também pode ver os detalhes na sua área de inscrições.",
  },
  failure: {
    icon: <XCircle className="h-16 w-16 text-red-500" />,
    title: "Pagamento Recusado",
    message: "Não foi possível processar seu pagamento. Por favor, tente novamente ou utilize outro método de pagamento.",
  },
  pending: {
    icon: <Clock className="h-16 w-16 text-yellow-500" />,
    title: "Pagamento Pendente",
    message: "Seu pagamento está sendo processado. Avisaremos assim que for aprovado. Fique de olho no seu email.",
  },
};

const PaymentStatusPage = () => {
  const location = useLocation();
  const status = location.pathname.split('/').pop() as keyof typeof statusConfig || 'failure';
  const config = statusConfig[status];

  return (
    <div className="container flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4">{config.icon}</div>
          <CardTitle className="text-2xl">{config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">{config.message}</p>
          <Button asChild>
            <Link to="/eventos">Voltar para Eventos</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentStatusPage;