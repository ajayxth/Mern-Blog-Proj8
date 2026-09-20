import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

type AnimationWrapperProps = {
  children: ReactNode;
  keyValue: string;
  initial?: HTMLMotionProps<"div">["initial"];
  animate?: HTMLMotionProps<"div">["animate"];
  transition?: HTMLMotionProps<"div">["transition"];
  className?: string;
};

const AnimationWrapper = ({
  children,
  keyValue,
  initial = { opacity: 0, y: 20 },
  animate = { opacity: 1, y: 0 },
  transition = { duration: 0.6 },
  className,
}: AnimationWrapperProps) => {
  return (
    <AnimatePresence>
      <motion.div
        key={keyValue}
        initial={initial}
        animate={animate}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimationWrapper;
