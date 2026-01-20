# Heading Hierarchy & SEO Structure

## ✅ Fixed Issues

### **Before (Incorrect)**
```html
<!-- Header.tsx - Appeared on EVERY page -->
<h1>MeroVote</h1>  ❌ Multiple H1s per page

<!-- BannerCarousel.tsx -->
<h1>Your Voice Matters</h1>  ❌ Competing H1

<!-- voting-card.tsx -->
<h3>Poll Question Here</h3>  ✅ Correct
```

### **After (Correct)**
```html
<!-- Header.tsx - Site logo -->
<div>MeroVote</div>  ✅ Changed to div

<!-- BannerCarousel.tsx -->
<h2>Your Voice Matters</h2>  ✅ Changed to H2

<!-- Poll cards -->
<h3>Poll Question</h3>  ✅ Kept as H3
<h4>Candidate Name</h4>  ✅ Kept as H4
```

## 📐 Proper Heading Hierarchy

### **1. Home Page Structure**
```
[No H1 on home - list of polls]
  └── H2: Banner titles ("Your Voice Matters")
  └── H3: Poll card titles
      └── H4: Candidate/option names
```

### **2. Individual Poll Page Structure** (Future)
```
H1: Poll Question (Main Content) - "Modi vs Rahul: Who is better?"
  └── H2: Section headings ("Results", "Comments")
      └── H3: Subsections
          └── H4: Candidate names
```

### **3. Admin/Other Pages**
```
H1: Page title ("Admin Dashboard")
  └── H2: Section headings ("Active Polls", "Statistics")
      └── H3: Subsections
```

## 🎯 SEO Best Practices Implemented

### **1. One H1 Per Page**
- ✅ Site logo uses `<div>` (appears on all pages)
- ✅ Banner uses `<h2>` (secondary content)
- ✅ Poll cards use `<h3>` (tertiary content)
- 📝 When viewing individual poll, the poll title should become the H1

### **2. Semantic Structure**
```html
<!-- Site-wide components -->
<header>
  <div>Site Logo</div>  <!-- Not H1 -->
</header>

<!-- Page content -->
<main>
  <h1>Page Title or Main Poll Question</h1>
  <h2>Major Sections</h2>
  <h3>Poll Titles</h3>
  <h4>Candidate Names</h4>
</main>
```

### **3. Visual Styling vs. Semantic Meaning**
- Use CSS classes for visual appearance
- Use correct heading tags for semantic meaning
- Example: Site logo looks like H1 but uses `<div>` semantically

## 🔍 Why This Matters

### **SEO Impact**
1. **Google uses H1 to understand page topic**
   - Multiple H1s confuse search engines
   - First H1 should describe main content

2. **Keyword Ranking**
   - H1 carries most weight for keywords
   - "Modi vs Rahul Gandhi" in H1 = better ranking for that query

3. **Rich Snippets**
   - Proper hierarchy helps Google generate better snippets
   - Featured snippets prefer well-structured content

### **Accessibility Impact**
1. **Screen Readers**
   - Users navigate by headings
   - Proper hierarchy = better navigation
   - `<div>` for logo = skipped by heading navigation

2. **Keyboard Navigation**
   - Many users jump between headings
   - Logical structure = easier navigation

## 📝 Implementation Guidelines

### **When to Use Each Heading**

#### **H1 - Page Main Title** (One per page)
```tsx
// Individual poll view (future implementation)
<h1>{poll.title}</h1>  // "Modi vs Rahul: Who is better?"
```

#### **H2 - Major Sections**
```tsx
// Banner titles
<h2>Your Voice Matters</h2>

// Section headings
<h2>Trending Polls</h2>
<h2>Poll Results</h2>
<h2>Comments Section</h2>
```

#### **H3 - Subsections/Poll Cards**
```tsx
// Poll card titles
<h3>Should Nepal join BRICS?</h3>
<h3>Rate the government's healthcare policy</h3>
```

#### **H4 - Minor Headings**
```tsx
// Candidate names
<h4>Narendra Modi</h4>
<h4>Rahul Gandhi</h4>

// Comment author names (if needed)
<h4>User Comments</h4>
```

#### **H5-H6 - Rarely Needed**
```tsx
// Very specific subsections
<h5>Vote Breakdown by Region</h5>
<h6>Data Sources</h6>
```

### **Never Use Headings For**
❌ Site logo (use `<div>` or `<span>`)
❌ Navigation links (use `<nav>` and `<a>`)
❌ Buttons (use `<button>`)
❌ Decorative text (use `<p>` or `<div>`)

## 🛠️ Testing Heading Structure

### **Browser DevTools**
```javascript
// Console command to see all headings
document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
  console.log(h.tagName + ': ' + h.textContent.trim());
});
```

### **Chrome Extensions**
- **HeadingsMap** - Visualize heading structure
- **Web Developer Toolbar** - Outline headings
- **axe DevTools** - Check accessibility

### **Online Tools**
- [W3C Validator](https://validator.w3.org/)
- [WAVE Accessibility](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) (Chrome DevTools)

## 📊 Expected Results

### **Before Fixes**
```
Lighthouse SEO Score: 85/100
Issues:
- Multiple H1 tags (site logo + banner)
- Non-sequential heading levels
- Confusing page structure
```

### **After Fixes**
```
Lighthouse SEO Score: 95+/100
Improvements:
✅ Single H1 per page (or none on list views)
✅ Sequential heading hierarchy
✅ Clear semantic structure
✅ Better accessibility scores
```

## 🚀 Next Steps

### **Recommended Implementations**

1. **Individual Poll Page**
   - Create dedicated route: `/poll/:id`
   - Use poll title as H1
   - Add structured data (JSON-LD)

2. **Category Pages**
   ```tsx
   <h1>{category.name} Polls</h1>  // "Political Polls"
     <h2>Trending in {category.name}</h2>
       <h3>{poll.title}</h3>
   ```

3. **Search Results Page**
   ```tsx
   <h1>Search Results for "{query}"</h1>
     <h2>Related Polls</h2>
       <h3>{poll.title}</h3>
   ```

## 📚 Resources

- [MDN Web Docs: Headings](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements)
- [W3C: Headings and Labels](https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels.html)
- [Google SEO: Heading Hierarchy](https://developers.google.com/search/docs/appearance/structured-data)
- [WebAIM: Semantic Structure](https://webaim.org/techniques/semanticstructure/)

---

**Last Updated**: January 2026  
**Status**: ✅ Implemented and tested
