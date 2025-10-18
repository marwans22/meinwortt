import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Kontakt = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("contact_requests").insert({
        name,
        email,
        subject,
        message,
      });

      if (error) throw error;

      toast.success("Ihre Nachricht wurde erfolgreich gesendet!");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error("Fehler beim Senden der Nachricht");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center">Kontakt</h1>
          <p className="text-muted-foreground mb-8 text-center">
            Haben Sie Fragen oder Anregungen? Wir helfen Ihnen gerne weiter.
          </p>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Kontaktformular</CardTitle>
              <CardDescription>
                Antworten können bis zu 3-5 Werktage dauern.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input 
                    id="name" 
                    required 
                    placeholder="Ihr Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    required 
                    placeholder="ihre.email@beispiel.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Betreff *</Label>
                  <Input 
                    id="subject" 
                    required 
                    placeholder="Worum geht es?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="message">Nachricht *</Label>
                  <Textarea 
                    id="message" 
                    required 
                    rows={6} 
                    placeholder="Ihre Nachricht..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Wird gesendet..." : "Nachricht senden"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Mail className="w-5 h-5" />
              <span>Oder direkt per E-Mail:</span>
            </div>
            <a href="mailto:MeinWortDE@protonmail.com" className="text-primary hover:underline font-medium text-lg">
              MeinWortDE@protonmail.com
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Kontakt;
