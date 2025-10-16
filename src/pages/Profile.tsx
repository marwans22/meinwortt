import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  User, 
  Settings, 
  FileText, 
  Edit, 
  Trash2, 
  Eye,
  LogOut,
  Shield,
  Download,
  Lock
} from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Petition {
  id: string;
  title: string;
  description: string;
  status: string;
  goal: number;
  created_at: string;
  category?: string;
  image_url?: string;
}

interface Signature {
  id: string;
  petition_id: string;
  signer_name: string;
  signer_email: string;
  verification_status: string;
  created_at: string;
  petitions?: {
    title: string;
  };
}

const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ full_name: "", bio: "" });
  const [passwordChange, setPasswordChange] = useState({ current: "", new: "", confirm: "" });
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      // Determine which profile to load
      const profileId = id || authUser?.id;
      
      if (!profileId) {
        navigate("/auth");
        return;
      }

      setUser(authUser);
      setIsOwnProfile(!id || (authUser && id === authUser.id));

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        setEditedProfile({ 
          full_name: profileData.full_name || "", 
          bio: profileData.bio || "" 
        });
      }

      // Check if admin (only for own profile)
      if (authUser && profileId === authUser.id) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", authUser.id)
          .eq("role", "admin")
          .maybeSingle();

        setIsAdmin(!!roleData);
      }

      // Load petitions
      const { data: petitionsData } = await supabase
        .from("petitions")
        .select("*")
        .eq("creator_id", profileId)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      setPetitions(petitionsData || []);

      // Load signatures only for own profile
      if (authUser && profileId === authUser.id) {
        const { data: signaturesData } = await supabase
          .from("signatures")
          .select(`
            *,
            petitions:petition_id (
              title
            )
          `)
          .order("created_at", { ascending: false });

        setSignatures(signaturesData || []);
      }

    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error("Fehler beim Laden des Profils");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("meinwort_logged_in");
    navigate("/");
    toast.success("Erfolgreich abgemeldet");
  };

  const handleProfileUpdate = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editedProfile.full_name,
          bio: editedProfile.bio
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile({ ...profile, ...editedProfile });
      setEditMode(false);
      toast.success("Profil erfolgreich aktualisiert");
    } catch (error: any) {
      toast.error("Fehler beim Aktualisieren des Profils");
    }
  };

  const handlePasswordChange = async () => {
    if (passwordChange.new !== passwordChange.confirm) {
      toast.error("Passwörter stimmen nicht überein");
      return;
    }

    if (passwordChange.new.length < 6) {
      toast.error("Passwort muss mindestens 6 Zeichen lang sein");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordChange.new
      });

      if (error) throw error;

      setPasswordChange({ current: "", new: "", confirm: "" });
      toast.success("Passwort erfolgreich geändert");
    } catch (error: any) {
      toast.error("Fehler beim Ändern des Passworts");
    }
  };

  const handleDeletePetition = async (id: string) => {
    try {
      const { error } = await supabase
        .from("petitions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setPetitions(petitions.filter(p => p.id !== id));
      toast.success("Petition gelöscht");
    } catch (error: any) {
      toast.error("Fehler beim Löschen der Petition");
    }
  };

  const handlePublishPetition = async (id: string) => {
    try {
      const { error } = await supabase
        .from("petitions")
        .update({ status: "published", published_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      setPetitions(petitions.map(p => 
        p.id === id ? { ...p, status: "published" } : p
      ));
      toast.success("Petition veröffentlicht");
    } catch (error: any) {
      toast.error("Fehler beim Veröffentlichen der Petition");
    }
  };

  const exportData = async () => {
    try {
      const data = {
        profile,
        petitions,
        signatures: signatures.filter(s => s.signer_email === user.email)
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `meinwort-daten-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      
      toast.success("Daten erfolgreich exportiert");
    } catch (error) {
      toast.error("Fehler beim Exportieren der Daten");
    }
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

  if (!user || !profile) {
    return null;
  }

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

  const stats = {
    totalPetitions: petitions.length,
    activePetitions: petitions.filter(p => p.status === "published").length,
    draftPetitions: petitions.filter(p => p.status === "draft").length,
    totalSignatures: signatures.filter(s => s.verification_status === "verified").length
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {profile.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{profile.full_name || "Unbekannt"}</h1>
                  {isAdmin && (
                    <Badge variant="default" className="bg-gradient-to-r from-primary to-primary/80">
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-4">{user.email}</p>
                {profile.bio && (
                  <p className="text-sm mb-4">{profile.bio}</p>
                )}
                
                <div className="flex flex-wrap gap-3">
                  {isOwnProfile && (
                    <>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center justify-center gap-2 w-full sm:w-auto">
                            <Edit className="w-4 h-4 shrink-0" />
                            <span className="text-sm">Profil bearbeiten</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Profil bearbeiten</DialogTitle>
                            <DialogDescription>
                              Aktualisiere deine Profilinformationen
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="name">Name</Label>
                              <Input
                                id="name"
                                value={editedProfile.full_name}
                                onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="bio">Bio</Label>
                              <Textarea
                                id="bio"
                                value={editedProfile.bio}
                                onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                                rows={4}
                              />
                            </div>
                            <Button onClick={handleProfileUpdate} className="w-full">
                              Speichern
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center justify-center gap-2 w-full sm:w-auto">
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span className="text-sm">Abmelden</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        {isOwnProfile && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{stats.totalPetitions}</div>
                <div className="text-sm text-muted-foreground">Gesamt Petitionen</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-primary">{stats.activePetitions}</div>
                <div className="text-sm text-muted-foreground">Aktive Petitionen</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-muted-foreground">{stats.draftPetitions}</div>
                <div className="text-sm text-muted-foreground">Entwürfe</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-success">{stats.totalSignatures}</div>
                <div className="text-sm text-muted-foreground">Unterschriften</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        {isOwnProfile ? (
          <Tabs defaultValue="petitions" className="space-y-6">
            <TabsList className="flex flex-col lg:flex-row w-full h-auto gap-2 p-2">
              <TabsTrigger value="petitions" className="w-full justify-center gap-2 px-4 py-3">
                <FileText className="w-4 h-4 shrink-0" />
                <span className="text-sm md:text-base">Meine Petitionen</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="w-full justify-center gap-2 px-4 py-3">
                <Settings className="w-4 h-4 shrink-0" />
                <span className="text-sm md:text-base">Einstellungen</span>
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="admin" className="w-full justify-center gap-2 px-4 py-3">
                  <Shield className="w-4 h-4 shrink-0" />
                  <span className="text-sm md:text-base">Admin</span>
                </TabsTrigger>
              )}
            </TabsList>

          {/* Petitions Tab */}
          <TabsContent value="petitions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Meine Petitionen</CardTitle>
                <CardDescription>Alle deine erstellten Petitionen</CardDescription>
              </CardHeader>
              <CardContent>
                {petitions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Du hast noch keine Petitionen erstellt
                  </p>
                ) : (
                  <div className="space-y-4">
                    {petitions.map((petition) => (
                      <Card key={petition.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-6">
                          <div className="space-y-4">
                            {/* Petition Info */}
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="text-base sm:text-lg font-semibold break-words">{petition.title}</h3>
                                {getStatusBadge(petition.status)}
                                {petition.category && (
                                  <Badge variant="secondary" className="text-xs">{petition.category}</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {petition.description}
                              </p>
                              <div className="text-xs text-muted-foreground">
                                Erstellt am {new Date(petition.created_at).toLocaleDateString("de-DE")}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => navigate(`/petition/${petition.id}`)} 
                                className="flex-1 sm:flex-none"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                <span>Ansehen</span>
                              </Button>
                              {(petition.status === "draft" || isAdmin) && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => navigate(`/create?edit=${petition.id}`)} 
                                  className="flex-1 sm:flex-none"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  <span>Bearbeiten</span>
                                </Button>
                              )}
                              {isAdmin && petition.status === "pending" && (
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  onClick={() => handlePublishPetition(petition.id)} 
                                  className="flex-1 sm:flex-none"
                                >
                                  <span>Veröffentlichen</span>
                                </Button>
                              )}
                              {(petition.status === "draft" || isAdmin) && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" className="flex-1 sm:flex-none">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      <span>Löschen</span>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Petition löschen?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Diese Aktion kann nicht rückgängig gemacht werden.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeletePetition(petition.id)}>
                                        Löschen
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
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
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Einstellungen</CardTitle>
                <CardDescription>Verwalte dein Konto und deine Daten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Passwort ändern</h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <Label htmlFor="new-password">Neues Passwort</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwordChange.new}
                        onChange={(e) => setPasswordChange({ ...passwordChange, new: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Mindestens 6 Zeichen. Empfohlen: Groß- und Kleinbuchstaben, Zahlen, Sonderzeichen
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Passwort bestätigen</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordChange.confirm}
                        onChange={(e) => setPasswordChange({ ...passwordChange, confirm: e.target.value })}
                      />
                    </div>
                    <Button onClick={handlePasswordChange} className="w-full sm:w-auto flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4 shrink-0" />
                      <span className="text-sm">Passwort ändern</span>
                    </Button>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Datenschutz (DSGVO)</h3>
                  <div className="space-y-3">
                    <Button variant="outline" onClick={exportData} className="w-full sm:w-auto flex items-center justify-center gap-2">
                      <Download className="w-4 h-4 shrink-0" />
                      <span className="text-sm">Daten exportieren</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full sm:w-auto flex items-center justify-center gap-2">
                          <Trash2 className="w-4 h-4 shrink-0" />
                          <span className="text-sm">Account löschen</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Account unwiderruflich löschen?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Daten werden permanent gelöscht.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground">
                            Unwiderruflich löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tab */}
          {isAdmin && (
            <TabsContent value="admin" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Admin Dashboard
                  </CardTitle>
                  <CardDescription>Erweiterte Verwaltungsfunktionen</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-4"
                      onClick={() => navigate("/admin")}
                    >
                      <div className="flex-1 text-left">
                        <div className="font-semibold">Vollständiges Admin Dashboard</div>
                        <div className="text-sm text-muted-foreground">
                          Alle Petitionen, Moderation, Statistiken
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
        ) : (
          // Public profile view
          <Card>
            <CardHeader>
              <CardTitle>Petitionen von {profile.full_name}</CardTitle>
              <CardDescription>Veröffentlichte Petitionen</CardDescription>
            </CardHeader>
            <CardContent>
              {petitions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Dieser Nutzer hat noch keine Petitionen veröffentlicht
                </p>
              ) : (
                <div className="space-y-4">
                  {petitions.map((petition) => (
                    <Card key={petition.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/petition/${petition.id}`)}>
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-1 truncate">
                              {petition.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {petition.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Profile;