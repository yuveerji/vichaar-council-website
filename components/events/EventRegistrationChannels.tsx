"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import EventRegistrationCard from "./EventRegistrationCard";
import InstitutionalRegistrationCard from "./InstitutionalRegistrationCard";
import TeamRegistrationCard from "./TeamRegistrationCard";
import { User, Users, Building2, Sparkles } from "lucide-react";

interface TicketCategory {
  id: string;
  name: string;
  price: number;
  capacity: number;
  soldCount: number;
  description: string | null;
  isActive: boolean;
}

interface EventRegistrationChannelsProps {
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  tickets: TicketCategory[];
  eventStatus: string;
}

type RegistrationChannel = "individual" | "team" | "institutional";

export default function EventRegistrationChannels({
  eventId,
  eventTitle,
  eventSlug,
  tickets,
  eventStatus
}: EventRegistrationChannelsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const paramType = (searchParams.get("type") || searchParams.get("channel") || "individual").toLowerCase();
  const initialChannel: RegistrationChannel =
    paramType === "institutional" || paramType === "school"
      ? "institutional"
      : paramType === "team"
      ? "team"
      : "individual";

  const [activeChannel, setActiveChannel] = useState<RegistrationChannel>(initialChannel);

  useEffect(() => {
    const current = (searchParams.get("type") || searchParams.get("channel") || "").toLowerCase();
    if (current === "institutional" || current === "school") {
      setActiveChannel("institutional");
    } else if (current === "team") {
      setActiveChannel("team");
    } else if (current === "individual") {
      setActiveChannel("individual");
    }
  }, [searchParams]);

  const handleChannelSwitch = (channel: RegistrationChannel) => {
    setActiveChannel(channel);
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", channel);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const channels: {
    key: RegistrationChannel;
    label: string;
    sublabel: string;
    icon: any;
    badge: string;
  }[] = [
    {
      key: "individual",
      label: "Individual Registration",
      sublabel: "Independent students · Classes 7–12",
      icon: User,
      badge: "Classes 7–12"
    },
    {
      key: "team",
      label: "Team Registration",
      sublabel: "2-member debate pairings",
      icon: Users,
      badge: "2 Speakers"
    },
    {
      key: "institutional",
      label: "Institutional Registration",
      sublabel: "Schools & delegations via coordinator",
      icon: Building2,
      badge: "Schools & Delegations"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Channel Switcher Navigation */}
      <div className="bg-white border border-charcoal/15 p-2 sm:p-3 rounded-md shadow-sm">
        <div className="text-[10px] font-bold tracking-widest text-charcoal/60 uppercase px-2 mb-2">
          SELECT REGISTRATION CHANNEL:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {channels.map((chan) => {
            const Icon = chan.icon;
            const isActive = activeChannel === chan.key;
            return (
              <button
                key={chan.key}
                type="button"
                onClick={() => handleChannelSwitch(chan.key)}
                className={`flex flex-col text-left p-3.5 sm:p-4 rounded border transition-all text-left relative overflow-hidden group ${
                  isActive
                    ? "bg-navy text-warmwhite border-navy shadow-md ring-2 ring-citrus/50"
                    : "bg-warmwhite text-charcoal border-charcoal/15 hover:border-navy/40 hover:bg-white"
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 right-0 w-2 h-full bg-citrus" />
                )}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                        isActive ? "bg-citrus text-navy" : "bg-charcoal/10 text-charcoal"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-bold tracking-tight ${
                        isActive ? "text-white" : "text-charcoal"
                      }`}
                    >
                      {chan.label}
                    </span>
                  </div>
                </div>
                <p
                  className={`text-[11px] leading-snug ${
                    isActive ? "text-warmwhite/75" : "text-charcoal/60"
                  }`}
                >
                  {chan.sublabel}
                </p>
                <div className="mt-2.5">
                  <span
                    className={`inline-block px-2 py-0.5 text-[9.5px] font-bold tracking-wider uppercase rounded-xs ${
                      isActive
                        ? "bg-citrus/20 text-citrus border border-citrus/40"
                        : "bg-charcoal/5 text-charcoal/70 border border-charcoal/10"
                    }`}
                  >
                    {chan.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render the Active Form Card */}
      {activeChannel === "individual" && (
        <EventRegistrationCard
          eventId={eventId}
          eventTitle={eventTitle}
          eventSlug={eventSlug}
          tickets={tickets}
          eventStatus={eventStatus}
        />
      )}

      {activeChannel === "team" && (
        <TeamRegistrationCard
          eventId={eventId}
          eventTitle={eventTitle}
          eventSlug={eventSlug}
          tickets={tickets}
          eventStatus={eventStatus}
        />
      )}

      {activeChannel === "institutional" && (
        <InstitutionalRegistrationCard
          eventId={eventId}
          eventTitle={eventTitle}
          eventSlug={eventSlug}
          tickets={tickets}
          eventStatus={eventStatus}
        />
      )}
    </div>
  );
}
