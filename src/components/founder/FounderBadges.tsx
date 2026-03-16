import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Award, Zap, Star, Rocket, Target, Crown, Flame, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const badgeIcons: Record<string, any> = {
  pioneer: Rocket,
  builder: Zap,
  veteran: Crown,
  rising_star: Star,
  serial_entrepreneur: Flame,
  verified: Shield,
  milestone_master: Target,
  default: Award,
};

const badgeColors: Record<string, string> = {
  pioneer: "border-accent/30 text-accent",
  builder: "border-success/30 text-success",
  veteran: "border-yellow-500/30 text-yellow-600",
  rising_star: "border-purple-500/30 text-purple-600",
  serial_entrepreneur: "border-orange-500/30 text-orange-600",
  verified: "border-accent/30 text-accent",
  milestone_master: "border-emerald-500/30 text-emerald-600",
  default: "border-muted-foreground/30 text-muted-foreground",
};

const FounderBadges = ({ pageId }: { pageId: string }) => {
  const { data: badges } = useQuery({
    queryKey: ["founder-badges", pageId],
    queryFn: async () => {
      const { data } = await supabase
        .from("founder_badges")
        .select("*")
        .eq("page_id", pageId)
        .order("awarded_at", { ascending: false });
      return data ?? [];
    },
  });

  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((b) => {
        const Icon = badgeIcons[b.badge_type] || badgeIcons.default;
        const color = badgeColors[b.badge_type] || badgeColors.default;
        return (
          <Badge key={b.id} variant="outline" className={`gap-1 text-xs ${color}`}>
            <Icon className="h-3 w-3" /> {b.badge_label}
          </Badge>
        );
      })}
    </div>
  );
};

export default FounderBadges;
