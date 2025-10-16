import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload } from "lucide-react";

const CreateGroup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Bitte melde dich an");
        return;
      }

      let logoUrl = null;

      // Upload logo if provided
      if (logoFile) {
        const fileExt = logoFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("petition-images")
          .upload(filePath, logoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("petition-images")
          .getPublicUrl(filePath);

        logoUrl = publicUrl;
      }

      // Create group
      const { data, error } = await supabase
        .from("groups")
        .insert({
          name,
          description,
          logo_url: logoUrl,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Gruppe erfolgreich erstellt!");
      navigate(`/groups/${data.id}`);
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error("Fehler beim Erstellen der Gruppe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Neue Gruppe erstellen</CardTitle>
              <CardDescription>
                Erstelle eine Gruppe, um gemeinsam mit anderen für wichtige Themen zu kämpfen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Gruppenname *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="z.B. Umweltschutz Berlin"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Beschreibe die Mission und Ziele deiner Gruppe..."
                    className="min-h-[150px]"
                    maxLength={1000}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Gruppenlogo (optional)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("logo")?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Logo hochladen
                    </Button>
                    {logoPreview && (
                      <img
                        src={logoPreview}
                        alt="Logo Vorschau"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading || !name.trim()}>
                    {loading ? "Wird erstellt..." : "Gruppe erstellen"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/groups")}
                  >
                    Abbrechen
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CreateGroup;
