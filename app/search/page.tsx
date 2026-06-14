import { redirect } from "next/navigation";

export default function Search({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q || "").trim();
  if (!q) redirect("/");
  if (/^\d+$/.test(q)) redirect(`/block/${q}`);           // block number
  if (/^[0-9a-fA-F]{64}$/.test(q)) redirect(`/tx/${q}`);  // tx id (or block id) — try tx detail
  redirect(`/account/${q}`);                               // account name
}
