import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const EditPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: founder } = useQuery({
    queryKey: ["founder-edit", slug],
    queryFn: async () => {
      const { data } = await supabase.from("founder_pages").select("*").eq("slug", slug).maybeSingle();
      return data;
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (founder) {
      setSummary(founder.summary ?? "");
      setContent(founder.content ?? "");
    }
  }, [founder]);

  if (!user) { navigate("/auth"); return null; }

  const handleSave = async () => {
    if (!founder) return;
    if (content.length < 50) { toast.error("Content must be at least 50 characters"); return; }
    setSaving(true);

    // Save revision
    await supabase.from("page_revisions").insert({
      page_id: founder.id,
      edited_by: user.id,
      previous_content: founder.content ?? "",
      new_content: content.trim(),
    });

    const { error } = await supabase
      .from("founder_pages")
      .update({ summary: summary.trim(), content: content.trim(), updated_at: new Date().toISOString() })
      .eq("id", founder.id);

    if (error) { toast.error(error.message); setSaving(false); return; }
    toast.success("Page updated");
    navigate(`/${slug}`);
  };

  if (!founder) return <div className="buildpedia-container py-20 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="buildpedia-container py-10 max-w-2xl mx-auto">
      <h1 className="font-display text-3xl text-foreground mb-6">Edit: {founder.founder_name}</h1>
      <div className="space-y-5">
        <div>
          <Label htmlFor="summary">Summary</Label>
          <Input id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="content">Content (Markdown)</Label>
          <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={16} />
        </div>
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          <Button variant="outline" onClick={() => navigate(`/${slug}`)}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default EditPage;
