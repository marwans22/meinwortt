import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Mail, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
}

export const AdminContactRequests = () => {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error("Error loading contact requests:", error);
      toast.error("Fehler beim Laden der Anfragen");
    } finally {
      setLoading(false);
    }
  };

  const markAsResolved = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("contact_requests")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id
        })
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Anfrage als erledigt markiert");
      loadRequests();
    } catch (error: any) {
      console.error("Error updating request:", error);
      toast.error("Fehler beim Aktualisieren");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Lädt Anfragen...
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = requests.filter(r => r.status === "pending");
  const resolvedRequests = requests.filter(r => r.status === "resolved");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
            <div className="text-sm text-muted-foreground">Ausstehend</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">{resolvedRequests.length}</div>
            <div className="text-sm text-muted-foreground">Erledigt</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kontaktanfragen</CardTitle>
          <CardDescription>
            {requests.length} {requests.length === 1 ? "Anfrage" : "Anfragen"} gesamt
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Keine Anfragen vorhanden
            </p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-primary" />
                          <h3 className="text-lg font-semibold">{request.subject}</h3>
                          <Badge variant={request.status === "pending" ? "outline" : "default"}>
                            {request.status === "pending" ? (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                Ausstehend
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Erledigt
                              </>
                            )}
                          </Badge>
                        </div>
                        <div className="space-y-2 mb-3">
                          <div className="text-sm">
                            <span className="font-medium">Von:</span> {request.name} ({request.email})
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Datum:</span>{" "}
                            {format(new Date(request.created_at), "d. MMM yyyy, HH:mm", { locale: de })}
                          </div>
                          {request.resolved_at && (
                            <div className="text-sm text-green-600">
                              <span className="font-medium">Erledigt am:</span>{" "}
                              {format(new Date(request.resolved_at), "d. MMM yyyy, HH:mm", { locale: de })}
                            </div>
                          )}
                        </div>
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{request.message}</p>
                        </div>
                      </div>
                      {request.status === "pending" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => markAsResolved(request.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Als erledigt markieren
                        </Button>
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