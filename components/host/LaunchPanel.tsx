"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import type { Game, Player } from "@/lib/supabase/types";
import { launchGame } from "@/lib/actions/setup";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function LaunchPanel({
  game,
  players,
  configured,
}: {
  game: Game;
  players: Player[];
  configured: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showQR, setShowQR] = useState(false);
  const ready = configured === 16;
  const launched = game.status !== "lobby";

  function launch() {
    startTransition(async () => {
      await launchGame(game.id);
      setShowQR(true);
      router.refresh();
    });
  }

  return (
    <>
      <div className="sticky bottom-0 z-20 flex items-center justify-between gap-4 border-t-[0.5px] border-line bg-bg/90 px-5 py-4 backdrop-blur">
        <p className="text-sm text-ink-muted">
          {ready
            ? "All seats configured."
            : `${16 - configured} seat${16 - configured === 1 ? "" : "s"} still empty.`}
        </p>
        <div className="flex gap-3">
          {launched && (
            <>
              <Button variant="ghost" onClick={() => setShowQR(true)}>
                QR codes
              </Button>
              <Button onClick={() => router.push(`/host/${game.id}`)}>
                Go to dashboard
              </Button>
            </>
          )}
          {!launched && (
            <Button onClick={launch} disabled={pending || configured === 0}>
              {pending ? "Launching…" : "Launch game"}
            </Button>
          )}
        </div>
      </div>

      <Modal
        open={showQR}
        onClose={() => setShowQR(false)}
        title="Player QR codes"
        fullScreen
      >
        <QRGrid game={game} players={players} />
      </Modal>
    </>
  );
}

function QRGrid({ game, players }: { game: Game; players: Player[] }) {
  const [origin, setOrigin] = useState("");
  const [codes, setCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!origin) return;
    const named = players.filter((p) => p.character_name?.trim());
    Promise.all(
      named.map(async (p) => {
        const url = `${origin}/join/${game.code}?pid=${p.id}`;
        const dataUrl = await QRCode.toDataURL(url, {
          margin: 1,
          width: 240,
          color: { dark: "#000000", light: "#ffffff" },
        });
        return [p.id, dataUrl] as const;
      })
    ).then((entries) => setCodes(Object.fromEntries(entries)));
  }, [origin, players, game.code]);

  const named = players.filter((p) => p.character_name?.trim());

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-secondary">
          One code per character. Print and hand out.
        </p>
        <Button size="sm" variant="ghost" onClick={() => window.print()}>
          Print
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {named.map((p) => (
          <div
            key={p.id}
            className="flex flex-col items-center gap-2 rounded-[10px] border-[0.5px] border-line bg-surface p-3"
          >
            {codes[p.id] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={codes[p.id]}
                alt={`QR for ${p.character_name}`}
                className="h-28 w-28 rounded-[6px]"
              />
            ) : (
              <div className="h-28 w-28 animate-pulse-soft rounded-[6px] bg-white/5" />
            )}
            <p className="text-center text-xs font-medium text-ink">
              {p.character_name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
