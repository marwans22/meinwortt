import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "signin";
  const [isSignUp, setIsSignUp] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync isSignUp with URL mode
  useEffect(() => {
    setIsSignUp(mode === "signup");
  }, [mode]);

  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumberOrSpecial: false
  });
  useEffect(() => {
    // Validate password
    setPasswordValidation({
      minLength: password.length >= 6,
      hasUppercase: /[A-Z]/.test(password),
      hasNumberOrSpecial: /[0-9!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [password]);
  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getUser().then(({
      data: {
        user
      }
    }) => {
      if (user) {
        navigate("/");
      }
    });
  }, [navigate]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password for sign up
    if (isSignUp) {
      if (!passwordValidation.minLength || !passwordValidation.hasUppercase || !passwordValidation.hasNumberOrSpecial) {
        toast.error("Bitte erfülle alle Passwort-Anforderungen");
        return;
      }
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const redirectUrl = `${window.location.origin}/`;
        const {
          data,
          error
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName
            }
          }
        });
        if (error) throw error;

        // Auto-login after signup
        if (data.user) {
          toast.success("Registrierung erfolgreich! Du bist jetzt angemeldet.");
          navigate("/");
        } else {
          toast.success("Registrierung erfolgreich! Du kannst dich jetzt anmelden.");
          setIsSignUp(false);
          setPassword("");
        }
      } else {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        toast.success("Erfolgreich angemeldet!");
        navigate("/");
      }
    } catch (error: any) {
      if (error.message.includes("already registered")) {
        toast.error("Diese E-Mail ist bereits registriert. Bitte melde dich an.");
      } else if (error.message.includes("Invalid")) {
        toast.error("Ungültige E-Mail oder Passwort.");
      } else {
        toast.error(error.message || "Ein Fehler ist aufgetreten");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      const {
        error
      } = await supabase.auth.signInWithOAuth({
        provider: "google"
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Ein Fehler ist aufgetreten");
    }
  };
  return <Layout>
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isSignUp ? "Registrieren" : "Anmelden"}
            </CardTitle>
            <CardDescription>
              {isSignUp ? "Erstelle ein Konto, um Petitionen zu starten und zu unterstützen" : "Melde dich an, um fortzufahren"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && <div className="space-y-2">
                  <Label htmlFor="fullName">Vollständiger Name</Label>
                  <Input id="fullName" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Max Mustermann" />
                </div>}
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="max@beispiel.de" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" minLength={6} />
                {isSignUp && password.length > 0 && <div className="mt-2 space-y-1 text-xs">
                    <div className={`flex items-center gap-2 ${passwordValidation.minLength ? 'text-success' : 'text-muted-foreground'}`}>
                      {passwordValidation.minLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Mindestens 6 Zeichen</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasUppercase ? 'text-success' : 'text-muted-foreground'}`}>
                      {passwordValidation.hasUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Mindestens 1 Großbuchstabe</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasNumberOrSpecial ? 'text-success' : 'text-muted-foreground'}`}>
                      {passwordValidation.hasNumberOrSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Mindestens 1 Zahl oder Sonderzeichen</span>
                    </div>
                  </div>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Bitte warten..." : isSignUp ? "Registrieren" : "Anmelden"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                
              </div>
            </div>

            

            <div className="mt-6 text-center text-sm">
              {isSignUp ? <p className="text-muted-foreground">
                  Bereits ein Konto?{" "}
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsSignUp(false);
                      navigate('/auth?mode=signin', { replace: true });
                    }} 
                    className="text-primary hover:underline font-medium cursor-pointer"
                  >
                    Jetzt anmelden
                  </button>
                </p> : <p className="text-muted-foreground">
                  Noch kein Konto?{" "}
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsSignUp(true);
                      navigate('/auth?mode=signup', { replace: true });
                    }} 
                    className="text-primary hover:underline font-medium cursor-pointer"
                  >
                    Jetzt registrieren
                  </button>
                </p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>;
};
export default Auth;