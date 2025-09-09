import { GenerosityItem } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useAuth } from "@/contexts/AuthProvider";

interface ItemCardProps {
  item: GenerosityItem;
  onInterestClick: (item: GenerosityItem) => void;
}

const ItemCard = ({ item, onInterestClick }: ItemCardProps) => {
  const { session } = useAuth();
  const isOwner = session?.user.id === item.user_id;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <Avatar>
          <AvatarImage src={item.profiles?.avatar_url || undefined} />
          <AvatarFallback>{item.profiles?.full_name?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-base">{item.profiles?.full_name}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {new Date(item.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {item.image_urls && item.image_urls.length > 0 ? (
          <Carousel className="w-full">
            <CarouselContent>
              {item.image_urls.map((url, index) => (
                <CarouselItem key={index}>
                  <img src={url} alt={item.title} className="aspect-video w-full object-cover rounded-lg" />
                </CarouselItem>
              ))}
            </CarouselContent>
            {item.image_urls.length > 1 && <>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </>}
          </Carousel>
        ) : (
          <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Sem imagem</p>
          </div>
        )}
        <div>
          <h3 className="font-semibold">{item.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant="secondary">{item.category}</Badge>
        <Button 
          size="sm" 
          disabled={item.status !== 'Disponível' || isOwner}
          onClick={() => onInterestClick(item)}
        >
          {item.status === 'Disponível' ? 'Tenho Interesse' : item.status}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ItemCard;