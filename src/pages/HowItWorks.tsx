import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, Target, CheckCircle, Megaphone, Share2 } from "lucide-react";

const HowItWorks = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            So funktioniert's
          </h1>
          <p className="text-xl text-muted-foreground mb-12 text-center max-w-2xl mx-auto">
            In nur wenigen Schritten kannst du eine Petition starten oder bestehende Petitionen unterstützen. 
            Hier erfährst du, wie es geht.
          </p>

          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Eine Petition starten</h2>
            <div className="space-y-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="mb-2">1. Registrieren & Petition erstellen</CardTitle>
                      <CardDescription>
                        Erstelle ein kostenloses Konto und klicke auf "Petition starten". 
                        Beschreibe dein Anliegen präzise und überzeugend. Füge ein aussagekräftiges 
                        Bild hinzu, um mehr Aufmerksamkeit zu erzielen.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="mb-2">2. Moderation & Veröffentlichung</CardTitle>
                      <CardDescription>
                        Unser Team prüft deine Petition innerhalb von 24-48 Stunden auf Einhaltung 
                        unserer Richtlinien. Nach der Freigabe wird deine Petition veröffentlicht 
                        und ist für alle sichtbar.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Share2 className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="mb-2">3. Teilen & Mobilisieren</CardTitle>
                      <CardDescription>
                        Teile deine Petition in sozialen Netzwerken, per E-Mail oder persönlich. 
                        Je mehr Menschen von deinem Anliegen erfahren, desto mehr Unterschriften 
                        kannst du sammeln.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Megaphone className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="mb-2">4. Ziel erreichen & Übergabe</CardTitle>
                      <CardDescription>
                        Wenn du dein Unterschriftenziel erreichst, unterstützen wir dich dabei, 
                        deine Petition an die zuständige Institution zu übergeben. Halte deine 
                        Unterstützer*innen über Fortschritte auf dem Laufenden.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Eine Petition unterstützen</h2>
            <div className="space-y-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="mb-2">1. Petition finden</CardTitle>
                      <CardDescription>
                        Durchsuche unsere Plattform nach Petitionen, die dir am Herzen liegen. 
                        Nutze die Suchfunktion oder filtere nach Kategorien wie Umwelt, 
                        Bildung, Gesundheit und mehr.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="mb-2">2. Unterschreiben</CardTitle>
                      <CardDescription>
                        Klicke auf "Unterschreiben" und gib deine Daten ein. Als registrierter 
                        Nutzer geht das besonders schnell. Auch als Gast kannst du unterschreiben - 
                        du erhältst dann eine Bestätigungs-E-Mail.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Share2 className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="mb-2">3. Weiterverbreiten</CardTitle>
                      <CardDescription>
                        Teile die Petition mit Freunden, Familie und in sozialen Netzwerken. 
                        Jede zusätzliche Unterschrift bringt das Anliegen dem Ziel näher.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>

          <div className="bg-primary/5 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Bereit, aktiv zu werden?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Starte jetzt deine eigene Petition oder unterstütze bestehende Anliegen. 
              Gemeinsam können wir Veränderung bewirken!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="/create">
                <Button size="lg">Petition starten</Button>
              </a>
              <a href="/">
                <Button size="lg" variant="outline">Petitionen entdecken</Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HowItWorks;
