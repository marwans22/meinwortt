import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Shield, 
  FileText, 
  Users, 
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  BarChart3
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminStats } from "@/components/AdminStats";
import { AdminReports } from "@/components/AdminReports";
import { ExportButton } from "@/components/ExportButton";

interface Petition {
  id: string;
  title: string;
  description: string;
  status: string;
  goal: number;
  created_at: string;
  category?: string;
  creator_id: string;
  creator_name?: string;
  creator_email?: string;
}

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [filteredPetitions, setFilteredPetitions] = useState<Petition[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    published: 0,
    draft: 0,
    closed: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  useEffect(() => {
    filterPetitions();
  }, [searchTerm, statusFilter, petitions]);

  const checkAdminAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check admin role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast.error("Keine Berechtigung für diese Seite");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await loadPetitions();
    } catch (error: any) {
      console.error("Error checking admin:", error);
      toast.error("Fehler beim Laden");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadPetitions = async () => {
    try {
      const { data: petitionsData, error } = await supabase
        .from("petitions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch creator profiles
      const petitionsWithCreators = await Promise.all(
        (petitionsData || []).map(async (petition) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", petition.creator_id)
            .single();

          return {
            ...petition,
            creator_name: profile?.full_name || "Unbekannt",
            creator_email: profile?.email || ""
          };
        })
      );

      setPetitions(petitionsWithCreators);
      
      // Calculate stats
      const newStats = {
        total: petitionsWithCreators?.length || 0,
        pending: petitionsWithCreators?.filter(p => p.status === "pending").length || 0,
        published: petitionsWithCreators?.filter(p => p.status === "published").length || 0,
        draft: petitionsWithCreators?.filter(p => p.status === "draft").length || 0,
        closed: petitionsWithCreators?.filter(p => p.status === "closed").length || 0
      };
      setStats(newStats);
    } catch (error: any) {
      console.error("Error loading petitions:", error);
      toast.error("Fehler beim Laden der Petitionen");
    }
  };

  const filterPetitions = () => {
    let filtered = petitions;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.creator_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPetitions(filtered);
  };

  const handlePublishPetition = async (id: string) => {
    try {
      const { error } = await supabase
        .from("petitions")
        .update({ 
          status: "published",
          published_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      await loadPetitions();
      toast.success("Petition veröffentlicht");
    } catch (error: any) {
      toast.error("Fehler beim Veröffentlichen");
    }
  };

  const handleRejectPetition = async (id: string) => {
    try {
      const { error } = await supabase
        .from("petitions")
        .update({ status: "closed" })
        .eq("id", id);

      if (error) throw error;

      await loadPetitions();
      toast.success("Petition abgelehnt");
    } catch (error: any) {
      toast.error("Fehler beim Ablehnen");
    }
  };

  const exportPetitions = async () => {
    try {
      const { data, error } = await supabase
        .from("petitions")
        .select("*")
        .csv();

      if (error) throw error;

      const blob = new Blob([data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `petitionen-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      
      toast.success("Export erfolgreich");
    } catch (error: any) {
      toast.error("Fehler beim Export");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      draft: { variant: "secondary", label: "Entwurf" },
      pending: { variant: "outline", label: "In Prüfung" },
      published: { variant: "default", label: "Aktiv" },
      closed: { variant: "destructive", label: "Geschlossen" }
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Lädt...</p>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Verwalte alle Petitionen und Benutzer auf MeinWort
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Gesamt</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">In Prüfung</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">{stats.published}</div>
              <div className="text-sm text-muted-foreground">Veröffentlicht</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-muted-foreground">{stats.draft}</div>
              <div className="text-sm text-muted-foreground">Entwürfe</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-destructive">{stats.closed}</div>
              <div className="text-sm text-muted-foreground">Geschlossen</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Suche nach Titel, Beschreibung oder Ersteller..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="pending">In Prüfung</SelectItem>
                  <SelectItem value="published">Veröffentlicht</SelectItem>
                  <SelectItem value="draft">Entwürfe</SelectItem>
                  <SelectItem value="closed">Geschlossen</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportPetitions}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Petitions List */}
        <Card>
          <CardHeader>
            <CardTitle>Alle Petitionen</CardTitle>
            <CardDescription>
              {filteredPetitions.length} {filteredPetitions.length === 1 ? "Petition" : "Petitionen"} gefunden
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPetitions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Keine Petitionen gefunden
              </p>
            ) : (
              <div className="space-y-4">
                {filteredPetitions.map((petition) => (
                  <Card key={petition.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold">{petition.title}</h3>
                            {getStatusBadge(petition.status)}
                            {petition.category && (
                              <Badge variant="secondary">{petition.category}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {petition.description}
                          </p>
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>
                                {petition.creator_name || "Unbekannt"} ({petition.creator_email})
                              </span>
                            </div>
                            <div>
                              Erstellt: {new Date(petition.created_at).toLocaleDateString("de-DE")}
                            </div>
                            <div>
                              Ziel: {petition.goal.toLocaleString("de-DE")} Unterschriften
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/petition/${petition.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {petition.status === "pending" && (
                            <>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handlePublishPetition(petition.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Veröffentlichen
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleRejectPetition(petition.id)}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Ablehnen
                              </Button>
                            </>
                          )}
                          {petition.status === "published" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRejectPetition(petition.id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Schließen
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Admin;