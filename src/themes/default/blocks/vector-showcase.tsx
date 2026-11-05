'use client';

import { VectorShowcase } from '@/shared/components/vector-showcase';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function VectorShowcaseBlock({
  section,
  className,
}: {
  section?: Section;
  className?: string;
}) {
  return (
    <section
      id={section?.id || 'vector-showcase'}
      className={cn('relative py-6 md:py-12 bg-zinc-50/50 dark:bg-zinc-900/20 border-y border-zinc-200/60 dark:border-zinc-850', section?.className, className)}
    >
      <div className="container mx-auto">
        <VectorShowcase />
      </div>
    </section>
  );
}

// Export both PascalCase and alias for theme loader
export { VectorShowcaseBlock as VectorShowcase };

