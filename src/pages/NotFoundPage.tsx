import { EmptyState } from '@/ui/kit';

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg py-16">
      <EmptyState
        eyebrow="404"
        title="Page not found"
        action={{ label: '← Back to Home', to: '/' }}
      >
        That route doesn&apos;t exist.
      </EmptyState>
    </div>
  );
}
