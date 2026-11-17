import { redirect, notFound } from "next/navigation";
import { getAuthorizedAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminRootPage() {
  const currentAdmin = await getAuthorizedAdmin();

  if (!currentAdmin) {
    notFound();
  }

  redirect("/admin/dashboard");
}
