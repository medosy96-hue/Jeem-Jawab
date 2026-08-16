import { GameHost } from "@/components/GameHost";

export default async function HostPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <GameHost code={code} />;
}
