import VitrineHeader from "@/components/vitrine/Header";
import VitrineFooter from "@/components/vitrine/Footer";

export default function VitrineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <VitrineHeader />
      <main className="flex-grow">
        {children}
      </main>
      <VitrineFooter />
    </div>
  );
}
