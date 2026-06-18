"use client";

import { useMemo } from "react";
import type { Player } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

// Circular layout of all seats with directed "finds" arrows. Seats that nobody
// is looking for are flagged amber so the host can spot social dead-ends.
export function InteractionWeb({
  players,
  selectedId,
  onSelect,
}: {
  players: Player[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const SIZE = 320;
  const R = 130;
  const C = SIZE / 2;

  const nodes = useMemo(() => {
    const n = players.length || 1;
    return players.map((p, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      return {
        player: p,
        x: C + R * Math.cos(angle),
        y: C + R * Math.sin(angle),
      };
    });
  }, [players]);

  const incoming = useMemo(() => {
    const set = new Set<string>();
    players.forEach((p) => p.find_player_id && set.add(p.find_player_id));
    return set;
  }, [players]);

  const byId = useMemo(
    () => new Map(nodes.map((nd) => [nd.player.id, nd])),
    [nodes]
  );

  const edges = nodes.flatMap((nd) => {
    const target = nd.player.find_player_id
      ? byId.get(nd.player.find_player_id)
      : null;
    return target ? [{ from: nd, to: target, id: nd.player.id }] : [];
  });

  const isolatedCount = players.filter(
    (p) => p.character_name?.trim() && !incoming.has(p.id)
  ).length;

  return (
    <div className="rounded-[12px] border-[0.5px] border-line bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
          Interaction web
        </p>
        <p className="text-[11px] text-ink-muted">
          {isolatedCount > 0 ? (
            <span className="text-amber">{isolatedCount} unsought</span>
          ) : (
            <span className="text-green">all connected</span>
          )}
        </p>
      </div>

      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="mx-auto h-[320px] w-[320px] max-w-full"
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="rgba(255,255,255,0.25)" />
          </marker>
        </defs>

        {edges.map((e) => {
          const highlight = e.from.player.id === selectedId;
          // Shorten the line so the arrowhead sits outside the target node.
          const dx = e.to.x - e.from.x;
          const dy = e.to.y - e.from.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          const x2 = e.to.x - ux * 16;
          const y2 = e.to.y - uy * 16;
          return (
            <line
              key={e.id}
              x1={e.from.x + ux * 16}
              y1={e.from.y + uy * 16}
              x2={x2}
              y2={y2}
              stroke={
                highlight ? "var(--purple)" : "rgba(255,255,255,0.12)"
              }
              strokeWidth={highlight ? 1.5 : 0.75}
              markerEnd="url(#arrow)"
            />
          );
        })}

        {nodes.map((nd, i) => {
          const p = nd.player;
          const isSet = !!p.character_name?.trim();
          const unsought = isSet && !incoming.has(p.id);
          const selected = p.id === selectedId;
          return (
            <g
              key={p.id}
              transform={`translate(${nd.x},${nd.y})`}
              className="cursor-pointer"
              onClick={() => onSelect(p.id)}
            >
              <circle
                r={selected ? 13 : 11}
                fill={selected ? "#1a1a1a" : "var(--surface)"}
                stroke={
                  selected
                    ? "#ffffff"
                    : unsought
                      ? "var(--amber)"
                      : isSet
                        ? "var(--green)"
                        : "rgba(255,255,255,0.2)"
                }
                strokeWidth={selected ? 1.5 : 1}
              />
              <text
                textAnchor="middle"
                dy="3.5"
                fontSize="9"
                fill="rgba(255,255,255,0.7)"
              >
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
