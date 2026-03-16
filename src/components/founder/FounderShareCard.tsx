import { Share2, Linkedin, Twitter, Mail, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  founderName: string;
  buildScore: number;
  viewCount: number;
  rank?: number;
  slug: string;
}

const FounderShareCard = ({ founderName, buildScore, viewCount, rank, slug }: Props) => {
  const pageUrl = `${window.location.origin}/${slug}`;
  const shareText = `${founderName} — ${rank ? `Rank #${rank} on ` : ""}Buildpedia | Build Score: ${buildScore}`;

  const copyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    toast.success("Link copied!");
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <h3 className="font-display text-lg text-foreground mb-3 flex items-center gap-2">
        <Share2 className="h-4 w-4" /> Share
      </h3>

      {/* Visual Card */}
      <div className="border border-border rounded-lg p-5 bg-gradient-to-br from-background to-secondary mb-4">
        <p className="font-display text-2xl text-foreground mb-1">{founderName}</p>
        {rank && <p className="text-accent text-sm font-medium mb-3">Rank #{rank} on Buildpedia</p>}
        <div className="flex gap-4 text-sm">
          <div><span className="text-muted-foreground">Build Score</span><p className="text-success font-semibold">{buildScore}</p></div>
          <div><span className="text-muted-foreground">Page Views</span><p className="font-semibold text-foreground">{viewCount.toLocaleString()}</p></div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">buildpedia.app</p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5">
          <Link2 className="h-3.5 w-3.5" /> Copy
        </Button>
        <Button variant="outline" size="sm" asChild className="gap-1.5">
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`} target="_blank" rel="noopener noreferrer">
            <Linkedin className="h-3.5 w-3.5" /> LinkedIn
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild className="gap-1.5">
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`} target="_blank" rel="noopener noreferrer">
            <Twitter className="h-3.5 w-3.5" /> X
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild className="gap-1.5">
          <a href={`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(pageUrl)}`}>
            <Mail className="h-3.5 w-3.5" /> Email
          </a>
        </Button>
      </div>
    </div>
  );
};

export default FounderShareCard;
