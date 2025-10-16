import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Flag } from "lucide-react";
import { toast } from "sonner";

interface ReportDialogProps {
  petitionId: string;
  userId: string | null;
}

const reportReasons = [
  { value: "fake", label: "Falsche Informationen" },
  { value: "offensive", label: "Beleidigend oder hasserfüllt" },
  { value: "spam", label: "Spam oder Werbung" },
  { value: "inappropriate", label: "Unangemessener Inhalt" },
  { value: "other", label: "Anderer Grund" },
];

export const ReportDialog = ({ petitionId, userId }: ReportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error("Bitte melde dich an");
      return;
    }

    if (!reason) {
      toast.error("Bitte wähle einen Grund aus");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("reports").insert({
        petition_id: petitionId,
        reporter_id: userId,
        reason,
        description: description || null,
      });

      if (error) throw error;

      toast.success("Danke! Deine Meldung wurde gesendet.");
      setOpen(false);
      setReason("");
      setDescription("");
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast.error("Fehler beim Senden der Meldung");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive">
          <Flag className="w-4 h-4 mr-2" />
          Melden
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Petition melden</DialogTitle>
          <DialogDescription>
            Bitte teile uns mit, warum diese Petition gemeldet werden sollte.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Grund *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Grund auswählen" />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Weitere Details..."
              maxLength={500}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading || !reason}>
              {loading ? "Wird gesendet..." : "Meldung absenden"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
