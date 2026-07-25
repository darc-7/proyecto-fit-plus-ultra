import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ClientDetailModal({ client, onClose }) {
  if (!client) return null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalles del Cliente</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 pb-4 border-b">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
            {(client.displayName || "?")[0].toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-foreground text-lg">{client.displayName || "Sin nombre"}</div>
            <div className="text-muted-foreground text-sm">{client.email}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Card className="bg-muted/50 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">Racha Actual</p>
              <p className="text-xl font-bold text-orange-500">{client.streak || 0} días 🔥</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">Puntos Totales</p>
              <p className="text-xl font-bold text-yellow-600">⭐ {client.totalPoints || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">Rutinas Completadas</p>
              <p className="text-xl font-bold text-green-600">{client.completedRoutines || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">Días Registrado</p>
              <p className="text-xl font-bold text-blue-600">
                {(() => {
                  const raw = client.createdAt;
                  const date = raw?.toDate ? raw.toDate() : raw ? new Date(raw) : null;
                  return date ? Math.floor((new Date() - date) / (1000 * 60 * 60 * 24)) : 0;
                })()}
              </p>
            </CardContent>
          </Card>
        </div>

        {client.currentRoutine && client.currentRoutine.length > 0 && (
          <Card className="bg-muted/50 shadow-none mt-4">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-2">Rutina Actual</p>
              <p className="text-sm text-foreground">{client.currentRoutine.length} ejercicio(s) asignados</p>
            </CardContent>
          </Card>
        )}

        {client.createdAt && (
          <div className="text-xs text-muted-foreground mt-4">
            Registrado el {new Date(client.createdAt).toLocaleDateString("es-ES", {
              year: "numeric", month: "long", day: "numeric"
            })}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
