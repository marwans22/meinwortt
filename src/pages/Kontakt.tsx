import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

const Kontakt = () => {
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
              <form className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" required placeholder="Ihr Name" />
                </div>
                <div>
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input id="email" type="email" required placeholder="ihre.email@beispiel.de" />
                </div>
                <div>
                  <Label htmlFor="subject">Betreff *</Label>
                  <Input id="subject" required placeholder="Worum geht es?" />
                </div>
                <div>
                  <Label htmlFor="message">Nachricht *</Label>
                  <Textarea id="message" required rows={6} placeholder="Ihre Nachricht..." />
                </div>
                <Button type="submit" className="w-full">Nachricht senden</Button>
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
