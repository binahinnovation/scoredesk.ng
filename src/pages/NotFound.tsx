
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-9xl font-extrabold text-emerald-700">404</h1>
      <h2 className="mt-4 text-3xl font-bold tracking-tight">Page not found</h2>
      <p className="mt-2 text-lg text-muted-foreground">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Go back home</Link>
      </Button>
    </div>
  );
}
