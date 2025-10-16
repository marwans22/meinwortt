import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Eye, Check, X, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Report {
  id: string;
  petition_id: string;
  reporter_id: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
  petitions?: {
    title: string;
    description: string;
    creator_id: string;
  };
  reporter?: {
    full_name: string;
    email: string;
  };
  creator?: {
    full_name: string;
    email: string;
  };
}

export const AdminReportedPetitions = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("pending");

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("reports")
        .select(`
          *,
          petitions:petition_id (title, description, creator_id)
        `)
        .not("petition_id", "is", null)
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data: reportsData, error } = await query;
      if (error) throw error;

      // Load reporter and creator profiles
      const reportsWithProfiles = await Promise.all(
        (reportsData || []).map(async (report) => {
          const [reporterProfile, creatorProfile] = await Promise.all([
            supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", report.reporter_id)
              .maybeSingle(),
            supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", report.petitions?.creator_id)
              .maybeSingle()
          ]);

          return {
            ...report,
            reporter: reporterProfile.data,
            creator: creatorProfile.data
          };
        })
      );

      setReports(reportsWithProfiles);
    } catch (error: any) {
      console.error("Error loading reports:", error);
      toast.error("Fehler beim Laden der Meldungen");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId: string, action: "approve" | "reject") => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      if (action === "approve") {
        // Delete the petition
        const { error: deleteError } = await supabase
          .from("petitions")
          .delete()
          .eq("id", report.petition_id);

        if (deleteError) throw deleteError;
        toast.success("Petition wurde gelöscht");
      }

      // Update report status
      const { error: updateError } = await supabase
        .from("reports")
        .update({ 
          status: "resolved",
          resolved_at: new Date().toISOString()
        })
        .eq("id", reportId);

      if (updateError) throw updateError;

      toast.success(action === "approve" ? "Meldung bestätigt" : "Meldung ignoriert");
      loadReports();
    } catch (error: any) {
      console.error("Error resolving report:", error);
      toast.error("Fehler beim Bearbeiten der Meldung");
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      fake: "Falsche Informationen",
      offensive: "Beleidigend oder hasserfüllt",
      spam: "Spam oder Werbung",
      inappropriate: "Unangemessener Inhalt",
      other: "Anderer Grund"
    };
    return labels[reason] || reason;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground">Lädt...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Gemeldete Petitionen
          </CardTitle>
          <CardDescription>
            Überprüfe und bearbeite Meldungen von Nutzern
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("pending")}
            >
              Ausstehend ({reports.filter(r => r.status === "pending").length})
            </Button>
            <Button
              variant={filter === "resolved" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("resolved")}
            >
              Bearbeitet
            </Button>
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              Alle
            </Button>
          </div>

          {reports.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Keine Meldungen gefunden
            </p>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id} className="border-l-4 border-l-destructive animate-fade-in">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Report Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="destructive">
                              {getReasonLabel(report.reason)}
                            </Badge>
                            <Badge variant={report.status === "pending" ? "outline" : "secondary"}>
                              {report.status === "pending" ? "Ausstehend" : "Bearbeitet"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Gemeldet am {format(new Date(report.created_at), "d. MMM yyyy, HH:mm", { locale: de })}
                          </p>
                        </div>
                      </div>

                      {/* Petition Info */}
                      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{report.petitions?.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {report.petitions?.description}
                            </p>
                          </div>
                          <Link to={`/petition/${report.petition_id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
                          <div>
                            <span className="font-medium">Ersteller:</span>{" "}
                            {report.creator?.full_name || "Unbekannt"} ({report.creator?.email})
                          </div>
                        </div>
                      </div>

                      {/* Report Details */}
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Gemeldet von:</span>{" "}
                          {report.reporter?.full_name || "Unbekannt"} ({report.reporter?.email})
                        </div>
                        {report.description && (
                          <div className="text-sm">
                            <span className="font-medium">Beschreibung:</span>
                            <p className="mt-1 text-muted-foreground">{report.description}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {report.status === "pending" && (
                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleResolve(report.id, "approve")}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Petition löschen
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolve(report.id, "reject")}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Ignorieren
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
