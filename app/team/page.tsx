import { headers } from "next/headers";
import TeamCard from "../components/TeamCard";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  image: string | null;
};

async function fetchTeam(): Promise<TeamMember[]> {
  const headersList = headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/team_members`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to fetch team members");
  }

  return res.json();
}

export default async function TeamPage() {
  const team = await fetchTeam();

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Our Team
        </h1>
        <p className="text-sm text-slate-600 sm:text-base">
          Team members are loaded dynamically from the Neon database. This will
          later include more detailed bios and roles.
        </p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {team.map((member) => (
          <TeamCard
            key={member.id}
            name={member.name}
            role={member.role}
            imageSrc={member.image ?? undefined}
          />
        ))}
      </div>
    </section>
  );
}
