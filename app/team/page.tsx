const team = [
  {
    name: "Team Member One",
    role: "Placeholder Role",
  },
  {
    name: "Team Member Two",
    role: "Placeholder Role",
  },
  {
    name: "Team Member Three",
    role: "Placeholder Role",
  },
];

export default function TeamPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
          Our Team
        </h1>
        <p className="text-sm text-slate-300 sm:text-base">
          Placeholder team page for Boggur 2.0. The final implementation will
          mirror the team presentation on boggur.is with photos and detailed
          bios.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {team.map((member) => (
          <article
            key={member.name}
            className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300"
          >
            <div className="mb-3 h-16 w-16 rounded-full bg-slate-800" />
            <h2 className="text-base font-semibold text-slate-50">
              {member.name}
            </h2>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {member.role}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
