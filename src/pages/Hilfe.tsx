import { Layout } from "@/components/Layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Hilfe = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center">Hilfe & FAQ</h1>
          <p className="text-muted-foreground mb-12 text-center">
            Häufig gestellte Fragen rund um MeinWort
          </p>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Wie erstelle ich eine Petition?</AccordionTrigger>
              <AccordionContent>
                Registrieren Sie sich kostenlos, klicken Sie auf "Petition starten" und füllen Sie das Formular aus. 
                Ihre Petition wird vor Veröffentlichung von unserem Team geprüft.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Kann ich eine Petition ohne Registrierung unterschreiben?</AccordionTrigger>
              <AccordionContent>
                Ja, Sie können als Gast unterschreiben. Sie erhalten dann eine Bestätigungs-E-Mail (Double-Opt-In), 
                um Ihre Unterschrift zu verifizieren.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Wie lange dauert die Moderation meiner Petition?</AccordionTrigger>
              <AccordionContent>
                Unser Team prüft neue Petitionen in der Regel innerhalb von 24-48 Stunden. 
                Sie werden per E-Mail benachrichtigt, sobald Ihre Petition freigeschaltet wurde.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Was passiert mit meinen Daten?</AccordionTrigger>
              <AccordionContent>
                Ihre Daten werden gemäß DSGVO verarbeitet und geschützt. Sie können jederzeit Ihre Daten 
                exportieren oder Ihr Konto löschen. Details finden Sie in unserer Datenschutzerklärung.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>Kann ich meine Petition bearbeiten?</AccordionTrigger>
              <AccordionContent>
                Entwürfe können jederzeit bearbeitet werden. Veröffentlichte Petitionen können nicht 
                mehr grundlegend geändert werden, um die Integrität der Unterschriften zu wahren.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>Wie kann ich meine Petition teilen?</AccordionTrigger>
              <AccordionContent>
                Auf jeder Petitionsseite finden Sie Share-Buttons für soziale Netzwerke. 
                Sie können den Link auch direkt kopieren und per E-Mail oder Messenger teilen.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-12 p-6 bg-muted/50 rounded-lg text-center">
            <p className="text-muted-foreground">
              Weitere Fragen? <a href="/kontakt" className="text-primary hover:underline font-medium">Kontaktieren Sie uns</a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Hilfe;
