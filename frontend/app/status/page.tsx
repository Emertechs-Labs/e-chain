export const dynamic = 'force-dynamic';

export default function StatusPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">System Status</h1>
      <p className="text-muted-foreground">
        All systems are operational.
      </p>
    </div>
  );
}