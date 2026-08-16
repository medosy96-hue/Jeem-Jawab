import { CreateForm } from "@/components/CreateForm";

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  return <CreateForm mode={mode === "online" ? "online" : "local"} />;
}
