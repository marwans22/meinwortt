import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, Database, Mail, Cookie, UserCheck, FileText, AlertCircle } from "lucide-react";

const Datenschutz = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Datenschutzerklärung</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. 
              Wir verarbeiten Ihre Daten ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO).
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="default" className="text-xs">DSGVO-konform</Badge>
              <Badge variant="secondary" className="text-xs">Transparent</Badge>
              <Badge variant="secondary" className="text-xs">Sicher</Badge>
            </div>
          </div>

          <div className="space-y-6">
            {/* Verantwortliche Stelle */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <UserCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Verantwortliche Stelle</CardTitle>
                    <CardDescription>Kontakt für Datenschutzfragen</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-lg font-semibold">MeinWort</p>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href="mailto:MeinWortDE@protonmail.com" className="text-primary hover:underline">
                    MeinWortDE@protonmail.com
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Welche Daten wir sammeln */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Database className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Welche Daten wir sammeln</CardTitle>
                    <CardDescription>Übersicht über die erfassten Informationen</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Automatisch erfasste Daten */}
                <div className="border-l-4 border-primary/30 pl-4 py-2">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    Automatisch erfasste Daten
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Beim Besuch unserer Website werden automatisch Informationen allgemeiner Natur erfasst (Server-Logfiles):
                  </p>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Art des Webbrowsers und verwendetes Betriebssystem</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Domainnamen Ihres Internet Service Providers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Datum und Uhrzeit des Zugriffs</span>
                    </li>
                  </ul>
                </div>

                {/* Registrierung */}
                <div className="border-l-4 border-secondary/30 pl-4 py-2">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-secondary" />
                    Registrierung und Petition erstellen
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Wenn Sie sich registrieren oder eine Petition erstellen:
                  </p>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-secondary mt-1">•</span>
                      <span>Vorname und Nachname</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary mt-1">•</span>
                      <span>E-Mail-Adresse</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary mt-1">•</span>
                      <span>Anzeigename (optional)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary mt-1">•</span>
                      <span>Profil-Informationen (optional)</span>
                    </li>
                  </ul>
                </div>

                {/* Petitionen unterschreiben */}
                <div className="border-l-4 border-success/30 pl-4 py-2">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-success" />
                    Petitionen unterschreiben
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Wenn Sie eine Petition unterschreiben, speichern wir:
                  </p>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-1">•</span>
                      <span>Ihren Namen (wie Sie ihn angeben)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-1">•</span>
                      <span>E-Mail-Adresse</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-1">•</span>
                      <span>Zeitstempel der Unterschrift</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-1">•</span>
                      <span>IP-Adresse (zur Betrugsprävention, anonymisiert)</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Zweck der Datenverarbeitung */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Zweck der Datenverarbeitung</CardTitle>
                    <CardDescription>Wofür wir Ihre Daten verwenden</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="p-1.5 rounded-md bg-primary/10 mt-0.5">
                      <UserCheck className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Bereitstellung und Verwaltung Ihres Benutzerkontos</p>
                      <p className="text-sm text-muted-foreground">Zur Authentifizierung und Personalisierung</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1.5 rounded-md bg-primary/10 mt-0.5">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Erstellung und Verwaltung von Petitionen</p>
                      <p className="text-sm text-muted-foreground">Damit Sie Ihre Anliegen veröffentlichen können</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1.5 rounded-md bg-primary/10 mt-0.5">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Verarbeitung und Verifizierung von Unterschriften</p>
                      <p className="text-sm text-muted-foreground">Um Betrug zu verhindern und Echtheit sicherzustellen</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1.5 rounded-md bg-primary/10 mt-0.5">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Kommunikation und Benachrichtigungen</p>
                      <p className="text-sm text-muted-foreground">Updates über Ihre Petitionen (mit Ihrer Zustimmung)</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Cookie className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Cookies</CardTitle>
                    <CardDescription>Wie wir Cookies verwenden</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Unsere Website verwendet Cookies – kleine Textdateien, die auf Ihrem Gerät gespeichert werden:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      Notwendige Cookies
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Für grundlegende Funktionalität (Session-Management, Authentifizierung)
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-primary" />
                      Präferenz-Cookies
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Um Ihre Einstellungen und Entwürfe zu speichern
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datenweitergabe */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <CardTitle>Datenweitergabe</CardTitle>
                    <CardDescription className="text-destructive">
                      Ihre Daten werden nicht an Dritte weitergegeben!
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <p className="font-semibold text-success mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    100% Datenschutz garantiert
                  </p>
                  <p className="text-sm">
                    Wir geben Ihre personenbezogenen Daten nur weiter, wenn:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-1">✓</span>
                      <span>Sie uns dafür Ihre ausdrückliche Einwilligung erteilt haben</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-1">✓</span>
                      <span>Die Weitergabe zur Erfüllung einer rechtlichen Verpflichtung notwendig ist</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-1">✓</span>
                      <span>Dies zur Durchsetzung unserer Rechte erforderlich ist</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Ihre Rechte */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Ihre Rechte</CardTitle>
                    <CardDescription>Sie haben die volle Kontrolle über Ihre Daten</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Auskunftsrecht</h4>
                    <p className="text-sm text-muted-foreground">
                      Sie können jederzeit Auskunft über Ihre gespeicherten Daten verlangen
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Berichtigungsrecht</h4>
                    <p className="text-sm text-muted-foreground">
                      Sie können falsche Daten korrigieren lassen
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Löschungsrecht</h4>
                    <p className="text-sm text-muted-foreground">
                      Sie können Ihre Daten löschen lassen
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Widerspruchsrecht</h4>
                    <p className="text-sm text-muted-foreground">
                      Sie können der Datenverarbeitung widersprechen
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm">
                    <strong>Kontaktieren Sie uns:</strong> Für alle Anfragen bezüglich Ihrer Daten wenden Sie sich bitte an{" "}
                    <a href="mailto:MeinWortDE@protonmail.com" className="text-primary hover:underline">
                      MeinWortDE@protonmail.com
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Datensicherheit */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Lock className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <CardTitle>Datensicherheit</CardTitle>
                    <CardDescription>Wie wir Ihre Daten schützen</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Wir verwenden modernste Sicherheitsmaßnahmen, um Ihre Daten zu schützen:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-md bg-success/10 mt-0.5">
                      <Shield className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">SSL/TLS-Verschlüsselung</p>
                      <p className="text-sm text-muted-foreground">
                        Alle Datenübertragungen sind verschlüsselt
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-md bg-success/10 mt-0.5">
                      <Lock className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">Passwort-Hashing</p>
                      <p className="text-sm text-muted-foreground">
                        Passwörter werden sicher verschlüsselt gespeichert
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-md bg-success/10 mt-0.5">
                      <Database className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">Sichere Datenbanken</p>
                      <p className="text-sm text-muted-foreground">
                        Ihre Daten werden in sicheren, europäischen Rechenzentren gespeichert
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Aktualisierung */}
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground text-center">
                  <strong>Letzte Aktualisierung:</strong> Dezember 2024
                  <br />
                  Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen. 
                  Bitte prüfen Sie diese Seite regelmäßig.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Datenschutz;
