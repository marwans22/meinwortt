import { Layout } from "@/components/Layout";

const AGB = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
          <h1>Allgemeine Geschäftsbedingungen (AGB)</h1>
          
          <h2>1. Geltungsbereich</h2>
          <p>Diese AGB gelten für die Nutzung der Plattform MeinWort.de.</p>

          <h2>2. Registrierung und Nutzerkonto</h2>
          <p>Die Registrierung ist kostenlos. Sie verpflichten sich, wahrheitsgemäße Angaben zu machen.</p>

          <h2>3. Petitionen erstellen</h2>
          <p>Petitionen müssen gesetzeskonform sein und dürfen nicht gegen gute Sitten verstoßen.</p>

          <h2>4. Moderation</h2>
          <p>Wir behalten uns vor, Petitionen vor Veröffentlichung zu prüfen und gegebenenfalls abzulehnen.</p>

          <h2>5. Haftungsausschluss</h2>
          <p>MeinWort haftet nicht für Inhalte von Nutzer-generierten Petitionen.</p>

          <p className="text-sm text-muted-foreground mt-8">Stand: {new Date().toLocaleDateString('de-DE')}</p>
        </div>
      </div>
    </Layout>
  );
};

export default AGB;
