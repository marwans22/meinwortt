import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";

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
  const progress = Math.min((signatureCount / goal) * 100, 100);
  const isGoalReached = signatureCount >= goal;

  return (
    <Link to={`/petition/${id}`}>
      <Card className="group overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer h-full flex flex-col bg-card rounded-xl">
        {imageUrl && (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <CardContent className="p-6 flex-1">
          <div className="flex items-center gap-2 mb-3">
            {category && (
              <Badge variant="secondary" className="text-xs font-manrope">
                {category}
              </Badge>
            )}
            {isGoalReached && (
              <Badge className="bg-success text-success-foreground text-xs font-manrope">
                Ziel erreicht!
              </Badge>
            )}
          </div>
          <h3 className="text-xl font-poppins font-bold mb-2 line-clamp-2 text-foreground">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm font-inter line-clamp-3 mb-4">
            {description}
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground font-manrope">
                {signatureCount.toLocaleString("de-DE")} Unterschriften
              </span>
              <span className="text-muted-foreground font-inter">
                Ziel: {goal.toLocaleString("de-DE")}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
        <CardFooter className="px-6 pb-6 pt-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-inter">
            <Users className="h-4 w-4" />
            <span>Gestartet von {creatorName}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};
