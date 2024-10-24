import * as React from 'react';

import { type VariantProps, cva } from 'class-variance-authority';
import Image, { type ImageProps } from 'next/image';

import { cn } from '@/utils/tailwind';

const avatarVariants = cva('relative shrink-0 overflow-hidden rounded-full', {
  variants: {
    border: {
      default: 'rounded-full',
      square: 'rounded-sm',
    },
    size: {
      sm: 'h-8 w-8',
      default: 'h-10 w-10',
      lg: 'h-16 w-16',
      xl: 'h-20 w-20',
      '2xl': 'w-32 h-32',
    },
  },
  defaultVariants: {
    border: 'default',
    size: 'default',
  },
});

export interface AvatarProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Image>, 'src'>,
    VariantProps<typeof avatarVariants> {
  src: ImageProps['src'] | null | undefined;
  fallbackUrl?: string;
}

const Avatar = React.forwardRef<React.ElementRef<typeof Image>, AvatarProps>(
  ({ className, fallbackUrl, border, size, children, src, ...props }, ref) => {
    if (src) {
      return (
        <Image
          ref={ref}
          className={cn(avatarVariants({ border, size, className }))}
          src={src}
          {...props}
        />
      );
    }
    if (fallbackUrl) {
      return (
        <Image
          ref={ref}
          className={cn(avatarVariants({ border, size, className }))}
          src={fallbackUrl}
          {...props}
        />
      );
    }
    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center rounded-full bg-muted',
          avatarVariants({ border, size, className })
        )}
      >
        {children}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export default Avatar;
