const fs = require('fs');

const inputFile = "D:/GRAVACOES LOL/meta-folder-6/articulos 38.txt";
const blogPostsFile = "C:/pizza petaka/pizzapetaka/src/data/blogPosts.ts";

const raw = fs.readFileSync(inputFile, 'utf8');

// Parse each article block
const articleBlocks = raw.split(/=== ARTIGO \d+: [^\s]+ ===/g).slice(1);
const slugMatches = [...raw.matchAll(/=== ARTIGO \d+: ([^\s]+) ===/g)];

const articles = {};

slugMatches.forEach((match, i) => {
  const slug = match[1].trim();
  const block = articleBlocks[i];

  const contentMatch = block.match(/CONTENT:\s*([\s\S]*?)FAQ_JSON:/);
  const faqMatch = block.match(/FAQ_JSON:\s*([\s\S]*?)(?:=== FIM ARTIGO|$)/);

  if (contentMatch && faqMatch) {
    const content = contentMatch[1].trim();
    const faqRaw = faqMatch[1].trim().replace(/=== FIM ARTIGO.*$/s, '').trim();
    articles[slug] = { content, faqRaw };
  }
});

console.log('Parsed articles:', Object.keys(articles).length);

// Read and update blogPosts.ts
let blogTs = fs.readFileSync(blogPostsFile, 'utf8');

// Check if faq field exists in type
if (!blogTs.includes('faq?:')) {
  blogTs = blogTs.replace(
    'featured?: boolean;',
    'featured?: boolean;\n  faq?: object;'
  );
  console.log('Added faq field to BlogPost type');
}

// Update each article
let updatedCount = 0;
for (const [slug, { content, faqRaw }] of Object.entries(articles)) {
  // Parse FAQ JSON
  let faqObj;
  try {
    faqObj = JSON.parse(faqRaw);
  } catch (e) {
    console.warn(`Failed to parse FAQ JSON for ${slug}:`, e.message);
    continue;
  }

  const faqString = JSON.stringify(faqObj, null, 2)
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${');

  const contentEscaped = content
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${');

  // Find and replace content for this slug
  const slugPattern = new RegExp(
    `(slug: '${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'[\\s\\S]*?content: \`)([\\s\\S]*?)(\`,)`,
    'm'
  );

  if (slugPattern.test(blogTs)) {
    blogTs = blogTs.replace(slugPattern, `$1\n${contentEscaped}\n    $3`);
    updatedCount++;

    // Add or replace faq field after content
    const afterContent = new RegExp(
      `(slug: '${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'[\\s\\S]*?content: \`[\\s\\S]*?\`,)(\\s*faq: [\\s\\S]*?\\},)?`,
      'm'
    );

    if (blogTs.includes(`slug: '${slug}'`) && !blogTs.match(new RegExp(`slug: '${slug}'[\\s\\S]{0,500}faq:`))) {
      // Insert faq after content field
      blogTs = blogTs.replace(
        new RegExp(`(slug: '${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'[\\s\\S]*?content: \`[\\s\\S]*?\`,)`, 'm'),
        `$1\n    faq: ${faqString},`
      );
    }

    console.log(`✓ ${slug}`);
  } else {
    console.warn(`✗ Slug not found: ${slug}`);
  }
}

fs.writeFileSync(blogPostsFile, blogTs, 'utf8');
console.log(`\nDone. Updated ${updatedCount} articles.`);
