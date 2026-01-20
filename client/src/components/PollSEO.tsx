import { Helmet } from 'react-helmet-async';
import { AggregatedPoll } from '@/services/polls.service';

interface PollSEOProps {
  poll: AggregatedPoll;
}

/**
 * PollSEO Component
 * Dynamically updates page title, meta description, and Open Graph tags
 * based on the poll data for better SEO and social sharing
 */
export default function PollSEO({ poll }: PollSEOProps) {
  // Extract candidate/party names for description
  const getCandidatesDescription = (): string => {
    const candidates = (poll as any)?.candidates;
    if (candidates && candidates.length > 0) {
      const names = candidates.map((c: any) => c.name).slice(0, 3);
      if (names.length === 2) {
        return `${names[0]} vs ${names[1]}`;
      } else if (names.length > 2) {
        return names.join(', ');
      }
      return names[0] || '';
    }
    return '';
  };

  // Generate dynamic title (under 60 chars for SEO)
  const pageTitle = `${poll.title.slice(0, 50)}${poll.title.length > 50 ? '...' : ''} | MeroVote`;

  // Generate meta description (under 160 chars)
  const candidatesDesc = getCandidatesDescription();
  const metaDescription = candidatesDesc
    ? `Vote on: ${poll.title}. ${candidatesDesc}. Join thousands in shaping public opinion on this 2026 political poll.`
    : `Vote on: ${poll.title}. Join thousands in shaping public opinion on key 2026 political issues and policies.`;

  // Truncate description to 160 chars
  const truncatedDescription = metaDescription.slice(0, 157) + (metaDescription.length > 157 ? '...' : '');

  // Open Graph image - use poll media or default
  const ogImage = poll.mediaUrl || `${window.location.origin}/assets/icons/android-chrome-512x512.png`;

  // Generate canonical URL
  const canonicalUrl = `${window.location.origin}/poll/${poll.id}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={truncatedDescription} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={truncatedDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="MeroVote - Political Polling Platform" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={truncatedDescription} />
      <meta property="twitter:image" content={ogImage} />

      {/* Additional SEO Tags */}
      <meta name="keywords" content={`2026 election, political poll, public opinion, ${candidatesDesc}, Nepal politics, voting`} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Poll-specific metadata */}
      <meta property="og:updated_time" content={new Date(poll.updatedAt || poll.startDate).toISOString()} />
      <meta property="article:published_time" content={new Date(poll.startDate).toISOString()} />
      <meta property="article:expiration_time" content={new Date(poll.endDate).toISOString()} />
    </Helmet>
  );
}
