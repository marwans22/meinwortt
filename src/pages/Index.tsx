import { Layout } from "@/components/Layout";
import { PetitionCard } from "@/components/PetitionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Users, Target, PenLine, Heart, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
interface Petition {
  id: string;
  title: string;
  description: string;
  goal: number;
  category: string | null;
  image_url: string | null;
  creator: {
    full_name: string;
  };
  signatures: {
    id: string;
  }[];
}
const Index = () => {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    fetchPetitions();
  }, []);
  const fetchPetitions = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("petitions").select(`
          *,
          signatures(id)
        `).eq("status", "published").order("created_at", {
        ascending: false
      }).limit(12);
      if (error) throw error;

      // Fetch creator profiles separately
      const petitionsWithCreators = await Promise.all((data || []).map(async petition => {
        const {
          data: profile
        } = await supabase.from("profiles").select("full_name").eq("id", petition.creator_id).single();
        return {
          ...petition,
          creator: profile || {
            full_name: "Unbekannt"
          }
        };
      }));
      setPetitions(petitionsWithCreators as any);
    } catch (error) {
      console.error("Error fetching petitions:", error);
    } finally {
      setLoading(false);
    }
  };
  const filteredPetitions = petitions.filter(petition => petition.title.toLowerCase().includes(searchQuery.toLowerCase()) || petition.description.toLowerCase().includes(searchQuery.toLowerCase()));
  return <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-poppins font-bold mb-6 text-foreground leading-tight">
              Gib deiner Stimme{" "}
              <span className="text-primary">Gewicht</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-10 font-inter leading-relaxed max-w-3xl mx-auto">
              Gemeinsam können wir Großes erreichen. Schließe dich Tausenden von Menschen an, 
              die für ihre Anliegen kämpfen und echte Veränderung bewirken.
            </p>
            <div className="flex flex-col gap-3 justify-center mb-16">
              <Button 
                size="lg" 
                className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                onClick={() => navigate("/create")}
              >
                <PenLine className="mr-2 h-5 w-5" />
                Petition starten
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 w-full sm:w-auto"
                onClick={() => document.getElementById("petitions")?.scrollIntoView({
                  behavior: "smooth"
                })}
              >
                Petitionen entdecken
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <Card className="p-6 bg-card/50 backdrop-blur border-primary/10 hover:border-primary/30 transition-all duration-200">
                <Users className="h-10 w-10 text-primary mx-auto mb-3" />
                <div className="text-3xl font-poppins font-bold text-foreground mb-1">10.000+</div>
                <div className="text-sm text-muted-foreground font-inter">Aktive Unterstützer</div>
              </Card>
              <Card className="p-6 bg-card/50 backdrop-blur border-secondary/10 hover:border-secondary/30 transition-all duration-200">
                <TrendingUp className="h-10 w-10 text-secondary mx-auto mb-3" />
                <div className="text-3xl font-poppins font-bold text-foreground mb-1">85%</div>
                <div className="text-sm text-muted-foreground font-inter">Erfolgsquote</div>
              </Card>
              <Card className="p-6 bg-card/50 backdrop-blur border-success/10 hover:border-success/30 transition-all duration-200">
                <Target className="h-10 w-10 text-success mx-auto mb-3" />
                <div className="text-3xl font-poppins font-bold text-foreground mb-1">500+</div>
                <div className="text-sm text-muted-foreground font-inter">Erreichte Ziele</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-card/30 border-y">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Suche nach Petitionen..." 
                className="pl-12 h-14 text-lg font-inter border-2 focus:border-primary transition-colors" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Petitions Grid */}
      <section id="petitions" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4 text-foreground">
              Aktuelle Petitionen
            </h2>
            <p className="text-lg text-muted-foreground font-inter max-w-2xl mx-auto">
              Unterstütze Anliegen, die dir am Herzen liegen, und mache einen Unterschied
            </p>
          </div>

          {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => <div key={i} className="h-96 bg-muted/30 animate-pulse rounded-xl" />)}
            </div> : filteredPetitions.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPetitions.map(petition => <PetitionCard key={petition.id} id={petition.id} title={petition.title} description={petition.description} goal={petition.goal} signatureCount={petition.signatures?.length || 0} category={petition.category || undefined} imageUrl={petition.image_url || undefined} creatorName={petition.creator?.full_name || "Unbekannt"} />)}
            </div> : <div className="text-center py-16">
              <p className="text-muted-foreground text-lg font-inter">
                {searchQuery ? "Keine Petitionen gefunden. Versuche es mit anderen Suchbegriffen." : "Noch keine Petitionen vorhanden. Sei der Erste und starte eine Petition!"}
              </p>
              <Button className="mt-6" onClick={() => navigate("/create")}>
                Petition starten
              </Button>
            </div>}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4 text-foreground">
              Erfolgsgeschichten
            </h2>
            <p className="text-lg text-muted-foreground font-inter max-w-2xl mx-auto">
              Echte Menschen, echte Veränderungen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-8 bg-card hover:shadow-lg transition-all duration-200">
              <Heart className="h-8 w-8 text-primary mb-4" />
              <p className="text-muted-foreground font-inter italic mb-4 leading-relaxed">
                "Dank MeinWort konnten wir unseren lokalen Park vor der Bebauung retten. 
                Über 5.000 Menschen haben unterschrieben!"
              </p>
              <div className="font-manrope font-semibold text-foreground">Sarah M.</div>
              <div className="text-sm text-muted-foreground font-inter">Berlin</div>
            </Card>

            <Card className="p-8 bg-card hover:shadow-lg transition-all duration-200">
              <Shield className="h-8 w-8 text-secondary mb-4" />
              <p className="text-muted-foreground font-inter italic mb-4 leading-relaxed">
                "Die Plattform hat uns geholfen, mehr Sicherheit an unserer Schule durchzusetzen. 
                Unglaublich, was wir erreicht haben!"
              </p>
              <div className="font-manrope font-semibold text-foreground">Michael K.</div>
              <div className="text-sm text-muted-foreground font-inter">München</div>
            </Card>

            <Card className="p-8 bg-card hover:shadow-lg transition-all duration-200">
              <Target className="h-8 w-8 text-success mb-4" />
              <p className="text-muted-foreground font-inter italic mb-4 leading-relaxed">
                "Eine einfache Petition hat zu echter Veränderung geführt. 
                Unsere Stadt investiert jetzt in nachhaltige Mobilität!"
              </p>
              <div className="font-manrope font-semibold text-foreground">Anna L.</div>
              <div className="text-sm text-muted-foreground font-inter">Hamburg</div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary via-primary-hover to-primary overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-5xl font-poppins font-bold mb-6 text-primary-foreground">
            Starte jetzt deine Petition
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto text-primary-foreground/90 font-inter leading-relaxed">
            Hast du ein Anliegen, das dir am Herzen liegt? Mobilisiere Menschen für dein Thema 
            und bewirke echte Veränderung in deiner Gemeinde.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all" 
            onClick={() => navigate("/create")}
          >
            <PenLine className="mr-2 h-5 w-5" />
            Jetzt loslegen
          </Button>
        </div>
      </section>
    </Layout>;
};
export default Index;