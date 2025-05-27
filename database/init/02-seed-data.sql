-- Seed data for Osprey Labs application
-- This script runs after the schema creation

-- Insert default admin user
-- Password: admin123 (hashed with bcrypt)
-- API Key: osprey-admin-2024-secure-key
INSERT INTO admin_users (
    username,
    email,
    password_hash,
    api_key,
    role,
    is_active
) VALUES (
    'admin',
    'admin@osprey-labs.com',
    '$2b$12$FUnAHWm3NWmH7M5AS0Bhnu4DtuUbgBHD4p2hs6KG6URoPYjsn/b6W', -- admin123
    'osprey-admin-2024-secure-key',
    'super_admin',
    true
);

-- Get the admin user ID for foreign key references
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id FROM admin_users WHERE username = 'admin';

    -- Insert sample articles
    INSERT INTO articles (
        title,
        slug,
        excerpt,
        content,
        author,
        status,
        tags,
        featured_image,
        read_time,
        published_at,
        created_by,
        updated_by
    ) VALUES 
    (
        'How AI is Revolutionizing Business Automation in 2024',
        'ai-revolutionizing-business-automation-2024',
        'Discover how artificial intelligence is transforming business operations, reducing costs, and driving unprecedented efficiency gains across industries.',
        '## Introduction

Artificial Intelligence is no longer a futuristic concept—it''s reshaping how businesses operate today. From automating routine tasks to providing predictive insights, AI is becoming the backbone of modern business efficiency.

In this comprehensive guide, we''ll explore the latest AI automation trends, real-world applications, and practical steps your business can take to leverage these powerful technologies.

## The Current State of AI in Business

Today''s AI landscape offers unprecedented opportunities for businesses of all sizes:

- **Cost Reduction**: AI automation can reduce operational costs by up to 40%
- **Efficiency Gains**: Automated processes run 24/7 without human intervention
- **Error Reduction**: AI systems eliminate human errors in repetitive tasks
- **Scalability**: AI solutions grow with your business needs

### Key Statistics

> "Companies implementing AI automation report an average ROI of 300% within the first year" - McKinsey Global Institute

The numbers speak for themselves:

1. **73%** of executives say AI will be critical to their business strategy
2. **60%** of companies have already implemented some form of AI automation
3. **45%** reduction in processing time for automated workflows

## Popular AI Automation Applications

### Customer Service Automation

AI chatbots and virtual assistants are transforming customer support:

- **24/7 Availability**: Customers get instant responses any time
- **Consistent Quality**: Every interaction follows best practices
- **Cost Efficiency**: Reduce support staff costs by up to 60%

### Document Processing

Intelligent document processing eliminates manual data entry:

```python
# Example: AI-powered invoice processing
def process_invoice(invoice_image):
    # Extract text using OCR
    text = extract_text(invoice_image)
    
    # Parse key information
    invoice_data = {
        ''vendor'': extract_vendor(text),
        ''amount'': extract_amount(text),
        ''date'': extract_date(text)
    }
    
    # Validate and store
    return validate_and_store(invoice_data)
```

### Predictive Analytics

AI helps businesses make data-driven decisions:

- **Sales Forecasting**: Predict future revenue with 95% accuracy
- **Inventory Management**: Optimize stock levels automatically
- **Risk Assessment**: Identify potential issues before they occur

## Implementation Strategy

### Phase 1: Assessment and Planning

Before implementing AI automation, conduct a thorough assessment:

1. **Identify Pain Points**: Where are your biggest inefficiencies?
2. **Evaluate ROI Potential**: Which processes offer the highest returns?
3. **Assess Technical Readiness**: Do you have the necessary infrastructure?

### Phase 2: Pilot Implementation

Start small with a pilot project:

- Choose a single, well-defined process
- Set clear success metrics
- Plan for 3-6 month evaluation period

### Phase 3: Scale and Optimize

Once your pilot succeeds:

- Expand to additional processes
- Integrate systems for seamless workflows
- Continuously monitor and improve performance

## Common Challenges and Solutions

### Challenge 1: Employee Resistance

**Solution**: Focus on augmentation, not replacement

- Train employees on new AI tools
- Emphasize how AI handles routine tasks so humans can focus on strategic work
- Celebrate early wins and success stories

### Challenge 2: Data Quality Issues

**Solution**: Implement robust data governance

- Clean and standardize existing data
- Establish data quality monitoring
- Create clear data entry protocols

### Challenge 3: Integration Complexity

**Solution**: Choose the right technology partners

- Work with experienced AI implementation specialists
- Use APIs and middleware for seamless integration
- Plan for gradual rollout rather than big-bang approach

---

## Real-World Success Stories

### Case Study: Manufacturing Company

A mid-sized manufacturing company implemented AI-powered quality control:

- **Result**: 50% reduction in defective products
- **Timeline**: 6 months from pilot to full implementation
- **ROI**: 250% return on investment in first year

### Case Study: Financial Services

A regional bank automated loan processing:

- **Result**: Processing time reduced from 5 days to 2 hours
- **Timeline**: 4 months implementation
- **ROI**: 400% return through increased loan volume

## Getting Started: Your Next Steps

Ready to begin your AI automation journey? Here''s your action plan:

1. **Audit Current Processes**: Identify automation opportunities
2. **Research Solutions**: Explore AI tools relevant to your industry
3. **Consult Experts**: Work with AI specialists for guidance
4. **Start Small**: Begin with a pilot project
5. **Measure Results**: Track ROI and performance metrics

### Tools and Platforms to Consider

- **Zapier**: For simple workflow automation
- **UiPath**: For robotic process automation (RPA)
- **Microsoft Power Platform**: For business process automation
- **Custom AI Solutions**: For specialized requirements

## Conclusion

AI automation isn''t just about technology—it''s about transforming how your business operates. By starting with clear goals, choosing the right tools, and focusing on employee adoption, you can achieve significant efficiency gains and cost savings.

The companies that embrace AI automation today will have a competitive advantage tomorrow. Don''t wait—start exploring how AI can revolutionize your business operations.

**Ready to get started?** Contact our team for a free AI automation assessment and discover how we can help transform your business processes.',
        'Sarah Chen',
        'published',
        ARRAY['AI', 'Business Automation', 'Technology', 'Digital Transformation'],
        '/images/business-automation.jpg',
        8,
        CURRENT_TIMESTAMP - INTERVAL '7 days',
        admin_user_id,
        admin_user_id
    ),
    (
        'Markdown Formatting Test Article',
        'markdown-formatting-test',
        'A comprehensive test of all markdown formatting features including headers, lists, code blocks, links, and more.',
        '# Main Heading (H1)

This is a test article to demonstrate all markdown formatting capabilities.

## Section Heading (H2)

This section shows basic text formatting and **bold text** with *italic text* and ***bold italic text***.

### Subsection (H3)

Here''s some `inline code` and a [link to Google](https://google.com).

#### Minor Heading (H4)

Let''s test some lists:

**Unordered List:**
- First item with **bold text**
- Second item with *italic text*
- Third item with `inline code`
- Fourth item with [a link](https://example.com)

**Ordered List:**
1. First numbered item
2. Second numbered item
3. Third numbered item

## Code Examples

Here''s a JavaScript code block:

```javascript
function greetUser(name) {
  console.log(`Hello, ${name}!`);
  return `Welcome to our platform, ${name}`;
}

// Usage example
const message = greetUser("John");
console.log(message);
```

And here''s a Python example:

```python
def calculate_roi(investment, returns):
    """Calculate return on investment percentage"""
    if investment == 0:
        return 0
    
    roi = ((returns - investment) / investment) * 100
    return round(roi, 2)

# Example usage
initial_investment = 10000
final_returns = 13000
roi_percentage = calculate_roi(initial_investment, final_returns)
print(f"ROI: {roi_percentage}%")
```

## Quotes and Callouts

> This is a blockquote that spans multiple lines.
> It can contain **bold text**, *italic text*, and even `inline code`.
> Perfect for highlighting important information or quotes.

## Advanced Formatting

Here''s a horizontal rule:

---

And here''s some more content after the rule.

### Mixed Content Example

This paragraph contains:
- **Bold text** for emphasis
- *Italic text* for subtle highlighting  
- `Code snippets` for technical terms
- [External links](https://osprey-labs.com) for references
- ***Bold and italic*** for maximum emphasis

## Technical Documentation

When documenting APIs, you might write:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Or show configuration files:

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

## Conclusion

This article demonstrates comprehensive markdown support including:

1. **Headers** (H1 through H4)
2. **Text formatting** (bold, italic, combined)
3. **Lists** (ordered and unordered)
4. **Code blocks** with syntax highlighting
5. **Inline code** formatting
6. **Links** (internal and external)
7. **Blockquotes** for emphasis
8. **Horizontal rules** for section breaks

All of these elements should render properly with the enhanced markdown processor!',
        'Tech Team',
        'published',
        ARRAY['Markdown', 'Testing', 'Documentation', 'Formatting'],
        '/images/markdown-test.jpg',
        5,
        CURRENT_TIMESTAMP - INTERVAL '2 days',
        admin_user_id,
        admin_user_id
    );

    -- Insert sample contact submission
    INSERT INTO contact_submissions (
        name,
        email,
        company,
        message,
        status,
        ip_address,
        user_agent
    ) VALUES (
        'John Smith',
        'john.smith@example.com',
        'Tech Solutions Inc.',
        'Hi, I''m interested in learning more about your AI automation services. Could we schedule a consultation?',
        'new',
        '192.168.1.100',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    );

    -- Insert sample job application
    INSERT INTO job_applications (
        first_name,
        last_name,
        email,
        phone,
        position,
        experience_level,
        cover_letter,
        linkedin_url,
        status,
        ip_address,
        user_agent
    ) VALUES (
        'Jane',
        'Doe',
        'jane.doe@example.com',
        '+1-555-0123',
        'Full Stack Developer',
        'Mid-level (3-5 years)',
        'I am excited to apply for the Full Stack Developer position at Osprey Labs. With 4 years of experience in React, Node.js, and PostgreSQL, I believe I would be a great fit for your team.',
        'https://linkedin.com/in/janedoe',
        'new',
        '192.168.1.101',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );

    -- Insert sample chat log
    INSERT INTO chat_logs (
        thread_id,
        user_message,
        assistant_response,
        ip_address,
        user_agent
    ) VALUES (
        'thread_' || extract(epoch from now())::text,
        'Hello, can you tell me about your services?',
        'Hello! I''d be happy to help you learn about Osprey Labs services. We specialize in AI solutions, business process automation, and custom software development. What specific area are you most interested in?',
        '192.168.1.102',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
    );

END $$; 