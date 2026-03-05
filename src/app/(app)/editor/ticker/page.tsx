import { createClient } from "@/lib/supabase/server";
import { hasMinRole } from "@/lib/validators/article";
import { redirect } from "next/navigation";
import { AddTickerForm, TickerRow, TickerRowMobile } from "./ticker-actions";

export default async function TickerManagementPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile as { role: string } | null)?.role;
  if (!role || !hasMinRole(role, "editor")) {
    redirect("/");
  }

  const { data: items } = await supabase
    .from("ticker_items")
    .select("*")
    .order("priority", { ascending: false });

  const tickerItems = items ?? [];

  return (
    <main className="min-h-screen bg-void">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <h1 className="mb-6 font-cinzel text-2xl font-bold text-paper sm:mb-8 sm:text-3xl">
          Ticker Management
        </h1>

        <AddTickerForm />

        {tickerItems.length === 0 ? (
          <div className="rounded border border-seam bg-chamber p-8 text-center">
            <h2 className="font-cinzel text-lg text-paper">No Ticker Items</h2>
            <p className="mt-2 font-crimson text-stone">
              Add a ticker item above to get started.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded border border-seam md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-seam bg-graphite">
                    <th className="px-4 py-3 text-left font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                      Text
                    </th>
                    <th className="px-4 py-3 text-left font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                      Expires
                    </th>
                    <th className="px-4 py-3 text-right font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tickerItems.map((item) => (
                    <TickerRow key={item.id} item={item} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {tickerItems.map((item) => (
                <TickerRowMobile key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
