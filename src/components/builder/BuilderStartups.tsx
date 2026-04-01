import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink } from "lucide-react";

const FounderStartups = ({ pageId }: { pageId: string }) => {
  const { data: startups } = useQuery({
    queryKey: ["founder-startups", pageId],
    queryFn: async () => {
      const { data } = await supabase
        .from("founder_startups")
        .select("role, startups(name, description, website, founded_year)")
        .eq("founder_page_id", pageId);
      return data ?? [];
    },
  });

  if (!startups || startups.length === 0) {
    return <p className="text-muted-foreground text-sm">No startups linked yet.</p>;
  }

  return (
    <div className="space-y-3">
      {startups.map((fs: any, i: number) => (
        <div key={i} className="border border-border rounded-lg p-4 bg-card">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-foreground">{fs.startups?.name}</h4>
              <p className="text-sm text-muted-foreground mt-0.5">{fs.role}</p>
              {fs.startups?.description && (
                <p className="text-sm text-muted-foreground mt-1">{fs.startups.description}</p>
              )}
            </div>
            {fs.startups?.website && (
              <a href={fs.startups.website} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80">
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
          {fs.startups?.founded_year && (
            <p className="text-xs text-muted-foreground mt-2">Founded {fs.startups.founded_year}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default FounderStartups;
