import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AnimatedPage } from "@/components/AnimatedPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Target, TrendingUp, Calendar, Tag, Building } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { PetitionComments } from "@/components/PetitionComments";
import { SavePetitionButton } from "@/components/SavePetitionButton";
import { ReportDialog } from "@/components/ReportDialog";
import { ImageGallery } from "@/components/ImageGallery";

interface Petition {
  id: string;
  title: string;
  description: string;
  goal: number;
  category: string;
  target_institution: string;
  image_url: string;
  created_at: string;
  creator_id: string;
  status: string;
}

const PetitionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [petition, setPetition] = useState<Petition | null>(null);
  const [signatureCount, setSignatureCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  // Load petition data
  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    const loadPetition = async () => {
      setLoading(true);
      try {
        // Load petition
        const { data: petitionData, error: petitionError } = await supabase
          .from("petitions")
          .select("*")
          .eq("id", id)
          .eq("status", "published")
          .maybeSingle();

        if (petitionError) throw petitionError;
        
        if (!petitionData) {
          toast.error("Petition nicht gefunden");
          navigate("/");
          return;
        }

        setPetition(petitionData);

        // Load signature count
        const { count, error: countError } = await supabase
          .from("signatures")
          .select("*", { count: "exact", head: true })
          .eq("petition_id", id)
          .eq("verification_status", "verified");

        if (countError) throw countError;
        setSignatureCount(count || 0);
      } catch (error: any) {
        console.error("Error loading petition:", error);
        toast.error("Fehler beim Laden der Petition");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadPetition();
  }, [id, navigate]);

  // Realtime signature updates
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`signatures-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "signatures",
          filter: `petition_id=eq.${id}`,
        },
        (payload) => {
          if (payload.new.verification_status === "verified") {
            setSignatureCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast.error("Bitte stimme den Datenschutzbestimmungen zu");
      return;
    }

    if (!petition) return;

    setSigning(true);

    try {
      const { error } = await supabase.from("signatures").insert({
        petition_id: petition.id,
        signer_name: `${firstName} ${lastName}`,
        signer_email: email,
        comment: comment || null,
        verification_status: "verified", // Auto-verify for now
      });

      if (error) {
        if (error.message.includes("duplicate")) {
          toast.error("Du hast diese Petition bereits unterschrieben");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Danke, dass du deine Stimme erhoben hast! 🎉");
      
      // Clear form
      setFirstName("");
      setLastName("");
      setEmail("");
      setComment("");
      setAgreedToTerms(false);
    } catch (error: any) {
      console.error("Error signing petition:", error);
      toast.error("Fehler beim Unterschreiben");
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!petition) {
    return null;
  }

  const progress = Math.min((signatureCount / petition.goal) * 100, 100);
  const remaining = Math.max(petition.goal - signatureCount, 0);
  
  const petitionAny = petition as any;
  let images: string[] = [];
  
  if (petitionAny.images) {
    // Check if images is already an array or needs parsing
    if (Array.isArray(petitionAny.images)) {
      images = petitionAny.images;
    } else if (typeof petitionAny.images === 'string') {
      try {
        images = JSON.parse(petitionAny.images);
      } catch {
        images = [];
      }
    }
  } else if (petition.image_url) {
    images = [petition.image_url];
  }

  return (
    <Layout>
      <AnimatedPage>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {petition.category && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                      <Tag className="w-3 h-3" />
                      {petition.category}
                    </span>
                  )}
                  {petition.target_institution && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
                      <Building className="w-3 h-3" />
                      {petition.target_institution}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mt-4">
                  {petition.title}
                </h1>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Gestartet am {format(new Date(petition.created_at), "d. MMMM yyyy", { locale: de })}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <SavePetitionButton petitionId={petition.id} userId={currentUser?.id || null} />
                <ReportDialog petitionId={petition.id} userId={currentUser?.id || null} />
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          {images.length > 0 && (
            <ImageGallery images={images} alt={petition.title} />
          )}

          {/* Progress Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Fortschritt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-semibold">
                      {signatureCount.toLocaleString("de-DE")} Unterschriften
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Ziel: {petition.goal.toLocaleString("de-DE")}
                    </span>
                  </div>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-sm text-muted-foreground text-right">
                  Noch {remaining.toLocaleString("de-DE")} Unterschriften benötigt
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {signatureCount.toLocaleString("de-DE")}
                  </div>
                  <div className="text-xs text-muted-foreground">Unterstützer</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {petition.goal.toLocaleString("de-DE")}
                  </div>
                  <div className="text-xs text-muted-foreground">Ziel</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{Math.round(progress)}%</div>
                  <div className="text-xs text-muted-foreground">Erreicht</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Beschreibung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm md:prose-base max-w-none">
                <p className="whitespace-pre-wrap">{petition.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Sign Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">Petition unterschreiben</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Unterstütze diese Petition mit deiner Unterschrift
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSign} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-base">Vorname *</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      placeholder="Max"
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-base">Nachname *</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      placeholder="Mustermann"
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">E-Mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="max.mustermann@beispiel.de"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment" className="text-base">Kommentar (optional)</Label>
                  <Input
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Warum unterstützt du diese Petition?"
                    maxLength={500}
                    className="h-12 text-base"
                  />
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    required
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm md:text-base leading-relaxed cursor-pointer">
                    Ich stimme zu, dass meine Daten zur Unterstützung dieser Petition gespeichert,
                    aber nicht an Dritte weitergegeben werden. Weitere Informationen in unserer{" "}
                    <a href="/datenschutz" className="text-primary hover:underline font-medium">
                      Datenschutzerklärung
                    </a>
                    .
                  </Label>
                </div>

                <Button type="submit" size="lg" className="w-full h-14 text-base md:text-lg" disabled={signing}>
                  {signing ? "Wird unterschrieben..." : "Jetzt unterschreiben"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle>Diskussion</CardTitle>
            </CardHeader>
            <CardContent>
              <PetitionComments petitionId={petition.id} currentUserId={currentUser?.id || null} />
            </CardContent>
          </Card>
        </div>
      </div>
      </AnimatedPage>
    </Layout>
  );
};

export default PetitionDetail;
