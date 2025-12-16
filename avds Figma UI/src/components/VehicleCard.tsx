import { Link } from 'react-router-dom';
import { Vehicle } from '../lib/types';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Link to={`/vehicles/${vehicle.id}`}>
      <Card
        className="cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden group bg-card border-border"
      >
        <div className="aspect-video overflow-hidden">
          <ImageWithFallback
            src={vehicle.images[0] || '/placeholder-car.png'} // You might need a placeholder image
            alt={vehicle.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="mb-2 text-foreground">{vehicle.title}</h3>
          <p className="text-muted-foreground mb-3">{vehicle.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-primary">{vehicle.price > 0 ? `$${vehicle.price.toLocaleString()}` : 'Contact for Price'}</span>
            <span className="text-sm text-muted-foreground">{vehicle.productionYear}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
