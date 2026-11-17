import { redirect } from "next/navigation";
import { getCurrentParticipant } from "@/lib/participant-auth";
import PortalClientLayout from "./PortalClientLayout";

export const dynamic = "force-dynamic";

export default async function ParticipantPortalLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const participant = await getCurrentParticipant();

  if (!participant) {
    redirect("/my-vichaar/login");
  }

  return (
    <PortalClientLayout participant={participant}>
      {children}
    </PortalClientLayout>
  );
}
