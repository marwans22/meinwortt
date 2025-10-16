import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

export const AdminReports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          *,
          petitions(title),
          petition_comments(content),
          profiles!reports_reporter_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      console.error("Error loading reports:", error);
      toast.error("Fehler beim Laden der Meldungen");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId: string, action: "approve" | "reject") => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("reports")
        .update({
          status: action === "approve" ? "resolved" : "rejected",
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
        })
        .eq("id", reportId);

      if (error) throw error;
      toast.success(action === "approve" ? "Meldung bestätigt" : "Meldung abgelehnt");
      loadReports();
    } catch (error: any) {
      console.error("Error resolving report:", error);
      toast.error("Fehler beim Bearbeiten der Meldung");
    }
  };

  const getReasonLabel = (reason: string) => {
    const reasons: Record<string, string> = {
      fake: "Falsche Informationen",
      offensive: "Beleidigend",
      spam: "Spam",
      inappropriate: "Unangemessen",
      other: "Anderer Grund",
    };
    return reasons[reason] || reason;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Offen</Badge>;
      case "resolved":
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Erledigt</Badge>;
      case "rejected":
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Abgelehnt</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Keine Meldungen</h3>
          <p className="text-muted-foreground">Es liegen derzeit keine Meldungen vor.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  {report.petition_id ? (
                    <>Petition: {report.petitions?.title || "Unbekannt"}</>
                  ) : report.comment_id ? (
                    <>Kommentar gemeldet</>
                  ) : (
                    <>Meldung</>
                  )}
                </CardTitle>
                <CardDescription>
                  Gemeldet von {report.profiles?.full_name || "Unbekannt"} am{" "}
                  {format(new Date(report.created_at), "d. MMM yyyy, HH:mm", { locale: de })}
                </CardDescription>
              </div>
              {getStatusBadge(report.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-semibold mb-1">Grund:</div>
              <Badge variant="outline">{getReasonLabel(report.reason)}</Badge>
            </div>

            {report.description && (
              <div>
                <div className="font-semibold mb-1">Beschreibung:</div>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </div>
            )}

            {report.comment_id && report.petition_comments && (
              <div>
                <div className="font-semibold mb-1">Gemeldeter Kommentar:</div>
                <p className="text-sm bg-muted p-3 rounded">
                  {report.petition_comments.content}
                </p>
              </div>
            )}

            {report.status === "pending" && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleResolve(report.id, "approve")}
                >
                  Bestätigen & Löschen
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResolve(report.id, "reject")}
                >
                  Ablehnen
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
