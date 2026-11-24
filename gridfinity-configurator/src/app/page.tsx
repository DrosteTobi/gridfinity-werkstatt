import { Hero } from "@/components/Hero";
import { Planner } from "@/components/Planner";
import { ConfiguratorProvider } from "@/context/ConfiguratorContext";

export default function HomePage() {
  return (
    <ConfiguratorProvider>
      <main>
        <Hero />
        <Planner />
      </main>
    </ConfiguratorProvider>
  );
}
