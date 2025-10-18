import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Search } from "lucide-react";

// Comprehensive list of major German cities and states
const GERMAN_CITIES = [
  // Major Cities (100k+)
  "Berlin", "Hamburg", "München", "Köln", "Frankfurt am Main", "Stuttgart", "Düsseldorf", 
  "Dortmund", "Essen", "Leipzig", "Bremen", "Dresden", "Hannover", "Nürnberg", "Duisburg",
  "Bochum", "Wuppertal", "Bielefeld", "Bonn", "Münster", "Karlsruhe", "Mannheim", "Augsburg",
  "Wiesbaden", "Gelsenkirchen", "Mönchengladbach", "Braunschweig", "Chemnitz", "Kiel", "Aachen",
  "Halle (Saale)", "Magdeburg", "Freiburg im Breisgau", "Krefeld", "Lübeck", "Oberhausen",
  "Erfurt", "Mainz", "Rostock", "Kassel", "Hagen", "Hamm", "Saarbrücken", "Mülheim an der Ruhr",
  "Potsdam", "Ludwigshafen am Rhein", "Oldenburg", "Leverkusen", "Osnabrück", "Solingen",
  
  // Medium Cities (50k-100k)
  "Heidelberg", "Darmstadt", "Regensburg", "Ingolstadt", "Würzburg", "Fürth", "Ulm",
  "Heilbronn", "Pforzheim", "Wolfsburg", "Göttingen", "Bottrop", "Recklinghausen",
  "Reutlingen", "Bremerhaven", "Koblenz", "Erlangen", "Bergisch Gladbach", "Jena",
  "Remscheid", "Trier", "Salzgitter", "Moers", "Siegen", "Hildesheim", "Cottbus",
  
  // Smaller Cities & Towns (20k-50k)
  "Gütersloh", "Kaiserslautern", "Witten", "Schwerin", "Gera", "Iserlohn", "Zwickau",
  "Düren", "Ratingen", "Lünen", "Esslingen am Neckar", "Marl", "Tübingen", "Velbert",
  "Ludwigsburg", "Minden", "Konstanz", "Worms", "Dorsten", "Lüdenscheid", "Dessau-Roßlau",
  "Bamberg", "Castrop-Rauxel", "Arnsberg", "Gladbeck", "Detmold", "Viersen", "Lüneburg",
  "Bayreuth", "Celle", "Aalen", "Fulda", "Bocholt", "Plauen", "Neuwied", "Sindelfingen",
  "Kempten (Allgäu)", "Rosenheim", "Landshut", "Neu-Ulm", "Neubrandenburg", "Herten",
  
  // Additional Towns
  "Weimar", "Schwäbisch Gmünd", "Gießen", "Hanau", "Friedrichshafen", "Offenburg",
  "Wilhelmshaven", "Flensburg", "Stralsund", "Görlitz", "Passau", "Speyer", "Greifswald",
  "Bad Homburg", "Waiblingen", "Langenhagen", "Hürth", "Kerpen", "Grevenbroich",
  "Dormagen", "Eschweiler", "Meerbusch", "Pulheim", "Frechen", "Lörrach", "Schweinfurt",
  "Wetzlar", "Marburg", "Bad Salzuflen", "Wesel", "Neu-Isenburg", "Rastatt", "Brühl",
  "Euskirchen", "Neustadt an der Weinstraße", "Frankenthal", "Pirmasens", "Emden",
  "Delmenhorst", "Cuxhaven", "Goslar", "Hameln", "Wolfenbüttel", "Gifhorn", "Lingen",
  "Paderborn", "Gütersloh", "Herford", "Minden", "Lippstadt", "Siegen", "Bergkamen",
  "Rüsselsheim", "Oberursel", "Rodgau", "Dreieich", "Bad Nauheim", "Limburg",
  "Gelnhausen", "Büdingen", "Friedberg", "Norderstedt", "Pinneberg", "Ahrensburg",
  "Geesthacht", "Reinbek", "Wedel", "Neumünster", "Rendsburg", "Husum", "Ludwigslust",
  "Wismar", "Güstrow", "Ribnitz-Damgarten", "Anklam", "Demmin", "Bergen auf Rügen"
].sort();

interface CitySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const CitySelect = ({ value, onChange, placeholder = "Stadt auswählen..." }: CitySelectProps) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredCities = useMemo(() => {
    if (!search) return GERMAN_CITIES;
    return GERMAN_CITIES.filter(city =>
      city.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleSelect = (city: string) => {
    onChange(city);
    setSearch("");
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={value || search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (!e.target.value) onChange("");
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg z-20 overflow-hidden">
            <div className="p-2 border-b bg-muted/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Stadt suchen..."
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="p-2 space-y-1">
                {filteredCities.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Keine Stadt gefunden
                  </div>
                ) : (
                  filteredCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleSelect(city)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm"
                    >
                      <MapPin className="w-3 h-3 inline mr-2 text-muted-foreground" />
                      {city}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
            <div className="p-2 border-t bg-muted/30 text-xs text-muted-foreground text-center">
              {filteredCities.length} {filteredCities.length === 1 ? "Stadt" : "Städte"}
            </div>
          </div>
        </>
      )}
    </div>
  );
};