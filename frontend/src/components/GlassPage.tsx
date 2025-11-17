import type { ReactNode } from "react";

interface GlassPageProps {
  children: ReactNode;
  /** Tailwind max-width classes applied to the content wrapper */
  maxWidthClass?: string;
  /** Extra classes merged into the glass card container */
  cardClassName?: string;
  /** Additional classes for the inner content wrapper */
  contentClassName?: string;
  /** Align content vertically. Defaults to top alignment */
  align?: "top" | "center";
  /** Pass an extra class to the outer shell */
  className?: string;
  /** When false, renders children without the default glass card */
  withCard?: boolean;
}

export default function GlassPage({
  children,
  maxWidthClass = "w-full",
  cardClassName = "",
  contentClassName = "",
  align = "top",
  className = "",
  withCard = true,
}: GlassPageProps) {
  const alignClass = align === "center" ? "page-shell--center" : "page-shell--top";

  return (
    <div className={`page-shell background-image ${alignClass} ${className}`.trim()}>
      <div className="fade-overlay" />
      <div className={`page-shell__content ${maxWidthClass} ${contentClassName}`.trim()}>
        {withCard ? (
          <div className={`glass-card ${cardClassName}`.trim()}>{children}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

