import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, Sparkles, Trophy, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Index = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const { data: trendingFounders } = useQuery({
    queryKey: ["trending-founders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("founder_pages")
        .select("slug, founder_name, summary, build_score, view_count, verified_founder, profile_image_url")
        .order("view_count", { ascending: false })
        .limit(6);
      return data ?? [];
    },
  });

  const { data: recentFounders } = useQuery({
    queryKey: ["recent-founders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("founder_pages")
        .select("slug, founder_name, summary, build_score, view_count, verified_founder")
        .order("created_at", { ascending: false })
        .limit(6);
      return data ?? [];
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 md:py-32 border-b border-border">
        <div className="buildpedia-container text-center">
          <h1 className="font-display text-5xl md:text-7xl text-foreground mb-4 tracking-tight">
            Buildpedia
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-xl mx-auto font-body">
            The open encyclopedia for builders, founders and the startups they create.
          </p>
          <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a builder, founder, or startup..."
              className="pl-12 pr-4 h-14 text-base rounded-lg border-border bg-background shadow-sm"
            />
            <Button type="submit" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2">
              Search
            </Button>
          </form>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {["Sharav Arora", "Elon Musk", "Caleb Wodi"].map((name) => (
              <Badge
                key={name}
                variant="secondary"
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => navigate(`/${name.toLowerCase().replace(/\s+/g, "-")}`)}
              >
                {name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Founders */}
      <section className="py-12 border-b border-border">
        <div className="buildpedia-container">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              <h2 className="font-display text-2xl text-foreground">Trending Builders</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/leaderboard")} className="gap-1 text-muted-foreground">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(trendingFounders ?? []).map((founder) => (
              <FounderCard key={founder.slug} founder={founder} onClick={() => navigate(`/${founder.slug}`)} />
            ))}
            {(!trendingFounders || trendingFounders.length === 0) && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No builder pages yet. <Button variant="link" onClick={() => navigate("/create")} className="text-accent p-0">Create the first one.</Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Pages */}
      <section className="py-12">
        <div className="buildpedia-container">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="font-display text-2xl text-foreground">New Pages</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(recentFounders ?? []).map((founder) => (
              <FounderCard key={founder.slug} founder={founder} onClick={() => navigate(`/${founder.slug}`)} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

interface FounderCardProps {
  founder: {
    slug: string;
    founder_name: string;
    summary: string | null;
    build_score: number | null;
    view_count: number | null;
    verified_founder: boolean | null;
    profile_image_url?: string | null;
  };
  onClick: () => void;
}

const FounderCard = ({ founder, onClick }: FounderCardProps) => (
  <button
    onClick={onClick}
    className="text-left border border-border rounded-lg p-4 bg-card hover:border-accent/40 transition-colors duration-150 group"
  >
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center text-foreground font-display text-lg shrink-0">
        {founder.profile_image_url ? (
          <img src={founder.profile_image_url} alt="" className="h-full w-full rounded-md object-cover" />
        ) : (
          founder.founder_name.charAt(0)
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-display text-lg text-foreground group-hover:text-accent transition-colors truncate">
            {founder.founder_name}
          </span>
          {founder.verified_founder && (
            <span className="text-accent text-xs" title="Verified Founder">✔</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{founder.summary || "No summary yet."}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="text-success font-medium">{founder.build_score ?? 0} Build Score</span>
          <span>{founder.view_count ?? 0} views</span>
        </div>
      </div>
    </div>
  </button>
);

export default Index;
