import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Menu, X, MessageSquareQuote } from "lucide-react";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity group">
              <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-lg group-hover:scale-105 transition-transform">
                <MessageSquareQuote className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-poppins font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                MeinWort
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
                Petitionen
              </Link>
              <Link to="/groups" className="text-sm font-medium hover:text-primary transition-colors">
                Gruppen
              </Link>
              <Link to="/so-funktionierts" className="text-sm font-medium hover:text-primary transition-colors">
                So funktioniert's
              </Link>
              <Link to="/ueber" className="text-sm font-medium hover:text-primary transition-colors">
                Über uns
              </Link>
              {user ? (
                <>
                  <Link to="/create" className="text-sm font-medium hover:text-primary transition-colors">
                    Petition starten
                  </Link>
                  <Link to="/profile/mein" className="text-sm font-medium hover:text-primary transition-colors">
                    Mein Profil
                  </Link>
                  <Button onClick={handleSignOut} variant="ghost" size="sm">
                    Abmelden
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => navigate("/auth?mode=signin")} variant="ghost" size="sm">
                    Anmelden
                  </Button>
                  <Button onClick={() => navigate("/auth?mode=signup")} size="sm" className="hover:scale-105 transition-transform">
                    Registrieren
                  </Button>
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4">
              <Link
                to="/"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Petitionen
              </Link>
              <Link
                to="/groups"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Gruppen
              </Link>
              <Link
                to="/so-funktionierts"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                So funktioniert's
              </Link>
              <Link
                to="/ueber"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Über uns
              </Link>
              {user ? (
                <>
                  <Link
                    to="/create"
                    className="text-sm font-medium hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Petition starten
                  </Link>
                  <Link
                    to="/profile/mein"
                    className="text-sm font-medium hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mein Profil
                  </Link>
                  <Button onClick={handleSignOut} variant="outline" size="sm" className="w-full">
                    Abmelden
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => navigate("/auth?mode=signin")} variant="outline" size="sm" className="w-full">
                    Anmelden
                  </Button>
                  <Button onClick={() => navigate("/auth?mode=signup")} size="sm" className="w-full">
                    Registrieren
                  </Button>
                </>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-card/50 mt-auto">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 mb-3 md:mb-4 justify-center sm:justify-start">
                <MessageSquareQuote className="w-5 h-5 text-primary" />
                <h3 className="font-poppins font-bold text-base md:text-lg">MeinWort</h3>
              </div>
              <p className="text-sm text-muted-foreground font-inter leading-relaxed">
                Deine Stimme zählt. Petitionen erstellen, unterschreiben und Veränderung bewirken.
              </p>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-manrope font-semibold mb-3 md:mb-4 text-sm md:text-base">Rechtliches</h4>
              <ul className="space-y-2 text-sm font-inter">
                <li><Link to="/impressum" className="text-muted-foreground hover:text-primary transition-colors inline-block py-1">Impressum</Link></li>
                <li><Link to="/datenschutz" className="text-muted-foreground hover:text-primary transition-colors inline-block py-1">Datenschutz</Link></li>
                <li><Link to="/agb" className="text-muted-foreground hover:text-primary transition-colors inline-block py-1">AGB</Link></li>
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-manrope font-semibold mb-3 md:mb-4 text-sm md:text-base">Hilfe</h4>
              <ul className="space-y-2 text-sm font-inter">
                <li><Link to="/hilfe" className="text-muted-foreground hover:text-primary transition-colors inline-block py-1">FAQ</Link></li>
                <li><Link to="/kontakt" className="text-muted-foreground hover:text-primary transition-colors inline-block py-1">Kontakt</Link></li>
                <li><Link to="/so-funktionierts" className="text-muted-foreground hover:text-primary transition-colors inline-block py-1">So funktioniert's</Link></li>
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-manrope font-semibold mb-3 md:mb-4 text-sm md:text-base">Über MeinWort</h4>
              <ul className="space-y-2 text-sm font-inter">
                <li><Link to="/ueber" className="text-muted-foreground hover:text-primary transition-colors inline-block py-1">Über uns</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 md:pt-8 border-t text-center text-xs md:text-sm text-muted-foreground font-inter">
            © {new Date().getFullYear()} MeinWort. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
};
