import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Users, Settings, FileText, UserPlus, UserMinus, Shield } from "lucide-react";
import { PetitionCard } from "@/components/PetitionCard";
import { GroupChat } from "@/components/GroupChat";
import { Link } from "react-router-dom";

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [petitions, setPetitions] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const channel = (supabase as any)
      .channel(`members-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "group_members",
          filter: `group_id=eq.${id}`,
        },
        () => {
          // Reload members when changes occur
          loadGroup(user);
        }
      )
      .subscribe();

    return () => {
      (supabase as any).removeChannel(channel);
    };
  }, [id, user]);

  useEffect(() => {
    loadUserAndGroup();
  }, [id]);

  const loadUserAndGroup = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    await loadGroup(user);
  };

  const loadGroup = async (currentUser?: any) => {
    setLoading(true);
    try {
      const { data: groupData, error } = await supabase
        .from("groups")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setGroup(groupData);
      setName(groupData.name);
      setDescription(groupData.description || "");

      // Load members
      const { data: membersData } = await supabase
        .from("group_members")
        .select(`
          *,
          profiles!group_members_user_id_fkey(full_name, avatar_url)
        `)
        .eq("group_id", id);

      setMembers(membersData || []);

      // Check if current user is member/admin
      const userToCheck = currentUser || user;
      if (userToCheck) {
        const userMembership = membersData?.find((m: any) => m.user_id === userToCheck.id);
        setIsMember(!!userMembership || groupData?.created_by === userToCheck.id);
        setIsAdmin((userMembership?.role === "admin") || groupData?.created_by === userToCheck.id);
      }

      // Load petitions
      const { data: petitionsData } = await supabase
        .from("group_petitions")
        .select(`
          petition_id,
          petitions(*)
        `)
        .eq("group_id", id);

      setPetitions(petitionsData?.map((p: any) => p.petitions) || []);
    } catch (error: any) {
      console.error("Error loading group:", error);
      toast.error("Fehler beim Laden der Gruppe");
      navigate("/groups");
    } finally {
      setLoading(false);
    }
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
      loadGroup(user);
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
      loadGroup(user);
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
      loadGroup(user);
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
      loadGroup(user);
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
      loadGroup(user);
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
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
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
                          {(members.length || (user?.id === group.created_by ? 1 : 0))} {(members.length || (user?.id === group.created_by ? 1 : 0)) === 1 ? "Mitglied" : "Mitglieder"}
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
                  {user && !isMember && user.id !== group.created_by && (
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

          {/* Tabs */}
          <Tabs defaultValue="petitions">
            <TabsList>
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
                  {petitions.map((petition: any) => (
                    <PetitionCard 
                      key={petition.id}
                      id={petition.id}
                      title={petition.title}
                      description={petition.description}
                      goal={petition.goal}
                      signatureCount={0}
                      category={petition.category || undefined}
                      imageUrl={petition.image_url || undefined}
                      creatorName="Unbekannt"
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
                <Card key={member.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
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

            {isMember && (
              <TabsContent value="chat">
                <GroupChat groupId={id!} userId={user?.id!} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default GroupDetail;
