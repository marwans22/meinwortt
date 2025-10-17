import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PetitionCard } from "./PetitionCard";
import { Badge } from "./ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Petition {
  id: string;
  title: string;
  description: string;
  goal: number;
  category: string;
  image_url: string;
  status: string;
  created_at: string;
  creator_id: string;
}

interface MyPetitionsTabProps {
  userId: string;
}

export const MyPetitionsTab = ({ userId }: MyPetitionsTabProps) => {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [signatureCounts, setSignatureCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadPetitions();
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error: any) {
      console.error("Error loading profile:", error);
    }
  };

  const loadPetitions = async () => {
    setLoading(true);
    try {
      const { data: petitionsData, error: petitionsError } = await supabase
        .from("petitions")
        .select("*")
        .eq("creator_id", userId)
        .order("created_at", { ascending: false });

      if (petitionsError) throw petitionsError;

      setPetitions(petitionsData || []);

      // Load signature counts for each petition
      const counts: Record<string, number> = {};
      for (const petition of petitionsData || []) {
        const { count, error: countError } = await supabase
          .from("signatures")
          .select("*", { count: "exact", head: true })
          .eq("petition_id", petition.id)
          .eq("verification_status", "verified");

        if (!countError) {
          counts[petition.id] = count || 0;
        }
      }
      setSignatureCounts(counts);
    } catch (error: any) {
      console.error("Error loading petitions:", error);
      toast.error("Fehler beim Laden der Petitionen");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-success text-success-foreground">Veröffentlicht</Badge>;
      case "pending":
        return <Badge variant="secondary">Wird überprüft</Badge>;
      case "rejected":
        return <Badge variant="destructive">Abgelehnt</Badge>;
      case "draft":
        return <Badge variant="outline">Entwurf</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (petitions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          Du hast noch keine Petitionen erstellt.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {petitions.map((petition) => (
        <div key={petition.id} className="space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            {getStatusBadge(petition.status)}
            {petition.status === "pending" && (
              <p className="text-sm text-muted-foreground">
                Deine Petition wird gerade von unserem Team überprüft.
              </p>
            )}
          </div>
          <PetitionCard
            id={petition.id}
            title={petition.title}
            description={petition.description}
            goal={petition.goal}
            signatureCount={signatureCounts[petition.id] || 0}
            category={petition.category}
            imageUrl={petition.image_url}
            creatorName={userProfile?.full_name || "Unbekannt"}
          />
        </div>
      ))}
    </div>
  );
};
