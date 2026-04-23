import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
          <WifiOff className="size-6 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold">Vous êtes hors ligne</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Vos données locales restent disponibles. Reconnectez-vous pour
          synchroniser les assets récents.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href="/">Retour au tableau de bord</Link>
        </Button>
      </section>
    </main>
  );
}
