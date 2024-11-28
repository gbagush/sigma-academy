import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="mx-8 py-2 flex-grow">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
