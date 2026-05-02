// src/utils/websiteExtractor.js - Additional utility functions

/**
 * Enhanced content extraction utilities
 */

export const ContentExtractorUtils = {
  
  // Clean and normalize text content
  cleanText: (text) => {
    return text
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();
  },

  // Extract specific content types
  extractSpecificContent: (doc, contentType) => {
    const extractors = {
      // Extract all headings with their hierarchy
      headings: () => {
        const headings = [];
        const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        headingElements.forEach((heading, index) => {
          headings.push({
            level: parseInt(heading.tagName.charAt(1)),
            text: heading.textContent.trim(),
            id: heading.id || `heading-${index}`,
            tag: heading.tagName.toLowerCase()
          });
        });
        
        return headings;
      },

      // Extract all paragraphs with context
      paragraphs: () => {
        const paragraphs = [];
        const pElements = doc.querySelectorAll('p');
        
        pElements.forEach((p, index) => {
          const text = p.textContent.trim();
          if (text) {
            // Find the closest heading before this paragraph
            let precedingHeading = null;
            let current = p.previousElementSibling;
            
            while (current) {
              if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(current.tagName)) {
                precedingHeading = {
                  level: parseInt(current.tagName.charAt(1)),
                  text: current.textContent.trim(),
                  tag: current.tagName.toLowerCase()
                };
                break;
              }
              current = current.previousElementSibling;
            }
            
            paragraphs.push({
              index,
              text,
              wordCount: text.split(/\s+/).length,
              precedingHeading,
              html: p.innerHTML
            });
          }
        });
        
        return paragraphs;
      },

      // Extract all images with detailed information
      images: () => {
        const images = [];
        const imgElements = doc.querySelectorAll('img');
        
        imgElements.forEach((img, index) => {
          const src = img.getAttribute('src');
          if (src) {
            images.push({
              index,
              src: src.startsWith('http') ? src : new URL(src, window.location.href).href,
              alt: img.getAttribute('alt') || '',
              title: img.getAttribute('title') || '',
              width: img.getAttribute('width') || img.naturalWidth || null,
              height: img.getAttribute('height') || img.naturalHeight || null,
              loading: img.getAttribute('loading') || '',
              className: img.className || '',
              parentContext: img.parentElement?.tagName.toLowerCase() || null
            });
          }
        });
        
        return images;
      },

      // Extract all links with categorization
      links: () => {
        const links = [];
        const linkElements = doc.querySelectorAll('a[href]');
        
        linkElements.forEach((link, index) => {
          const href = link.getAttribute('href');
          const text = link.textContent.trim();
          
          if (href && text) {
            const fullUrl = href.startsWith('http') ? href : new URL(href, window.location.href).href;
            const isExternal = !fullUrl.includes(window.location.hostname);
            const isEmail = href.startsWith('mailto:');
            const isTel = href.startsWith('tel:');
            
            links.push({
              index,
              text,
              href: fullUrl,
              isExternal,
              isEmail,
              isTel,
              target: link.getAttribute('target') || '',
              rel: link.getAttribute('rel') || '',
              title: link.getAttribute('title') || ''
            });
          }
        });
        
        return links;
      },

      // Extract tables with structure
      tables: () => {
        const tables = [];
        const tableElements = doc.querySelectorAll('table');
        
        tableElements.forEach((table, index) => {
          const headers = [];
          const rows = [];
          
          // Extract headers
          const headerCells = table.querySelectorAll('th');
          headerCells.forEach(th => {
            headers.push(th.textContent.trim());
          });
          
          // Extract rows
          const rowElements = table.querySelectorAll('tbody tr, tr');
          rowElements.forEach(row => {
            const cells = [];
            const cellElements = row.querySelectorAll('td, th');
            cellElements.forEach(cell => {
              cells.push(cell.textContent.trim());
            });
            if (cells.length > 0) {
              rows.push(cells);
            }
          });
          
          if (rows.length > 0) {
            tables.push({
              index,
              headers,
              rows,
              caption: table.querySelector('caption')?.textContent.trim() || ''
            });
          }
        });
        
        return tables;
      },

      // Extract lists with nested structure
      lists: () => {
        const lists = [];
        const listElements = doc.querySelectorAll('ul, ol');
        
        listElements.forEach((list, index) => {
          const items = [];
          const listItems = list.querySelectorAll('li');
          
          listItems.forEach(li => {
            const text = li.textContent.trim();
            const hasNestedList = li.querySelector('ul, ol') !== null;
            
            items.push({
              text,
              hasNestedList,
              html: li.innerHTML
            });
          });
          
          if (items.length > 0) {
            lists.push({
              index,
              type: list.tagName.toLowerCase(),
              ordered: list.tagName === 'OL',
              items,
              className: list.className || ''
            });
          }
        });
        
        return lists;
      }
    };

    return extractors[contentType] ? extractors[contentType]() : [];
  },

  // Generate content outline/table of contents
  generateOutline: (headings) => {
    const outline = [];
    const stack = [];

    headings.forEach(heading => {
      // Pop items from stack until we find a parent level
      while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
        stack.pop();
      }

      const outlineItem = {
        ...heading,
        children: [],
        depth: stack.length
      };

      if (stack.length === 0) {
        outline.push(outlineItem);
      } else {
        stack[stack.length - 1].children.push(outlineItem);
      }

      stack.push(outlineItem);
    });

    return outline;
  },

  // Analyze content quality and SEO metrics
  analyzeContent: (extractedData) => {
    const analysis = {
      seo: {},
      readability: {},
      structure: {}
    };

    // SEO Analysis
    analysis.seo = {
      hasTitle: !!extractedData.meta.title,
      titleLength: extractedData.meta.title?.length || 0,
      titleOptimal: extractedData.meta.title?.length >= 30 && extractedData.meta.title?.length <= 60,
      
      hasDescription: !!extractedData.meta.description,
      descriptionLength: extractedData.meta.description?.length || 0,
      descriptionOptimal: extractedData.meta.description?.length >= 120 && extractedData.meta.description?.length <= 160,
      
      hasKeywords: !!extractedData.meta.keywords,
      hasOgTags: !!(extractedData.meta.ogTitle || extractedData.meta.ogDescription || extractedData.meta.ogImage),
      hasTwitterCards: !!(extractedData.meta.twitterTitle || extractedData.meta.twitterDescription),
      hasCanonical: !!extractedData.meta.canonical,
      
      h1Count: extractedData.content.filter(item => item.type === 'heading' && item.level === 1).length,
      hasProperH1: extractedData.content.filter(item => item.type === 'heading' && item.level === 1).length === 1,
      
      imageCount: extractedData.statistics.imageCount,
      imagesWithAlt: 0 // Would need to calculate from actual image data
    };

    // Readability Analysis
    const allText = extractedData.content
      .flatMap(item => [item.content, ...(item.children?.map(child => child.content) || [])])
      .filter(Boolean)
      .join(' ');

    const sentences = allText.split(/[.!?]+/).filter(Boolean);
    const avgWordsPerSentence = extractedData.statistics.wordCount / sentences.length || 0;

    analysis.readability = {
      wordCount: extractedData.statistics.wordCount,
      sentenceCount: sentences.length,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      readingTimeMinutes: Math.ceil(extractedData.statistics.wordCount / 200),
      complexityScore: avgWordsPerSentence > 20 ? 'Hard' : avgWordsPerSentence > 15 ? 'Medium' : 'Easy'
    };

    // Structure Analysis
    const headingLevels = extractedData.content
      .filter(item => item.type === 'heading')
      .map(item => item.level);

    analysis.structure = {
      headingCount: extractedData.statistics.headingCount,
      paragraphCount: extractedData.statistics.paragraphCount,
      hasLogicalHeadingOrder: this.checkHeadingOrder(headingLevels),
      contentDepth: headingLevels.length > 0 ? Math.max(...headingLevels) : 0,
      avgParagraphsPerSection: Math.round((extractedData.statistics.paragraphCount / Math.max(extractedData.statistics.headingCount, 1)) * 10) / 10
    };

    return analysis;
  },

  // Check if headings follow logical order (H1 -> H2 -> H3, etc.)
  checkHeadingOrder: (levels) => {
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] > levels[i - 1] + 1) {
        return false; // Skipped a level (e.g., H1 -> H3)
      }
    }
    return true;
  },

  // Export content in different formats
  exportFormats: {
    // Markdown format
    toMarkdown: (extractedData) => {
      let markdown = '';
      
      // Add title
      if (extractedData.meta.title) {
        markdown += `# ${extractedData.meta.title}\n\n`;
      }
      
      // Add meta description
      if (extractedData.meta.description) {
        markdown += `> ${extractedData.meta.description}\n\n`;
      }
      
      // Process content
      extractedData.content.forEach(item => {
        if (item.type === 'heading') {
          markdown += `${'#'.repeat(item.level)} ${item.content}\n\n`;
          
          // Add children content
          if (item.children) {
            item.children.forEach(child => {
              if (child.type === 'paragraph') {
                markdown += `${child.content}\n\n`;
              } else if (child.type === 'list') {
                child.items.forEach(listItem => {
                  markdown += `${child.ordered ? '1.' : '-'} ${listItem}\n`;
                });
                markdown += '\n';
              } else if (child.type === 'image') {
                markdown += `![${child.alt}](${child.src})\n\n`;
              }
            });
          }
        } else if (item.type === 'paragraph') {
          markdown += `${item.content}\n\n`;
        } else if (item.type === 'list') {
          item.items.forEach(listItem => {
            markdown += `${item.ordered ? '1.' : '-'} ${listItem}\n`;
          });
          markdown += '\n';
        } else if (item.type === 'image') {
          markdown += `![${item.alt}](${item.src})\n\n`;
        }
      });
      
      return markdown;
    },

    // Plain text format with structure
    toPlainText: (extractedData) => {
      let text = '';
      
      if (extractedData.meta.title) {
        text += `${extractedData.meta.title.toUpperCase()}\n`;
        text += '='.repeat(extractedData.meta.title.length) + '\n\n';
      }
      
      extractedData.content.forEach(item => {
        if (item.type === 'heading') {
          text += `${'  '.repeat(item.level - 1)}${item.content}\n`;
          text += `${'  '.repeat(item.level - 1)}${'-'.repeat(item.content.length)}\n\n`;
          
          if (item.children) {
            item.children.forEach(child => {
              if (child.type === 'paragraph') {
                text += `${child.content}\n\n`;
              } else if (child.type === 'list') {
                child.items.forEach((listItem, index) => {
                  text += `  ${child.ordered ? `${index + 1}.` : '•'} ${listItem}\n`;
                });
                text += '\n';
              }
            });
          }
        } else if (item.type === 'paragraph') {
          text += `${item.content}\n\n`;
        }
      });
      
      return text;
    },

    // CSV format for tabular data export
    toCSV: (extractedData) => {
      const csvLines = [
        'Type,Level,Content,Word Count'
      ];
      
      extractedData.content.forEach(item => {
        const wordCount = item.content ? item.content.split(/\s+/).length : 0;
        const content = (item.content || '').replace(/"/g, '""'); // Escape quotes
        csvLines.push(`"${item.type}","${item.level || ''}","${content}","${wordCount}"`);
        
        if (item.children) {
          item.children.forEach(child => {
            const childWordCount = child.content ? child.content.split(/\s+/).length : 0;
            const childContent = (child.content || '').replace(/"/g, '""');
            csvLines.push(`"${child.type}","","${childContent}","${childWordCount}"`);
          });
        }
      });
      
      return csvLines.join('\n');
    }
  }
};

// Usage example in the main component:
/*
// Add these methods to your WebsiteContentExtractor component:

const analyzeExtractedContent = () => {
  if (!extractedData) return;
  
  const analysis = ContentExtractorUtils.analyzeContent(extractedData);
  console.log('Content Analysis:', analysis);
  // Display analysis results in UI
};

const exportAsMarkdown = () => {
  if (!extractedData) return;
  
  const markdown = ContentExtractorUtils.exportFormats.toMarkdown(extractedData);
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `content_${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const generateContentOutline = () => {
  if (!extractedData) return;
  
  const headings = extractedData.content.filter(item => item.type === 'heading');
  const outline = ContentExtractorUtils.generateOutline(headings);
  console.log('Content Outline:', outline);
  // Display outline in UI
};
*/