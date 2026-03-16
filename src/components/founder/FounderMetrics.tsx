import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const FounderMetrics = ({ pageId }: { pageId: string }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: metrics } = useQuery({
    queryKey: ["founder-metrics", pageId],
    queryFn: async () => {
      const { data } = await supabase
        .from("founder_metrics")
        .select("*")
        .eq("page_id", pageId)
        .order("updated_at", { ascending: false });
      return data ?? [];
    },
  });

  const handleDelete = async (id: string) => {
    await supabase.from("founder_metrics").delete().eq("id", id);
    toast.success("Metric removed");
    queryClient.invalidateQueries({ queryKey: ["founder-metrics", pageId] });
  };

  if (!metrics || metrics.length === 0) {
    return <p className="text-muted-foreground text-sm">No metrics added yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {metrics.map((m) => (
        <div key={m.id} className="border border-border rounded-lg p-4 bg-card relative group">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <BarChart3 className="h-3.5 w-3.5" /> {m.metric_name}
          </div>
          <p className="text-xl font-semibold text-foreground">{m.metric_value}</p>
          {user && (
            <Button
              variant="ghost" size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              onClick={() => handleDelete(m.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default FounderMetrics;
