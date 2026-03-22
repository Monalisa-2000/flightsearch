import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPinOff } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center py-32 text-center px-4">
        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-8">
          <MapPinOff className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-5xl font-display font-bold text-primary mb-4">Off the radar.</h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto mb-8">
          The page you are looking for has been moved, deleted, or never existed.
        </p>
        <Link href="/">
          <Button className="h-12 px-8 rounded-xl bg-accent text-white font-bold text-lg hover:-translate-y-1 transition-transform">
            Return to Base
          </Button>
        </Link>
      </div>
    </Layout>
  );
}
