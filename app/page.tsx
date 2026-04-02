import CoachListClient from "./_components/CoachListClient";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">⚽</div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">KickOff</h1>
          <p className="text-zinc-400 text-sm">Sett opp lag og bytteplan for kampen</p>
        </div>
        <CoachListClient />
      </div>
    </main>
  );
}
