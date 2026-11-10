/** Shapes returned by the Strapi 5 REST API (and mirrored by the local seed source). */

export type Media = {
  id?: number;
  documentId?: string;
  url: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  mime?: string | null;
  formats?: Record<string, { url: string; width: number; height: number }> | null;
};

export type Link = {
  label?: string | null;
  href?: string | null;
  openInNewTab?: boolean | null;
  description?: string | null;
  /** Optional product logo shown next to the link in menus. */
  logo?: Media | null;
  /** Optional small icon (SVG, painted with the item accent) shown before the link in menus, e.g. Services sub-links. */
  icon?: Media | null;
};
export type AnchorLink = { label: string; targetId: string };
export type Stat = { value: string; suffix?: string | null; label?: string | null };
export type ImageCard = { title?: string | null; description?: string | null; image?: Media | null; href?: string | null };
export type IconCard = {
  icon?: Media | null;
  title?: string | null;
  description?: string | null;
  href?: string | null;
  linkLabel?: string | null;
  color?: string | null;
};
export type TextItem = { title?: string | null; description?: string | null };
export type SocialLink = {
  platform: "twitter" | "youtube" | "linkedin" | "facebook" | "instagram" | "goodfirms" | "other";
  label?: string | null;
  handle?: string | null;
  href?: string | null;
  icon?: Media | null;
};
export type InsightCard = { label?: string | null; title: string; image?: Media | null; href?: string | null; openInNewTab?: boolean | null };
export type Option = { label: string; value?: string | null; group?: string | null };

export type Seo = {
  metaTitle: string;
  metaDescription?: string | null;
  keywords?: string | null;
  canonicalUrl?: string | null;
  ogImage?: Media | null;
  noIndex?: boolean | null;
};

export type NavItem = {
  label: string;
  href?: string | null;
  description?: string | null;
  icon?: Media | null;
  /** Portrait thumbnail used by image menus such as Industries. */
  image?: Media | null;
  openInNewTab?: boolean | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  links?: Link[] | null;
  /** Optional labelled sub-group inside a tile, e.g. "LINKFIELDS IP" or "ENGAGEMENT MODELS". */
  groupLabel?: string | null;
  groupLinks?: Link[] | null;
  /** Small label above the tile title, e.g. "01" or "DATA & AI". */
  eyebrow?: string | null;
  /** Items sharing a section are rendered under a titled row (e.g. "PROPRIETARY PRODUCTS"). */
  section?: string | null;
  sectionDescription?: string | null;
  accent?: Accent | null;
};
export type Accent = "orange" | "blue" | "purple" | "teal" | "yellow";
export type NavGroup = {
  label: string;
  href?: string | null;
  description?: string | null;
  coverImage?: Media | null;
  items?: NavItem[] | null;
};
export type Badge = { image?: Media | null; alt?: string | null; href?: string | null; width?: number | null; height?: number | null; caption?: string | null };
export type FooterColumn = { title: string; mobileVisible?: boolean | null; badges?: Badge[] | null; links?: Link[] | null };
export type ContactDefaults = {
  heading?: string | null;
  subheading?: string | null;
  nextStepsTitle?: string | null;
  nextSteps?: TextItem[] | null;
  serviceOptions?: Option[] | null;
  submitLabel?: string | null;
  successMessage?: string | null;
  backgroundLight?: Media | null;
  backgroundLightMobile?: Media | null;
  backgroundDark?: Media | null;
  backgroundDarkMobile?: Media | null;
};

export type EventPromo = {
  enabled?: boolean | null;
  /** Remembers dismissal per visitor; defaults to the event slug. */
  promoId?: string | null;
  showFrom?: string | null;
  /** Defaults to the end of the day after the event ends. */
  hideAfter?: string | null;
  delaySeconds?: number | null;
  excludePaths?: string | null;
  eyebrow?: string | null;
  title?: string | null;
  titleHighlight?: string | null;
  body?: string | null;
  badgeLabel?: string | null;
  badgeImage?: Media | null;
  image?: Media | null;
  quote?: string | null;
  quoteAuthor?: string | null;
  quoteRole?: string | null;
  dateLabel?: string | null;
  venueLabel?: string | null;
  standLabel?: string | null;
  calendarTitle?: string | null;
  calendarStart?: string | null;
  calendarEnd?: string | null;
  calendarLocation?: string | null;
  primaryCta?: Link | null;
  secondaryCta?: Link | null;
  pillLabel?: string | null;
  followUpEyebrow?: string | null;
  followUpTitle?: string | null;
  followUpBody?: string | null;
  followUpCta?: Link | null;
};

export type EventItem = {
  id?: number;
  documentId?: string;
  title: string;
  slug: string;
  category?: string | null;
  format?: "in-person" | "online" | "hybrid" | null;
  startDate: string;
  endDate?: string | null;
  /** Daily opening time "HH:MM" (SAST). With `endTime` it drives the live countdown and "open now" state. */
  startTime?: string | null;
  /** Daily closing time "HH:MM" (SAST). */
  endTime?: string | null;
  /** Closing time on the last day, when it differs from `endTime`. */
  lastDayEndTime?: string | null;
  dateLabel?: string | null;
  timeLabel?: string | null;
  venue?: string | null;
  city?: string | null;
  country?: string | null;
  role?: string | null;
  stand?: string | null;
  summary?: string | null;
  recap?: string | null;
  image?: Media | null;
  logo?: Media | null;
  detailLink?: Link | null;
  meetingCta?: Link | null;
  organiserUrl?: string | null;
  featured?: boolean | null;
  popup?: EventPromo | null;
};

/** One office (Global › Offices). `address` holds one line per row; `mapQuery` overrides the map search. */
export type Office = {
  id?: number;
  country: string;
  role?: string | null;
  isHeadquarters?: boolean | null;
  address: string;
  mapQuery?: string | null;
  accent?: Accent | null;
};
export type Global = {
  siteName: string;
  logo?: Media | null;
  favicon?: Media | null;
  navigation?: NavGroup[] | null;
  headerCta?: Link | null;
  footerColumns?: FooterColumn[] | null;
  legalLinks?: Link[] | null;
  copyright?: string | null;
  contactEmail?: string | null;
  salesEmail?: string | null;
  footerTagline?: string | null;
  /** Office locations line shown in the footer brand block, e.g. "South Africa (HQ) · India · UAE". */
  footerLocations?: string | null;
  /** Office addresses (Global › Offices): footer and the Office locations section. */
  offices?: Office[] | null;
  footerSocials?: SocialLink[] | null;
  socialBannerHeading?: string | null;
  socialBannerLinks?: SocialLink[] | null;
  insightsHeading?: string | null;
  insights?: InsightCard[] | null;
  contactForm?: ContactDefaults | null;
  defaultSeo?: Seo | null;
};

/** Every dynamic-zone entry carries its component UID, e.g. "sections.page-hero". */
export type SectionData = { __component: string; id?: number | string; [field: string]: unknown };

export type Page = {
  id?: number;
  documentId?: string;
  title: string;
  path: string;
  seo?: Seo | null;
  sections?: SectionData[] | null;
  updatedAt?: string;
};

export type BlogPost = {
  id?: number;
  documentId?: string;
  title: string;
  slug: string;
  order?: number | null;
  excerpt?: string | null;
  cover?: Media | null;
  label?: string | null;
  tag?: string | null;
  categoryGroup?: "Industries" | "Technology" | null;
  keyword?: string | null;
  authorName?: string | null;
  authorAvatar?: Media | null;
  publishedDate?: string | null;
  content?: string | null;
  featured?: boolean | null;
  seo?: Seo | null;
  updatedAt?: string;
};

export type NewsArticle = {
  id?: number;
  documentId?: string;
  title: string;
  label?: string | null;
  image?: Media | null;
  url?: string | null;
  excerpt?: string | null;
  publishedDate?: string | null;
  order?: number | null;
};
