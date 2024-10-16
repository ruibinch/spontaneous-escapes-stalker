import {
  Skeleton as NextUISkeleton,
  SkeletonProps,
  cn,
} from '@nextui-org/react';

type Props = Omit<SkeletonProps, 'isLoaded'> & {
  isLoaded: boolean;
};

export function Skeleton(props: Props) {
  return (
    <NextUISkeleton
      {...props}
      isLoaded={props.isLoaded}
      className={cn('rounded-lg', props.className)}
    />
  );
}
