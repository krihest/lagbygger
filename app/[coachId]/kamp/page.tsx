import MatchSetupClient from "../../_components/MatchSetupClient";

export default async function KampSetupPage({
  params,
}: {
  params: Promise<{ coachId: string }>;
}) {
  const { coachId } = await params;
  return <MatchSetupClient coachId={coachId} />;
}
