
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import ResumeSection from '@/components/ResumeSection';
import ProjectsSection from '@/components/ProjectsSection';
import ContactSection from '@/components/ContactSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <ResumeSection />
        <ProjectsSection />
        <ContactSection />
      </main>
      
      {/* Footer */}
      <footer className="bg-background border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">
              © 2024 [Your Name]. Built with React, TypeScript, and Tailwind CSS.
            </p>
            <p className="text-xs mt-2">
              Designed with ❤️ for an amazing user experience.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
