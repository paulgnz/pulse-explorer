import { getInfo, CHAIN_NAME } from "@/lib/rpc";
import LiveHome from "@/components/LiveHome";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function Home() {
  let info: any, err = "";
  try {
    info = await getInfo();
  } catch (e: any) {
    err = e.message || String(e);
  }

  if (err)
    return (
      <EmptyState icon="⚡" title="Can’t reach the chain RPC" badge="retrying">
        The PulseVM JSON-RPC node didn’t respond. {CHAIN_NAME}. ({err})
      </EmptyState>
    );

  return <LiveHome initial={info} />;
}
