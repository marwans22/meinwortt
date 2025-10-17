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
import { Users, Target, TrendingUp, Calendar, Tag, Building, MapPin, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { PetitionComments } from "@/components/PetitionComments";
import { SavePetitionButton } from "@/components/SavePetitionButton";
import { ReportDialog } from "@/components/ReportDialog";
import { ImageGallery } from "@/components/ImageGallery";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PetitionCard } from "@/components/PetitionCard";

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

const GERMAN_CITIES = [
  "Berlin", "Hamburg", "München", "Köln", "Frankfurt am Main", "Stuttgart",
  "Düsseldorf", "Dortmund", "Essen", "Leipzig", "Bremen", "Dresden",
  "Hannover", "Nürnberg", "Duisburg", "Bochum", "Wuppertal", "Bielefeld",
  "Bonn", "Münster", "Karlsruhe", "Mannheim", "Augsburg", "Wiesbaden",
  "Gelsenkirchen", "Mönchengladbach", "Braunschweig", "Chemnitz", "Kiel",
  "Aachen", "Halle", "Magdeburg", "Freiburg", "Krefeld", "Lübeck",
  "Oberhausen", "Erfurt", "Mainz", "Rostock", "Kassel", "Hagen",
  "Hamm", "Saarbrücken", "Mülheim", "Potsdam", "Ludwigshafen", "Oldenburg",
  "Leverkusen", "Osnabrück", "Solingen", "Heidelberg", "Herne", "Neuss",
];

const PetitionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [petition, setPetition] = useState<Petition | null>(null);
  const [signatureCount, setSignatureCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [allPetitions, setAllPetitions] = useState<any[]>([]);
  
  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
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

        // Load creator profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", petitionData.creator_id)
          .single();
        
        setCreatorProfile(profileData);

        // Load signature count
        const { count, error: countError } = await supabase
          .from("signatures")
          .select("*", { count: "exact", head: true })
          .eq("petition_id", id)
          .eq("verification_status", "verified");

        if (countError) throw countError;
        setSignatureCount(count || 0);

        // Load all published petitions
        const { data: petitionsData } = await supabase
          .from("petitions")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(6);
        
        setAllPetitions(petitionsData || []);
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
        verification_status: "verified",
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
      setCity("");
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  {petition.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {petition.category && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary">
                      <Tag className="w-3 h-3" />
                      {petition.category}
                    </span>
                  )}
                  {petition.target_institution && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                      <Building className="w-3 h-3" />
                      {petition.target_institution}
                    </span>
                  )}
                </div>
              </div>

              {/* Image Gallery */}
              {images.length > 0 && (
                <ImageGallery images={images} alt={petition.title} />
              )}

              {/* Recent Supporters */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Aktuelle Unterzeichner*innen:</p>
                {/* Add recent supporters here if needed */}
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold">Das Problem</h2>
                <div className="prose prose-sm md:prose-base max-w-none">
                  <p className="whitespace-pre-wrap text-base leading-relaxed">{petition.description}</p>
                </div>
              </div>

              {/* Creator Info */}
              {creatorProfile && (
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {creatorProfile.full_name?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{creatorProfile.full_name || "Unbekannt"}</p>
                        <p className="text-sm text-muted-foreground">
                          Gestartet am {format(new Date(petition.created_at), "d. MMMM yyyy", { locale: de })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comments Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Diskussion</CardTitle>
                </CardHeader>
                <CardContent>
                  <PetitionComments petitionId={petition.id} currentUserId={currentUser?.id || null} />
                </CardContent>
              </Card>

              {/* All Petitions */}
              {allPetitions.length > 0 && (
                <div className="space-y-6 pt-8 border-t">
                  <h2 className="text-2xl font-bold">Weitere Petitionen</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {allPetitions.map((p) => (
                      <PetitionCard 
                        key={p.id}
                        id={p.id}
                        title={p.title}
                        description={p.description}
                        goal={p.goal}
                        signatureCount={0}
                        category={p.category}
                        imageUrl={p.image_url}
                        creatorName="Ersteller"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sticky Sign Form */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-8 space-y-4">
                <Card className="shadow-lg">
                  <CardContent className="pt-6 space-y-6">
                    {/* Signature Count */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-4xl font-bold text-primary">
                          {signatureCount.toLocaleString("de-DE")}
                        </span>
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">Verifizierte Unterschriften</p>
                      <Progress value={progress} className="h-2 mt-4" />
                      <p className="text-xs text-muted-foreground mt-2">
                        Ziel: {petition.goal.toLocaleString("de-DE")} Unterschriften
                      </p>
                    </div>

                    {/* Sign Form */}
                    <div>
                      <h3 className="text-xl font-bold mb-4">Unterschreiben Sie diese Petition</h3>
                      <form onSubmit={handleSign} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-sm">Vorname</Label>
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            placeholder="Max"
                            className="h-10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-sm">Nachname</Label>
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            placeholder="Mustermann"
                            className="h-10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm">E-Mail</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="max@beispiel.de"
                            className="h-10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-sm">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            Stadt
                          </Label>
                          <Select value={city} onValueChange={setCity} required>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Stadt auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                              {GERMAN_CITIES.map((cityName) => (
                                <SelectItem key={cityName} value={cityName}>
                                  {cityName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-start gap-2 pt-2">
                          <Checkbox
                            id="terms"
                            checked={agreedToTerms}
                            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                            required
                            className="mt-1"
                          />
                          <Label htmlFor="terms" className="text-xs leading-relaxed cursor-pointer">
                            Ich stimme zu, dass meine Daten gespeichert werden. Siehe{" "}
                            <a href="/datenschutz" className="text-primary hover:underline">
                              Datenschutz
                            </a>
                          </Label>
                        </div>

                        <Button 
                          type="submit" 
                          size="lg" 
                          className="w-full h-12 text-base font-semibold" 
                          disabled={signing}
                        >
                          {signing ? "Wird unterschrieben..." : "Petition unterschreiben"}
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <SavePetitionButton petitionId={petition.id} userId={currentUser?.id || null} />
                  <ReportDialog petitionId={petition.id} userId={currentUser?.id || null} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </AnimatedPage>
    </Layout>
  );
};

export default PetitionDetail;
