import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";

const LeaderboardPage = () => {
  const navigate = useNavigate();

  const { data: founders } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data } = await supabase
        .from("founder_pages")
        .select("slug, founder_name, build_score, view_count, verified_founder, profile_image_url")
        .order("build_score", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  return (
    <div className="buildpedia-container py-10">
      <div className="flex items-center gap-2 mb-8">
        <Trophy className="h-6 w-6 text-accent" />
        <h1 className="font-display text-3xl text-foreground">Leaderboard</h1>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium w-12">#</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Builder</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">Build Score</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium hidden sm:table-cell">Views</th>
            </tr>
          </thead>
          <tbody>
            {(founders ?? []).map((f, i) => (
              <tr
                key={f.slug}
                onClick={() => navigate(`/${f.slug}`)}
                className="border-b border-border last:border-0 hover:bg-card/50 cursor-pointer transition-colors"
              >
                <td className="py-3 px-4 text-muted-foreground font-medium">{i + 1}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded bg-secondary flex items-center justify-center text-foreground font-display text-sm shrink-0 overflow-hidden">
                      {f.profile_image_url ? (
                        <img src={f.profile_image_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        f.founder_name.charAt(0)
                      )}
                    </div>
                    <span className="font-medium text-foreground">{f.founder_name}</span>
                    {f.verified_founder && <span className="text-accent text-xs">✔</span>}
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-success font-semibold">{f.build_score ?? 0}</td>
                <td className="py-3 px-4 text-right text-muted-foreground hidden sm:table-cell">{(f.view_count ?? 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!founders || founders.length === 0) && (
          <div className="py-12 text-center text-muted-foreground">No builder pages yet.</div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
