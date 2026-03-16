import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Edit } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
      if (data) setUsername(data.username ?? "");
      return data;
    },
    enabled: !!user,
  });

  const { data: myPages } = useQuery({
    queryKey: ["my-pages", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("founder_pages").select("slug, founder_name, build_score, view_count").eq("created_by", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  if (!user) { navigate("/auth"); return null; }

  const handleSave = async () => {
    const { error } = await supabase.from("profiles").update({ username }).eq("user_id", user.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated");
    setEditing(false);
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  };

  return (
    <div className="buildpedia-container py-10 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center">
          <User className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-foreground">{profile?.username || "Your Profile"}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="border border-border rounded-lg p-6 bg-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-foreground">Details</h2>
          <Button variant="outline" size="sm" onClick={() => setEditing(!editing)} className="gap-1.5">
            <Edit className="h-3.5 w-3.5" /> {editing ? "Cancel" : "Edit"}
          </Button>
        </div>
        {editing ? (
          <div className="space-y-3">
            <div>
              <Label>Username</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <Button onClick={handleSave}>Save</Button>
          </div>
        ) : (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Username</dt>
              <dd className="text-foreground">{profile?.username || "Not set"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Reputation</dt>
              <dd className="text-foreground">{profile?.reputation_score ?? 0}</dd>
            </div>
          </dl>
        )}
      </div>

      <div className="border border-border rounded-lg p-6 bg-card">
        <h2 className="font-display text-xl text-foreground mb-4">My Founder Pages</h2>
        {myPages && myPages.length > 0 ? (
          <div className="space-y-2">
            {myPages.map((p) => (
              <button key={p.slug} onClick={() => navigate(`/${p.slug}`)} className="w-full text-left border border-border rounded-lg p-3 hover:border-accent/40 transition-colors">
                <span className="font-medium text-foreground">{p.founder_name}</span>
                <span className="text-xs text-muted-foreground ml-2">{p.build_score ?? 0} pts · {p.view_count ?? 0} views</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No pages created yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
