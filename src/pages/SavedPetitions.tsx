import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PetitionCard } from "@/components/PetitionCard";
import { Trash2 } from "lucide-react";

const SavedPetitions = () => {
  const [petitions, setPetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      loadSavedPetitions(user.id);
    }
  };

  const loadSavedPetitions = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
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
          const { data: petition } = await supabase
            .from("petitions")
            .select("*, signatures(id)")
            .eq("id", sp.petition_id)
            .single();
          
          const { data: creator } = await supabase
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
      const { error } = await supabase
        .from("saved_petitions")
        .delete()
        .eq("id", savedId);

      if (error) throw error;
      toast.success("Petition entfernt");
      if (user) loadSavedPetitions(user.id);
    } catch (error: any) {
      console.error("Error removing petition:", error);
      toast.error("Fehler beim Entfernen");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Gespeicherte Petitionen</h1>
            <p className="text-muted-foreground mt-2">
              Deine gemerkten Petitionen im Überblick
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : petitions.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <h3 className="text-xl font-semibold mb-2">Keine gespeicherten Petitionen</h3>
                <p className="text-muted-foreground">
                  Speichere Petitionen, um sie später schnell wiederzufinden.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {petitions.map((petition: any) => (
                <div key={petition.id} className="relative group">
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
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SavedPetitions;
