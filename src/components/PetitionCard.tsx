import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenTool } from "lucide-react";

interface PetitionCardProps {
  id: string;
  title: string;
  description: string;
  goal: number;
  signatureCount: number;
  category?: string;
  imageUrl?: string;
  creatorName: string;
}

export const PetitionCard = ({
  id,
  title,
  description,
  goal,
  signatureCount,
  category,
  imageUrl,
  creatorName,
}: PetitionCardProps) => {
  return (
    <Card className="group overflow-hidden bg-card rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full">
      {imageUrl && (
        <Link to={`/petition/${id}`} className="block">
          <div className="aspect-video w-full overflow-hidden relative">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>
      )}
      <div className="p-4 md:p-6 flex-1 flex flex-col">
        <Link 
          to={`/petition/${id}`} 
          className="text-sm text-muted-foreground font-inter mb-3 underline hover:text-foreground transition-colors"
        >
          Von {signatureCount.toLocaleString("de-DE")} Unterstützer*innen beworben
        </Link>
        
        <Link to={`/petition/${id}`}>
          <h3 className="text-lg md:text-xl font-poppins font-bold mb-2 text-foreground hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>
        
        {description && (
          <p className="text-muted-foreground text-sm font-inter mb-3">
            {category || "Deutschland"}
          </p>
        )}
        
        <div className="flex items-center gap-2 text-primary font-inter font-semibold text-sm mb-4">
          <PenTool className="h-4 w-4" />
          <span>{signatureCount.toLocaleString("de-DE")} Unterschriften</span>
        </div>
        
        <div className="mt-auto">
          <Link to={`/petition/${id}`}>
            <Button 
              variant="outline" 
              className="w-full font-manrope text-sm md:text-base py-5 md:py-6 border-2 hover:bg-accent"
            >
              Diese Petition unterschreiben
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
