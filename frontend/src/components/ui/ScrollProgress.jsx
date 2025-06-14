import React, { useState, useCallback, memo } from "react";

const ScrollProgress = memo(
  ({
    containerRef,
    height = "h-2",
    trackColor = "bg-gray-200",
    progressColor = "bg-orange-500",
  }) => {
    const [scrollProgress, setScrollProgress] = useState(0);

    const handleScroll = useCallback(() => {
      if (!containerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(progress);
    }, [containerRef]);

    React.useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }, [containerRef, handleScroll]);

    return (
      <div className={`${height} ${trackColor}`}>
        <div
          className={`h-full ${progressColor}`}
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    );
  }
);

ScrollProgress.displayName = "ScrollProgress";

export default ScrollProgress;
