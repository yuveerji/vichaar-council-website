import { redirect } from "next/navigation";
import { getCurrentParticipant } from "@/lib/participant-auth";

export const dynamic = "force-dynamic";

export default async function MyVichaarEntryPage() {
  const participant = await getCurrentParticipant();

  if (participant) {
    redirect("/my-vichaar/dashboard");
  } else {
    redirect("/my-vichaar/login");
  }
}
