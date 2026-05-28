import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { UserProvider } from "@/components/UserProvider";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Compliance Platform",
  description:
    "Compliance Documentation Automation Platform — requirements, documents, evidence, approvals, AI analysis and reporting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = getCurrentUser();
  return (
    <html lang="en">
      <body>
        <UserProvider user={user}>
          {user ? (
            <div className="min-h-screen flex">
              <Sidebar role={user.role} />
              <div className="flex-1 flex flex-col min-w-0">
                <Topbar user={user} />
                <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
                  {children}
                </main>
              </div>
            </div>
          ) : (
            children
          )}
        </UserProvider>
      </body>
    </html>
  );
}
