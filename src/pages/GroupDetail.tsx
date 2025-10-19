import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Users, Settings, FileText, UserPlus, UserMinus } from "lucide-react";
import { PetitionCard } from "@/components/PetitionCard";
import { GroupChat } from "@/components/GroupChat";

interface GroupMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

interface GroupData {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  created_by: string;
  created_at: string;
}

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [petitions, setPetitions] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    initializeData();
  }, [id]);

  // Realtime subscription for members
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`group-members-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "group_members",
          filter: `group_id=eq.${id}`,
        },
        () => {
          loadMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const initializeData = async () => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      
      await Promise.all([
        loadGroup(),
        loadMembers(),
        loadPetitions(),
      ]);

      // Check user membership after loading members
      if (currentUser) {
        await checkUserMembership(currentUser.id);
      }
    } catch (error) {
      console.error("Error initializing data:", error);
      toast.error("Fehler beim Laden der Gruppe");
      navigate("/groups");
    } finally {
      setLoading(false);
    }
  };

  const loadGroup = async () => {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    
    setGroup(data);
    setName(data.name);
    setDescription(data.description || "");
  };

  const loadMembers = async () => {
    // First get members
    const { data: membersData, error: membersError } = await supabase
      .from("group_members")
      .select("id, user_id, role, joined_at")
      .eq("group_id", id)
      .order("joined_at", { ascending: true });

    if (membersError) {
      console.error("Error loading members:", membersError);
      return;
    }

    if (!membersData || membersData.length === 0) {
      setMembers([]);
      return;
    }

    // Get user IDs
    const userIds = [...new Set(membersData.map((m) => m.user_id))];

    // Fetch profiles separately
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error loading profiles:", profilesError);
      return;
    }

    // Build profiles map
    const profilesMap = new Map(
      profilesData?.map((p) => [p.id, p]) || []
    );

    // Combine data
    const membersWithProfiles = membersData.map((member) => ({
      ...member,
      profiles: profilesMap.get(member.user_id) || {
        id: member.user_id,
        full_name: "Unbekannt",
        avatar_url: null,
      },
    }));

    setMembers(membersWithProfiles as GroupMember[]);
  };

  const checkUserMembership = async (userId: string) => {
    const { data } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", id)
      .eq("user_id", userId)
      .maybeSingle();

    const membershipExists = !!data;
    const isGroupAdmin = data?.role === "admin" || group?.created_by === userId;

    setIsMember(membershipExists);
    setIsAdmin(isGroupAdmin);
  };

  const loadPetitions = async () => {
    const { data } = await supabase
      .from("group_petitions")
      .select(`
        petition_id,
        petitions (
          id,
          title,
          description,
          category,
          image_url,
          goal,
          created_at
        )
      `)
      .eq("group_id", id);

    setPetitions(data?.map((p: any) => p.petitions).filter(Boolean) || []);
  };

  const handleJoin = async () => {
    if (!user) {
      toast.error("Bitte melde dich an");
      return;
    }

    try {
      const { error } = await supabase.from("group_members").insert({
        group_id: id,
        user_id: user.id,
        role: "member",
      });

      if (error) throw error;
      
      toast.success("Du bist der Gruppe beigetreten!");
      await loadMembers();
      await checkUserMembership(user.id);
    } catch (error: any) {
      console.error("Error joining group:", error);
      toast.error("Fehler beim Beitreten");
    }
  };

  const handleLeave = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      
      toast.success("Du hast die Gruppe verlassen");
      setIsMember(false);
      setIsAdmin(false);
      await loadMembers();
    } catch (error: any) {
      console.error("Error leaving group:", error);
      toast.error("Fehler beim Verlassen");
    }
  };

  const handleSaveGroup = async () => {
    try {
      const { error } = await supabase
        .from("groups")
        .update({ name, description })
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Gruppe aktualisiert");
      setEditMode(false);
      await loadGroup();
    } catch (error: any) {
      console.error("Error updating group:", error);
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const handleToggleAdmin = async (memberId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "member" : "admin";

    try {
      const { error } = await supabase
        .from("group_members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;
      
      toast.success(`Rolle aktualisiert zu ${newRole === "admin" ? "Admin" : "Mitglied"}`);
      await loadMembers();
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error("Fehler beim Aktualisieren der Rolle");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      
      toast.success("Mitglied entfernt");
      await loadMembers();
    } catch (error: any) {
      console.error("Error removing member:", error);
      toast.error("Fehler beim Entfernen");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto animate-pulse">
            <div className="h-32 bg-muted rounded mb-8" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!group) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-16 animate-fade-in">
        <div className="max-w-6xl mx-auto space-y-8">
          <Card>
            <CardHeader className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <Avatar className="w-20 h-20 md:w-24 md:h-24 mx-auto md:mx-0">
                  <AvatarImage src={group.logo_url || undefined} />
                  <AvatarFallback className="text-2xl md:text-3xl">
                    {group.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  {editMode ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Gruppenname</Label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-12"
                        />
                      </div>
                      <div>
                        <Label>Beschreibung</Label>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={handleSaveGroup} size="lg" className="w-full sm:w-auto">
                          Speichern
                        </Button>
                        <Button variant="outline" onClick={() => setEditMode(false)} size="lg" className="w-full sm:w-auto">
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <CardTitle className="text-2xl md:text-3xl mb-2">{group.name}</CardTitle>
                      <CardDescription className="text-base">
                        {group.description || "Keine Beschreibung"}
                      </CardDescription>
                      <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                        <Badge variant="secondary" className="text-sm px-3 py-1.5">
                          <Users className="w-3.5 h-3.5 mr-1.5" />
                          {members.length} {members.length === 1 ? "Mitglied" : "Mitglieder"}
                        </Badge>
                        <Badge variant="outline" className="text-sm px-3 py-1.5">
                          <FileText className="w-3.5 h-3.5 mr-1.5" />
                          {petitions.length} {petitions.length === 1 ? "Petition" : "Petitionen"}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {!editMode && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  {isAdmin && (
                    <Button variant="outline" onClick={() => setEditMode(true)} size="lg" className="w-full sm:w-auto">
                      <Settings className="w-4 h-4 mr-2" />
                      Bearbeiten
                    </Button>
                  )}
                  {user && !isMember && (
                    <Button onClick={handleJoin} size="lg" className="w-full sm:w-auto">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Beitreten
                    </Button>
                  )}
                  {isMember && !isAdmin && (
                    <Button variant="outline" onClick={handleLeave} size="lg" className="w-full sm:w-auto">
                      <UserMinus className="w-4 h-4 mr-2" />
                      Verlassen
                    </Button>
                  )}
                </div>
              )}
            </CardHeader>
          </Card>

          <Tabs defaultValue="petitions" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="petitions">Petitionen</TabsTrigger>
              <TabsTrigger value="members">Mitglieder</TabsTrigger>
              {isMember && <TabsTrigger value="chat">Chat</TabsTrigger>}
            </TabsList>

            <TabsContent value="petitions" className="space-y-6">
              {petitions.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Keine Petitionen</h3>
                    <p className="text-muted-foreground">
                      Diese Gruppe hat noch keine Petitionen erstellt.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {petitions.map((petition) => (
                    <PetitionCard
                      key={petition.id}
                      id={petition.id}
                      title={petition.title}
                      description={petition.description}
                      goal={petition.goal}
                      signatureCount={0}
                      category={petition.category}
                      imageUrl={petition.image_url}
                      creatorName="Gruppe"
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <div className="mb-4 p-4 bg-muted/50 rounded-lg animate-fade-in">
                <p className="text-sm text-muted-foreground">
                  <Users className="w-4 h-4 inline mr-2" />
                  {members.length} {members.length === 1 ? "Mitglied" : "Mitglieder"} in dieser Gruppe
                </p>
              </div>
              {members.map((member, index) => (
                <Card key={member.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                  <CardContent className="flex items-center justify-between p-4 transition-all hover:bg-muted/50">
                    <Link
                      to={`/profile/${member.user_id}`}
                      className="flex items-center gap-3 flex-1 hover:opacity-80 transition-all group"
                    >
                      <Avatar className="transition-transform group-hover:scale-110">
                        <AvatarImage src={member.profiles?.avatar_url || undefined} />
                        <AvatarFallback>
                          {member.profiles?.full_name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.profiles?.full_name || "Unbekannter Nutzer"}</p>
                        <Badge variant={member.role === "admin" ? "default" : "secondary"} className="mt-1">
                          {member.role === "admin" ? "Admin" : "Mitglied"}
                        </Badge>
                      </div>
                    </Link>
                    {isAdmin && member.user_id !== user?.id && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleAdmin(member.id, member.role)}
                        >
                          {member.role === "admin" ? "Admin entfernen" : "Admin machen"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          Entfernen
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {isMember && user && (
              <TabsContent value="chat">
                <GroupChat groupId={id!} userId={user.id} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default GroupDetail;
