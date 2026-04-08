import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MovementTable } from "@/components/MovementTable";
import { useData } from "@/contexts/DataContext";
import { useMemo } from "react";

const Dashboard = () => {
  const { articles, mouvements } = useData();

  // Calculer les statistiques dynamiquement
  const stats = useMemo(() => {
    // Date actuelle au format YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    // Filtrer les mouvements du jour
    const todayMovements = mouvements.filter(m => {
      const movementDate = m.date.split(' ')[0]; // Extraire YYYY-MM-DD
      return movementDate === today;
    });

    // Calculer les entrées du jour
    const entreesJour = todayMovements
      .filter(m => m.type === "Entrée")
      .reduce((sum, m) => sum + m.qte, 0);

    // Calculer les sorties du jour
    const sortiesJour = todayMovements
      .filter(m => m.type === "Sortie")
      .reduce((sum, m) => sum + m.qte, 0);

    // Calculer les transferts du jour
    const transfertsJour = todayMovements
      .filter(m => m.type === "Transfert")
      .reduce((sum, m) => sum + m.qte, 0);

    // Calculer le stock total
    const stockTotal = articles.reduce((sum, a) => sum + a.stock, 0);

    return [
      { 
        label: "Stock Total", 
        value: stockTotal.toLocaleString('fr-FR'), 
        icon: Package, 
        change: "", 
        up: true 
      },
      { 
        label: "Entrées du Jour", 
        value: entreesJour.toLocaleString('fr-FR'), 
        icon: ArrowDownToLine, 
        change: "", 
        up: true 
      },
      { 
        label: "Sorties du Jour", 
        value: sortiesJour.toLocaleString('fr-FR'), 
        icon: ArrowUpFromLine, 
        change: "", 
        up: false 
      },
      { 
        label: "Transferts du Jour", 
        value: transfertsJour.toLocaleString('fr-FR'), 
        icon: ArrowLeftRight, 
        change: "", 
        up: true 
      },
    ];
  }, [articles, mouvements]);

  // Calculer les données du graphique (derniers 6 jours)
  const movementData = useMemo(() => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = days[date.getDay()];
      
      const dayMovements = mouvements.filter(m => {
        const movementDate = m.date.split(' ')[0];
        return movementDate === dateStr;
      });
      
      const entrees = dayMovements
        .filter(m => m.type === "Entrée")
        .reduce((sum, m) => sum + m.qte, 0);
      
      const sorties = dayMovements
        .filter(m => m.type === "Sortie")
        .reduce((sum, m) => sum + m.qte, 0);
      
      data.push({ jour: dayName, entrees, sorties });
    }
    
    return data;
  }, [mouvements]);

  // Récupérer les 5 derniers mouvements triés par date décroissante
  const recentMovements = useMemo(() => {
    return [...mouvements]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [mouvements]);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl">
      {/* Header - Responsive text sizing */}
      <div className="px-1">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Tableau de Bord</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">Vue d'ensemble du stock</p>
      </div>

      {/* Stats - Responsive grid: 1 col mobile, 2 cols tablet, 4 cols desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-primary" />
              </div>
              {s.change && (
                <span className={`text-xs font-medium flex items-center gap-1 ${s.up ? "text-success" : "text-danger"}`}>
                  {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {s.change}
                </span>
              )}
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts - Responsive height and padding */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {/* Movements chart */}
        <div className="bg-card border rounded-lg p-3 sm:p-4 md:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-foreground mb-3 sm:mb-4">Mouvements de la Semaine</h3>
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={300} minWidth={300}>
              <BarChart data={movementData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                <XAxis dataKey="jour" tick={{ fontSize: 11 }} stroke="hsl(215, 14%, 50%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 14%, 50%)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(214, 20%, 88%)",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="entrees" name="Entrées" fill="hsl(152, 55%, 42%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sorties" name="Sorties" fill="hsl(210, 70%, 35%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables - Responsive padding */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {/* Recent movements */}
        <div className="bg-card border rounded-lg p-3 sm:p-4 md:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-foreground mb-3 sm:mb-4">Derniers Mouvements</h3>
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <MovementTable movements={recentMovements} showActions={false} compact={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
