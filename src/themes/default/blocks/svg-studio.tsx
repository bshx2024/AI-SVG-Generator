'use client';

import { SvgStudio } from '@/shared/components/svg-studio';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function SvgStudioBlock({
  section,
  className,
}: {
  section?: Section;
  className?: string;
}) {
  return (
    <section
      id={section?.id || 'svg-studio'}
      className={cn('relative py-6 md:py-10', section?.className, className)}
    >
      <div className="container mx-auto">
        <SvgStudio />
      </div>
    </section>
  );
}

// Export both PascalCase and alias for theme loader
export { SvgStudioBlock as SvgStudio };
