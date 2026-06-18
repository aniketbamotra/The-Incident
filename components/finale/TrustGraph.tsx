"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Player, TrustRating } from "@/lib/supabase/types";
import { honestyRate, type ClueAssignmentLite } from "@/lib/scoring";
import { Button } from "@/components/ui/Button";

// react-force-graph-2d touches the DOM/canvas, so it must not render on the server.
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

type Mode = "public" | "real";

export function TrustGraph({
  players,
  trust,
  assignments,
}: {
  players: Player[];
  trust: TrustRating[];
  assignments: ClueAssignmentLite[];
}) {
  const [mode, setMode] = useState<Mode>("public");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);

  useEffect(() => {
    const measure = () =>
      wrapRef.current && setWidth(wrapRef.current.clientWidth);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const inGame = useMemo(
    () => players.filter((p) => p.user_id || p.character_name?.trim()),
    [players]
  );

  const data = useMemo(() => {
    // Node size scales with how much others trusted this player.
    const incoming = new Map<string, number[]>();
    trust.forEach((t) => {
      if (!t.rated_id) return;
      const arr = incoming.get(t.rated_id) ?? [];
      arr.push(t.score);
      incoming.set(t.rated_id, arr);
    });

    const nodes = inGame.map((p) => {
      const scores = incoming.get(p.id) ?? [];
      const avgTrust =
        scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 50;
      const honesty = honestyRate(p.id, assignments);
      return {
        id: p.id,
        name: p.character_name || p.name,
        val: 2 + (avgTrust / 100) * 10,
        honesty,
        color:
          mode === "real"
            ? honesty >= 0.66
              ? "#1d9e75"
              : honesty >= 0.33
                ? "#f0a500"
                : "#e24b4a"
            : "#7f77dd",
      };
    });

    const links = trust
      .filter((t) => t.rater_id && t.rated_id)
      .map((t) => {
        const honesty = honestyRate(t.rated_id!, assignments);
        const accurate = Math.abs(t.score / 100 - honesty) < 0.25;
        return {
          source: t.rater_id!,
          target: t.rated_id!,
          color:
            mode === "real"
              ? accurate
                ? "rgba(29,158,117,0.5)"
                : "rgba(226,75,74,0.5)"
              : t.score >= 60
                ? "rgba(29,158,117,0.35)"
                : t.score <= 40
                  ? "rgba(226,75,74,0.35)"
                  : "rgba(127,119,221,0.35)",
        };
      });

    return { nodes, links };
  }, [inGame, trust, assignments, mode]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-ink">The trust map</h2>
          <p className="text-sm text-ink-muted">
            {mode === "public"
              ? "What everyone said they believed."
              : "What was actually true. Green nodes told the truth."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === "public" ? "purple" : "ghost"}
            onClick={() => setMode("public")}
          >
            Public
          </Button>
          <Button
            size="sm"
            variant={mode === "real" ? "purple" : "ghost"}
            onClick={() => setMode("real")}
          >
            Real
          </Button>
        </div>
      </div>

      <div
        ref={wrapRef}
        className="overflow-hidden rounded-[12px] border-[0.5px] border-line bg-surface"
      >
        {data.nodes.length > 0 ? (
          <ForceGraph2D
            graphData={data}
            width={width}
            height={500}
            backgroundColor="#111111"
            nodeLabel="name"
            nodeVal="val"
            nodeColor="color"
            linkColor="color"
            linkDirectionalParticles={mode === "real" ? 2 : 0}
            linkDirectionalParticleWidth={2}
            nodeCanvasObjectMode={() => "after"}
            nodeCanvasObject={(
              node: { x?: number; y?: number; name?: string; val?: number },
              ctx: CanvasRenderingContext2D,
              scale: number
            ) => {
              const label = node.name ?? "";
              ctx.font = `${11 / scale}px system-ui`;
              ctx.fillStyle = "rgba(255,255,255,0.7)";
              ctx.textAlign = "center";
              ctx.fillText(
                label,
                node.x ?? 0,
                (node.y ?? 0) + (node.val ?? 4) + 9 / scale
              );
            }}
          />
        ) : (
          <div className="flex h-[500px] items-center justify-center text-sm text-ink-muted">
            No trust ratings to map.
          </div>
        )}
      </div>
    </div>
  );
}
