import SquadPageClient from "../_components/SquadPageClient";

export default async function CoachPage({
  params,
}: {
  params: Promise<{ coachId: string }>;
}) {
  const { coachId } = await params;
  return <SquadPageClient coachId={coachId} />;
}
