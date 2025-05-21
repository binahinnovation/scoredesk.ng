
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface MainNavProps {
  onMenuClick: () => void;
}

export function MainNav({ onMenuClick }: MainNavProps) {
  return (
    <header className="fixed top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <div className="flex items-center space-x-2">
          <span className="font-bold text-2xl text-emerald-700">ScoreDesk</span>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <Button variant="outline" size="sm">Login</Button>
        </div>
      </div>
    </header>
  );
}
