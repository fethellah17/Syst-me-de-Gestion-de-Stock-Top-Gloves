import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tags,
  MapPin,
  ArrowLeftRight,
  ClipboardCheck,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Factory,
  Bell,
  AlertTriangle,
  Users,
  Ruler,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useState, useMemo, useEffect } from "react";
import { getStockStatus } from "@/lib/stock-utils";
import logoImg from "@/assets/logo-topgloves.jpg";
import NotificationBottomSheet from "./NotificationBottomSheet";

const navItems = [
  { to: "/dashboard", label: "Tableau de Bord", icon: LayoutDashboard },
  { to: "/articles", label: "Articles", icon: Package },
  { to: "/categories", label: "Catégories", icon: Tags },
  { to: "/emplacements", label: "Emplacements", icon: MapPin },
  { to: "/destinations", label: "Destinations", icon: MapPin },
  { to: "/fournisseurs", label: "Fournisseurs", icon: Factory },
  { to: "/mouvements", label: "Mouvements", icon: ArrowLeftRight },
  { to: "/inventaire", label: "Inventaire", icon: ClipboardCheck },
  { to: "/unites", label: "Unités de Mesure", icon: Ruler },
  { to: "/staff", label: "Personnel", icon: Users },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, isAdmin } = useAuth();
  const { articles } = useData();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate alerts
  const alerts = useMemo(() => {
    const critical = articles.filter(a => {
      const status = getStockStatus(a.stock, a.seuil, a.consommationJournaliere);
      return status.level === "critical";
    });

    const warning = articles.filter(a => {
      const status = getStockStatus(a.stock, a.seuil, a.consommationJournaliere);
      return status.level === "warning";
    });

    return { critical, warning, total: critical.length + warning.length };
  }, [articles]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col transition-transform duration-200 shadow-lg lg:shadow-none border-r border-sidebar-border ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <img src={logoImg} alt="Top Gloves Logo" className="w-9 h-9 rounded-lg object-cover" />
          <div>
            <h1 className="text-base font-bold text-sidebar-accent-foreground tracking-tight">Top Gloves</h1>
            <p className="text-[11px] text-sidebar-muted">Gestion de Stock</p>
          </div>
          <button className="lg:hidden ml-auto text-sidebar-foreground" onClick={() => setMobileOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Admin + Logout */}
        <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
          <NavLink
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
          >
            <ShieldCheck className="w-[18px] h-[18px]" />
            Accès Admin
            {isAdmin && (
              <span className="ml-auto w-2 h-2 rounded-full bg-success" />
            )}
          </NavLink>
          <button onClick={handleLogout} className="sidebar-link w-full">
            <LogOut className="w-[18px] h-[18px]" />
            Déconnexion
          </button>
        </div>

        {/* User */}
        <div className="px-5 py-3 border-t border-sidebar-border">
          <p className="text-xs font-medium text-sidebar-accent-foreground">{user?.name}</p>
          <p className="text-[11px] text-sidebar-muted">{user?.role}</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar - Mobile optimized */}
        <header className="h-14 sm:h-16 border-b bg-card flex items-center px-3 sm:px-4 lg:px-6 shrink-0">
          <button className="lg:hidden mr-2 sm:mr-3 text-foreground p-2 -ml-2 hover:bg-muted rounded-lg transition-colors" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div className="flex-1" />
          
          {/* Notification Bell - Touch friendly */}
          <div className="relative mr-2 sm:mr-4">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Bell className="w-5 h-5" />
              {alerts.total > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {alerts.total > 9 ? '9+' : alerts.total}
                </span>
              )}
            </button>

            {/* Desktop Notifications Dropdown */}
            {notificationsOpen && !isMobile && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-card border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden flex flex-col">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold text-sm text-foreground">Alertes Stock</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {alerts.total === 0 ? "Aucune alerte" : `${alerts.total} article${alerts.total > 1 ? 's' : ''} nécessite${alerts.total > 1 ? 'nt' : ''} votre attention`}
                    </p>
                  </div>
                  
                  <div className="overflow-y-auto flex-1">
                    {alerts.total === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                          <Package className="w-6 h-6 text-success" />
                        </div>
                        <p className="text-sm text-muted-foreground">Tous les stocks sont sécurisés</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {alerts.critical.map(article => (
                          <div key={article.id} className="p-3 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => {
                            setNotificationsOpen(false);
                            navigate('/articles');
                          }}>
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-4 h-4 text-destructive" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{article.nom}</p>
                                <p className="text-xs text-muted-foreground font-mono">{article.ref}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs font-semibold text-destructive">Stock: {article.stock}</span>
                                  <span className="text-xs text-muted-foreground">Seuil: {article.seuil}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {alerts.warning.map(article => (
                          <div key={article.id} className="p-3 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => {
                            setNotificationsOpen(false);
                            navigate('/articles');
                          }}>
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-4 h-4 text-warning" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{article.nom}</p>
                                <p className="text-xs text-muted-foreground font-mono">{article.ref}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs font-semibold text-warning">Stock: {article.stock}</span>
                                  <span className="text-xs text-muted-foreground">Seuil: {article.seuil}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {alerts.total > 0 && (
                    <div className="p-3 border-t">
                      <button
                        onClick={() => {
                          setNotificationsOpen(false);
                          navigate('/articles');
                        }}
                        className="w-full h-8 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                      >
                        Voir tous les articles
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Bottom Sheet */}
          {isMobile && (
            <NotificationBottomSheet
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
              alerts={alerts}
            />
          )}

          <div className="text-[10px] sm:text-xs text-muted-foreground font-mono hidden sm:block">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
          <div className="text-[10px] text-muted-foreground font-mono sm:hidden">
            {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
          </div>
        </header>

        {/* Content - Mobile optimized padding */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
