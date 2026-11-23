import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Package,
  Tag,
  MapPin,
  Flag,
  Truck,
  ArrowLeftRight,
  ClipboardCheck,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Bell,
  AlertTriangle,
  Users,
  Ruler,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useState, useMemo, useEffect } from "react";
import { getStockStatus } from "@/lib/stock-utils";
import logoImg from "@/assets/logo-topgloves.jpg";
import NotificationBottomSheet from "./NotificationBottomSheet";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const navItems = [
  { to: "/dashboard", label: "Tableau de Bord", icon: LayoutGrid },
  { to: "/articles", label: "Articles", icon: Package },
  { to: "/categories", label: "Catégories", icon: Tag },
  { to: "/emplacements", label: "Emplacements", icon: MapPin },
  { to: "/destinations", label: "Destinations", icon: Flag },
  { to: "/fournisseurs", label: "Fournisseurs", icon: Truck },
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
  
  // Sidebar collapsed state - stored in localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem("ui.sidebarCollapsed");
    return stored === "true";
  });

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Save sidebar collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem("ui.sidebarCollapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Keyboard shortcut: Escape to close mobile sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileOpen]);

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
    <TooltipProvider delayDuration={150}>
      <div className="flex h-screen overflow-hidden">
        {/* Mobile overlay backdrop */}
        {mobileOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/40 md:hidden" 
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-50 bg-sidebar flex flex-col shadow-lg md:shadow-none border-r border-sidebar-border transition-[width] duration-200 ease-out shrink-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } ${
            sidebarCollapsed ? "w-64 md:w-16" : "w-64"
          }`}
        >
          {/* Logo */}
          <div className="h-16 flex items-center gap-3 px-4 border-b border-sidebar-border shrink-0">
            {!sidebarCollapsed && (
              <>
                <img src={logoImg} alt="Top Gloves Logo" className="w-8 h-8 rounded object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm font-semibold text-sidebar-accent-foreground tracking-tight truncate">Top Gloves</h1>
                  <p className="text-[11px] text-sidebar-muted truncate">Gestion de Stock</p>
                </div>
              </>
            )}
            {sidebarCollapsed && (
              <img src={logoImg} alt="Top Gloves" className="w-8 h-8 rounded object-cover mx-auto" />
            )}
            <button 
              className="md:hidden text-sidebar-foreground shrink-0" 
              onClick={() => setMobileOpen(false)}
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Nav */}
          <nav className={`flex-1 overflow-y-auto sidebar-scrollbar ${sidebarCollapsed ? "flex flex-col items-center gap-1 py-3 px-2" : "px-2 py-3 space-y-0.5"}`}>
            {navItems.map((item) => {
              const content = (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => 
                    sidebarCollapsed 
                      ? `w-10 h-10 mx-auto flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 ${isActive ? "bg-primary/10 text-primary" : ""}`
                      : `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
                  }
                >
                  <item.icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );

              if (sidebarCollapsed) {
                return (
                  <Tooltip key={item.to}>
                    <TooltipTrigger asChild>
                      {content}
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8} className="hidden md:block text-xs">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return content;
            })}
          </nav>

          {/* Admin + Logout */}
          <div className={`mt-auto border-t border-gray-200 shrink-0 ${sidebarCollapsed ? "flex flex-col items-center gap-1 py-3" : "px-2 py-3 space-y-0.5"}`}>
            {sidebarCollapsed ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavLink
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) => `w-10 h-10 mx-auto flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 relative ${isActive ? "bg-primary/10 text-primary" : ""}`}
                    >
                      <ShieldCheck className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                      {isAdmin && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-success" />
                      )}
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8} className="hidden md:block text-xs">
                    Accès Admin
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={handleLogout} className="w-10 h-10 mx-auto flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900">
                      <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8} className="hidden md:block text-xs">
                    Déconnexion
                  </TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <NavLink
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                >
                  <ShieldCheck className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                  <span className="truncate">Accès Admin</span>
                  {isAdmin && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-success shrink-0" />
                  )}
                </NavLink>
                <button onClick={handleLogout} className="sidebar-link sidebar-link-logout-expanded w-full">
                  <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                  <span className="truncate">Déconnexion</span>
                </button>
              </>
            )}
          </div>

          {/* User */}
          <div className={`border-t border-gray-200 shrink-0 ${sidebarCollapsed ? "flex items-center justify-center py-3 pb-1" : "px-4 py-3"}`}>
            {sidebarCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium cursor-default">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8} className="hidden md:block">
                  <div>
                    <p className="font-medium text-xs">{user?.name}</p>
                    <p className="text-[11px] text-muted-foreground">{user?.role}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : (
              <>
                <p className="text-xs font-medium text-sidebar-accent-foreground truncate">{user?.name}</p>
                <p className="text-[11px] text-sidebar-muted truncate">{user?.role}</p>
              </>
            )}
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden transition-all duration-200 ease-out">
          {/* Top bar - Mobile optimized */}
          <header className="h-14 sm:h-16 border-b bg-card flex items-center px-3 sm:px-4 lg:px-6 shrink-0">
            <button 
              className="md:hidden mr-2 sm:mr-3 text-foreground p-2 -ml-2 hover:bg-muted rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
            </button>
            
            {/* Desktop sidebar toggle button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? "Développer le menu" : "Réduire le menu"}
              aria-expanded={!sidebarCollapsed}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded hover:bg-muted text-slate-500 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" strokeWidth={1.5} /> : <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />}
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
          <main className="flex-1 w-full min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-4 lg:p-6">
            <div className="animate-fade-in w-full min-w-0">{children}</div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AppLayout;
