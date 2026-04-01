import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Upload } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  pageId: string;
  founderId: string;
  slug: string;
  currentImageUrl: string | null;
}

const FounderManageSection = ({ pageId, founderId, slug, currentImageUrl }: Props) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  // Milestone form
  const [mTitle, setMTitle] = useState("");
  const [mDate, setMDate] = useState("");
  const [mDesc, setMDesc] = useState("");
  const [mType, setMType] = useState("milestone");

  // Product form
  const [pName, setPName] = useState("");
  const [pDate, setPDate] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pUrl, setPUrl] = useState("");

  // Startup form
  const [sName, setSName] = useState("");
  const [sDesc, setSDesc] = useState("");
  const [sYear, setSYear] = useState("");
  const [sWebsite, setSWebsite] = useState("");
  const [sRole, setSRole] = useState("Founder");

  // Metric form
  const [metricName, setMetricName] = useState("");
  const [metricValue, setMetricValue] = useState("");

  if (!user) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${pageId}/profile.${ext}`;

    const { error: uploadError } = await supabase.storage.from("profile-images").upload(path, file, { upsert: true });
    if (uploadError) { toast.error(uploadError.message); setUploading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from("profile-images").getPublicUrl(path);
    await supabase.from("founder_pages").update({ profile_image_url: publicUrl }).eq("id", pageId);

    toast.success("Profile image updated");
    queryClient.invalidateQueries({ queryKey: ["founder", slug] });
    setUploading(false);
  };

  const addMilestone = async () => {
    if (!mTitle.trim()) { toast.error("Title required"); return; }
    const { error } = await supabase.from("milestones").insert({
      page_id: pageId, title: mTitle.trim(), date: mDate || null,
      description: mDesc.trim() || null, type: mType,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Milestone added");
    setMTitle(""); setMDate(""); setMDesc(""); setMType("milestone");
    queryClient.invalidateQueries({ queryKey: ["milestones", pageId] });
  };

  const addProduct = async () => {
    if (!pName.trim()) { toast.error("Product name required"); return; }
    const { error } = await supabase.from("product_launches").insert({
      page_id: pageId, product_name: pName.trim(),
      launch_date: pDate || null, description: pDesc.trim() || null,
      product_url: pUrl.trim() || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Product added");
    setPName(""); setPDate(""); setPDesc(""); setPUrl("");
    queryClient.invalidateQueries({ queryKey: ["products", pageId] });
  };

  const addStartup = async () => {
    if (!sName.trim()) { toast.error("Startup name required"); return; }
    const { data: startup, error: sErr } = await supabase.from("startups").insert({
      name: sName.trim(), description: sDesc.trim() || null,
      founded_year: sYear ? parseInt(sYear) : null, website: sWebsite.trim() || null,
    }).select("id").single();
    if (sErr || !startup) { toast.error(sErr?.message ?? "Error"); return; }

    const { error: fsErr } = await supabase.from("founder_startups").insert({
      founder_page_id: pageId, startup_id: startup.id, role: sRole.trim() || null,
    });
    if (fsErr) { toast.error(fsErr.message); return; }
    toast.success("Startup added");
    setSName(""); setSDesc(""); setSYear(""); setSWebsite(""); setSRole("Founder");
    queryClient.invalidateQueries({ queryKey: ["founder-startups", pageId] });
  };

  const addMetric = async () => {
    if (!metricName.trim() || !metricValue.trim()) { toast.error("Name and value required"); return; }
    const { error } = await supabase.from("founder_metrics").insert({
      page_id: pageId, metric_name: metricName.trim(), metric_value: metricValue.trim(),
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Metric added");
    setMetricName(""); setMetricValue("");
    queryClient.invalidateQueries({ queryKey: ["founder-metrics", pageId] });
  };

  return (
    <div className="space-y-8">
      {/* Profile Image Upload */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <h3 className="font-display text-lg text-foreground mb-3">Profile Image</h3>
        <div className="flex items-center gap-4">
          {currentImageUrl && (
            <img src={currentImageUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
          )}
          <label className="cursor-pointer">
            <div className="flex items-center gap-2 text-sm text-accent hover:underline">
              <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload Image"}
            </div>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Add Milestone */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <h3 className="font-display text-lg text-foreground mb-3">Add Milestone</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Title *</Label><Input value={mTitle} onChange={(e) => setMTitle(e.target.value)} placeholder="First 100 users" /></div>
          <div><Label>Date</Label><Input type="date" value={mDate} onChange={(e) => setMDate(e.target.value)} /></div>
          <div className="col-span-2"><Label>Description</Label><Input value={mDesc} onChange={(e) => setMDesc(e.target.value)} placeholder="Optional description" /></div>
          <div><Label>Type</Label>
            <select value={mType} onChange={(e) => setMType(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="milestone">Milestone</option>
              <option value="funding">Funding</option>
              <option value="award">Award</option>
              <option value="partnership">Partnership</option>
            </select>
          </div>
        </div>
        <Button onClick={addMilestone} size="sm" className="mt-3 gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Milestone</Button>
      </div>

      {/* Add Product */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <h3 className="font-display text-lg text-foreground mb-3">Add Product Launch</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Product Name *</Label><Input value={pName} onChange={(e) => setPName(e.target.value)} /></div>
          <div><Label>Launch Date</Label><Input type="date" value={pDate} onChange={(e) => setPDate(e.target.value)} /></div>
          <div className="col-span-2"><Label>Description</Label><Input value={pDesc} onChange={(e) => setPDesc(e.target.value)} /></div>
          <div className="col-span-2"><Label>Product URL</Label><Input value={pUrl} onChange={(e) => setPUrl(e.target.value)} placeholder="https://" /></div>
        </div>
        <Button onClick={addProduct} size="sm" className="mt-3 gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Product</Button>
      </div>

      {/* Add Startup */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <h3 className="font-display text-lg text-foreground mb-3">Add Startup</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Startup Name *</Label><Input value={sName} onChange={(e) => setSName(e.target.value)} /></div>
          <div><Label>Your Role</Label><Input value={sRole} onChange={(e) => setSRole(e.target.value)} placeholder="Founder" /></div>
          <div><Label>Founded Year</Label><Input value={sYear} onChange={(e) => setSYear(e.target.value)} placeholder="2024" /></div>
          <div><Label>Website</Label><Input value={sWebsite} onChange={(e) => setSWebsite(e.target.value)} placeholder="https://" /></div>
          <div className="col-span-2"><Label>Description</Label><Input value={sDesc} onChange={(e) => setSDesc(e.target.value)} /></div>
        </div>
        <Button onClick={addStartup} size="sm" className="mt-3 gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Startup</Button>
      </div>

      {/* Add Metric */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <h3 className="font-display text-lg text-foreground mb-3">Add Metric</h3>
        <p className="text-xs text-muted-foreground mb-3">Track revenue, customers, users, or any key metric.</p>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Metric Name *</Label><Input value={metricName} onChange={(e) => setMetricName(e.target.value)} placeholder="Revenue, Users, MRR..." /></div>
          <div><Label>Value *</Label><Input value={metricValue} onChange={(e) => setMetricValue(e.target.value)} placeholder="$10,000 or 5,000" /></div>
        </div>
        <Button onClick={addMetric} size="sm" className="mt-3 gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Metric</Button>
      </div>
    </div>
  );
};

export default FounderManageSection;
