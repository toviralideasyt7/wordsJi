// SEO Utilities for WordSolverX Website

export interface SchemaOrganization {
    '@context': string;
    '@type': 'Organization';
    name: string;
    url: string;
    logo?: string;
    image?: string;
    description?: string;
    sameAs?: string[];
    contactPoint?: Array<{
        '@type': 'ContactPoint';
        contactType: string;
        email?: string;
        url?: string;
        availableLanguage?: string[];
    }>;
}

export const SOCIAL_PROFILE_URLS = [
    'https://www.pinterest.com/wordsolverx/',
];

const DEFAULT_SOCIAL_IMAGE = 'https://wordsolverx.com/wordsolverx.webp';
const DEFAULT_CONTACT_URL = 'https://wordsolverx.com/contact';
const DEFAULT_CONTACT_EMAIL = 'wordsolverx@gmail.com';
const DEFAULT_ORGANIZATION_DESCRIPTION =
    'WordSolverX publishes daily puzzle answers, solver tools, archives, and strategy guides for Wordle and other popular puzzle games.';

export interface SchemaWebPage {
    '@context': string;
    '@type': 'WebPage';
    name: string;
    description: string;
    url: string;
    image?: string;
    dateModified?: string;
}

export interface SchemaFAQ {
    '@context': string;
    '@type': 'FAQPage';
    mainEntity: Array<{
        '@type': 'Question';
        name: string;
        acceptedAnswer: {
            '@type': 'Answer';
            text: string;
        };
    }>;
}

export interface SchemaBreadcrumb {
    '@context': string;
    '@type': 'BreadcrumbList';
    itemListElement: Array<{
        '@type': 'ListItem';
        position: number;
        name: string;
        item?: string;
    }>;
}

export interface SchemaWebApplication {
    '@context': string;
    '@type': 'WebApplication';
    name: string;
    description: string;
    applicationCategory: string;
    operatingSystem: string;
    offers?: {
        '@type': 'Offer';
        price: string;
        priceCurrency: string;
    };
}

export interface SchemaCollectionPage {
    '@context': string;
    '@type': 'CollectionPage';
    name: string;
    description: string;
    url: string;
    mainEntity: SchemaItemList;
}

export interface SchemaItemList {
    '@type': 'ItemList';
    itemListElement: Array<{
        '@type': 'ListItem';
        position: number;
        url: string;
        name: string;
    }>;
}

export interface SchemaHowTo {
    '@context': string;
    '@type': 'HowTo';
    name: string;
    step: Array<{
        '@type': 'HowToStep';
        name: string;
        text: string;
        position: number;
    }>;
}

export interface SchemaSoftwareApplication {
    '@context': string;
    '@type': 'SoftwareApplication';
    name: string;
    applicationCategory: string;
    operatingSystem: string;
    offers: {
        '@type': 'Offer';
        price: string;
        priceCurrency: string;
    };
}

export interface SchemaSearchAction {
    '@context': string;
    '@type': 'WebSite';
    url: string;
    potentialAction: {
        '@type': 'SearchAction';
        target: {
            '@type': 'EntryPoint';
            urlTemplate: string;
        };
        'query-input': string;
    };
}

export interface SchemaPerson {
    '@context': string;
    '@type': 'Person';
    name: string;
    url?: string;
    image?: string;
    jobTitle?: string;
    description?: string;
    knowsAbout?: string[];
    sameAs?: string[];
}

export interface SchemaArticle {
    '@context': string;
    '@type': 'Article';
    headline: string;
    description: string;
    url: string;
    image?: string;
    datePublished: string;
    dateModified: string;
    author: SchemaPerson;
    publisher: {
        '@type': 'Organization';
        name: string;
        url: string;
        logo?: {
            '@type': 'ImageObject';
            url: string;
        };
    };
    mainEntityOfPage?: string;
}

// Generate Organization Schema (E-E-A-T enhanced)
export function generateOrganizationSchema(): SchemaOrganization {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'WordSolverX',
        url: 'https://wordsolverx.com',
        logo: DEFAULT_SOCIAL_IMAGE,
        image: DEFAULT_SOCIAL_IMAGE,
        description: DEFAULT_ORGANIZATION_DESCRIPTION,
        sameAs: SOCIAL_PROFILE_URLS,
        contactPoint: [
            {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                email: DEFAULT_CONTACT_EMAIL,
                url: DEFAULT_CONTACT_URL,
                availableLanguage: ['English'],
            },
        ],
    };
}

// Generate Article Schema (E-E-A-T + Google Discover)
export function generateArticleSchema(config: {
    headline: string;
    description: string;
    url: string;
    image?: string;
    datePublished?: string;
    dateModified?: string;
    authorName?: string;
    authorImage?: string;
    authorJobTitle?: string;
    authorDescription?: string;
    authorKnowsAbout?: string[];
    authorSameAs?: string[];
}): SchemaArticle {
    const today = new Date().toISOString().split('T')[0];
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: config.headline,
        description: config.description,
        url: config.url,
        ...(config.image && { image: config.image }),
        datePublished: config.datePublished || today,
        dateModified: config.dateModified || today,
        author: {
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: config.authorName || 'Preston Hayes',
            ...(config.authorImage && { image: config.authorImage }),
            ...(config.authorJobTitle && { jobTitle: config.authorJobTitle }),
            ...(config.authorDescription && { description: config.authorDescription }),
            ...(config.authorKnowsAbout && { knowsAbout: config.authorKnowsAbout }),
            ...(config.authorSameAs && { sameAs: config.authorSameAs }),
        },
        publisher: {
            '@type': 'Organization',
            name: 'WordSolverX',
            url: 'https://wordsolverx.com',
            logo: {
                '@type': 'ImageObject',
                url: 'https://wordsolverx.com/wordsolverx.webp',
            },
        },
        mainEntityOfPage: config.url,
    };
}

// Generate WebPage Schema
export function generateWebPageSchema(
    name: string,
    description: string,
    url: string,
    options: {
        image?: string;
        dateModified?: string;
    } = {}
): SchemaWebPage {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name,
        description,
        url,
        image: options.image ?? DEFAULT_SOCIAL_IMAGE,
        dateModified: options.dateModified ?? new Date().toISOString().split('T')[0],
    };
}

// Generate FAQ Schema
export function generateFAQSchema(
    faqs: Array<{ question: string; answer: string }>
): SchemaFAQ {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}

// Generate Breadcrumb Schema
export function generateBreadcrumbSchema(
    items: Array<{ name: string; url?: string }>
): SchemaBreadcrumb {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            ...(item.url && { item: item.url }),
        })),
    };
}

// Generate Web Application Schema
export function generateWebApplicationSchema(
    name: string,
    description: string
): SchemaWebApplication {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name,
        description,
        applicationCategory: 'Game',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
    };
}

// Generate Collection Page Schema
export function generateCollectionPageSchema(
    name: string,
    description: string,
    url: string,
    items: Array<{ name: string; url: string }>
): SchemaCollectionPage {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name,
        description,
        url,
        mainEntity: generateItemListSchema(items),
    };
}

// Generate ItemList Schema
export function generateItemListSchema(
    items: Array<{ name: string; url: string }>
): SchemaItemList {
    return {
        '@type': 'ItemList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: item.url,
            name: item.name,
        })),
    };
}

// Generate HowTo Schema
export function generateHowToSchema(
    name: string,
    steps: Array<{ name: string; text: string }>
): SchemaHowTo {
    return {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name,
        step: steps.map((step, index) => ({
            '@type': 'HowToStep',
            name: step.name,
            text: step.text,
            position: index + 1,
        })),
    };
}

// Generate SoftwareApplication Schema
export function generateSoftwareApplicationSchema(
    name: string,
    applicationCategory: string = 'GameApplication',
    operatingSystem: string = 'Any'
): SchemaSoftwareApplication {
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name,
        applicationCategory,
        operatingSystem,
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
    };
}

// Generate SearchAction Schema (for WebSite)
export function generateSearchActionSchema(
    url: string,
    searchTemplate: string
): SchemaSearchAction {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        url,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: searchTemplate,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

// Generate Person Schema (E-E-A-T enhanced)
export function generatePersonAuthorSchema(
    name: string,
    url?: string,
    image?: string,
    jobTitle?: string,
    knowsAbout?: string[],
    sameAs?: string[]
): SchemaPerson {
    return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name,
        ...(url && { url }),
        ...(image && { image }),
        ...(jobTitle && { jobTitle }),
        ...(knowsAbout && { knowsAbout }),
        ...(sameAs && { sameAs }),
    };
}

// Keyword sets for different pages
export const SEO_KEYWORDS = {
    homepage: [
        'wordle helper',
        'wordle solver',
        'wordle answers',
        'daily wordle',
        'wordle hints',
        'wordle today',
        'wordle game solver',
        'word puzzle solver',
        'five letter word finder',
        'wordle answer today',
        'wordle solver online',
        'free wordle helper',
    ],
    solver: [
        'wordle solver',
        'wordle solver tool',
        'wordle answer finder',
        'wordle cheat',
        'wordle helper tool',
        'solve wordle puzzle',
        'wordle word finder',
        'best wordle solver',
        'wordle solver free',
        'all wordle solver',
    ],
    allWordleSolver: [
        'all wordle solver',
        'solve any letter wordle within seconds',
        'multi-length wordle solver',
        'wordle variations solver',
        'quordle solver',
        'octordle solver',
        'custom length wordle',
        'wordle hard mode solver',
        '4-12 letter wordle solver',
    ],
    binanceWOTD: [
        'binance word of the day solver',
        'binance wotd solver',
        'binance word of the day answer',
        'solve binance word of the day',
        'binance daily word game',
        'binance wotd cheat',
        'binance word game solver',
        'how to solve binance word of the day',
        'what is binance word of the day',
        'binance word puzzle',
        'binance crypto word game',
        'binance wotd helper',
        'binance word of the day tips',
        'binance word game answer',
        'binance wotd strategy',
    ],
    today: [
        'wordle today',
        'today wordle answer',
        'wordle answer today',
        'daily wordle answer',
        'wordle solution today',
        'todays wordle',
        'wordle answer for today',
        'wordle #',
        'wordle hints today',
    ],
    yesterday: [
        'yesterday wordle',
        'wordle yesterday',
        'wordle answer yesterday',
        'yesterday wordle answer',
        'previous wordle answer',
        'last wordle answer',
    ],
    archive: [
        'wordle archive',
        'past wordle answers',
        'wordle answer history',
        'all wordle answers',
        'wordle answers list',
        'previous wordle solutions',
        'wordle database',
        'historical wordle answers',
    ],
};

// Generate comprehensive meta tags
export interface MetaTagsConfig {
    title: string;
    description: string;
    keywords?: string[];
    canonicalUrl?: string;
    ogImage?: string;
    twitterCard?: 'summary' | 'summary_large_image';
}

export function generateMetaTags(config: MetaTagsConfig): Record<string, string> {
    const {
        title,
        description,
        keywords = [],
        canonicalUrl,
        ogImage = 'https://wordsolverx.com/wordsolverx.webp',
        twitterCard = 'summary_large_image',
    } = config;

    return {
        title,
        description,
        keywords: keywords.join(', '),
        'og:title': title,
        'og:description': description,
        'og:image': ogImage,
        'og:type': 'website',
        ...(canonicalUrl && { 'og:url': canonicalUrl }),
        'twitter:card': twitterCard,
        'twitter:title': title,
        'twitter:description': description,
        'twitter:image': ogImage,
    };
}

export function stripStructuredDataTypes(
    schemaJson: string | null | undefined,
    schemaTypes: string[]
): string | null {
    if (!schemaJson) {
        return null;
    }

    const blockedTypes = new Set(schemaTypes);
    const hasBlockedType = (value: unknown): boolean =>
        typeof value === 'object' &&
        value !== null &&
        '@type' in value &&
        blockedTypes.has(String((value as Record<string, unknown>)['@type']));

    try {
        const parsed = JSON.parse(schemaJson) as unknown;

        if (Array.isArray(parsed)) {
            const filtered = parsed.filter((entry) => !hasBlockedType(entry));
            return filtered.length > 0 ? JSON.stringify(filtered) : null;
        }

        if (
            typeof parsed === 'object' &&
            parsed !== null &&
            '@graph' in parsed &&
            Array.isArray((parsed as Record<string, unknown>)['@graph'])
        ) {
            const graph = ((parsed as Record<string, unknown>)['@graph'] as unknown[]).filter(
                (entry) => !hasBlockedType(entry)
            );

            if (graph.length === 0) {
                return null;
            }

            return JSON.stringify({
                ...(parsed as Record<string, unknown>),
                '@graph': graph,
            });
        }

        return hasBlockedType(parsed) ? null : schemaJson;
    } catch {
        return schemaJson;
    }
}
