import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // QC diarahkan ke halaman input, PM ke dashboard rekap.
  redirect(session.role !== "PRODUCT_MANAGER" ? "/input" : "/dashboard");
}
