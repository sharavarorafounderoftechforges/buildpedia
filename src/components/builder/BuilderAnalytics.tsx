import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Eye } from "lucide-react";

const FounderAnalytics = ({ pageId, viewCount }: { pageId: string; viewCount: number }) => {
  const { data: recentViews } = useQuery({
    queryKey: ["page-views-7d", pageId],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count } = await supabase
        .from("page_views")
        .select("*", { count: "exact", head: true })
        .eq("page_id", pageId)
        .gte("timestamp", sevenDaysAgo.toISOString());
      return count ?? 0;
    },
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="border border-border rounded-lg p-4 bg-card">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
          <Eye className="h-4 w-4" /> Total Views
        </div>
        <p className="text-2xl font-semibold text-foreground">{viewCount.toLocaleString()}</p>
      </div>
      <div className="border border-border rounded-lg p-4 bg-card">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
          <Eye className="h-4 w-4" /> Last 7 Days
        </div>
        <p className="text-2xl font-semibold text-foreground">{(recentViews ?? 0).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default FounderAnalytics;
