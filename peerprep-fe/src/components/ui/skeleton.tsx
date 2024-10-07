import { cn } from '@/utils/tailwind';

const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
};

export default Skeleton;
