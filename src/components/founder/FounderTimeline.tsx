import { format } from "date-fns";

interface TimelineEvent {
  date: string;
  title: string;
  description?: string | null;
  type: string;
}

interface Props {
  milestones: Array<{ date: string | null; title: string; description: string | null; type: string | null }>;
  products: Array<{ launch_date: string | null; product_name: string; description: string | null }>;
}

const FounderTimeline = ({ milestones, products }: Props) => {
  const events: TimelineEvent[] = [
    ...milestones
      .filter((m) => m.date)
      .map((m) => ({ date: m.date!, title: m.title, description: m.description, type: m.type ?? "milestone" })),
    ...products
      .filter((p) => p.launch_date)
      .map((p) => ({ date: p.launch_date!, title: `Launched ${p.product_name}`, description: p.description, type: "launch" })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (events.length === 0) {
    return <p className="text-muted-foreground text-sm">No timeline events yet.</p>;
  }

  return (
    <div className="relative pl-6 border-l-2 border-border space-y-6">
      {events.map((event, i) => (
        <div key={i} className="relative">
          <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-accent bg-background" />
          <div className="text-xs text-muted-foreground mb-0.5">
            {format(new Date(event.date), "MMM yyyy")}
            <span className="ml-2 text-accent capitalize">{event.type}</span>
          </div>
          <h4 className="text-sm font-medium text-foreground">{event.title}</h4>
          {event.description && <p className="text-sm text-muted-foreground mt-0.5">{event.description}</p>}
        </div>
      ))}
    </div>
  );
};

export default FounderTimeline;
