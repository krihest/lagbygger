import PitchViewClient from "../../../../_components/PitchViewClient";

export default async function PitchViewPage({
  params,
}: {
  params: Promise<{ coachId: string; matchId: string }>;
}) {
  const { coachId, matchId } = await params;
  return <PitchViewClient coachId={coachId} matchId={matchId} />;
}
