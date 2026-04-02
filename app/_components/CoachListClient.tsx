"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCoaches } from "../_hooks/useCoach";

export default function CoachListClient() {
  const { coaches, createCoach, deleteCoach } = useCoaches();
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const router = useRouter();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const coach = createCoach(name.trim());
    router.push(`/${coach.id}`);
  }

  return (
    <div className="space-y-4">
      {coaches.length > 0 && (
        <div className="space-y-2">
          {coaches.map((c) => (
            <button
              key={c.id}
              onClick={() => router.push(`/${c.id}`)}
              className="w-full flex items-center justify-between px-4 py-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors text-left"
            >
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-zinc-400 text-sm">{c.players.length} spillere</p>
              </div>
              <span className="text-zinc-500">→</span>
            </button>
          ))}
        </div>
      )}

      {adding ? (
        <form onSubmit={handleCreate} className="space-y-3">
          <input
            autoFocus
            type="text"
            placeholder="Navn på trener / lag"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 focus:border-emerald-500 outline-none text-sm text-white placeholder:text-zinc-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 transition-colors"
            >
              Opprett
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setName(""); }}
              className="px-4 py-3 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors"
            >
              Avbryt
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full py-3 rounded-xl border border-dashed border-zinc-700 text-zinc-400 text-sm hover:border-emerald-500 hover:text-emerald-400 transition-colors"
        >
          + Nytt lag
        </button>
      )}
    </div>
  );
}
