import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const CreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const prefillName = (location.state as any)?.prefillName ?? "";

  const [founderName, setFounderName] = useState(prefillName);
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [publishing, setPublishing] = useState(false);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handlePublish = async () => {
    if (!founderName.trim()) { toast.error("Founder name is required"); return; }
    setPublishing(true);

    const slug = founderName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    // Check slug uniqueness
    const { data: existing } = await supabase.from("founder_pages").select("id").eq("slug", slug).maybeSingle();
    if (existing) { toast.error("A page with this name already exists"); setPublishing(false); return; }

    // Basic content checks
    if (content.length < 50) { toast.error("Content must be at least 50 characters for quality"); setPublishing(false); return; }

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

        <div className="flex gap-3">
          <Button onClick={handlePublish} disabled={publishing}>
            {publishing ? "Publishing..." : "Publish Page"}
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
