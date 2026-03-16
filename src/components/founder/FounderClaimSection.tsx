import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldCheck, Mail, Globe, AtSign } from "lucide-react";

const FounderClaimSection = ({ pageId, founderName }: { pageId: string; founderName: string }) => {
  const { user } = useAuth();
  const [claiming, setClaiming] = useState(false);
  const [method, setMethod] = useState<string | null>(null);

  if (!user) return null;

  const handleClaim = async (verificationMethod: string) => {
    setClaiming(true);
    const { error } = await supabase.from("page_claims").insert({
      page_id: pageId,
      claimer_user_id: user.id,
      verification_method: verificationMethod,
      verified: false,
    });
    if (error) {
      if (error.code === "23505") toast.info("You already have a pending claim for this page.");
      else toast.error(error.message);
      setClaiming(false);
      return;
    }
    toast.success("Claim submitted! Our team will verify your identity.");
    setMethod(verificationMethod);
    setClaiming(false);
  };

  if (method) {
    return (
      <div className="border border-accent/30 rounded-lg p-6 bg-accent/5 text-center">
        <ShieldCheck className="h-8 w-8 text-accent mx-auto mb-2" />
        <h3 className="font-display text-lg text-foreground mb-1">Claim Submitted</h3>
        <p className="text-sm text-muted-foreground">
          Your claim via {method} verification is being reviewed. You'll be notified once verified.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg p-6 bg-card">
      <h3 className="font-display text-lg text-foreground mb-1">Are you {founderName}?</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Claim this page to get a verified badge and manage your profile.
      </p>
      <div className="space-y-2">
        <Button variant="outline" className="w-full justify-start gap-2" onClick={() => handleClaim("email")} disabled={claiming}>
          <Mail className="h-4 w-4" /> Verify via Email
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2" onClick={() => handleClaim("domain")} disabled={claiming}>
          <Globe className="h-4 w-4" /> Verify via Domain
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2" onClick={() => handleClaim("social")} disabled={claiming}>
          <AtSign className="h-4 w-4" /> Verify via Social Media
        </Button>
      </div>
    </div>
  );
};

export default FounderClaimSection;
