import React, { forwardRef } from 'react';

type MotionProps = React.HTMLAttributes<HTMLElement> & {
  animate?: unknown;
  initial?: unknown;
  exit?: unknown;
  transition?: unknown;
  variants?: unknown;
  whileHover?: unknown;
  whileTap?: unknown;
  whileInView?: unknown;
  viewport?: unknown;
  layout?: unknown;
  layoutId?: unknown;
};

const cache = new Map<string, React.ForwardRefExoticComponent<MotionProps & React.RefAttributes<HTMLElement>>>();

function createMotionTag(tag: string) {
  const cached = cache.get(tag);
  if (cached) return cached;

  const Component = forwardRef<HTMLElement, MotionProps>(function LightweightMotion(
    {
      animate,
      initial,
      exit,
      transition,
      variants,
      whileHover,
      whileTap,
      whileInView,
      viewport,
      layout,
      layoutId,
      ...props
    },
    ref,
  ) {
    return React.createElement(tag, { ...props, ref });
  });

  cache.set(tag, Component);
  return Component;
}

/**
 * Drop-in subset of motion/react. The visual layout remains unchanged, but it
 * removes the animation runtime and all continuous animation work from the
 * initial mobile bundle.
 */
export const motion = new Proxy(
  {},
  {
    get: (_target, property) => createMotionTag(String(property)),
  },
) as Record<string, ReturnType<typeof createMotionTag>>;

export function AnimatePresence({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
