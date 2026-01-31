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
import Room from "./Rooms/room";
import Analysis from "./Analysis/analysis";
import DashboardPage from "./db/db";
import CertificationPage from "./certification/c";
import RoomDashboard from "./AI/AIcomponent";

export function Sidebar() {
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Dashboard", href: "/dashboard", icon: IconBrandTabler },
    { label: "Rooms", href: "#rooms", icon: IconUserBolt },
    { label: "Analysis", href: "#analysis", icon: IconChartBar },
    { label: "Certification", href: "#certification", icon: IconCertificate },
    { label: "AI", href: "#ai-tips", icon: IconBulb },
  ];

  interface SidebarLinkItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  }

  const handleLinkClick = (linkLabel: SidebarLinkItem["label"]): void => {
    setActiveTab(linkLabel);
  };

  return (
    // FIXED: Proper flex layout with no overlap
    <div className="flex h-screen w-full -mt-10 bg-neutral-950">
      {/* Sidebar - Takes fixed width, not positioned fixed */}
      <div className="w-[260px] flex-shrink-0">
        <Sb open={open} setOpen={setOpen} animate={false}>
          <SidebarBody className="flex w-full flex-col justify-between border-r border-neutral-700 bg-neutral-900 h-screen">
            <div className="flex flex-1 flex-col overflow-y-auto">
              <div className="mt-8 mb-4 px-4">
                <h2 className="text-xl font-bold text-white invisible">Your App</h2>
              </div>

              <div className="flex flex-col gap-2">
                {links.map((link, idx) => {
                  const isActive = activeTab === link.label;
                  const Icon = link.icon;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleLinkClick(link.label)}
                      className={cn(
                        "cursor-pointer rounded-lg mx-2 px-3 py-2 transition hover:bg-neutral-800",
                        isActive && "bg-neutral-800 border-l-2 border-green-500"
                      )}
                    >
                      <SidebarLink
                        link={{
                          ...link,
                          icon: (
                            <Icon
                              className={cn(
                                "h-5 w-5",
                                isActive ? "text-green-500" : "text-neutral-300"
                              )}
                            />
                          ),
                        }}
                        className={cn(
                          "flex items-center gap-3 text-sm",
                          isActive ? "text-green-500 font-semibold" : "text-neutral-200"
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Profile */}
            <div className="border-t border-neutral-700 px-4 py-4">
              {session ? (
                <>
                  <div className="flex items-center gap-3 rounded-lg bg-neutral-800 p-2">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        className="h-8 w-8 rounded-full object-cover"
                        alt="User"
                      />
                    ) : (
                      <IconUserBolt className="h-8 w-8 text-neutral-200" />
                    )}

                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">
                        {session.user?.name}
                      </div>
                      <div className="truncate text-xs text-neutral-400">
                        {session.user?.email}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => signOut()}
                    className="mt-3 w-full flex items-center gap-2 rounded-lg p-2 text-sm text-red-400 hover:bg-red-950"
                  >
                    <ArrowLeft size={16} />
                    Sign out
                  </button>
                </>
              ) : (
                <div className="text-sm text-neutral-400">Not signed in</div>
              )}
            </div>
          </SidebarBody>
        </Sb>
      </div>

      {/* Main Dashboard Content - Flex grow with proper padding */}
      <main className="flex-1 h-screen overflow-y-auto">
        <Dashboard activeTab={activeTab} />
      </main>
    </div>
  );
}

interface DashboardProps {
  activeTab: string;
}

const Dashboard = ({ activeTab }: DashboardProps) => {
  const renderContent = () => {
    switch (activeTab) {
      case "Analysis":
        return <Analysis />;
      case "Certification":
        return <CertificationPage />;
      case "Rooms":
        return <Room />;
      case "AI":
        return <RoomDashboard />;
      case "Dashboard":
      default:
        return <DashboardPage />;
    }
  };

  return (
    // FIXED: Added proper padding to prevent content overlap
    <div className="w-full h-full px-6 py-4">
      {renderContent()}
    </div>
  );
};