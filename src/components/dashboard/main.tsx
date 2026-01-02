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

export function Sidebar() {
  const { data: session } = useSession();

  // Fix 1: Make activeTab state dynamic instead of hardcoded
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Dashboard", href: "/dashboard", icon: IconBrandTabler },
    { label: "Rooms", href: "#rooms", icon: IconUserBolt }, // Fix 2: Use proper href
    { label: "Analysis", href: "#analysis", icon: IconChartBar }, // Fix 2: Use proper href
    { label: "Certification", href: "#certification", icon: IconCertificate }, // Fix 2: Use proper href
    // { label: "AI Tips", href: "/ai-tips", icon: IconBulb }, // Fix 2: Use proper href
  ];

  // Fix 3: Add click handler for navigation
  interface SidebarLinkItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  }

  const handleLinkClick = (linkLabel: SidebarLinkItem["label"]): void => {
    setActiveTab(linkLabel);
  };

  return (
    <div className="grid grid-cols-[260px_1fr] h-screen w-full absolute top-0">
      {/* Sidebar */}
      <Sb open={open} setOpen={setOpen} animate={false}>
        <SidebarBody className="flex flex-col justify-between gap-10 h-full border-r border-neutral-700 bg-neutral-900">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {/* Fix 4: Add proper header/logo section */}
            <div className="mt-8 mb-4 px-4">
              <h2 className="text-xl font-bold text-white"></h2>
            </div>

            <div className="flex flex-col gap-2">
              {links.map((link, idx) => {
                const isActive = activeTab === link.label;
                const Icon = link.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => handleLinkClick(link.label)} // Fix 3: Add click handler
                    className={cn(
                      "cursor-pointer rounded-lg mx-2 px-3 py-2 transition-colors hover:bg-neutral-800", // Fix 5: Better hover states
                      isActive && "bg-neutral-800 border-l-2 border-green-500" // Fix 6: Better active state styling
                    )}
                  >
                    <SidebarLink
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
                        "flex items-center gap-3 text-sm",
                        isActive ? "text-green-500 font-semibold" : "text-neutral-200"
                      )}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Profile section - Fix 7: Improved layout and error handling */}
          <div className="flex flex-col gap-3 border-t border-neutral-700 pt-4 px-4">
            {session ? (
              <>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-neutral-800">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user?.name || "User"}
                      className="h-8 w-8 rounded-full object-cover border border-neutral-600"
                      onError={(e) => {
                        // Fix 8: Handle image load errors
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        if (img.nextSibling && img.nextSibling instanceof HTMLElement) {
                          (img.nextSibling as HTMLElement).style.display = 'block';
                        }
                      }}
                    />
                  ) : null}
                  <IconUserBolt
                    className="h-8 w-8 text-neutral-200"
                    style={{ display: session.user?.image ? 'none' : 'block' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {session.user?.name || "User"}
                    </div>
                    {session.user?.email && (
                      <div className="text-xs text-neutral-400 truncate">
                        {session.user.email}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm p-2 rounded-lg hover:bg-red-950 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Sign out
                </button>
              </>
            ) : (
              // Fix 9: Handle case when no session exists
              <div className="text-neutral-400 text-sm p-2">
                Not signed in
              </div>
            )}
          </div>
        </SidebarBody>
      </Sb>

      {/* Scrollable Dashboard - Fix 10: Better container styling */}
        <Dashboard activeTab={activeTab} />
     
    </div>
  );
}

interface DashboardProps {
  activeTab: string;
}

const Dashboard = ({ activeTab }: DashboardProps) => {
  // Fix 11: Add proper content structure and loading states
  const renderContent = () => {
    switch (activeTab) {
      case "Analysis":
        return (
          <Analysis/>
        );
      case "Certification":
        return (
          <CertificationPage/>
        );
      case "Rooms":
        return (
          <Room/>
        );
      case "AI Tips":
        return (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white">🤖 AI-Powered Tips</h1>
            <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-700">
              <p className="text-neutral-300">Personalized AI tips to improve your typing speed and accuracy.</p>
            </div>
          </div>
        );
      case "Dashboard":
      default:
        return (
          <div className= "h-screen overflow-hidden scrollbar-hide flex ">
          <DashboardPage/>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-1 p-6">
      <div className="flex h-full w-full flex-1 flex-col gap-4">
        {renderContent()}
      </div>
    </div>
  );
};