import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, FileText, CheckCircle, TrendingUp } from "lucide-react";

export const AdminStats = () => {
  const [stats, setStats] = useState({
    totalPetitions: 0,
    activePetitions: 0,
    totalSignatures: 0,
    totalUsers: 0,
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Total petitions
      const { count: petitionsCount } = await supabase
        .from("petitions")
        .select("*", { count: "exact", head: true });

      // Active petitions
      const { count: activeCount } = await supabase
        .from("petitions")
        .select("*", { count: "exact", head: true })
        .eq("status", "published");

      // Total signatures
      const { count: signaturesCount } = await supabase
        .from("signatures")
        .select("*", { count: "exact", head: true })
        .eq("verification_status", "verified");

      // Total users
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      setStats({
        totalPetitions: petitionsCount || 0,
        activePetitions: activeCount || 0,
        totalSignatures: signaturesCount || 0,
        totalUsers: usersCount || 0,
      });

      // Monthly petition data
      const { data: petitions } = await supabase
        .from("petitions")
        .select("created_at")
        .order("created_at", { ascending: true });

      if (petitions) {
        const monthlyMap = new Map();
        petitions.forEach((p: any) => {
          const month = new Date(p.created_at).toLocaleDateString("de-DE", {
            year: "numeric",
            month: "short",
          });
          monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
        });

        const chartData = Array.from(monthlyMap.entries())
          .slice(-6)
          .map(([month, count]) => ({
            month,
            petitions: count,
          }));

        setMonthlyData(chartData);
      }
    } catch (error: any) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-8 bg-muted rounded w-3/4" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Petitionen</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPetitions}</div>
            <p className="text-xs text-muted-foreground">Alle Petitionen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktive Petitionen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePetitions}</div>
            <p className="text-xs text-muted-foreground">Veröffentlicht</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unterschriften</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSignatures.toLocaleString("de-DE")}</div>
            <p className="text-xs text-muted-foreground">Verifiziert</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktive Nutzer</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registriert</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Petitionen pro Monat</CardTitle>
          <CardDescription>Entwicklung der letzten 6 Monate</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="petitions" fill="hsl(var(--primary))" name="Petitionen" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
