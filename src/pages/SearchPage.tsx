import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from("founder_pages")
        .select("slug, founder_name, summary, build_score, view_count, verified_founder")
        .ilike("founder_name", `%${query}%`)
        .order("view_count", { ascending: false })
        .limit(20);
      setResults(data ?? []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="buildpedia-container py-10">
      <div className="max-w-2xl mx-auto">
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search founders..."
            className="pl-12 h-12"
            autoFocus
          />
        </div>

        {loading && <p className="text-muted-foreground text-sm">Searching...</p>}

        <div className="space-y-2">
          {results.map((r) => (
            <button
              key={r.slug}
              onClick={() => navigate(`/${r.slug}`)}
              className="w-full text-left border border-border rounded-lg p-4 hover:border-accent/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-display text-lg text-foreground">{r.founder_name}</span>
                {r.verified_founder && <span className="text-accent text-xs">✔</span>}
                <Badge variant="secondary" className="ml-auto text-xs">{r.build_score ?? 0} pts</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{r.summary || "No summary"}</p>
            </button>
          ))}
        </div>

        {!loading && query.trim() && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No founders found for "{query}"</p>
            <button onClick={() => navigate("/create", { state: { prefillName: query } })} className="text-accent hover:underline text-sm">
              Create a page for "{query}"
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
