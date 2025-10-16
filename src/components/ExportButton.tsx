import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const ExportButton = () => {
  const exportToCSV = async () => {
    try {
      const { data: petitions, error } = await supabase
        .from("petitions")
        .select(`
          *,
          profiles!petitions_creator_id_fkey(full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Create CSV content
      const headers = [
        "Titel",
        "Autor",
        "E-Mail",
        "Kategorie",
        "Ziel",
        "Status",
        "Erstellt am",
        "Telefon",
      ];

      const rows = (petitions || []).map((p: any) => [
        p.title,
        p.profiles?.full_name || "",
        p.profiles?.email || "",
        p.category || "",
        p.goal || "",
        p.status || "",
        new Date(p.created_at).toLocaleDateString("de-DE"),
        p.phone_number || "",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      // Download CSV
      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `petitionen_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("CSV-Export erfolgreich");
    } catch (error: any) {
      console.error("Error exporting CSV:", error);
      toast.error("Fehler beim Export");
    }
  };

  const exportToPDF = async () => {
    try {
      const { data: petitions, error } = await supabase
        .from("petitions")
        .select(`
          *,
          profiles!petitions_creator_id_fkey(full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Create simple HTML for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1E88E5; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #1E88E5; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>MeinWort - Petitionsübersicht</h1>
          <p>Exportiert am: ${new Date().toLocaleDateString("de-DE")}</p>
          <table>
            <thead>
              <tr>
                <th>Titel</th>
                <th>Autor</th>
                <th>Kategorie</th>
                <th>Status</th>
                <th>Erstellt am</th>
              </tr>
            </thead>
            <tbody>
              ${(petitions || [])
                .map(
                  (p: any) => `
                <tr>
                  <td>${p.title}</td>
                  <td>${p.profiles?.full_name || "Unbekannt"}</td>
                  <td>${p.category || "-"}</td>
                  <td>${p.status}</td>
                  <td>${new Date(p.created_at).toLocaleDateString("de-DE")}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
        </html>
      `;

      // Open in new window for print/save as PDF
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }

      toast.success("PDF wird vorbereitet - bitte Drucken oder als PDF speichern");
    } catch (error: any) {
      console.error("Error exporting PDF:", error);
      toast.error("Fehler beim Export");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportieren
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportToCSV}>
          Als CSV exportieren
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          Als PDF exportieren
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
