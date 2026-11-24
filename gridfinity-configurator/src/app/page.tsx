import { Hero } from "@/components/Hero";
import { Planner } from "@/components/Planner";
import { ConfiguratorProvider } from "@/context/ConfiguratorContext";

export default function HomePage() {
  return (
    <ConfiguratorProvider>
      <main>
        <Hero />
        <Planner />
        <footer className="mx-auto max-w-6xl px-5 pb-12 pt-4 text-center font-mono text-xs text-muted md:px-8">
          Gridfinity Shop · MVP configurator · placeholder EUR prices · no
          shipping yet
        </footer>
      </main>
    </ConfiguratorProvider>
  );
}
