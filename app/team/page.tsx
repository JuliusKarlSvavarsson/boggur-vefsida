import TeamCard from "../components/TeamCard";

const team = [
  {
    name: "Team Member One",
    role: "Placeholder Role",
    imageSrc: "/images/team/member1.jpg",
  },
  {
    name: "Team Member Two",
    role: "Placeholder Role",
    imageSrc: "/images/team/member2.jpg",
  },
  {
    name: "Team Member Three",
    role: "Placeholder Role",
    imageSrc: "/images/team/member3.jpg",
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
          <TeamCard key={member.name} {...member} />
        ))}
      </div>
    </section>
  );
}
