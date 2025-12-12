// app/routes/home.tsx
// Landing Page - 首页

import { useEffect } from "react";
import { Link } from "react-router";
import { useTranslation } from "@/lib/app-context";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/config";

// Icons
const Icons = {
  ArrowRight: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
  ),
};

export function meta() {
  return [
    { title: `${APP_CONFIG.name} - Modern SaaS Starter Framework` },
    { name: "description", content: "Production-ready SaaS starter with Better-Auth, Cloudflare D1, and internationalization" },
  ];
}

export default function Home() {
  const { t } = useTranslation();

  // Dynamic document title based on language
  useEffect(() => {
    document.title = `${t.pageTitles.home} | ${APP_CONFIG.name}`;
  }, [t]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="flex flex-col justify-center items-center text-center px-4 py-20 sm:py-32 bg-gradient-to-b from-background to-muted/30">

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6 max-w-4xl animate-fade-in-up">
          {t.home.heroTitle}
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed animate-fade-in-up">
          {t.home.heroSubtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up">
          <Link to="/register">
            <Button size="lg" className="px-8 gap-2">
              {t.home.ctaStart}
              <Icons.ArrowRight />
            </Button>
          </Link>
          <Button variant="secondary" size="lg" className="px-8">
            {t.home.ctaLearn}
          </Button>
        </div>
      </section>

      {/* Developer Experience Section */}
      <section className="py-20 px-4 bg-muted/30 border-t border-border">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              {t.home.developerExperience.title}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.home.developerExperience.cloudflareDesc}
            </p>
          </div>

          {/* Cloudflare Stack Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Pages Card */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Pages</h3>
              <p className="text-sm text-muted-foreground">{t.home.developerExperience.pages}</p>
            </div>

            {/* D1 Card */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">D1</h3>
              <p className="text-sm text-muted-foreground">{t.home.developerExperience.d1}</p>
            </div>

            {/* R2 Card */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">R2</h3>
              <p className="text-sm text-muted-foreground">{t.home.developerExperience.r2}</p>
            </div>
          </div>

          {/* Module Description */}
          <p className="text-center text-muted-foreground mb-8">
            {t.home.developerExperience.moduleDesc}
          </p>

          {/* Code Block - macOS Terminal Style */}
          <div className="bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-slate-400 font-mono">views/NewModule.tsx</span>
            </div>

            {/* Code Content */}
            <div className="p-6 overflow-x-auto">
              <pre className="text-sm font-mono text-slate-300 leading-relaxed">
                <code>{`// 1. Create your component
const NewModule = () => {
  const { t } = useApp();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{t.newModule.title}</h1>
      {/* Your content here */}
    </div>
  );
};

// 2. Add to translations object
const TRANSLATIONS = {
  en: { newModule: { title: 'New Feature' }, ... },
  // ...
};

// 3. Add to Main Switch
// <main>{currentView === 'new-module' && <NewModule />}</main>`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© {APP_CONFIG.copyrightYear} {APP_CONFIG.name}. Built for rapid prototyping.</p>
        </div>
      </footer>
    </div>
  );
}
