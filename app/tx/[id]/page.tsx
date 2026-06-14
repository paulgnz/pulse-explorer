import TxDetail from "@/components/TxDetail";

export const metadata = { title: "Transaction — Pulse Explorer" };

export default function Page({ params }: { params: { id: string } }) {
  return <TxDetail id={params.id} />;
}
