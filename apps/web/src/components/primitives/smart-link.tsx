import NextLink from "next/link";

type Props = Omit<React.ComponentProps<"a">, "href"> & {
  href?: string | null;
  newTab?: boolean | null;
  /** Forwarded to next/link for internal URLs. */
  prefetch?: boolean | null;
};

/** Internal links use next/link (client navigation + prefetch); external links open safely in a new tab. */
export function SmartLink({ href, newTab, prefetch, children, ...rest }: Props) {
  const url = href || "#";
  const external = /^(https?:|mailto:|tel:)/.test(url) || url.startsWith("/api/");
  if (external || newTab) {
    const blank = newTab || url.startsWith("http");
    return (
      <a href={url} {...(blank ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <NextLink href={url} prefetch={prefetch ?? undefined} {...rest}>
      {children}
    </NextLink>
  );
}
