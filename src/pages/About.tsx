import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Target, Shield } from "lucide-react";

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            Über MeinWort
          </h1>
          <p className="text-xl text-muted-foreground mb-12 text-center max-w-2xl mx-auto">
            Wir glauben daran, dass jede Stimme zählt. MeinWort ist die Plattform, 
            auf der Menschen ihre Anliegen teilen und gemeinsam Veränderung bewirken können.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <Card>
              <CardHeader>
                <Heart className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Unsere Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  MeinWort ermöglicht es jedem, gehört zu werden. Wir schaffen eine 
                  demokratische Plattform, auf der Bürger*innen ihre Anliegen artikulieren 
                  und Unterstützung mobilisieren können.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Gemeinschaft</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Gemeinsam sind wir stärker. Unsere Plattform verbindet Menschen mit 
                  ähnlichen Anliegen und schafft eine Bewegung für positive Veränderungen 
                  in unserer Gesellschaft.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Wirkung erzielen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Petitionen auf MeinWort haben bereits zu konkreten Veränderungen geführt. 
                  Von lokalen Initiativen bis zu bundesweiten Kampagnen - hier entsteht 
                  echter Impact.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Vertrauen & Sicherheit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Datenschutz und Transparenz sind für uns zentral. Wir schützen deine 
                  Daten gemäß DSGVO und sorgen für einen fairen, respektvollen Umgang 
                  auf unserer Plattform.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Warum MeinWort?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              In einer Zeit, in der viele Menschen das Gefühl haben, nicht gehört zu werden, 
              bietet MeinWort eine Stimme. Wir sind eine unabhängige, gemeinnützige Plattform, 
              die sich der Demokratie und dem gesellschaftlichen Dialog verpflichtet fühlt.
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Jede Petition, jede Unterschrift und jede Diskussion auf MeinWort trägt dazu bei, 
              unsere Gesellschaft ein Stück besser zu machen. Werde Teil dieser Bewegung!
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
