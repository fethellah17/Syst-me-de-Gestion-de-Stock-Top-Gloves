import { Package, AlertTriangle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Article } from "@/contexts/DataContext";

interface NotificationBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: {
    critical: Article[];
    warning: Article[];
    total: number;
  };
}

const NotificationBottomSheet = ({ isOpen, onClose, alerts }: NotificationBottomSheetProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 z-[60] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-[70] animate-in slide-in-from-bottom duration-300">
        <div className="bg-card rounded-t-2xl shadow-2xl mx-auto max-w-full sm:max-w-[90%] max-h-[85vh] flex flex-col">
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <div>
              <h3 className="font-semibold text-base text-foreground">Alertes Stock</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {alerts.total === 0 ? "Aucune alerte" : `${alerts.total} article${alerts.total > 1 ? 's' : ''} nécessite${alerts.total > 1 ? 'nt' : ''} votre attention`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 overscroll-contain">
            {alerts.total === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-success" />
                </div>
                <p className="text-sm text-muted-foreground">Tous les stocks sont sécurisés</p>
              </div>
            ) : (
              <div className="divide-y">
                {alerts.critical.map(article => (
                  <div 
                    key={article.id} 
                    className="p-4 active:bg-muted/70 transition-colors cursor-pointer"
                    onClick={() => {
                      onClose();
                      navigate('/articles');
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{article.nom}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{article.ref}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-sm font-semibold text-destructive">Stock: {article.stock}</span>
                          <span className="text-xs text-muted-foreground">Seuil: {article.seuil}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {alerts.warning.map(article => (
                  <div 
                    key={article.id} 
                    className="p-4 active:bg-muted/70 transition-colors cursor-pointer"
                    onClick={() => {
                      onClose();
                      navigate('/articles');
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-warning" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{article.nom}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{article.ref}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-sm font-semibold text-warning">Stock: {article.stock}</span>
                          <span className="text-xs text-muted-foreground">Seuil: {article.seuil}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {alerts.total > 0 && (
            <div className="p-4 border-t bg-card">
              <button
                onClick={() => {
                  onClose();
                  navigate('/articles');
                }}
                className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity active:scale-[0.98]"
              >
                Voir tous les articles
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationBottomSheet;
