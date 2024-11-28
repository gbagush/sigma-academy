import { Navbar } from "@/components/navigations/navbar";
import Footer from "@/components/navigations/footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-6 flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
