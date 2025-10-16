import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface SavePetitionButtonProps {
  petitionId: string;
  userId: string | null;
}

export const SavePetitionButton = ({ petitionId, userId }: SavePetitionButtonProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      checkIfSaved();
    }
  }, [petitionId, userId]);

  const checkIfSaved = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("saved_petitions")
        .select("id")
        .eq("petition_id", petitionId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      setIsSaved(!!data);
    } catch (error: any) {
      console.error("Error checking saved status:", error);
    }
  };

  const toggleSave = async () => {
    if (!userId) {
      toast.error("Bitte melde dich an, um Petitionen zu speichern");
      return;
    }

    setLoading(true);

    try {
      if (isSaved) {
        const { error } = await supabase
          .from("saved_petitions")
          .delete()
          .eq("petition_id", petitionId)
          .eq("user_id", userId);

        if (error) throw error;
        setIsSaved(false);
        toast.success("Petition entfernt");
      } else {
        const { error } = await supabase.from("saved_petitions").insert({
          petition_id: petitionId,
          user_id: userId,
        });

        if (error) throw error;
        setIsSaved(true);
        toast.success("Petition gespeichert");
      }
    } catch (error: any) {
      console.error("Error toggling save:", error);
      toast.error("Fehler beim Speichern");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isSaved ? "default" : "outline"}
      size="sm"
      onClick={toggleSave}
      disabled={loading}
      className="transition-all hover-scale"
    >
      <Heart className={`w-4 h-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
      {isSaved ? "Gespeichert" : "Merken"}
    </Button>
  );
};
