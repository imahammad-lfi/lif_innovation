# Section component catalogue (generated from apps/cms/src/components)

Page documents (`seed/custom/pages/*.json`) have `title`, `path`, `seo` {metaTitle, metaDescription, keywords, canonicalUrl:"", noIndex:false} and `sections` (list). Each section is an object with `"__component": "<uid>"` plus the fields below. Text fields support Markdown where the existing pages use it; `*text*` inside headings renders as the orange highlight and `_text_` as a blue highlight in headings that support highlights. Nested element fields are listed under each referenced element.

Usage counts and an example file (in `seed/data/pages/`) are given so you can copy a real, working structure.

## `company.card-grid`  (used 2x; e.g. company__about-us.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `description`: text
- `cards`: component -> shared.icon-card (repeatable list)
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}
- `variant`: enumeration one of ['values', 'work'] default='values'

## `company.career-cta`  (used 1x; e.g. careers.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `description`: text
- `cta`: component -> shared.link
- `ctaIcon`: media {"__media":"<path under seed/assets>","alt":"..."}
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}

## `company.career-slider`  (used 1x; e.g. careers.json)
- `anchorId`: string
- `heading`: text
- `ctaLabel`: string
- `ctaHref`: string
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}
- `images`: media {"__media":"<path under seed/assets>","alt":"..."} (multiple)

## `company.contact-banner`  (used 1x; e.g. contact-us.json)
- `anchorId`: string
- `contacts`: component -> elements.company-contact-email (repeatable list)

## `company.exploration-grid`  (used 1x; e.g. company__our-approach.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `cards`: component -> elements.company-exploration-card (repeatable list)

## `company.location-carousel`  (used 1x; e.g. careers.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `description`: text
- `slides`: component -> elements.company-carousel-slide (repeatable list)

## `company.media-story`  (used 3x; e.g. careers.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `description`: text
- `image`: media {"__media":"<path under seed/assets>","alt":"..."}
- `reverse`: boolean default=False
- `roundedImage`: boolean default=False

## `company.office-presence`  (used 2x; e.g. careers.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `mapImage`: media {"__media":"<path under seed/assets>","alt":"..."}
- `offices`: component -> elements.company-office-card (repeatable list)

## `company.vision-list`  (used 0x; not used yet)
- `anchorId`: string
- `items`: component -> elements.company-vision-card (repeatable list)

## `content.blog-listing`  (used 1x; e.g. company__blog.json)
- `heading`: string REQUIRED
- `categoryGroups`: component -> elements.content-filter-group (repeatable list)
- `discoverHeading`: string

## `content.empty-hub`  (used 0x; not used yet)

## `content.news-listing`  (used 1x; e.g. company__news-and-articles.json)
- `heading`: string REQUIRED

## `home.awards-carousel`  (used 1x; e.g. index.json)
- `anchorId`: string
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}
- `cards`: component -> elements.home-award-card (repeatable list)

## `home.careers-banner`  (used 1x; e.g. index.json)
- `anchorId`: string
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}
- `heading`: text
- `cta`: component -> shared.link

## `home.hero-slider`  (used 1x; e.g. index.json)
- `backgroundVideo`: media {"__media":"<path under seed/assets>","alt":"..."}
- `videoPoster`: media {"__media":"<path under seed/assets>","alt":"..."}
- `videoStyle`: enumeration one of ['globe', 'background'] default='background'
- `slides`: component -> elements.home-hero-slide (repeatable list)
- `partners`: component -> elements.home-partner (repeatable list)

## `home.industries-carousel`  (used 0x; not used yet)
- `anchorId`: string
- `heading`: string
- `description`: text
- `items`: component -> elements.home-industry-card (repeatable list)

## `home.journey`  (used 0x; not used yet)
- `anchorId`: string
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}
- `heading`: text
- `description`: text
- `stats`: component -> shared.stat (repeatable list)

## `home.services-showcase`  (used 0x; not used yet)
- `anchorId`: string
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}
- `heading`: string
- `description`: text
- `cta`: component -> shared.link
- `cards`: component -> elements.home-service-card (repeatable list)

## `home.solutions-grid`  (used 1x; e.g. index.json)
- `anchorId`: string
- `eyebrow`: string
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}
- `heading`: string
- `description`: text
- `cards`: component -> elements.home-solution-card (repeatable list)

## `hubs.what-we-offer`  (used 7x; e.g. services__cyber-security.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `body`: text
- `cards`: component -> elements.hubs-offer-item (repeatable list)

## `industries.building-tools`  (used 12x; e.g. industries__banking.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}
- `tools`: component -> elements.industries-building-tool (repeatable list)

## `industries.specialization-list`  (used 13x; e.g. industries__banking.json)
- `anchorId`: string
- `heading`: string
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}
- `items`: component -> elements.industries-specialization (repeatable list)

## `products.accelerator-grid`  (used 6x; e.g. products-and-accelerators.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `description`: text
- `items`: component -> elements.products-accelerator (repeatable list)
- `ctaLabel`: string
- `ctaUrl`: string

## `products.product-portfolio`  (used 2x; e.g. products-and-accelerators.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `description`: text
- `categories`: component -> elements.products-category (repeatable list)

## `sections.contact-form`  (used 71x; e.g. company__about-us.json)
- `anchorId`: string default='get-in-touch'
- `heading`: string
- `subheading`: string
- `nextStepsTitle`: string
- `nextSteps`: component -> shared.text-item (repeatable list)
- `layout`: enumeration one of ['section', 'page'] default='section'
- `theme`: enumeration one of ['dark', 'light'] default='dark'

## `sections.feature-tiles`  (used 20x; e.g. company__about-us.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `description`: text
- `variant`: enumeration one of ['default', 'portfolio', 'compact'] default='default'
- `columns`: integer
- `tone`: enumeration one of ['navy', 'ink'] default='navy'
- `logosLabel`: string
- `logos`: component -> shared.link (repeatable list)
- `items`: component -> elements.feature-tile (repeatable list)
- `noteLabel`: string
- `note`: text
- `strip`: string
- `ctaLabel`: string
- `ctaUrl`: string

## `sections.featured-insights`  (used 55x; e.g. company__about-us.json)
- `anchorId`: string
- `heading`: string
- `items`: component -> shared.insight-card (repeatable list)

## `sections.global-presence`  (used 2x; e.g. company__about-us.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `description`: text
- `locations`: component -> elements.location (repeatable list)
- `strip`: string

## `sections.industries-grid`  (used 9x; e.g. company__about-us.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `description`: text
- `items`: component -> elements.industries-grid-card (repeatable list)
- `cta`: component -> shared.link

## `sections.industries-showcase`  (used 0x; not used yet)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `description`: text
- `items`: component -> shared.image-card (repeatable list)
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}

## `sections.message-banner`  (used 55x; e.g. explore-more__innovationAndTransformation.json)
- `anchorId`: string
- `title`: text REQUIRED
- `description`: text
- `ctaLabel`: string
- `ctaUrl`: string

## `sections.metrics-grid`  (used 1x; e.g. index.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `description`: text
- `bullets`: text
- `metricsLabel`: string
- `metricsHeading`: string
- `metrics`: component -> elements.metric (repeatable list)
- `bannerLabel`: string
- `bannerTitle`: string
- `bannerText`: text
- `stepsLabel`: string
- `steps`: component -> elements.feature-tile (repeatable list)
- `image`: media {"__media":"<path under seed/assets>","alt":"..."}

## `sections.overview`  (used 61x; e.g. explore-more__innovationAndTransformation.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `body`: richtext
- `secondaryEyebrow`: string
- `secondaryHeading`: text
- `secondaryBody`: richtext
- `theme`: enumeration one of ['light', 'dark'] default='light'

## `sections.page-hero`  (used 69x; e.g. company__about-us.json)
- `title`: string REQUIRED
- `subtitle`: text
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}
- `anchorLinks`: component -> shared.anchor-link (repeatable list)

## `sections.rich-text`  (used 3x; e.g. cookies-policy.json)
- `anchorId`: string
- `heading`: string
- `body`: richtext
- `variant`: enumeration one of ['legal', 'article', 'plain'] default='legal'

## `sections.social-banner`  (used 71x; e.g. careers.json)
- `heading`: string
- `links`: component -> shared.social-link (repeatable list)

## `sections.stats-band`  (used 8x; e.g. explore-more__innovationAndTransformation.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `description`: text
- `stats`: component -> shared.stat (repeatable list)
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}

## `sections.value-plays`  (used 8x; e.g. company__our-approach.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `description`: text
- `plays`: component -> elements.value-play (repeatable list)
- `ctaLabel`: string
- `ctaUrl`: string

## `sections.who-we-are`  (used 2x; e.g. company__about-us.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `body`: text
- `missionLabel`: string
- `mission`: text
- `visionLabel`: string
- `vision`: text
- `stats`: component -> elements.metric (repeatable list)
- `image`: media {"__media":"<path under seed/assets>","alt":"..."}

## `services.flow-cards`  (used 23x; e.g. services__cyber-security__ai-security-grc.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `description`: text
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}
- `backgroundStyle`: enumeration one of ['image', 'dark'] default='image'
- `cards`: component -> elements.services-icon-card (repeatable list)

## `services.logo-offering`  (used 1x; e.g. services__talent-advisory-gcc__staff-augmentation.json)
- `anchorId`: string
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}
- `groups`: component -> elements.services-logo-group (repeatable list)
- `industriesHeading`: string
- `industries`: component -> shared.image-card (repeatable list)

## `services.media-process`  (used 8x; e.g. services__data-ai__data-platforms-analytics.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `description`: text
- `points`: component -> shared.text-item (repeatable list)
- `image`: media {"__media":"<path under seed/assets>","alt":"..."}
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}
- `partnersHeading`: string
- `partners`: component -> elements.services-partner-logo (repeatable list)
- `variant`: enumeration one of ['standard', 'compact'] default='standard'

## `services.numbered-help`  (used 7x; e.g. products-and-accelerators__delivery-accelerators.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}
- `items`: component -> elements.services-numbered-item (repeatable list)

## `services.process-accordion`  (used 20x; e.g. services__cyber-security__ai-security-grc.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `description`: text
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}
- `backgroundStyle`: enumeration one of ['image', 'dark'] default='image'
- `image`: media {"__media":"<path under seed/assets>","alt":"..."}
- `imageVariant`: enumeration one of ['standard', 'compact'] default='standard'
- `items`: component -> elements.services-accordion-item (repeatable list)
- `logos`: component -> elements.services-partner-logo (repeatable list)

## `services.superpowers`  (used 4x; e.g. services__digital-transformation__app-modernisation.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `cards`: component -> elements.services-icon-card (repeatable list)

## `services.what-we-offer`  (used 22x; e.g. careers.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `description`: text
- `items`: component -> shared.text-item (repeatable list)
- `cards`: component -> elements.services-icon-card (repeatable list)
- `cardLayout`: enumeration one of ['two', 'three'] default='three'

## `solutions.accordion-stack`  (used 3x; e.g. solutions__erp-solutions__sap__core-sap-expertise.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `items`: component -> elements.solutions-accordion-item (repeatable list)
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}
- `variant`: enumeration one of ['full', 'grid', 'static-grid'] default='full'

## `solutions.card-grid`  (used 17x; e.g. products-and-accelerators__ai-governance.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `description`: richtext
- `image`: media {"__media":"<path under seed/assets>","alt":"..."}
- `cards`: component -> shared.icon-card (repeatable list)
- `variant`: enumeration one of ['dark', 'transparent', 'intro', 'offer-rows'] default='dark'
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}

## `solutions.how-can-we-help`  (used 10x; e.g. explore-more__innovationAndTransformation.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `description`: richtext
- `image`: media {"__media":"<path under seed/assets>","alt":"..."}
- `cards`: component -> shared.icon-card (repeatable list)
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}
- `linkedCards`: boolean default=False

## `solutions.numbered-list`  (used 1x; e.g. solutions__erp-solutions__sap__data-services.json)
- `anchorId`: string
- `heading`: text
- `items`: component -> shared.text-item (repeatable list)

## `solutions.process-grid`  (used 1x; e.g. solutions__erp-solutions__odoo.json)
- `eyebrow`: string
- `heading`: text
- `description`: richtext
- `cards`: component -> shared.icon-card (repeatable list)
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}
- `centerImage`: media {"__media":"<path under seed/assets>","alt":"..."}

## `solutions.salesforce-services`  (used 1x; e.g. solutions__erp-solutions__salesforce.json)
- `anchorId`: string
- `heading`: text
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}
- `tabs`: component -> elements.solutions-salesforce-tab (repeatable list)

## `solutions.split-accordion`  (used 1x; e.g. solutions__erp-solutions__salesforce.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `description`: richtext
- `items`: component -> elements.solutions-accordion-item (repeatable list)
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}

## `solutions.technology-details`  (used 4x; e.g. explore-more__innovationAndTransformation.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `description`: richtext
- `secondaryEyebrow`: string
- `secondaryHeading`: text
- `secondaryDescription`: richtext
- `image`: media {"__media":"<path under seed/assets>","alt":"..."}
- `cards`: component -> shared.icon-card (repeatable list)
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}
- `layout`: enumeration one of ['grid', 'grid-compact', 'stack'] default='stack'

## `solutions.why-choose-us`  (used 1x; e.g. solutions__erp-solutions__salesforce.json)
- `anchorId`: string
- `eyebrow`: string
- `heading`: text
- `stats`: component -> shared.stat (repeatable list)
- `backgroundImage`: media {"__media":"<path under seed/assets>","alt":"..."}

# Nested elements
## `elements.company-carousel-slide`
- `image`: media {"__media":"<path under seed/assets>","alt":"..."}
- `label`: string

## `elements.company-contact-email`
- `title`: string
- `email`: string

## `elements.company-exploration-card`
- `icon`: media {"__media":"<path under seed/assets>","alt":"..."}
- `description`: text

## `elements.company-office-card`
- `icon`: media {"__media":"<path under seed/assets>","alt":"..."}
- `country`: string
- `address`: text
- `phone`: text
- `directionsLabel`: string
- `directionsHref`: text

## `elements.company-vision-card`
- `icon`: media {"__media":"<path under seed/assets>","alt":"..."}
- `title`: string
- `description`: text

## `elements.content-filter-group`
- `label`: string REQUIRED
- `options`: component -> elements.content-filter-option (repeatable list)

## `elements.content-filter-option`
- `label`: string REQUIRED
- `value`: string

## `elements.feature-tile`
- `number`: string
- `eyebrow`: string
- `title`: string REQUIRED
- `tagline`: string
- `description`: text
- `bullets`: text
- `groupLabel`: string
- `links`: component -> shared.link (repeatable list)
- `footLabel`: string
- `footText`: text
- `accent`: enumeration one of ['orange', 'blue', 'purple', 'teal', 'yellow']
- `icon`: media {"__media":"<path under seed/assets>","alt":"..."}
- `logo`: media {"__media":"<path under seed/assets>","alt":"..."}
- `href`: string
- `linkLabel`: string

## `elements.home-award-card`
- `title`: text
- `description`: text
- `image`: media {"__media":"<path under seed/assets>","alt":"..."}
- `cta`: component -> shared.link

## `elements.home-hero-slide`
- `title`: text
- `description`: text
- `cta`: component -> shared.link

## `elements.home-industry-card`
- `title`: string
- `description`: text
- `image`: media {"__media":"<path under seed/assets>","alt":"..."}
- `cta`: component -> shared.link

## `elements.home-partner`
- `label`: string
- `image`: media {"__media":"<path under seed/assets>","alt":"..."}
- `href`: text

## `elements.home-service-card`
- `title`: string
- `image`: media {"__media":"<path under seed/assets>","alt":"..."}
- `href`: string

## `elements.home-solution-card`
- `title`: string
- `image`: media {"__media":"<path under seed/assets>","alt":"..."}
- `description`: text
- `cta`: component -> shared.link

## `elements.hubs-offer-item`
- `title`: string
- `description`: richtext
- `image`: media {"__media":"<path under seed/assets>","alt":"..."}
- `cta`: component -> shared.link

## `elements.industries-building-tool`
- `title`: string
- `description`: text
- `actionLabel`: string
- `actionUrl`: string

## `elements.industries-grid-card`
- `title`: string REQUIRED
- `description`: text
- `image`: media {"__media":"<path under seed/assets>","alt":"..."}
- `href`: string
- `tags`: text
- `accent`: enumeration one of ['orange', 'blue', 'purple', 'teal', 'yellow']

## `elements.industries-specialization`
- `title`: string
- `description`: text
- `image`: media {"__media":"<path under seed/assets>","alt":"..."}

## `elements.location`
- `name`: string REQUIRED
- `role`: string
- `lat`: decimal
- `lng`: decimal
- `hq`: boolean default=False
- `accent`: enumeration one of ['orange', 'blue', 'purple', 'teal', 'yellow']

## `elements.metric`
- `label`: string
- `prefix`: string
- `value`: string REQUIRED
- `title`: string
- `description`: text
- `accent`: enumeration one of ['orange', 'blue', 'purple', 'teal', 'yellow']

## `elements.products-accelerator`
- `label`: string
- `title`: string REQUIRED
- `description`: text
- `icon`: media {"__media":"<path under seed/assets>","alt":"..."}
- `accent`: enumeration one of ['orange', 'blue', 'purple', 'teal', 'yellow'] default='orange'
- `features`: component -> shared.text-item (repeatable list)
- `href`: string
- `linkLabel`: string

## `elements.products-category`
- `anchorId`: string
- `number`: string
- `title`: string REQUIRED
- `href`: string
- `accent`: enumeration one of ['orange', 'blue', 'purple', 'teal', 'yellow'] default='orange'
- `products`: component -> elements.products-product (repeatable list)

## `elements.products-product`
- `name`: string REQUIRED
- `logo`: media {"__media":"<path under seed/assets>","alt":"..."}
- `tagline`: string
- `description`: text
- `tags`: string
- `href`: string
- `linkLabel`: string
- `openInNewTab`: boolean default=False

## `elements.services-accordion-item`
- `title`: string
- `description`: text

## `elements.services-icon-card`
- `icon`: media {"__media":"<path under seed/assets>","alt":"..."}
- `title`: string
- `description`: text

## `elements.services-logo-group`
- `heading`: string
- `logos`: component -> elements.services-icon-card (repeatable list)

## `elements.services-numbered-item`
- `description`: text

## `elements.services-partner-logo`
- `label`: string
- `image`: media {"__media":"<path under seed/assets>","alt":"..."}
- `href`: text

## `elements.solutions-accordion-item`
- `title`: text
- `description`: richtext

## `elements.solutions-salesforce-tab`
- `label`: string
- `title`: text
- `description`: richtext
- `cards`: component -> shared.icon-card (repeatable list)

## `elements.value-play`
- `title`: string REQUIRED
- `trigger`: text
- `outcome`: text
- `ip`: text
- `accent`: enumeration one of ['orange', 'blue', 'purple', 'teal', 'yellow']

## `shared.anchor-link`
- `label`: string REQUIRED
- `targetId`: string REQUIRED

## `shared.icon-card`
- `icon`: media {"__media":"<path under seed/assets>","alt":"..."}
- `title`: string
- `description`: text
- `href`: string
- `linkLabel`: string
- `color`: string

## `shared.image-card`
- `title`: string
- `description`: text
- `image`: media {"__media":"<path under seed/assets>","alt":"..."}
- `href`: string

## `shared.insight-card`
- `label`: string
- `title`: string REQUIRED
- `image`: media {"__media":"<path under seed/assets>","alt":"..."}
- `href`: string
- `openInNewTab`: boolean default=False

## `shared.link`
- `label`: string
- `href`: string
- `openInNewTab`: boolean default=False
- `description`: string
- `logo`: media {"__media":"<path under seed/assets>","alt":"..."}

## `shared.option`
- `label`: string REQUIRED
- `value`: string

## `shared.seo`
- `metaTitle`: string REQUIRED
- `metaDescription`: text
- `keywords`: text
- `canonicalUrl`: string
- `ogImage`: media {"__media":"<path under seed/assets>","alt":"..."}
- `noIndex`: boolean default=False

## `shared.social-link`
- `platform`: enumeration one of ['twitter', 'youtube', 'linkedin', 'facebook', 'instagram', 'goodfirms', 'other'] default='other'
- `label`: string
- `handle`: string
- `href`: string
- `icon`: media {"__media":"<path under seed/assets>","alt":"..."}

## `shared.stat`
- `value`: string REQUIRED
- `suffix`: string
- `label`: string

## `shared.text-item`
- `title`: text
- `description`: text
