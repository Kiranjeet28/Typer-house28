"use client";
import React, { useState } from "react";
import { Sidebar as Sb, SidebarBody, SidebarLink } from "../ui/sidebar";
import {
  IconBrandTabler,
  IconUserBolt,
  IconChartBar,
  IconCertificate,
  IconBulb,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";

export function Sidebar() {
  const { data: session } = useSession();

  const links = [
    { label: "Dashboard", href: "/dashboard", icon: IconBrandTabler },
    { label: "Rooms", href: "#rooms", icon: IconUserBolt },
    { label: "Analysis", href: "#analysis", icon: IconChartBar },
    { label: "Certification", href: "#certification", icon: IconCertificate },
    { label: "AI Tips", href: "#ai-tips", icon: IconBulb },
  ];

  const [open, setOpen] = useState(false);
  const [activeTab] = useState("Analysis"); // Default active tab

  return (
    <div className="grid grid-cols-[260px_1fr] h-screen w-full absolute top-0">
      {/* Sidebar */}
      <Sb open={open} setOpen={setOpen} animate={false}>
        <SidebarBody className="flex flex-col justify-between gap-10 h-full border-r border-neutral-700 bg-neutral-900">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <div className="mt-16 flex flex-col gap-2">
              {links.map((link, idx) => {
                const isActive = activeTab.toLowerCase() === link.label.toLowerCase();
                const Icon = link.icon;
                return (
                  <SidebarLink
                    key={idx}
                    link={{
                      ...link,
                      icon: (
                        <Icon
                          className={cn(
                            "h-5 w-5 shrink-0",
                            isActive ? "text-green-500" : "text-neutral-200"
                          )}
                        />
                      ),
                    }}
                    className={cn(
                      "cursor-pointer",
                      isActive && "text-green-500 font-semibold"
                    )}
                  />
                );
              })}
            </div>
          </div>

          {/* Profile section */}
          <div className="flex flex-col gap-3 border-t border-neutral-700 pt-4">
            {session && (
              <>
                <div className="flex items-center gap-3">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user?.name || "User"}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <IconUserBolt className="h-8 w-8 rounded-full text-neutral-200" />
                  )}
                  <span className="text-sm truncate">{session.user?.name}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1 text-red-500 hover:text-red-400"
                >
                  <ArrowLeft size={16} /> Sign out
                </button>
              </>
            )}
          </div>
        </SidebarBody>
      </Sb>

      {/* Scrollable Dashboard */}
      <div className="overflow-y-auto h-screen bg-neutral-950 text-white p-6">
        <Dashboard activeTab={activeTab} />
      </div>
    </div>
  );
}

const Dashboard = ({ activeTab }: { activeTab: string }) => {
  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-tl-2xl border p-6">
        {activeTab === "Analysis" && <div>📊 Analysis content here...</div>}
        {activeTab === "Certification" && <div>📜 Certification details here...</div>}
        {activeTab === "Rooms" && <div>🏠 All Rooms created list here...</div>}
        {activeTab === "AI Tips" && <div>🤖 AI Tips to improve your typing...</div>}
        {activeTab === "Dashboard" && <div>🏆 Typing competition results & game modes here...</div>}
      </div>
    </div>
  );
};
