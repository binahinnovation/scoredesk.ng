
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gradient-to-b from-white to-emerald-50">
      <div className="mb-8 animate-fade-in">
        <Link to="/" className="inline-block mb-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="bg-emerald-700 text-white p-2 rounded-lg">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="font-bold text-3xl text-emerald-700">ScoreDesk</span>
          </div>
        </Link>
      </div>
      
      <div className="animate-slide-in">
        <div className="relative">
          <h1 className="text-9xl font-extrabold text-emerald-700 opacity-20">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-4xl font-bold tracking-tight text-emerald-700">Page not found</h2>
          </div>
        </div>
        
        <div className="mt-6 max-w-md mx-auto">
          <p className="mt-2 text-lg text-muted-foreground">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
          
          <div className="mt-10 flex justify-center space-x-4">
            <Button asChild className="bg-emerald-700 hover:bg-emerald-800 shadow-md">
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Go back home
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-16 animate-fade-in" style={{ animationDelay: "0.5s" }}>
        <p className="text-sm text-muted-foreground">Need assistance? Contact our support team.</p>
      </div>
    </div>
  );
}
