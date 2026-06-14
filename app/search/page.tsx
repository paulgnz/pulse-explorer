import { redirect } from "next/navigation";

export default function Search({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q || "").trim();
  if (!q) redirect("/");
  if (/^\d+$/.test(q)) redirect(`/block/${q}`);           // block number
  if (q.length === 64) redirect(`/block/${q}`);            // block id (tx history needs indexer)
  redirect(`/account/${q}`);                               // account name
}
