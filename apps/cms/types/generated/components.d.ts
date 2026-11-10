import type { Schema, Struct } from '@strapi/strapi';

export interface CompanyCardGrid extends Struct.ComponentSchema {
  collectionName: 'components_company_card_grid';
  info: {
    description: 'Editable values or approach icon-card matrix.';
    displayName: 'Company card grid';
    icon: 'grid';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    cards: Schema.Attribute.Component<'shared.icon-card', true>;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    variant: Schema.Attribute.Enumeration<['values', 'work']> &
      Schema.Attribute.DefaultTo<'values'>;
  };
}

export interface CompanyCareerCta extends Struct.ComponentSchema {
  collectionName: 'components_company_career_cta';
  info: {
    description: 'Careers background panel and explore-jobs link';
    displayName: 'Career call to action';
    icon: 'rocket';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    cta: Schema.Attribute.Component<'shared.link', false>;
    ctaIcon: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
  };
}

export interface CompanyCareerSlider extends Struct.ComponentSchema {
  collectionName: 'components_company_career_slider';
  info: {
    description: 'Careers hero with animated image strip and jobs call-to-action';
    displayName: 'Career slider';
    icon: 'landscape';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    ctaHref: Schema.Attribute.String;
    ctaLabel: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    images: Schema.Attribute.Media<'images' | 'files' | 'videos', true>;
  };
}

export interface CompanyContactBanner extends Struct.ComponentSchema {
  collectionName: 'components_company_contact_banner';
  info: {
    description: 'Compact email strip: optional heading/description and one card per enquiry type';
    displayName: 'Contact email banner';
    icon: 'envelop';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    contacts: Schema.Attribute.Component<
      'elements.company-contact-email',
      true
    >;
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String;
  };
}

export interface CompanyExplorationGrid extends Struct.ComponentSchema {
  collectionName: 'components_company_exploration_grid';
  info: {
    description: 'Four-card exploration recipe section';
    displayName: 'Exploration grid';
    icon: 'grid';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    cards: Schema.Attribute.Component<
      'elements.company-exploration-card',
      true
    >;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
  };
}

export interface CompanyLocationCarousel extends Struct.ComponentSchema {
  collectionName: 'components_company_location_carousel';
  info: {
    description: 'Life at Linkfields story with linked workplace image carousel';
    displayName: 'Location carousel';
    icon: 'landscape';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    slides: Schema.Attribute.Component<'elements.company-carousel-slide', true>;
  };
}

export interface CompanyMediaStory extends Struct.ComponentSchema {
  collectionName: 'components_company_media_story';
  info: {
    description: 'Dark two-column story with eyebrow, copy and image';
    displayName: 'Media story';
    icon: 'picture';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    reverse: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    roundedImage: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface CompanyOfficePresence extends Struct.ComponentSchema {
  collectionName: 'components_company_office_presence';
  info: {
    description: 'Global map and editable office contact cards';
    displayName: 'Office presence';
    icon: 'pinMap';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    mapImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    offices: Schema.Attribute.Component<'elements.company-office-card', true>;
  };
}

export interface CompanyVisionList extends Struct.ComponentSchema {
  collectionName: 'components_company_vision_list';
  info: {
    description: 'Two-column vision and mission statements';
    displayName: 'Vision and mission';
    icon: 'eye';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    items: Schema.Attribute.Component<'elements.company-vision-card', true>;
  };
}

export interface ContentBlogListing extends Struct.ComponentSchema {
  collectionName: 'components_content_blog_listing';
  info: {
    description: 'Blog category navigation and listing headings';
    displayName: 'Blog listing';
    icon: 'bulletList';
  };
  attributes: {
    categoryGroups: Schema.Attribute.Component<
      'elements.content-filter-group',
      true
    >;
    discoverHeading: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ContentEmptyHub extends Struct.ComponentSchema {
  collectionName: 'components_content_empty_hubs';
  info: {
    description: 'Intentional desktop blank area on the Industries and Services hub routes';
    displayName: 'Empty hub spacer';
    icon: 'layout';
  };
  attributes: {};
}

export interface ContentNewsListing extends Struct.ComponentSchema {
  collectionName: 'components_content_news_listing';
  info: {
    description: 'News and article card grid';
    displayName: 'News listing';
    icon: 'bulletList';
  };
  attributes: {
    heading: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsCompanyCarouselSlide extends Struct.ComponentSchema {
  collectionName: 'components_elements_company_carousel_slide';
  info: {
    description: 'Workplace image and its location label';
    displayName: 'Company carousel slide';
    icon: 'picture';
  };
  attributes: {
    image: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    label: Schema.Attribute.String;
  };
}

export interface ElementsCompanyContactEmail extends Struct.ComponentSchema {
  collectionName: 'components_elements_company_contact_email';
  info: {
    description: 'Email contact category and address';
    displayName: 'Company contact email';
    icon: 'envelop';
  };
  attributes: {
    email: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface ElementsCompanyExplorationCard extends Struct.ComponentSchema {
  collectionName: 'components_elements_company_exploration_card';
  info: {
    description: 'Icon with an exploration step description';
    displayName: 'Exploration card';
    icon: 'grid';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface ElementsCompanyOfficeCard extends Struct.ComponentSchema {
  collectionName: 'components_elements_company_office_card';
  info: {
    description: 'Country office icon, address, telephone details and directions link';
    displayName: 'Office card';
    icon: 'pinMap';
  };
  attributes: {
    address: Schema.Attribute.Text;
    country: Schema.Attribute.String;
    directionsHref: Schema.Attribute.Text;
    directionsLabel: Schema.Attribute.String;
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    phone: Schema.Attribute.Text;
  };
}

export interface ElementsCompanyVisionCard extends Struct.ComponentSchema {
  collectionName: 'components_elements_company_vision_card';
  info: {
    description: 'Icon, heading and vision or mission copy';
    displayName: 'Company vision card';
    icon: 'eye';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    title: Schema.Attribute.String;
  };
}

export interface ElementsContentFilterGroup extends Struct.ComponentSchema {
  collectionName: 'components_elements_content_filter_group';
  info: {
    description: 'A blog category and its keyword filters';
    displayName: 'Content filter group';
    icon: 'filter';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    options: Schema.Attribute.Component<'elements.content-filter-option', true>;
  };
}

export interface ElementsContentFilterOption extends Struct.ComponentSchema {
  collectionName: 'components_elements_content_filter_option';
  info: {
    description: 'A selectable blog keyword';
    displayName: 'Content filter option';
    icon: 'filter';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String;
  };
}

export interface ElementsFeatureTile extends Struct.ComponentSchema {
  collectionName: 'components_elements_feature_tile';
  info: {
    description: "Unified tile: number/icon/logo, eyebrow, title, tagline, text, bullets (one per line, 'Title \u2013 detail'), logo links, footnote, link";
    displayName: 'Feature tile';
    icon: 'apps';
  };
  attributes: {
    accent: Schema.Attribute.Enumeration<
      ['orange', 'blue', 'purple', 'teal', 'yellow']
    >;
    bullets: Schema.Attribute.Text;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    footLabel: Schema.Attribute.String;
    footText: Schema.Attribute.Text;
    groupLabel: Schema.Attribute.String;
    href: Schema.Attribute.String;
    icon: Schema.Attribute.Media<'images' | 'files'>;
    linkLabel: Schema.Attribute.String;
    links: Schema.Attribute.Component<'shared.link', true>;
    logo: Schema.Attribute.Media<'images' | 'files'>;
    number: Schema.Attribute.String;
    tagline: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsHeroChip extends Struct.ComponentSchema {
  collectionName: 'components_elements_hero_chips';
  info: {
    description: 'A small linked label shown under a home hero slide (for example one strategic value play).';
    displayName: 'Hero chip';
    icon: 'dot';
  };
  attributes: {
    accent: Schema.Attribute.Enumeration<
      ['orange', 'blue', 'purple', 'teal', 'yellow']
    > &
      Schema.Attribute.DefaultTo<'orange'>;
    href: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsHeroProof extends Struct.ComponentSchema {
  collectionName: 'components_elements_hero_proofs';
  info: {
    description: 'Credential shown in the scrolling hero strip: a short value (e.g. 20+, #35) and/or a badge logo, plus a label.';
    displayName: 'Hero proof point';
    icon: 'star';
  };
  attributes: {
    href: Schema.Attribute.String;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 80;
      }>;
    logo: Schema.Attribute.Media<'images'>;
    value: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 16;
      }>;
  };
}

export interface ElementsHomeAwardCard extends Struct.ComponentSchema {
  collectionName: 'components_elements_home_award_card';
  info: {
    description: 'Award copy, certification image and CTA.';
    displayName: 'Home award card';
    icon: 'star';
  };
  attributes: {
    cta: Schema.Attribute.Component<'shared.link', false>;
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files'>;
    title: Schema.Attribute.Text;
  };
}

export interface ElementsHomeHeroSlide extends Struct.ComponentSchema {
  collectionName: 'components_elements_home_hero_slide';
  info: {
    description: 'One caption and CTA within the home video hero. Eyebrow overrides the hero eyebrow for this slide; chips add up to six linked labels.';
    displayName: 'Home hero slide';
    icon: 'play';
  };
  attributes: {
    chips: Schema.Attribute.Component<'elements.hero-chip', true>;
    cta: Schema.Attribute.Component<'shared.link', false>;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    title: Schema.Attribute.Text;
  };
}

export interface ElementsHomeIndustryCard extends Struct.ComponentSchema {
  collectionName: 'components_elements_home_industry_card';
  info: {
    description: 'Image, copy and CTA within the home industries carousel.';
    displayName: 'Home industry card';
    icon: 'landscape';
  };
  attributes: {
    cta: Schema.Attribute.Component<'shared.link', false>;
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files'>;
    title: Schema.Attribute.String;
  };
}

export interface ElementsHomePartner extends Struct.ComponentSchema {
  collectionName: 'components_elements_home_partner';
  info: {
    description: 'Partner logo (white mark), optional original-colour logo shown on hover, and destination in the home hero.';
    displayName: 'Home partner';
    icon: 'link';
  };
  attributes: {
    colorImage: Schema.Attribute.Media<'images' | 'files'>;
    href: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files'>;
    label: Schema.Attribute.String;
  };
}

export interface ElementsHomeServiceCard extends Struct.ComponentSchema {
  collectionName: 'components_elements_home_service_card';
  info: {
    description: 'One linked service image tile in the home showcase.';
    displayName: 'Home service card';
    icon: 'grid';
  };
  attributes: {
    href: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images' | 'files'>;
    title: Schema.Attribute.String;
  };
}

export interface ElementsHomeSolutionCard extends Struct.ComponentSchema {
  collectionName: 'components_elements_home_solution_card';
  info: {
    description: 'Logo, description and CTA in the home solutions grid.';
    displayName: 'Home solution card';
    icon: 'apps';
  };
  attributes: {
    cta: Schema.Attribute.Component<'shared.link', false>;
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files'>;
    title: Schema.Attribute.String;
  };
}

export interface ElementsHubsOfferItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_hubs_offer_item';
  info: {
    description: 'One tab, its service details, image, and optional destination.';
    displayName: 'Hub offer item';
    icon: 'picture';
  };
  attributes: {
    cta: Schema.Attribute.Component<'shared.link', false>;
    description: Schema.Attribute.RichText;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    title: Schema.Attribute.String;
  };
}

export interface ElementsIndustriesBuildingTool extends Struct.ComponentSchema {
  collectionName: 'components_elements_industries_building_tool';
  info: {
    description: 'A service offer in the industry building tools band';
    displayName: 'Industries building tool';
    icon: 'apps';
  };
  attributes: {
    actionLabel: Schema.Attribute.String;
    actionUrl: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface ElementsIndustriesGridCard extends Struct.ComponentSchema {
  collectionName: 'components_elements_industries_grid_card';
  info: {
    description: 'Industry card: photo, title, description, tags (one per line)';
    displayName: 'Industry card';
    icon: 'briefcase';
  };
  attributes: {
    accent: Schema.Attribute.Enumeration<
      ['orange', 'blue', 'purple', 'teal', 'yellow']
    >;
    description: Schema.Attribute.Text;
    href: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    tags: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsIndustriesSpecialization
  extends Struct.ComponentSchema {
  collectionName: 'components_elements_industries_specialization';
  info: {
    description: 'One image, title, and description in an industry specialization carousel';
    displayName: 'Industries specialization';
    icon: 'landscape';
  };
  attributes: {
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String;
  };
}

export interface ElementsLocation extends Struct.ComponentSchema {
  collectionName: 'components_elements_location';
  info: {
    description: 'Office / market location on the world map';
    displayName: 'Location';
    icon: 'pinMap';
  };
  attributes: {
    accent: Schema.Attribute.Enumeration<
      ['orange', 'blue', 'purple', 'teal', 'yellow']
    >;
    hq: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    lat: Schema.Attribute.Decimal;
    lng: Schema.Attribute.Decimal;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    role: Schema.Attribute.String;
  };
}

export interface ElementsMetric extends Struct.ComponentSchema {
  collectionName: 'components_elements_metric';
  info: {
    description: "Outcome metric: label, prefix ('Up to'), value, title, description";
    displayName: 'Metric';
    icon: 'chartPie';
  };
  attributes: {
    accent: Schema.Attribute.Enumeration<
      ['orange', 'blue', 'purple', 'teal', 'yellow']
    >;
    description: Schema.Attribute.Text;
    label: Schema.Attribute.String;
    prefix: Schema.Attribute.String;
    title: Schema.Attribute.String;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsProductsAccelerator extends Struct.ComponentSchema {
  collectionName: 'components_elements_products_accelerators';
  info: {
    description: 'A reusable delivery accelerator card';
    displayName: 'Accelerator';
    icon: 'rocket';
  };
  attributes: {
    accent: Schema.Attribute.Enumeration<
      ['orange', 'blue', 'purple', 'teal', 'yellow']
    > &
      Schema.Attribute.DefaultTo<'orange'>;
    description: Schema.Attribute.Text;
    features: Schema.Attribute.Component<'shared.text-item', true>;
    href: Schema.Attribute.String;
    icon: Schema.Attribute.Media<'images'>;
    label: Schema.Attribute.String;
    linkLabel: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsProductsCategory extends Struct.ComponentSchema {
  collectionName: 'components_elements_products_categories';
  info: {
    description: 'Service line grouping of proprietary products (tags: separate with |)';
    displayName: 'Product category';
    icon: 'apps';
  };
  attributes: {
    accent: Schema.Attribute.Enumeration<
      ['orange', 'blue', 'purple', 'teal', 'yellow']
    > &
      Schema.Attribute.DefaultTo<'orange'>;
    anchorId: Schema.Attribute.String;
    href: Schema.Attribute.String;
    number: Schema.Attribute.String;
    products: Schema.Attribute.Component<'elements.products-product', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsProductsProduct extends Struct.ComponentSchema {
  collectionName: 'components_elements_products_products';
  info: {
    description: 'A proprietary product inside a product category';
    displayName: 'Product (portfolio)';
    icon: 'cube';
  };
  attributes: {
    description: Schema.Attribute.Text;
    href: Schema.Attribute.String;
    linkLabel: Schema.Attribute.String;
    logo: Schema.Attribute.Media<'images'>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    tagline: Schema.Attribute.String;
    tags: Schema.Attribute.String;
  };
}

export interface ElementsServicesAccordionItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_services_accordion_item';
  info: {
    description: 'Expandable service-process title and copy.';
    displayName: 'Services accordion item';
    icon: 'bulletList';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface ElementsServicesIconCard extends Struct.ComponentSchema {
  collectionName: 'components_elements_services_icon_card';
  info: {
    description: 'Icon with editable service-card title and description.';
    displayName: 'Services icon card';
    icon: 'picture';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    title: Schema.Attribute.String;
  };
}

export interface ElementsServicesLogoGroup extends Struct.ComponentSchema {
  collectionName: 'components_elements_services_logo_group';
  info: {
    description: 'A labelled row of technology logos.';
    displayName: 'Services logo group';
    icon: 'apps';
  };
  attributes: {
    heading: Schema.Attribute.String;
    logos: Schema.Attribute.Component<'elements.services-icon-card', true>;
  };
}

export interface ElementsServicesNumberedItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_services_numbered_item';
  info: {
    description: 'One numbered service-help statement.';
    displayName: 'Services numbered item';
    icon: 'numberList';
  };
  attributes: {
    description: Schema.Attribute.Text;
  };
}

export interface ElementsServicesPartnerLogo extends Struct.ComponentSchema {
  collectionName: 'components_elements_services_partner_logo';
  info: {
    description: 'Partner/vendor logo linking to the partner website (e.g. Partner RPA tools).';
    displayName: 'Services partner logo';
    icon: 'link';
  };
  attributes: {
    href: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files'>;
    label: Schema.Attribute.String;
  };
}

export interface ElementsSolutionsAccordionItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_solutions_accordion_item';
  info: {
    description: 'Editable title and detail for a solutions accordion.';
    displayName: 'Solutions accordion item';
    icon: 'bulletList';
  };
  attributes: {
    description: Schema.Attribute.RichText;
    title: Schema.Attribute.Text;
  };
}

export interface ElementsSolutionsSalesforceTab extends Struct.ComponentSchema {
  collectionName: 'components_elements_solutions_salesforce_tab';
  info: {
    description: 'One Salesforce service tab and its cloud cards.';
    displayName: 'Solutions Salesforce tab';
    icon: 'apps';
  };
  attributes: {
    cards: Schema.Attribute.Component<'shared.icon-card', true>;
    description: Schema.Attribute.RichText;
    label: Schema.Attribute.String;
    title: Schema.Attribute.Text;
  };
}

export interface ElementsValuePlay extends Struct.ComponentSchema {
  collectionName: 'components_elements_value_play';
  info: {
    description: 'Value play row: trigger, outcome and Linkfields IP';
    displayName: 'Value play';
    icon: 'lightbulb';
  };
  attributes: {
    accent: Schema.Attribute.Enumeration<
      ['orange', 'blue', 'purple', 'teal', 'yellow']
    >;
    href: Schema.Attribute.String;
    ip: Schema.Attribute.Text;
    linkLabel: Schema.Attribute.String;
    outcome: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    trigger: Schema.Attribute.Text;
  };
}

export interface HomeAwardsCarousel extends Struct.ComponentSchema {
  collectionName: 'components_home_awards_carousel';
  info: {
    description: 'Awards and recognition carousel over a branded background.';
    displayName: 'Home awards carousel';
    icon: 'star';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files'>;
    cards: Schema.Attribute.Component<'elements.home-award-card', true>;
  };
}

export interface HomeCareersBanner extends Struct.ComponentSchema {
  collectionName: 'components_home_careers_banner';
  info: {
    description: 'Image-backed home careers CTA banner.';
    displayName: 'Home careers banner';
    icon: 'briefcase';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files'>;
    cta: Schema.Attribute.Component<'shared.link', false>;
    heading: Schema.Attribute.Text;
  };
}

export interface HomeHeroSlider extends Struct.ComponentSchema {
  collectionName: 'components_home_hero_slider';
  info: {
    description: 'Full-screen video-backed home hero with slides and partner logos.';
    displayName: 'Home hero slider';
    icon: 'play';
  };
  attributes: {
    autoplaySeconds: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 15;
          min: 4;
        },
        number
      > &
      Schema.Attribute.DefaultTo<6>;
    backgroundVideo: Schema.Attribute.Media<'videos' | 'files'>;
    eyebrow: Schema.Attribute.String;
    partners: Schema.Attribute.Component<'elements.home-partner', true>;
    partnersLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'OEM & technology partners'>;
    primaryCta: Schema.Attribute.Component<'shared.link', false>;
    proofPoints: Schema.Attribute.Component<'elements.hero-proof', true>;
    slides: Schema.Attribute.Component<'elements.home-hero-slide', true>;
    videoPoster: Schema.Attribute.Media<'images'>;
    videoStyle: Schema.Attribute.Enumeration<['globe', 'background']> &
      Schema.Attribute.DefaultTo<'background'>;
  };
}

export interface HomeIndustriesCarousel extends Struct.ComponentSchema {
  collectionName: 'components_home_industries_carousel';
  info: {
    description: 'Image-led home industry cards with carousel controls.';
    displayName: 'Home industries carousel';
    icon: 'landscape';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String;
    items: Schema.Attribute.Component<'elements.home-industry-card', true>;
  };
}

export interface HomeJourney extends Struct.ComponentSchema {
  collectionName: 'components_home_journey';
  info: {
    description: 'Our Journey dark image-backed achievement statistics.';
    displayName: 'Home journey';
    icon: 'chartBubble';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files'>;
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.Text;
    stats: Schema.Attribute.Component<'shared.stat', true>;
  };
}

export interface HomeServicesShowcase extends Struct.ComponentSchema {
  collectionName: 'components_home_services_showcase';
  info: {
    description: 'Our Services copy and image-card carousel.';
    displayName: 'Home services showcase';
    icon: 'grid';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files'>;
    cards: Schema.Attribute.Component<'elements.home-service-card', true>;
    cta: Schema.Attribute.Component<'shared.link', false>;
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String;
  };
}

export interface HomeSolutionsGrid extends Struct.ComponentSchema {
  collectionName: 'components_home_solutions_grid';
  info: {
    description: 'Six solution logos with descriptions and links.';
    displayName: 'Home solutions grid';
    icon: 'apps';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files'>;
    cards: Schema.Attribute.Component<'elements.home-solution-card', true>;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
  };
}

export interface HubsWhatWeOffer extends Struct.ComponentSchema {
  collectionName: 'components_hubs_what_we_offer';
  info: {
    description: 'Tabbed service offerings used on the seven service hub pages.';
    displayName: 'Hub What We Offer';
    icon: 'grid';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    body: Schema.Attribute.Text;
    cards: Schema.Attribute.Component<'elements.hubs-offer-item', true>;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
  };
}

export interface IndustriesBuildingTools extends Struct.ComponentSchema {
  collectionName: 'components_industries_building_tools';
  info: {
    description: 'Dark service offering band used on industry pages';
    displayName: 'Building tools';
    icon: 'apps';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images'>;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    tools: Schema.Attribute.Component<
      'elements.industries-building-tool',
      true
    >;
  };
}

export interface IndustriesSpecializationList extends Struct.ComponentSchema {
  collectionName: 'components_industries_specialization_list';
  info: {
    description: 'Interactive image and tabs carousel for industry specializations';
    displayName: 'Specialization list';
    icon: 'landscape';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images'>;
    heading: Schema.Attribute.String;
    items: Schema.Attribute.Component<
      'elements.industries-specialization',
      true
    >;
  };
}

export interface LayoutBadge extends Struct.ComponentSchema {
  collectionName: 'components_layout_badge';
  info: {
    description: '';
    displayName: 'Badge / logo';
    icon: 'medal';
  };
  attributes: {
    alt: Schema.Attribute.String;
    caption: Schema.Attribute.String;
    height: Schema.Attribute.Integer;
    href: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    width: Schema.Attribute.Integer;
  };
}

export interface LayoutContactDefaults extends Struct.ComponentSchema {
  collectionName: 'components_layout_contact_defaults';
  info: {
    description: '';
    displayName: 'Contact form defaults';
    icon: 'envelop';
  };
  attributes: {
    backgroundDark: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    backgroundDarkMobile: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    backgroundLight: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    backgroundLightMobile: Schema.Attribute.Media<
      'images' | 'files' | 'videos'
    >;
    heading: Schema.Attribute.String;
    nextSteps: Schema.Attribute.Component<'shared.text-item', true>;
    nextStepsTitle: Schema.Attribute.String;
    serviceOptions: Schema.Attribute.Component<'shared.option', true>;
    subheading: Schema.Attribute.String;
    submitLabel: Schema.Attribute.String;
    successMessage: Schema.Attribute.Text;
  };
}

export interface LayoutEventPromo extends Struct.ComponentSchema {
  collectionName: 'components_layout_event_promos';
  info: {
    description: 'Site-wide pop-up and reminder for an Event. Empty dates, venue and stand fall back to the Event. Default window: from publishing until the end of the day after the event ends; on that last day the follow-up text is shown.';
    displayName: 'Event pop-up';
    icon: 'calendar';
  };
  attributes: {
    badgeImage: Schema.Attribute.Media<'images'>;
    badgeLabel: Schema.Attribute.String;
    body: Schema.Attribute.Text;
    calendarEnd: Schema.Attribute.Date;
    calendarLocation: Schema.Attribute.String;
    calendarStart: Schema.Attribute.Date;
    calendarTitle: Schema.Attribute.String;
    dateLabel: Schema.Attribute.String;
    delaySeconds: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 60;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<4>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    excludePaths: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    followUpBody: Schema.Attribute.Text;
    followUpCta: Schema.Attribute.Component<'shared.link', false>;
    followUpEyebrow: Schema.Attribute.String;
    followUpTitle: Schema.Attribute.String;
    hideAfter: Schema.Attribute.DateTime;
    image: Schema.Attribute.Media<'images'>;
    pillLabel: Schema.Attribute.String;
    primaryCta: Schema.Attribute.Component<'shared.link', false>;
    promoId: Schema.Attribute.String;
    quote: Schema.Attribute.Text;
    quoteAuthor: Schema.Attribute.String;
    quoteRole: Schema.Attribute.String;
    secondaryCta: Schema.Attribute.Component<'shared.link', false>;
    showFrom: Schema.Attribute.DateTime;
    standLabel: Schema.Attribute.String;
    title: Schema.Attribute.String;
    titleHighlight: Schema.Attribute.String;
    venueLabel: Schema.Attribute.String;
  };
}

export interface LayoutFooterColumn extends Struct.ComponentSchema {
  collectionName: 'components_layout_footer_column';
  info: {
    description: '';
    displayName: 'Footer column';
    icon: 'layout';
  };
  attributes: {
    badges: Schema.Attribute.Component<'layout.badge', true>;
    links: Schema.Attribute.Component<'shared.link', true>;
    mobileVisible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface LayoutNavGroup extends Struct.ComponentSchema {
  collectionName: 'components_layout_nav_group';
  info: {
    description: '';
    displayName: 'Navigation group';
    icon: 'layer';
  };
  attributes: {
    coverImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    description: Schema.Attribute.Text;
    href: Schema.Attribute.String;
    items: Schema.Attribute.Component<'layout.nav-item', true>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface LayoutNavItem extends Struct.ComponentSchema {
  collectionName: 'components_layout_nav_item';
  info: {
    description: '';
    displayName: 'Navigation item';
    icon: 'link';
  };
  attributes: {
    accent: Schema.Attribute.Enumeration<
      ['orange', 'blue', 'purple', 'teal', 'yellow']
    >;
    ctaHref: Schema.Attribute.String;
    ctaLabel: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    groupLabel: Schema.Attribute.String;
    groupLinks: Schema.Attribute.Component<'shared.link', true>;
    href: Schema.Attribute.String;
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    links: Schema.Attribute.Component<'shared.link', true>;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    section: Schema.Attribute.String;
    sectionDescription: Schema.Attribute.String;
  };
}

export interface LayoutOffice extends Struct.ComponentSchema {
  collectionName: 'components_layout_office';
  info: {
    description: 'One office address (no phone numbers). Shown in the footer and the Office locations section.';
    displayName: 'Office';
    icon: 'pinMap';
  };
  attributes: {
    accent: Schema.Attribute.Enumeration<
      ['orange', 'blue', 'purple', 'teal', 'yellow']
    >;
    address: Schema.Attribute.Text & Schema.Attribute.Required;
    country: Schema.Attribute.String & Schema.Attribute.Required;
    isHeadquarters: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    mapQuery: Schema.Attribute.String;
    role: Schema.Attribute.String;
  };
}

export interface ProductsAcceleratorGrid extends Struct.ComponentSchema {
  collectionName: 'components_products_accelerator_grid';
  info: {
    description: 'Reusable accelerator cards; the card linking to the current page is hidden automatically';
    displayName: 'Accelerator grid';
    icon: 'rocket';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    ctaLabel: Schema.Attribute.String;
    ctaUrl: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    items: Schema.Attribute.Component<'elements.products-accelerator', true>;
  };
}

export interface ProductsProductPortfolio extends Struct.ComponentSchema {
  collectionName: 'components_products_product_portfolio';
  info: {
    description: 'Proprietary products grouped by service line (bento grid with logos)';
    displayName: 'Product portfolio';
    icon: 'grid';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    categories: Schema.Attribute.Component<'elements.products-category', true>;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
  };
}

export interface SectionsContactForm extends Struct.ComponentSchema {
  collectionName: 'components_sections_contact_form';
  info: {
    description: 'Lead form \u2013 empty fields fall back to Global \u203A Contact form defaults';
    displayName: 'Contact form';
    icon: 'envelop';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'get-in-touch'>;
    heading: Schema.Attribute.String;
    layout: Schema.Attribute.Enumeration<['section', 'page']> &
      Schema.Attribute.DefaultTo<'section'>;
    nextSteps: Schema.Attribute.Component<'shared.text-item', true>;
    nextStepsTitle: Schema.Attribute.String;
    subheading: Schema.Attribute.String;
    theme: Schema.Attribute.Enumeration<['dark', 'light']> &
      Schema.Attribute.DefaultTo<'dark'>;
  };
}

export interface SectionsEventsList extends Struct.ComponentSchema {
  collectionName: 'components_sections_events_lists';
  info: {
    description: 'Upcoming and past events from Strapi \u203A Event, split automatically by date. Upcoming events show booking, calendar and organiser links.';
    displayName: 'Events list';
    icon: 'calendar';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'upcoming-events'>;
    description: Schema.Attribute.Text;
    emptyText: Schema.Attribute.Text;
    emptyTitle: Schema.Attribute.String;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    pastAnchorId: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'past-events'>;
    pastDescription: Schema.Attribute.Text;
    pastEyebrow: Schema.Attribute.String;
    pastHeading: Schema.Attribute.Text;
    pastLimit: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<9>;
    showPast: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsFeatureTiles extends Struct.ComponentSchema {
  collectionName: 'components_sections_feature_tiles';
  info: {
    description: 'Unified tile grid (portfolios, why Linkfields, engagement models, what we deliver, IP, accelerators)';
    displayName: 'Feature tiles';
    icon: 'grid';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    columns: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 1;
        },
        number
      >;
    ctaLabel: Schema.Attribute.String;
    ctaUrl: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    items: Schema.Attribute.Component<'elements.feature-tile', true>;
    logos: Schema.Attribute.Component<'shared.link', true>;
    logosLabel: Schema.Attribute.String;
    note: Schema.Attribute.Text;
    noteLabel: Schema.Attribute.String;
    strip: Schema.Attribute.String;
    tone: Schema.Attribute.Enumeration<['navy', 'ink']> &
      Schema.Attribute.DefaultTo<'navy'>;
    variant: Schema.Attribute.Enumeration<['default', 'portfolio', 'compact']> &
      Schema.Attribute.DefaultTo<'default'>;
  };
}

export interface SectionsFeaturedInsights extends Struct.ComponentSchema {
  collectionName: 'components_sections_featured_insights';
  info: {
    description: 'Insights & Updates cards (falls back to the global list when empty)';
    displayName: 'Featured insights';
    icon: 'feather';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    ctaLabel: Schema.Attribute.String;
    ctaUrl: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    items: Schema.Attribute.Component<'shared.insight-card', true>;
  };
}

export interface SectionsGlobalPresence extends Struct.ComponentSchema {
  collectionName: 'components_sections_global_presence';
  info: {
    description: 'Dotted world map with headquarters and market locations';
    displayName: 'Global presence';
    icon: 'earth';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    ctaLabel: Schema.Attribute.String;
    ctaUrl: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    locations: Schema.Attribute.Component<'elements.location', true>;
    strip: Schema.Attribute.String;
    variant: Schema.Attribute.Enumeration<['full', 'compact']> &
      Schema.Attribute.DefaultTo<'full'>;
  };
}

export interface SectionsIndustriesGrid extends Struct.ComponentSchema {
  collectionName: 'components_sections_industries_grid';
  info: {
    description: 'Who we serve \u2013 industry cards with photo, description and tags';
    displayName: 'Industries grid';
    icon: 'apps';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    cta: Schema.Attribute.Component<'shared.link', false>;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    items: Schema.Attribute.Component<'elements.industries-grid-card', true>;
  };
}

export interface SectionsIndustriesShowcase extends Struct.ComponentSchema {
  collectionName: 'components_sections_industries_showcase';
  info: {
    description: 'Constantly innovating \u2013 industry image tiles';
    displayName: 'Industries showcase';
    icon: 'grid';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    items: Schema.Attribute.Component<'shared.image-card', true>;
  };
}

export interface SectionsMessageBanner extends Struct.ComponentSchema {
  collectionName: 'components_sections_message_banner';
  info: {
    description: 'Blue strip with an orange call-to-action';
    displayName: 'Message banner';
    icon: 'message';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    ctaLabel: Schema.Attribute.String;
    ctaUrl: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    title: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface SectionsMetricsGrid extends Struct.ComponentSchema {
  collectionName: 'components_sections_metrics_grid';
  info: {
    description: 'Client value: intro, outcome metrics, banner and steps';
    displayName: 'Metrics grid';
    icon: 'chartBubble';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    bannerLabel: Schema.Attribute.String;
    bannerText: Schema.Attribute.Text;
    bannerTitle: Schema.Attribute.String;
    bullets: Schema.Attribute.Text;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    footnote: Schema.Attribute.Text;
    heading: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files'>;
    metrics: Schema.Attribute.Component<'elements.metric', true>;
    metricsHeading: Schema.Attribute.String;
    metricsLabel: Schema.Attribute.String;
    steps: Schema.Attribute.Component<'elements.feature-tile', true>;
    stepsLabel: Schema.Attribute.String;
  };
}

export interface SectionsOfficeLocations extends Struct.ComponentSchema {
  collectionName: 'components_sections_office_locations';
  info: {
    description: 'Office addresses with an interactive map and directions. Offices come from Global \u203A Offices.';
    displayName: 'Office locations';
    icon: 'pinMap';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'our-offices'>;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    showMap: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsOverview extends Struct.ComponentSchema {
  collectionName: 'components_sections_overview';
  info: {
    description: 'Eyebrow + heading on the left, copy on the right';
    displayName: 'Overview';
    icon: 'layout';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    body: Schema.Attribute.RichText;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    secondaryBody: Schema.Attribute.RichText;
    secondaryEyebrow: Schema.Attribute.String;
    secondaryHeading: Schema.Attribute.Text;
    theme: Schema.Attribute.Enumeration<['light', 'dark']> &
      Schema.Attribute.DefaultTo<'light'>;
  };
}

export interface SectionsPageHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_page_hero';
  info: {
    description: 'Inner-page hero with background image and in-page anchor tabs';
    displayName: 'Page hero';
    icon: 'landscape';
  };
  attributes: {
    anchorLinks: Schema.Attribute.Component<'shared.anchor-link', true>;
    backgroundImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    logo: Schema.Attribute.Media<'images'>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsRichText extends Struct.ComponentSchema {
  collectionName: 'components_sections_rich_text';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'feather';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    body: Schema.Attribute.RichText;
    heading: Schema.Attribute.String;
    variant: Schema.Attribute.Enumeration<['legal', 'article', 'plain']> &
      Schema.Attribute.DefaultTo<'legal'>;
  };
}

export interface SectionsSocialBanner extends Struct.ComponentSchema {
  collectionName: 'components_sections_social_banner';
  info: {
    description: 'Follow us for the latest updates (falls back to Global social links)';
    displayName: 'Social banner';
    icon: 'earth';
  };
  attributes: {
    heading: Schema.Attribute.String;
    links: Schema.Attribute.Component<'shared.social-link', true>;
  };
}

export interface SectionsStatsBand extends Struct.ComponentSchema {
  collectionName: 'components_sections_stats_band';
  info: {
    description: 'Persistently innovative \u2013 animated counters';
    displayName: 'Stats band';
    icon: 'chartPie';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    stats: Schema.Attribute.Component<'shared.stat', true>;
  };
}

export interface SectionsValuePlays extends Struct.ComponentSchema {
  collectionName: 'components_sections_value_plays';
  info: {
    description: 'Strategic value plays: trigger, outcome, Linkfields IP';
    displayName: 'Value plays';
    icon: 'puzzle';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    ctaLabel: Schema.Attribute.String;
    ctaUrl: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    plays: Schema.Attribute.Component<'elements.value-play', true>;
  };
}

export interface SectionsWhoWeAre extends Struct.ComponentSchema {
  collectionName: 'components_sections_who_we_are';
  info: {
    description: 'Company introduction with mission, vision and headline facts';
    displayName: 'Who we are';
    icon: 'user';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    body: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files'>;
    mission: Schema.Attribute.Text;
    missionLabel: Schema.Attribute.String;
    stats: Schema.Attribute.Component<'elements.metric', true>;
    vision: Schema.Attribute.Text;
    visionLabel: Schema.Attribute.String;
  };
}

export interface ServicesFlowCards extends Struct.ComponentSchema {
  collectionName: 'components_services_flow_cards';
  info: {
    description: 'WHAT WE OFFER service cards on an image or black ground.';
    displayName: 'Services \u00B7 Flow cards';
    icon: 'apps';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    backgroundStyle: Schema.Attribute.Enumeration<['image', 'dark']> &
      Schema.Attribute.DefaultTo<'image'>;
    cards: Schema.Attribute.Component<'elements.services-icon-card', true>;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
  };
}

export interface ServicesLogoOffering extends Struct.ComponentSchema {
  collectionName: 'components_services_logo_offering';
  info: {
    description: 'Performing-language and platform logo rows with industry cards.';
    displayName: 'Services \u00B7 Logo offering';
    icon: 'layer';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    groups: Schema.Attribute.Component<'elements.services-logo-group', true>;
    industries: Schema.Attribute.Component<'shared.image-card', true>;
    industriesHeading: Schema.Attribute.String;
  };
}

export interface ServicesMediaProcess extends Struct.ComponentSchema {
  collectionName: 'components_services_media_process';
  info: {
    description: 'Dark two-column process story with a supporting illustration.';
    displayName: 'Services \u00B7 Process media';
    icon: 'picture';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    partners: Schema.Attribute.Component<
      'elements.services-partner-logo',
      true
    >;
    partnersHeading: Schema.Attribute.String;
    points: Schema.Attribute.Component<'shared.text-item', true>;
    variant: Schema.Attribute.Enumeration<['standard', 'compact']> &
      Schema.Attribute.DefaultTo<'standard'>;
  };
}

export interface ServicesNumberedHelp extends Struct.ComponentSchema {
  collectionName: 'components_services_numbered_help';
  info: {
    description: 'Blue-gradient numbered two-column help list.';
    displayName: 'Services \u00B7 Numbered help';
    icon: 'numberList';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    items: Schema.Attribute.Component<'elements.services-numbered-item', true>;
  };
}

export interface ServicesProcessAccordion extends Struct.ComponentSchema {
  collectionName: 'components_services_process_accordion';
  info: {
    description: 'OUR PROCESS two-column accordion with optional supporting image.';
    displayName: 'Services \u00B7 Process accordion';
    icon: 'bulletList';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    backgroundStyle: Schema.Attribute.Enumeration<['image', 'dark']> &
      Schema.Attribute.DefaultTo<'image'>;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    imageVariant: Schema.Attribute.Enumeration<['standard', 'compact']> &
      Schema.Attribute.DefaultTo<'standard'>;
    items: Schema.Attribute.Component<'elements.services-accordion-item', true>;
    logos: Schema.Attribute.Component<'elements.services-partner-logo', true>;
  };
}

export interface ServicesSuperpowers extends Struct.ComponentSchema {
  collectionName: 'components_services_superpowers';
  info: {
    description: 'BENEFITS / OUR SUPERPOWERS icon and copy grid.';
    displayName: 'Services \u00B7 Superpowers';
    icon: 'star';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    cards: Schema.Attribute.Component<'elements.services-icon-card', true>;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
  };
}

export interface ServicesWhatWeOffer extends Struct.ComponentSchema {
  collectionName: 'components_services_what_we_offer';
  info: {
    description: 'Dark icon-card grid used for HOW CAN WE HELP and WHAT WE OFFER.';
    displayName: 'Services \u00B7 What we offer';
    icon: 'grid';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    cardLayout: Schema.Attribute.Enumeration<['two', 'three']> &
      Schema.Attribute.DefaultTo<'three'>;
    cards: Schema.Attribute.Component<'elements.services-icon-card', true>;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    items: Schema.Attribute.Component<'shared.text-item', true>;
  };
}

export interface SharedAnchorLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_anchor_link';
  info: {
    description: '';
    displayName: 'Anchor link';
    icon: 'arrowDown';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    targetId: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedIconCard extends Struct.ComponentSchema {
  collectionName: 'components_shared_icon_card';
  info: {
    description: '';
    displayName: 'Icon card';
    icon: 'apps';
  };
  attributes: {
    color: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    href: Schema.Attribute.String;
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    linkLabel: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SharedImageCard extends Struct.ComponentSchema {
  collectionName: 'components_shared_image_card';
  info: {
    description: '';
    displayName: 'Image card';
    icon: 'picture';
  };
  attributes: {
    description: Schema.Attribute.Text;
    href: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    title: Schema.Attribute.String;
  };
}

export interface SharedInsightCard extends Struct.ComponentSchema {
  collectionName: 'components_shared_insight_card';
  info: {
    description: '';
    displayName: 'Insight card';
    icon: 'feather';
  };
  attributes: {
    href: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    label: Schema.Attribute.String;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_link';
  info: {
    description: '';
    displayName: 'Link';
    icon: 'link';
  };
  attributes: {
    description: Schema.Attribute.String;
    href: Schema.Attribute.String;
    icon: Schema.Attribute.Media<'images'>;
    label: Schema.Attribute.String;
    logo: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface SharedOption extends Struct.ComponentSchema {
  collectionName: 'components_shared_option';
  info: {
    description: '';
    displayName: 'Option';
    icon: 'bulletList';
  };
  attributes: {
    group: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seo';
  info: {
    description: '';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    canonicalUrl: Schema.Attribute.String;
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.Text;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    noIndex: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    ogImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_link';
  info: {
    description: '';
    displayName: 'Social link';
    icon: 'earth';
  };
  attributes: {
    handle: Schema.Attribute.String;
    href: Schema.Attribute.String;
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    label: Schema.Attribute.String;
    platform: Schema.Attribute.Enumeration<
      [
        'twitter',
        'youtube',
        'linkedin',
        'facebook',
        'instagram',
        'goodfirms',
        'other',
      ]
    > &
      Schema.Attribute.DefaultTo<'other'>;
  };
}

export interface SharedStat extends Struct.ComponentSchema {
  collectionName: 'components_shared_stat';
  info: {
    description: '';
    displayName: 'Statistic';
    icon: 'chartBubble';
  };
  attributes: {
    label: Schema.Attribute.String;
    suffix: Schema.Attribute.String;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedTextItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_text_item';
  info: {
    description: '';
    displayName: 'Text item';
    icon: 'bulletList';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.Text;
  };
}

export interface SolutionsAccordionStack extends Struct.ComponentSchema {
  collectionName: 'components_solutions_accordion_stack';
  info: {
    description: 'Full-width, card-grid, or static accordion content.';
    displayName: 'Solutions accordion stack';
    icon: 'stack';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    items: Schema.Attribute.Component<
      'elements.solutions-accordion-item',
      true
    >;
    variant: Schema.Attribute.Enumeration<['full', 'grid', 'static-grid']> &
      Schema.Attribute.DefaultTo<'full'>;
  };
}

export interface SolutionsCardGrid extends Struct.ComponentSchema {
  collectionName: 'components_solutions_card_grid';
  info: {
    description: 'Dark, transparent, intro, or source-style offer-row cards with editable imagery.';
    displayName: 'Solutions card grid';
    icon: 'grid';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    cards: Schema.Attribute.Component<'shared.icon-card', true>;
    description: Schema.Attribute.RichText;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    variant: Schema.Attribute.Enumeration<
      ['dark', 'transparent', 'intro', 'offer-rows']
    > &
      Schema.Attribute.DefaultTo<'dark'>;
  };
}

export interface SolutionsHowCanWeHelp extends Struct.ComponentSchema {
  collectionName: 'components_solutions_how_can_we_help';
  info: {
    description: 'Reusable dark call-to-action cards block.';
    displayName: 'How Can We Help';
    icon: 'handHeart';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    cards: Schema.Attribute.Component<'shared.icon-card', true>;
    description: Schema.Attribute.RichText;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    linkedCards: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface SolutionsNumberedList extends Struct.ComponentSchema {
  collectionName: 'components_solutions_numbered_list';
  info: {
    description: 'Numbered capability statements.';
    displayName: 'Solutions numbered list';
    icon: 'numbers';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    items: Schema.Attribute.Component<'shared.text-item', true>;
  };
}

export interface SolutionsProcessGrid extends Struct.ComponentSchema {
  collectionName: 'components_solutions_process_grid';
  info: {
    description: 'Implementation-process cards around optional centre media.';
    displayName: 'Solutions process grid';
    icon: 'arrowRight';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    cards: Schema.Attribute.Component<'shared.icon-card', true>;
    centerImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    description: Schema.Attribute.RichText;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
  };
}

export interface SolutionsSalesforceServices extends Struct.ComponentSchema {
  collectionName: 'components_solutions_salesforce_services';
  info: {
    description: 'Desktop side-tab service catalogue.';
    displayName: 'Salesforce services';
    icon: 'apps';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    heading: Schema.Attribute.Text;
    tabs: Schema.Attribute.Component<'elements.solutions-salesforce-tab', true>;
  };
}

export interface SolutionsSplitAccordion extends Struct.ComponentSchema {
  collectionName: 'components_solutions_split_accordion';
  info: {
    description: 'Two-column content block with openable detail rows.';
    displayName: 'Solutions split accordion';
    icon: 'bulletList';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    description: Schema.Attribute.RichText;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    items: Schema.Attribute.Component<
      'elements.solutions-accordion-item',
      true
    >;
  };
}

export interface SolutionsTechnologyDetails extends Struct.ComponentSchema {
  collectionName: 'components_solutions_technology_details';
  info: {
    description: 'Reusable technology detail cards block.';
    displayName: 'Technology Details';
    icon: 'apps';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    cards: Schema.Attribute.Component<'shared.icon-card', true>;
    description: Schema.Attribute.RichText;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    layout: Schema.Attribute.Enumeration<['grid', 'grid-compact', 'stack']> &
      Schema.Attribute.DefaultTo<'stack'>;
    secondaryDescription: Schema.Attribute.RichText;
    secondaryEyebrow: Schema.Attribute.String;
    secondaryHeading: Schema.Attribute.Text;
  };
}

export interface SolutionsWhyChooseUs extends Struct.ComponentSchema {
  collectionName: 'components_solutions_why_choose_us';
  info: {
    description: 'Salesforce statistics showcase.';
    displayName: 'Why choose us';
    icon: 'chartPie';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.Text;
    stats: Schema.Attribute.Component<'shared.stat', true>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'company.card-grid': CompanyCardGrid;
      'company.career-cta': CompanyCareerCta;
      'company.career-slider': CompanyCareerSlider;
      'company.contact-banner': CompanyContactBanner;
      'company.exploration-grid': CompanyExplorationGrid;
      'company.location-carousel': CompanyLocationCarousel;
      'company.media-story': CompanyMediaStory;
      'company.office-presence': CompanyOfficePresence;
      'company.vision-list': CompanyVisionList;
      'content.blog-listing': ContentBlogListing;
      'content.empty-hub': ContentEmptyHub;
      'content.news-listing': ContentNewsListing;
      'elements.company-carousel-slide': ElementsCompanyCarouselSlide;
      'elements.company-contact-email': ElementsCompanyContactEmail;
      'elements.company-exploration-card': ElementsCompanyExplorationCard;
      'elements.company-office-card': ElementsCompanyOfficeCard;
      'elements.company-vision-card': ElementsCompanyVisionCard;
      'elements.content-filter-group': ElementsContentFilterGroup;
      'elements.content-filter-option': ElementsContentFilterOption;
      'elements.feature-tile': ElementsFeatureTile;
      'elements.hero-chip': ElementsHeroChip;
      'elements.hero-proof': ElementsHeroProof;
      'elements.home-award-card': ElementsHomeAwardCard;
      'elements.home-hero-slide': ElementsHomeHeroSlide;
      'elements.home-industry-card': ElementsHomeIndustryCard;
      'elements.home-partner': ElementsHomePartner;
      'elements.home-service-card': ElementsHomeServiceCard;
      'elements.home-solution-card': ElementsHomeSolutionCard;
      'elements.hubs-offer-item': ElementsHubsOfferItem;
      'elements.industries-building-tool': ElementsIndustriesBuildingTool;
      'elements.industries-grid-card': ElementsIndustriesGridCard;
      'elements.industries-specialization': ElementsIndustriesSpecialization;
      'elements.location': ElementsLocation;
      'elements.metric': ElementsMetric;
      'elements.products-accelerator': ElementsProductsAccelerator;
      'elements.products-category': ElementsProductsCategory;
      'elements.products-product': ElementsProductsProduct;
      'elements.services-accordion-item': ElementsServicesAccordionItem;
      'elements.services-icon-card': ElementsServicesIconCard;
      'elements.services-logo-group': ElementsServicesLogoGroup;
      'elements.services-numbered-item': ElementsServicesNumberedItem;
      'elements.services-partner-logo': ElementsServicesPartnerLogo;
      'elements.solutions-accordion-item': ElementsSolutionsAccordionItem;
      'elements.solutions-salesforce-tab': ElementsSolutionsSalesforceTab;
      'elements.value-play': ElementsValuePlay;
      'home.awards-carousel': HomeAwardsCarousel;
      'home.careers-banner': HomeCareersBanner;
      'home.hero-slider': HomeHeroSlider;
      'home.industries-carousel': HomeIndustriesCarousel;
      'home.journey': HomeJourney;
      'home.services-showcase': HomeServicesShowcase;
      'home.solutions-grid': HomeSolutionsGrid;
      'hubs.what-we-offer': HubsWhatWeOffer;
      'industries.building-tools': IndustriesBuildingTools;
      'industries.specialization-list': IndustriesSpecializationList;
      'layout.badge': LayoutBadge;
      'layout.contact-defaults': LayoutContactDefaults;
      'layout.event-promo': LayoutEventPromo;
      'layout.footer-column': LayoutFooterColumn;
      'layout.nav-group': LayoutNavGroup;
      'layout.nav-item': LayoutNavItem;
      'layout.office': LayoutOffice;
      'products.accelerator-grid': ProductsAcceleratorGrid;
      'products.product-portfolio': ProductsProductPortfolio;
      'sections.contact-form': SectionsContactForm;
      'sections.events-list': SectionsEventsList;
      'sections.feature-tiles': SectionsFeatureTiles;
      'sections.featured-insights': SectionsFeaturedInsights;
      'sections.global-presence': SectionsGlobalPresence;
      'sections.industries-grid': SectionsIndustriesGrid;
      'sections.industries-showcase': SectionsIndustriesShowcase;
      'sections.message-banner': SectionsMessageBanner;
      'sections.metrics-grid': SectionsMetricsGrid;
      'sections.office-locations': SectionsOfficeLocations;
      'sections.overview': SectionsOverview;
      'sections.page-hero': SectionsPageHero;
      'sections.rich-text': SectionsRichText;
      'sections.social-banner': SectionsSocialBanner;
      'sections.stats-band': SectionsStatsBand;
      'sections.value-plays': SectionsValuePlays;
      'sections.who-we-are': SectionsWhoWeAre;
      'services.flow-cards': ServicesFlowCards;
      'services.logo-offering': ServicesLogoOffering;
      'services.media-process': ServicesMediaProcess;
      'services.numbered-help': ServicesNumberedHelp;
      'services.process-accordion': ServicesProcessAccordion;
      'services.superpowers': ServicesSuperpowers;
      'services.what-we-offer': ServicesWhatWeOffer;
      'shared.anchor-link': SharedAnchorLink;
      'shared.icon-card': SharedIconCard;
      'shared.image-card': SharedImageCard;
      'shared.insight-card': SharedInsightCard;
      'shared.link': SharedLink;
      'shared.option': SharedOption;
      'shared.seo': SharedSeo;
      'shared.social-link': SharedSocialLink;
      'shared.stat': SharedStat;
      'shared.text-item': SharedTextItem;
      'solutions.accordion-stack': SolutionsAccordionStack;
      'solutions.card-grid': SolutionsCardGrid;
      'solutions.how-can-we-help': SolutionsHowCanWeHelp;
      'solutions.numbered-list': SolutionsNumberedList;
      'solutions.process-grid': SolutionsProcessGrid;
      'solutions.salesforce-services': SolutionsSalesforceServices;
      'solutions.split-accordion': SolutionsSplitAccordion;
      'solutions.technology-details': SolutionsTechnologyDetails;
      'solutions.why-choose-us': SolutionsWhyChooseUs;
    }
  }
}
