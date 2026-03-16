import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, Trophy, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const SiteHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="buildpedia-container flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl text-foreground tracking-tight">Buildpedia</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => navigate("/search")} className="gap-1.5 text-muted-foreground">
            <Search className="h-4 w-4" />
            Search
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/leaderboard")} className="gap-1.5 text-muted-foreground">
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Button>
          {user && (
            <Button variant="ghost" size="sm" onClick={() => navigate("/create")} className="gap-1.5 text-muted-foreground">
              <Plus className="h-4 w-4" />
              Create Page
            </Button>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="gap-1.5">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-muted-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button variant="default" size="sm" onClick={() => navigate("/auth")} className="gap-1.5">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
