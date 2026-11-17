import { notFound } from "next/navigation";
import { getAuthorizedAdmin } from "@/lib/auth";
import NewEventForm from "@/components/admin/NewEventForm";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const currentAdmin = await getAuthorizedAdmin();

  if (!currentAdmin) {
    notFound();
  }

  return <NewEventForm user={currentAdmin} />;
}
