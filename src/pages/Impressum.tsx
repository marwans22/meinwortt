import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const Impressum = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Impressum</h1>
          
          <Card className="mb-8 border-yellow-500/50 bg-yellow-500/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <CardTitle className="text-yellow-900 dark:text-yellow-100">In Bearbeitung</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Das vollständige Impressum wird in Kürze bereitgestellt. 
                Diese Seite befindet sich derzeit in Bearbeitung.
              </p>
              <p className="mt-4 text-muted-foreground">
                Für dringende Anfragen kontaktieren Sie uns bitte unter:{" "}
                <a 
                  href="mailto:MeinWortDE@protonmail.com" 
                  className="text-primary hover:underline font-medium"
                >
                  MeinWortDE@protonmail.com
                </a>
              </p>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground">
            <h2 className="font-semibold text-foreground mb-2">Platzhalter-Informationen:</h2>
            <p className="mb-2">
              <strong>Plattform:</strong> MeinWort.de
            </p>
            <p className="mb-2">
              <strong>E-Mail:</strong>{" "}
              <a href="mailto:MeinWortDE@protonmail.com" className="text-primary hover:underline">
                MeinWortDE@protonmail.com
              </a>
            </p>
            <p className="mt-6 text-xs">
              Gemäß §5 TMG und §55 RStV ist jede kommerzielle Website verpflichtet, 
              ein vollständiges Impressum bereitzustellen. Diese Informationen werden 
              zeitnah ergänzt.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Impressum;
