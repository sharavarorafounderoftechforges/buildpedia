import { format } from "date-fns";
import { ExternalLink } from "lucide-react";

interface Product {
  product_name: string;
  launch_date: string | null;
  description: string | null;
  product_url: string | null;
}

const FounderProducts = ({ products }: { products: Product[] }) => {
  if (products.length === 0) {
    return <p className="text-muted-foreground text-sm">No product launches yet.</p>;
  }

  return (
    <div className="space-y-3">
      {products.map((p, i) => (
        <div key={i} className="border border-border rounded-lg p-4 bg-card">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-foreground">{p.product_name}</h4>
              {p.launch_date && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(p.launch_date), "MMM d, yyyy")}
                </p>
              )}
              {p.description && <p className="text-sm text-muted-foreground mt-1">{p.description}</p>}
            </div>
            {p.product_url && (
              <a href={p.product_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80">
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FounderProducts;
