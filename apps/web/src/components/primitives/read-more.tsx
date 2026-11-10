import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { SmartLink } from "./smart-link";

/** Orange "Read more →" link used on cards across the site. */
export function ReadMore({
  href,
  label = "Read more",
  newTab,
  className,
}: {
  href?: string | null;
  label?: string | null;
  newTab?: boolean | null;
  className?: string;
}) {
  const content = (
    <>
      <span>{label || "Read more"}</span>
      <ArrowRight aria-hidden className="size-[1.05em] stroke-[2.25] transition-transform duration-300 group-hover/rm:translate-x-1" />
    </>
  );
  const cls = cn(
    "rm-link hover-grow group/rm inline-flex w-fit origin-left items-center gap-2 font-heading text-[13.5px] font-semibold leading-[1.4] text-brand 3xl:text-[15px]",
    className,
  );
  if (!href) return <span className={cls}>{content}</span>;
  return (
    <SmartLink href={href} newTab={newTab} className={cls}>
      {content}
    </SmartLink>
  );
}
