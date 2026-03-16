import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";

const CreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const prefillName = (location.state as any)?.prefillName ?? "";

  const [founderName, setFounderName] = useState(prefillName);
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [moderating, setModerating] = useState(false);
  const [modResult, setModResult] = useState<any>(null);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const runModeration = async (): Promise<boolean> => {
    setModerating(true);
    setModResult(null);
    try {
      const resp = await supabase.functions.invoke("moderate-content", {
        body: { content, founderName: founderName.trim() },
      });

      if (resp.error) {
        console.warn("Moderation error, auto-approving:", resp.error);
        setModResult({ approved: true, summary: "Auto-approved" });
        return true;
      }

      const result = resp.data;
      setModResult(result);

      if (!result.approved) {
        toast.error(`Content not approved: ${result.summary}`);
        return false;
      }
      return true;
    } catch (err) {
      console.warn("Moderation failed, auto-approving");
      return true;
    } finally {
      setModerating(false);
    }
  };

  const handlePublish = async () => {
    if (!founderName.trim()) { toast.error("Founder name is required"); return; }
    if (content.length < 50) { toast.error("Content must be at least 50 characters"); return; }

    setPublishing(true);

    // Run AI moderation
    const approved = await runModeration();
    if (!approved) { setPublishing(false); return; }

    const slug = founderName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const { data: existing } = await supabase.from("founder_pages").select("id").eq("slug", slug).maybeSingle();
    if (existing) { toast.error("A page with this name already exists"); setPublishing(false); return; }

    const { error } = await supabase.from("founder_pages").insert({
      slug,
      founder_name: founderName.trim(),
      summary: summary.trim() || null,
      content: content.trim(),
      created_by: user.id,
      build_score: 0,
      view_count: 0,
      verified_founder: false,
    });

    if (error) {
      toast.error(error.message);
      setPublishing(false);
      return;
    }

    toast.success("Page published!");
    navigate(`/${slug}`);
  };

  return (
    <div className="buildpedia-container py-10 max-w-2xl mx-auto">
      <h1 className="font-display text-3xl text-foreground mb-6">Create Founder Page</h1>

      <div className="space-y-5">
        <div>
          <Label htmlFor="name">Founder Name *</Label>
          <Input id="name" value={founderName} onChange={(e) => setFounderName(e.target.value)} placeholder="e.g. Sharav Arora" />
          {founderName && (
            <p className="text-xs text-muted-foreground mt-1">
              URL: /{founderName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="summary">Summary</Label>
          <Input id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="One-line bio" />
        </div>

        <div>
          <Label htmlFor="content">Content (Markdown supported) *</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the founder's biography, achievements, and story..."
            rows={16}
          />
          <p className="text-xs text-muted-foreground mt-1">{content.length} characters</p>
        </div>

        {modResult && (
          <div className={`border rounded-lg p-4 text-sm ${modResult.approved ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className={`h-4 w-4 ${modResult.approved ? "text-success" : "text-destructive"}`} />
              <span className="font-medium text-foreground">{modResult.approved ? "Content Approved" : "Content Rejected"}</span>
              {modResult.quality_score != null && (
                <span className="text-xs text-muted-foreground ml-auto">Quality: {modResult.quality_score}/100</span>
              )}
            </div>
            <p className="text-muted-foreground">{modResult.summary}</p>
            {modResult.issues?.length > 0 && (
              <ul className="mt-2 text-xs text-destructive list-disc pl-4">
                {modResult.issues.map((issue: string, i: number) => <li key={i}>{issue}</li>)}
              </ul>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={handlePublish} disabled={publishing || moderating}>
            {moderating ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Checking content...</> :
             publishing ? "Publishing..." : "Publish Page"}
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
