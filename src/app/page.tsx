import { getTeams } from "@/data/teams";

export default async function Home() {
  const teams = await getTeams();

  return (
    <main>
      <h1>Formula Lab</h1>

      <h2>Teams</h2>

      <ul>
        {teams.map((team) => (
          <li key={team.id}>{team.name}</li>
        ))}
      </ul>
    </main>
  );
}
