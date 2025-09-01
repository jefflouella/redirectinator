import { useEffect } from 'react';
import { schemaService } from '@/services/schemaService';

export const useSchema = (pageType: 'home' | 'about' | 'blog' | 'contact' = 'home') => {
  useEffect(() => {
    // Generate and inject schema for the current page
    const schema = schemaService.generateCompleteSchema(pageType);
    
    // Remove existing schema script if present
    const existingSchema = document.querySelector('script[data-schema="dynamic"]');
    if (existingSchema) {
      existingSchema.remove();
    }
    
    // Create new schema script
    const schemaScript = document.createElement('script');
    schemaScript.setAttribute('type', 'application/ld+json');
    schemaScript.setAttribute('data-schema', 'dynamic');
    schemaScript.textContent = JSON.stringify(schema, null, 2);
    
    // Inject into head
    document.head.appendChild(schemaScript);
    
    // Cleanup on unmount
    return () => {
      const script = document.querySelector('script[data-schema="dynamic"]');
      if (script) {
        script.remove();
      }
    };
  }, [pageType]);
};

export const useArticleSchema = (title: string, description: string, publishDate: string) => {
  useEffect(() => {
    const articleSchema = schemaService.generateArticleSchema(title, description, publishDate);
    
    // Remove existing article schema if present
    const existingSchema = document.querySelector('script[data-schema="article"]');
    if (existingSchema) {
      existingSchema.remove();
    }
    
    // Create new article schema script
    const schemaScript = document.createElement('script');
    schemaScript.setAttribute('type', 'application/ld+json');
    schemaScript.setAttribute('data-schema', 'article');
    schemaScript.textContent = JSON.stringify(articleSchema, null, 2);
    
    // Inject into head
    document.head.appendChild(schemaScript);
    
    // Cleanup on unmount
    return () => {
      const script = document.querySelector('script[data-schema="article"]');
      if (script) {
        script.remove();
      }
    };
  }, [title, description, publishDate]);
};
