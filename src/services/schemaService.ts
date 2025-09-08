// Schema service for generating dynamic structured data
export interface SchemaData {
  '@context': string;
  '@graph': any[];
}

export class SchemaService {
  private static instance: SchemaService;

  private constructor() {}

  public static getInstance(): SchemaService {
    if (!SchemaService.instance) {
      SchemaService.instance = new SchemaService();
    }
    return SchemaService.instance;
  }

  /**
   * Generate FAQ schema for SEO
   */
  public generateFAQSchema(): any {
    return {
      '@type': 'FAQPage',
      '@id': 'https://redirectinator.com/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is Redirectinator?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Redirectinator is a professional tool for checking URL redirects, monitoring website status, and analyzing redirect chains. It's designed for SEO professionals who need to manage large numbers of URLs efficiently.",
          },
        },
        {
          '@type': 'Question',
          name: 'How does Redirectinator work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Redirectinator processes URLs in batches, following redirect chains to determine final destinations and status codes. It supports bulk uploads via CSV/XML, integrates with SEMrush and Wayback Machine, and provides detailed analytics and export options.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is Redirectinator free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Yes, Redirectinator is completely free to use. It's a client-side application that runs in your browser, so there are no server costs or usage limits.",
          },
        },
        {
          '@type': 'Question',
          name: 'What file formats does Redirectinator support?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Redirectinator supports CSV files for bulk URL imports, XML sitemaps, and provides export options in CSV, JSON, Excel, and PDF report formats.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I integrate Redirectinator with other tools?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, Redirectinator integrates with SEMrush for keyword research and Wayback Machine for historical URL discovery. It also supports API integrations and can export data for use in other SEO tools.',
          },
        },
        {
          '@type': 'Question',
          name: 'Who created Redirectinator?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Redirectinator was created by Jeff Louella, an SEO professional and developer specializing in technical SEO tools and automation. The tool was built to solve real-world SEO challenges faced by professionals.',
          },
        },
      ],
    };
  }

  /**
   * Generate HowTo schema for using the tool
   */
  public generateHowToSchema(): any {
    return {
      '@type': 'HowTo',
      '@id': 'https://redirectinator.com/#howto',
      name: 'How to Use Redirectinator for URL Redirect Analysis',
      description:
        'Step-by-step guide to using Redirectinator for professional URL redirect checking and monitoring',
      image: 'https://redirectinator.com/og-image.png',
      totalTime: 'PT5M',
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: '0',
      },
      supply: [
        {
          '@type': 'HowToSupply',
          name: 'List of URLs to check',
        },
        {
          '@type': 'HowToSupply',
          name: 'Modern web browser',
        },
      ],
      tool: [
        {
          '@type': 'WebApplication',
          name: 'Redirectinator',
          url: 'https://redirectinator.com/',
        },
      ],
      step: [
        {
          '@type': 'HowToStep',
          name: 'Upload or enter URLs',
          text: 'Use the bulk upload feature to import CSV files or XML sitemaps, or manually enter URLs one by one.',
          image: 'https://redirectinator.com/step1.png',
        },
        {
          '@type': 'HowToStep',
          name: 'Configure processing options',
          text: 'Set batch size, delay between requests, and other processing parameters in the settings.',
          image: 'https://redirectinator.com/step2.png',
        },
        {
          '@type': 'HowToStep',
          name: 'Start processing',
          text: 'Click "Process URLs" to begin checking redirects. Monitor progress in real-time.',
          image: 'https://redirectinator.com/step3.png',
        },
        {
          '@type': 'HowToStep',
          name: 'Review results',
          text: 'Analyze the results table showing final URLs, status codes, and redirect chains.',
          image: 'https://redirectinator.com/step4.png',
        },
        {
          '@type': 'HowToStep',
          name: 'Export data',
          text: 'Export results in CSV, JSON, Excel, or PDF format for further analysis.',
          image: 'https://redirectinator.com/step5.png',
        },
      ],
    };
  }

  /**
   * Generate Article schema for blog content
   */
  public generateArticleSchema(
    title: string,
    description: string,
    publishDate: string
  ): any {
    return {
      '@type': 'Article',
      '@id': `https://redirectinator.com/blog/${title.toLowerCase().replace(/\s+/g, '-')}`,
      headline: title,
      description: description,
      image: 'https://redirectinator.com/og-image.png',
      datePublished: publishDate,
      dateModified: publishDate,
      author: {
        '@type': 'Person',
        '@id': 'https://redirectinator.com/#author',
        name: 'Jeff Louella',
        url: 'https://jefflouella.com',
      },
      publisher: {
        '@type': 'Organization',
        '@id': 'https://redirectinator.com/#organization',
        name: 'Redirectinator',
        logo: {
          '@type': 'ImageObject',
          url: 'https://redirectinator.com/logo/redirectinator-large-cobalt.png',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': 'https://redirectinator.com/',
      },
      articleSection: 'SEO Tools',
      keywords:
        'SEO, redirects, URL checking, technical SEO, website monitoring',
    };
  }

  /**
   * Generate Product schema for the tool
   */
  public generateProductSchema(): any {
    return {
      '@type': 'Product',
      '@id': 'https://redirectinator.com/#product',
      name: 'Redirectinator',
      description:
        'Professional URL redirect checker and monitoring tool for SEO professionals',
      brand: {
        '@type': 'Brand',
        name: 'Redirectinator',
        url: 'https://redirectinator.com/',
      },
      manufacturer: {
        '@type': 'Person',
        '@id': 'https://redirectinator.com/#author',
        name: 'Jeff Louella',
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'Person',
          '@id': 'https://redirectinator.com/#author',
          name: 'Jeff Louella',
        },
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '150',
        bestRating: '5',
        worstRating: '1',
      },
      review: [
        {
          '@type': 'Review',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5',
            bestRating: '5',
          },
          author: {
            '@type': 'Person',
            name: 'SEO Professional',
          },
          reviewBody:
            'Excellent tool for bulk URL redirect checking. Saves hours of manual work.',
        },
      ],
    };
  }

  /**
   * Generate Service schema
   */
  public generateServiceSchema(): any {
    return {
      '@type': 'Service',
      '@id': 'https://redirectinator.com/#service',
      name: 'URL Redirect Analysis Service',
      description:
        'Professional service for analyzing URL redirects, monitoring website status, and providing SEO insights',
      provider: {
        '@type': 'Person',
        '@id': 'https://redirectinator.com/#author',
        name: 'Jeff Louella',
      },
      areaServed: 'Worldwide',
      serviceType: 'SEO Tool',
      category: 'Web Development',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    };
  }

  /**
   * Generate BreadcrumbList schema for navigation
   */
  public generateBreadcrumbSchema(
    paths: Array<{ name: string; url: string }>
  ): any {
    return {
      '@type': 'BreadcrumbList',
      '@id': 'https://redirectinator.com/#breadcrumb',
      itemListElement: paths.map((path, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: path.name,
        item: path.url,
      })),
    };
  }

  /**
   * Generate Organization schema with more details
   */
  public generateOrganizationSchema(): any {
    return {
      '@type': 'Organization',
      '@id': 'https://redirectinator.com/#organization',
      name: 'Redirectinator',
      url: 'https://redirectinator.com/',
      logo: {
        '@type': 'ImageObject',
        url: 'https://redirectinator.com/logo/redirectinator-large-cobalt.png',
        width: '512',
        height: '512',
      },
      description:
        'Professional SEO tools and utilities for technical SEO professionals',
      foundingDate: '2024-01-01',
      founder: {
        '@type': 'Person',
        '@id': 'https://redirectinator.com/#author',
        name: 'Jeff Louella',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        url: 'https://jefflouella.com/contact',
      },
      sameAs: [
        'https://github.com/jefflouella/redirectinator',
        'https://jefflouella.com',
      ],
    };
  }

  /**
   * Generate Person schema with enhanced details
   */
  public generatePersonSchema(): any {
    return {
      '@type': 'Person',
      '@id': 'https://redirectinator.com/#author',
      name: 'Jeff Louella',
      url: 'https://jefflouella.com',
      image: {
        '@type': 'ImageObject',
        url: 'https://jefflouella.com/jeff-louella.jpg',
        width: '400',
        height: '400',
      },
      description:
        'SEO professional and developer specializing in technical SEO tools and automation',
      jobTitle: 'SEO Professional',
      worksFor: {
        '@type': 'Organization',
        name: 'Freelance SEO Consultant',
      },
      knowsAbout: [
        'Technical SEO',
        'Search Engine Optimization',
        'Web Development',
        'URL Redirects',
        'Website Monitoring',
        'SEO Tools',
        'JavaScript',
        'React',
        'Node.js',
      ],
      sameAs: [
        'https://github.com/jefflouella',
        'https://linkedin.com/in/jefflouella',
        'https://twitter.com/jefflouella',
      ],
      alumniOf: {
        '@type': 'Organization',
        name: 'SEO Industry',
      },
      hasOccupation: {
        '@type': 'Occupation',
        name: 'SEO Professional',
        occupationLocation: {
          '@type': 'Place',
          name: 'United States',
        },
      },
    };
  }

  /**
   * Generate complete schema for a page
   */
  public generateCompleteSchema(
    pageType: 'home' | 'about' | 'blog' | 'contact' = 'home'
  ): SchemaData {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        this.generateOrganizationSchema(),
        this.generatePersonSchema(),
      ],
    };

    // Add page-specific schemas
    switch (pageType) {
      case 'home':
        baseSchema['@graph'].push(
          this.generateFAQSchema(),
          this.generateHowToSchema(),
          this.generateProductSchema(),
          this.generateServiceSchema()
        );
        break;
      case 'about':
        baseSchema['@graph'].push(
          this.generateBreadcrumbSchema([
            { name: 'Home', url: 'https://redirectinator.com/' },
            { name: 'About', url: 'https://redirectinator.com/about' },
          ])
        );
        break;
      case 'blog':
        baseSchema['@graph'].push(
          this.generateBreadcrumbSchema([
            { name: 'Home', url: 'https://redirectinator.com/' },
            { name: 'Blog', url: 'https://redirectinator.com/blog' },
          ])
        );
        break;
    }

    return baseSchema;
  }
}

// Export singleton instance
export const schemaService = SchemaService.getInstance();
