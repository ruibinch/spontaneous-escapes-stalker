import { IS_CLIENT } from '@/common/env';
import {
  Skeleton as NextUISkeleton,
  SkeletonProps,
  cn,
} from '@nextui-org/react';

export function Skeleton(props: SkeletonProps) {
  return (
    <NextUISkeleton
      {...props}
      isLoaded={props.isLoaded ?? IS_CLIENT}
      className={cn('rounded-lg', props.className)}
    />
  );
}
