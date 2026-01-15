import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <FileQuestion className="w-10 h-10 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Page Not Found
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/">
          <Home className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}
