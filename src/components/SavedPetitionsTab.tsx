import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PetitionCard } from "@/components/PetitionCard";
import { Trash2 } from "lucide-react";

export const SavedPetitionsTab = ({ userId }: { userId: string }) => {
  const [petitions, setPetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadSavedPetitions();
    }
  }, [userId]);

  const loadSavedPetitions = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("saved_petitions")
        .select(`
          id,
          created_at,
          petition_id
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch petition details and signatures separately
      const petitionsWithData = await Promise.all(
        (data || []).map(async (sp: any) => {
          const { data: petition } = await (supabase as any)
            .from("petitions")
            .select("*, signatures(id)")
            .eq("id", sp.petition_id)
            .single();
          
          const { data: creator } = await (supabase as any)
            .from("profiles")
            .select("full_name")
            .eq("id", petition?.creator_id)
            .single();

          return {
            ...petition,
            savedId: sp.id,
            signatures: petition?.signatures || [],
            creator: creator || { full_name: "Unbekannt" }
          };
        })
      );
      
      setPetitions(petitionsWithData);
    } catch (error: any) {
      console.error("Error loading saved petitions:", error);
      toast.error("Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (savedId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("saved_petitions")
        .delete()
        .eq("id", savedId);

      if (error) throw error;
      toast.success("Petition entfernt");
      loadSavedPetitions();
    } catch (error: any) {
      console.error("Error removing petition:", error);
      toast.error("Fehler beim Entfernen");
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (petitions.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <h3 className="text-xl font-semibold mb-2">Keine gespeicherten Petitionen</h3>
          <p className="text-muted-foreground">
            Speichere Petitionen, um sie später schnell wiederzufinden.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {petitions.map((petition: any) => (
        <div key={petition.id} className="relative group animate-fade-in">
          <PetitionCard 
            id={petition.id}
            title={petition.title}
            description={petition.description}
            goal={petition.goal}
            signatureCount={petition.signatures?.length || 0}
            category={petition.category || undefined}
            imageUrl={petition.image_url || undefined}
            creatorName={petition.creator?.full_name || "Unbekannt"}
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleRemove(petition.savedId)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};
