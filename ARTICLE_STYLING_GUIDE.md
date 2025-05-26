# Article Styling Guide

This guide shows you how to format articles for the best presentation in your Osprey Labs website.

## Content Structure Best Practices

### 1. **Article Hierarchy**
```
Title (handled automatically by the page)
├── Excerpt (optional but recommended)
├── Introduction paragraph
├── Main sections (H2)
│   ├── Subsections (H3)
│   ├── Content paragraphs
│   └── Lists, quotes, code blocks
└── Conclusion
```

### 2. **Recommended Article Length**
- **Short articles**: 500-800 words (2-3 min read)
- **Medium articles**: 800-1500 words (3-6 min read)
- **Long articles**: 1500+ words (6+ min read)

## Enhanced Markdown Formatting

### Headers
```
# Main Heading (H1) - Use sparingly in content
## Section Heading (H2) - Use for major sections
### Subsection (H3) - Use for subsections
#### Minor Heading (H4) - Use for sub-subsections
```

### Text Formatting
```
**Bold text** for emphasis
*Italic text* for subtle emphasis
***Bold and italic*** for maximum emphasis
`inline code` for technical terms
```

### Lists
```
Unordered lists:
- First item
- Second item with **bold text**
- Third item with *italic text*
- Fourth item with `inline code`

Ordered lists:
1. First step
2. Second step
3. Third step
```

### Links
```
[Link text](https://example.com) - External links open in new tab
[Internal link](/articles) - Internal navigation
```

### Quotes
```
> This is a blockquote that can span multiple lines.
> It can contain **bold text**, *italic text*, and `inline code`.
> Perfect for highlighting important quotes or statistics.
```

### Code Blocks with Language Support
````
```javascript
function example() {
  console.log("JavaScript code with syntax highlighting");
  return "Displays 'JavaScript' label in top-right";
}
```

```python
def example():
    """Python code with syntax highlighting"""
    print("Displays 'Python' label in top-right")
    return "Enhanced formatting"
```

```bash
# Shell commands with syntax highlighting
npm install
npm run dev
```

```json
{
  "name": "Configuration files",
  "version": "1.0.0",
  "description": "JSON with proper formatting"
}
```
````

### Horizontal Rules
```
---
```

## Visual Elements

### Featured Images
- **Recommended size**: 1200x630px (16:9 aspect ratio)
- **Format**: JPG or PNG
- **File size**: Under 500KB for fast loading
- **Path examples**:
  - `/images/article-featured.jpg`
  - `/images/ai-automation-hero.png`

### Inline Images
Place images in your content using standard HTML:
```html
<img src="/images/diagram.png" alt="Process diagram" />
```

## Content Guidelines

### 1. **Opening Paragraph**
- Make it engaging and hook the reader
- The first paragraph gets special styling (larger text)
- Summarize what the reader will learn

### 2. **Section Structure**
- Use H2 for main sections
- Keep sections focused on one main idea
- Use H3 for subsections when needed

### 3. **Paragraph Length**
- Keep paragraphs 2-4 sentences
- Use double line breaks to separate paragraphs
- Each paragraph should have one main point

### 4. **Lists and Bullets**
- Use lists to break up dense content
- Bullet points for unordered information
- Numbered lists for step-by-step processes
- Mix formatting within list items (bold, italic, code, links)

### 5. **Code and Technical Content**
- Use `inline code` for technical terms
- Use code blocks for longer examples
- Specify language for syntax highlighting: `javascript`, `python`, `bash`, `json`, `html`, `css`
- Language labels appear automatically in the top-right corner

## Example Well-Formatted Article

```
# Main Article Title (if needed in content)

## Introduction

Start with a compelling hook that draws readers in. This paragraph gets special styling to make it stand out.

The rest of your introduction should set up what the reader will learn and why it matters to them.

## The Current State of Technology

Today's businesses face several challenges:

- **Challenge 1**: Brief description with emphasis
- **Challenge 2**: Another challenge with *subtle emphasis*
- **Challenge 3**: Technical challenge with `code terms`
- **Challenge 4**: Reference with [external link](https://example.com)

### Specific Example

Here's how this plays out in practice:

> "Quote from an expert or important statistic that supports your point"
> 
> This blockquote can span multiple lines and include **formatting**.

When implementing solutions, companies typically follow this process:

1. **Assessment Phase**: Evaluate current systems
2. **Planning Phase**: Design the solution architecture  
3. **Implementation Phase**: Deploy and configure
4. **Testing Phase**: Validate functionality

## Technical Implementation

For developers working with APIs, here's a basic example:

```javascript
async function fetchData() {
  try {
    const response = await fetch('/api/articles');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Key Considerations

When implementing this approach, keep in mind:

- **Performance**: Optimize for speed and efficiency
- **Security**: Always validate inputs and sanitize outputs
- **Scalability**: Design for future growth

---

## Conclusion

Wrap up your article with a strong conclusion that:
- Summarizes the key points
- Provides actionable next steps
- Encourages reader engagement
```

## Enhanced Features

### 1. **Improved Code Blocks**
- Language detection and labeling
- Better syntax highlighting preparation
- Support for: JavaScript, Python, TypeScript, HTML, CSS, Bash, JSON
- Automatic language labels in top-right corner

### 2. **Better List Processing**
- Proper nesting and formatting
- Support for mixed content in list items
- Automatic list type detection

### 3. **Enhanced Link Handling**
- External links open in new tabs
- Proper security attributes (noopener, noreferrer)
- Internal links for site navigation

### 4. **Improved Text Processing**
- Better bold/italic combination handling
- Proper paragraph separation
- Enhanced blockquote formatting

### 5. **Robust Content Protection**
- Code blocks protected during processing
- Inline code preserved correctly
- Proper order of operations for formatting

## SEO and Readability Tips

### 1. **Title Optimization**
- Keep titles under 60 characters
- Include primary keywords
- Make it compelling and clickable

### 2. **Excerpt Writing**
- 150-160 characters ideal
- Summarize the article's value
- Include a call-to-action

### 3. **Tag Strategy**
- Use 3-5 relevant tags
- Mix broad and specific tags
- Examples: "AI", "Business Automation", "Tutorial", "Case Study"

### 4. **Content Flow**
- Use transition sentences between sections
- Include internal links to related articles
- Break up long sections with subheadings

## Advanced Styling Options

### Special Content Blocks
You can use HTML classes for special callouts:

```html
<div class="callout">
  <p>This is a general information callout</p>
</div>

<div class="callout-warning">
  <p>This is a warning or caution</p>
</div>

<div class="callout-success">
  <p>This highlights a success or positive outcome</p>
</div>

<div class="callout-error">
  <p>This indicates an error or problem</p>
</div>
```

### Drop Cap Effect
For a dramatic opening, add the `drop-cap` class to your first paragraph:

```html
<p class="drop-cap">This paragraph will have a large decorative first letter.</p>
```

## Content Planning Template

Use this template when planning your articles:

```
Title: [Your compelling title]
Excerpt: [Brief summary that hooks readers]
Tags: [3-5 relevant tags]
Featured Image: [Path to your hero image]

## Outline:
1. Introduction (hook + preview)
2. Problem/Context (what challenge does this address?)
3. Solution/Method (your main content)
4. Examples/Case Studies (real-world applications)
5. Implementation (how-to steps if applicable)
6. Conclusion (summary + next steps)

Target Length: [500-1500 words]
Target Audience: [Who is this for?]
Key Takeaways: [3 main points readers should remember]
```

## Quality Checklist

Before publishing, ensure your article has:

- [ ] Compelling title and excerpt
- [ ] Clear structure with proper headings
- [ ] Engaging opening paragraph
- [ ] Relevant featured image
- [ ] Proper formatting (bold, italic, lists)
- [ ] Code examples with language specification
- [ ] Working links (internal and external)
- [ ] Strong conclusion
- [ ] Appropriate tags
- [ ] Proofread for grammar and spelling

## Performance Tips

### Image Optimization
- Compress images before uploading
- Use appropriate file formats (JPG for photos, PNG for graphics)
- Include descriptive alt text

### Content Length
- Aim for 3-6 minute read times for best engagement
- Use the automatic read time calculation as a guide
- Break up longer articles with subheadings and visuals

### Mobile Optimization
- Keep paragraphs short on mobile
- Use plenty of white space
- Ensure images scale properly
- Test on different screen sizes

## Testing Your Formatting

Visit the test article at `/articles/markdown-formatting-test` to see all formatting features in action. This comprehensive example demonstrates:

- All heading levels
- Text formatting combinations
- Various list types
- Code blocks with different languages
- Blockquotes with formatting
- Links and horizontal rules
- Mixed content examples

Use this as a reference when creating your own articles! 