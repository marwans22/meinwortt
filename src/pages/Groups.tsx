import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

interface Group {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
  _count?: {
    members: number;
    petitions: number;
  };
}

const Groups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
    loadGroups();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadGroups = async () => {
    setLoading(true);
    try {
      // Fetch groups
      const { data: groupsData, error } = await supabase
        .from("groups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch member counts for all groups
      const { data: memberCounts } = await supabase
        .from("group_members")
        .select("group_id");

      // Fetch petition counts for all groups
      const { data: petitionCounts } = await supabase
        .from("group_petitions")
        .select("group_id");

      // Count members and petitions per group
      const memberCountMap = (memberCounts || []).reduce((acc: any, item: any) => {
        acc[item.group_id] = (acc[item.group_id] || 0) + 1;
        return acc;
      }, {});

      const petitionCountMap = (petitionCounts || []).reduce((acc: any, item: any) => {
        acc[item.group_id] = (acc[item.group_id] || 0) + 1;
        return acc;
      }, {});

      const processedGroups = (groupsData || []).map((group: any) => ({
        ...group,
        _count: {
          members: memberCountMap[group.id] || 0,
          petitions: petitionCountMap[group.id] || 0,
        },
      }));

      setGroups(processedGroups);
    } catch (error: any) {
      console.error("Error loading groups:", error);
      toast.error("Fehler beim Laden der Gruppen");
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold">Gruppen entdecken</h1>
              <p className="text-muted-foreground mt-2 text-sm md:text-base">
                Finde Organisationen und Gemeinschaften, die sich für wichtige Themen einsetzen
              </p>
            </div>
            {user && (
              <Button onClick={() => navigate("/groups/create")} size="lg" className="w-full md:w-auto md:self-start">
                <Plus className="w-5 h-5 mr-2" />
                Gruppe erstellen
              </Button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Gruppen durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="w-16 h-16 bg-muted rounded-full mb-4" />
                    <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : filteredGroups.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Keine Gruppen gefunden</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Versuche eine andere Suche"
                    : "Sei der Erste und erstelle eine Gruppe!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredGroups.map((group) => (
                <Link key={group.id} to={`/groups/${group.id}`}>
                  <Card className="hover-scale transition-all cursor-pointer h-full active:scale-95">
                    <CardHeader className="space-y-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-14 h-14 md:w-16 md:h-16 shrink-0">
                          <AvatarImage src={group.logo_url || undefined} />
                          <AvatarFallback className="text-lg md:text-xl">
                            {group.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="line-clamp-2 text-base md:text-lg">{group.name}</CardTitle>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-3 text-sm">
                        {group.description || "Keine Beschreibung verfügbar"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs px-2.5 py-1">
                          <Users className="w-3 h-3 mr-1" />
                          {group._count?.members || 0} {(group._count?.members || 0) === 1 ? "Mitglied" : "Mitglieder"}
                        </Badge>
                        <Badge variant="outline" className="text-xs px-2.5 py-1">
                          {group._count?.petitions || 0} {(group._count?.petitions || 0) === 1 ? "Petition" : "Petitionen"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Groups;
