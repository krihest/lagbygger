import MatchDayClient from "../../../_components/MatchDayClient";

export default async function MatchDayPage({
  params,
}: {
  params: Promise<{ coachId: string; matchId: string }>;
}) {
  const { coachId, matchId } = await params;
  return <MatchDayClient coachId={coachId} matchId={matchId} />;
}
