import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Upload, ChevronLeft, ChevronRight, Check, MapPin, FileText, Image as ImageIcon, Phone, FileCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CATEGORIES = [
  "Umwelt",
  "Bildung",
  "Gesundheit",
  "Soziales",
  "Politik",
  "Tierschutz",
  "Verkehr",
  "Wirtschaft",
  "Kultur",
  "Sonstiges",
];

const CreatePetition = () => {
  const [user, setUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [petitionType, setPetitionType] = useState("");
  const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("5000");
  const [category, setCategory] = useState("");
  const [targetInstitution, setTargetInstitution] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const DRAFT_KEY = "petition_draft_multi_step";
  const totalSteps = 6;

  // Load draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setPetitionType(draft.petitionType || "");
        setLocation(draft.location || "");
        setTitle(draft.title || "");
        setDescription(draft.description || "");
        setGoal(draft.goal || "5000");
        setCategory(draft.category || "");
        setTargetInstitution(draft.targetInstitution || "");
        setPhoneNumber(draft.phoneNumber || "");
        setCurrentStep(draft.currentStep || 1);
        toast.success("Entwurf wiederhergestellt!");
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, []);

  // Check authentication
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        toast.error("Du musst angemeldet sein, um eine Petition zu erstellen");
        navigate("/auth");
      } else {
        setUser(user);
      }
    });
  }, [navigate]);

  // Save draft to localStorage whenever form changes
  useEffect(() => {
    if (petitionType || location || title || description || category || targetInstitution || phoneNumber) {
      const draft = { 
        petitionType, 
        location, 
        title, 
        description, 
        goal, 
        category, 
        targetInstitution, 
        phoneNumber,
        currentStep 
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  }, [petitionType, location, title, description, goal, category, targetInstitution, phoneNumber, currentStep]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    
    if (images.length + fileArray.length > 5) {
      toast.error("Du kannst maximal 5 Bilder hochladen");
      return;
    }

    // Validate file types
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const invalidFiles = fileArray.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast.error("Nur JPG, PNG und WEBP Bilder sind erlaubt");
      return;
    }

    // Validate file sizes (max 5MB per file)
    const oversizedFiles = fileArray.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error("Bilder dürfen maximal 5MB groß sein");
      return;
    }

    setImages(prev => [...prev, ...fileArray]);

    // Create previews
    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep === 1 && !petitionType) {
      toast.error("Bitte wähle eine Petitionsart aus");
      return;
    }
    if (currentStep === 2 && petitionType === "lokal" && !location) {
      toast.error("Bitte gib einen Ort ein");
      return;
    }
    if (currentStep === 3 && !title) {
      toast.error("Bitte gib einen Titel ein");
      return;
    }
    if (currentStep === 4 && !description) {
      toast.error("Bitte gib eine Beschreibung ein");
      return;
    }
    
    if (currentStep < totalSteps) {
      // Skip location step if not lokal
      if (currentStep === 1 && petitionType !== "lokal") {
        setCurrentStep(3);
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // Skip location step backwards if not lokal
      if (currentStep === 3 && petitionType !== "lokal") {
        setCurrentStep(1);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Du musst angemeldet sein");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Upload images first
      const imageUrls: string[] = [];
      
      if (images.length > 0) {
        setUploadProgress(10);
        
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('petition-images')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('petition-images')
            .getPublicUrl(fileName);

          imageUrls.push(publicUrl);
          setUploadProgress(10 + ((i + 1) / images.length) * 40);
        }
      }

      setUploadProgress(60);

      // Create petition
      const { error } = await supabase
        .from("petitions")
        .insert({
          title,
          description,
          goal: parseInt(goal),
          category,
          target_institution: targetInstitution,
          creator_id: user.id,
          status: "pending",
          image_url: imageUrls.length > 0 ? imageUrls[0] : null,
          petition_type: petitionType,
          location: petitionType === "lokal" ? location : null,
          phone_number: phoneNumber || null,
          images: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
        })
        .select()
        .single();

      if (error) throw error;

      setUploadProgress(100);

      // Clear draft from localStorage
      localStorage.removeItem(DRAFT_KEY);

      toast.success("Petition erfolgreich eingereicht! Sie wird von unserem Team geprüft.");
      navigate("/");
    } catch (error: any) {
      console.error("Error creating petition:", error);
      toast.error(error.message || "Fehler beim Erstellen der Petition");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: "Art" },
      ...(petitionType === "lokal" ? [{ number: 2, label: "Ort" }] : []),
      { number: 3, label: "Titel" },
      { number: 4, label: "Beschreibung" },
      { number: 5, label: "Bilder" },
      { number: 6, label: "Zusammenfassung" },
    ];

    return (
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  currentStep >= step.number
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
              </div>
              <span className="text-xs mt-2 text-center">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-1 flex-1 mx-2 mt-[-20px] transition-colors ${
                  currentStep > step.number ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Petition starten</h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Teile dein Anliegen mit der Welt und sammle Unterstützer für deine Sache
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Schritt {currentStep} von {totalSteps}</CardTitle>
              <CardDescription>
                Erstelle deine Petition in wenigen einfachen Schritten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {renderStepIndicator()}

              {/* Step 1: Petition Type */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Wähle aus, ob deine Petition lokal, national oder weltweit sein soll.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <Label className="text-base">Petitionsart *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { value: "lokal", label: "Lokal", desc: "Für deine Stadt oder Region", icon: MapPin },
                        { value: "national", label: "National", desc: "Für ganz Deutschland", icon: FileText },
                        { value: "weltweit", label: "Weltweit", desc: "Internationale Reichweite", icon: FileCheck },
                      ].map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setPetitionType(type.value)}
                            className={`p-6 rounded-lg border-2 transition-all text-left hover:border-primary ${
                              petitionType === type.value
                                ? "border-primary bg-primary/5"
                                : "border-muted"
                            }`}
                          >
                            <Icon className="w-8 h-8 mb-3 text-primary" />
                            <h3 className="font-semibold mb-1">{type.label}</h3>
                            <p className="text-sm text-muted-foreground">{type.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Location (only for local petitions) */}
              {currentStep === 2 && petitionType === "lokal" && (
                <div className="space-y-6 animate-fade-in">
                  <Alert>
                    <MapPin className="h-4 w-4" />
                    <AlertDescription>
                      Gib den Ort an, für den deine Petition relevant ist. Dies hilft Menschen in deiner Nähe, deine Petition zu finden.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-base">Ort *</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="z.B. München, Berlin-Mitte, Hamburg"
                      className="text-base"
                    />
                    <p className="text-sm text-muted-foreground">
                      Stadt, Stadtteil oder Region
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Title */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Ein klarer, aussagekräftiger Titel ist entscheidend. Erkläre in wenigen Worten, was du erreichen möchtest.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base">Titel deiner Petition *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="z.B. Mehr Fahrradwege in unserer Stadt"
                      maxLength={200}
                      className="text-base"
                    />
                    <p className="text-sm text-muted-foreground">
                      {title.length}/200 Zeichen
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">Kategorie *</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Kategorie wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetInstitution">Zielinstitution (optional)</Label>
                      <Input
                        id="targetInstitution"
                        value={targetInstitution}
                        onChange={(e) => setTargetInstitution(e.target.value)}
                        placeholder="z.B. Stadtrat, Bundestag"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Unterschriftenziel *</Label>
                    <Input
                      id="goal"
                      type="number"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      min="100"
                      max="1000000"
                    />
                    <p className="text-sm text-muted-foreground">
                      Standard: 5.000 Unterschriften
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Description */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Erkläre dein Anliegen ausführlich. Warum ist diese Petition wichtig? Was soll sich ändern?
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base">Beschreibung *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Beschreibe dein Anliegen ausführlich..."
                      rows={15}
                      className="resize-none"
                    />
                    <p className="text-sm text-muted-foreground">
                      Mindestens 100 Zeichen empfohlen
                    </p>
                  </div>
                </div>
              )}

              {/* Step 5: Images */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fade-in">
                  <Alert>
                    <ImageIcon className="h-4 w-4" />
                    <AlertDescription>
                      Bilder machen deine Petition ansprechender! Du kannst 1-5 Bilder hochladen (optional).
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="images"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Klicken zum Hochladen</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            JPG, PNG oder WEBP (max. 5MB pro Bild, max. 5 Bilder)
                          </p>
                        </div>
                        <input
                          id="images"
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          onChange={handleImageSelect}
                          disabled={images.length >= 5}
                        />
                      </label>
                    </div>

                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Vorschau ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {images.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {images.length} von 5 Bildern ausgewählt
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Telefonnummer (optional)</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+49 123 456789"
                    />
                    <p className="text-sm text-muted-foreground">
                      Für Rückfragen durch unser Team
                    </p>
                  </div>
                </div>
              )}

              {/* Step 6: Summary */}
              {currentStep === 6 && (
                <div className="space-y-6 animate-fade-in">
                  <Alert>
                    <FileCheck className="h-4 w-4" />
                    <AlertDescription>
                      Überprüfe deine Angaben bevor du die Petition einreichst.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                      <div>
                        <span className="text-sm font-semibold text-muted-foreground">Art:</span>
                        <p className="text-base capitalize">{petitionType}</p>
                      </div>
                      {petitionType === "lokal" && (
                        <div>
                          <span className="text-sm font-semibold text-muted-foreground">Ort:</span>
                          <p className="text-base">{location}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-semibold text-muted-foreground">Titel:</span>
                        <p className="text-base">{title}</p>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-muted-foreground">Kategorie:</span>
                        <p className="text-base">{category}</p>
                      </div>
                      {targetInstitution && (
                        <div>
                          <span className="text-sm font-semibold text-muted-foreground">Zielinstitution:</span>
                          <p className="text-base">{targetInstitution}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-semibold text-muted-foreground">Unterschriftenziel:</span>
                        <p className="text-base">{parseInt(goal).toLocaleString('de-DE')}</p>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-muted-foreground">Beschreibung:</span>
                        <p className="text-base line-clamp-3">{description}</p>
                      </div>
                      {images.length > 0 && (
                        <div>
                          <span className="text-sm font-semibold text-muted-foreground">Bilder:</span>
                          <p className="text-base">{images.length} Bild(er)</p>
                        </div>
                      )}
                      {phoneNumber && (
                        <div>
                          <span className="text-sm font-semibold text-muted-foreground">Telefonnummer:</span>
                          <p className="text-base">{phoneNumber}</p>
                        </div>
                      )}
                    </div>

                    {loading && uploadProgress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Wird hochgeladen...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1 || loading}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Zurück
                </Button>

                {currentStep < totalSteps ? (
                  <Button type="button" onClick={handleNext}>
                    Weiter
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="button" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Wird eingereicht..." : "Petition einreichen"}
                    <Check className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>

              {currentStep === totalSteps && (
                <p className="text-xs text-muted-foreground text-center">
                  Deine Petition wird vor der Veröffentlichung von unserem Team geprüft
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CreatePetition;
