import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, ShieldCheck, Eye, Rocket, Flag, Calendar, Settings } from "lucide-react";
import { toast } from "sonner";
import FounderTimeline from "@/components/founder/FounderTimeline";
import FounderStartups from "@/components/founder/FounderStartups";
import FounderProducts from "@/components/founder/FounderProducts";
import FounderAnalytics from "@/components/founder/FounderAnalytics";
import FounderBadges from "@/components/founder/FounderBadges";
import FounderMetrics from "@/components/founder/FounderMetrics";
import FounderShareCard from "@/components/founder/FounderShareCard";
import FounderClaimSection from "@/components/founder/FounderClaimSection";
import FounderManageSection from "@/components/founder/FounderManageSection";
import ReactMarkdown from "react-markdown";

const FounderPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: founder, isLoading } = useQuery({
    queryKey: ["founder", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("founder_pages")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: milestones } = useQuery({
    queryKey: ["milestones", founder?.id],
    queryFn: async () => {
      const { data } = await supabase.from("milestones").select("*").eq("page_id", founder!.id).order("date", { ascending: true });
      return data ?? [];
    },
    enabled: !!founder?.id,
  });

  const { data: products } = useQuery({
    queryKey: ["products", founder?.id],
    queryFn: async () => {
      const { data } = await supabase.from("product_launches").select("*").eq("page_id", founder!.id).order("launch_date", { ascending: false });
      return data ?? [];
    },
    enabled: !!founder?.id,
  });

  // Track page view
  useQuery({
    queryKey: ["track-view", founder?.id],
    queryFn: async () => {
      await supabase.from("page_views").insert({ page_id: founder!.id });
      await supabase.rpc("increment_view_count", { page_id_param: founder!.id });
      return true;
    },
    enabled: !!founder?.id,
    staleTime: Infinity,
  });

  // Get rank
  const { data: rank } = useQuery({
    queryKey: ["founder-rank", founder?.id],
    queryFn: async () => {
      const { data } = await supabase.from("founder_pages").select("id").order("build_score", { ascending: false });
      const idx = data?.findIndex((f) => f.id === founder!.id);
      return idx !== undefined && idx >= 0 ? idx + 1 : undefined;
    },
    enabled: !!founder?.id,
  });

  if (isLoading) {
    return <div className="buildpedia-container py-20 text-center text-muted-foreground">Loading...</div>;
  }

  if (!founder) {
    return (
      <div className="buildpedia-container py-20 text-center">
        <h1 className="font-display text-3xl text-foreground mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">No founder page exists for "/{slug}"</p>
        {user ? (
          <Button onClick={() => navigate("/create", { state: { prefillName: slug?.replace(/-/g, " ") } })} className="gap-2">
            Create this page
          </Button>
        ) : (
          <Button onClick={() => navigate("/auth")} variant="outline">Sign in to create this page</Button>
        )}
      </div>
    );
  }

  const tabs = ["overview", "timeline", "startups", "products", "metrics", "analytics"];
  if (user) tabs.push("manage");

  return (
    <div className="buildpedia-container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div>
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center text-foreground font-display text-3xl shrink-0 overflow-hidden">
              {founder.profile_image_url ? (
                <img src={founder.profile_image_url} alt={founder.founder_name} className="h-full w-full object-cover" />
              ) : (
                founder.founder_name.charAt(0)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-3xl md:text-4xl text-foreground">{founder.founder_name}</h1>
                {founder.verified_founder && (
                  <Badge variant="outline" className="gap-1 text-accent border-accent/30">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">{founder.summary}</p>
              <FounderBadges pageId={founder.id} />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mb-6">
            {user && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/edit/${founder.slug}`)} className="gap-1.5">
                <Edit className="h-3.5 w-3.5" /> Edit
              </Button>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 gap-0 flex-wrap">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 capitalize text-sm"
                >
                  {tab === "manage" ? <><Settings className="h-3.5 w-3.5 mr-1" /> Manage</> : tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <article className="prose prose-sm max-w-none text-foreground">
                <ReactMarkdown>{founder.content || "No content yet. Click Edit to add information about this founder."}</ReactMarkdown>
              </article>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <FounderTimeline milestones={milestones ?? []} products={products ?? []} />
            </TabsContent>

            <TabsContent value="startups" className="mt-6">
              <FounderStartups pageId={founder.id} />
            </TabsContent>

            <TabsContent value="products" className="mt-6">
              <FounderProducts products={products ?? []} />
            </TabsContent>

            <TabsContent value="metrics" className="mt-6">
              <FounderMetrics pageId={founder.id} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <FounderAnalytics pageId={founder.id} viewCount={founder.view_count ?? 0} />
            </TabsContent>

            {user && (
              <TabsContent value="manage" className="mt-6">
                <FounderManageSection pageId={founder.id} founderId={founder.id} slug={founder.slug} currentImageUrl={founder.profile_image_url} />
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-20 h-fit space-y-4">
          <div className="border border-border rounded-lg p-4 bg-card">
            <h3 className="font-display text-lg text-foreground mb-4">Quick Facts</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground flex items-center gap-1.5"><Rocket className="h-3.5 w-3.5" /> Build Score</dt>
                <dd className="text-success font-semibold">{founder.build_score ?? 0}</dd>
              </div>
              {rank && (
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Global Rank</dt>
                  <dd className="font-semibold text-foreground">#{rank}</dd>
                </div>
              )}
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> Page Views</dt>
                <dd className="font-medium text-foreground">{(founder.view_count ?? 0).toLocaleString()}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground flex items-center gap-1.5"><Flag className="h-3.5 w-3.5" /> Milestones</dt>
                <dd className="font-medium text-foreground">{milestones?.length ?? 0}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Products</dt>
                <dd className="font-medium text-foreground">{products?.length ?? 0}</dd>
              </div>
            </dl>
          </div>

          <FounderShareCard
            founderName={founder.founder_name}
            buildScore={founder.build_score ?? 0}
            viewCount={founder.view_count ?? 0}
            rank={rank}
            slug={founder.slug}
          />

          {user && !founder.verified_founder && (
            <FounderClaimSection pageId={founder.id} founderName={founder.founder_name} />
          )}
        </aside>
      </div>
    </div>
  );
};

export default FounderPage;
