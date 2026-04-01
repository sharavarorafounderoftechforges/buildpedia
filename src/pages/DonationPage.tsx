import { Heart, ExternalLink, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

const DonationPage = () => (
  <div className="buildpedia-container py-16 max-w-2xl mx-auto text-center">
    <Heart className="h-12 w-12 text-destructive mx-auto mb-4" />
    <h1 className="font-display text-4xl text-foreground mb-3">Support Buildpedia</h1>
    <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
      Buildpedia is a community-driven encyclopedia for builders. Your support helps keep it running and growing.
    </p>

    <div className="border border-border rounded-lg p-8 bg-card mb-8">
      <Coffee className="h-8 w-8 text-accent mx-auto mb-3" />
      <h2 className="font-display text-2xl text-foreground mb-2">Buy Me a Coffee</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Every contribution helps cover hosting, development, and AI moderation costs.
      </p>
      <Button asChild size="lg" className="gap-2">
        <a href="https://buymeacoffee.com/sharavarora" target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4" /> Donate on Buy Me a Coffee
        </a>
      </Button>
    </div>

    <div className="border border-border rounded-lg p-6 bg-card">
      <h3 className="font-display text-xl text-foreground mb-2">Professional Bio Writing</h3>
      <p className="text-muted-foreground text-sm mb-4">
        Want a professionally written builder page? Reach out to our editorial team.
      </p>
      <Button variant="outline" asChild className="gap-2">
        <a href="mailto:team@buildpedia.com">
          Contact: team@buildpedia.com
        </a>
      </Button>
    </div>
  </div>
);

export default DonationPage;
