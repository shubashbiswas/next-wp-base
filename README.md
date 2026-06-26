# next-wp

A production-ready starter template for building WordPress sites with Next.js.

## Features

- ✅ Production-ready headless WordPress architecture
- ✅ Modern Next.js 16 App Router with TypeScript
- ✅ Comprehensive SEO implementation (Open Graph, JSON-LD, XML Sitemap, RSS)
- ✅ ISR with automatic cache invalidation via webhooks
- ✅ Responsive design with Tailwind CSS and Craft Design System
- ✅ Dockerized for local development and production deployment
- ✅ Built-in CI/CD ready with GitHub Actions
- ✅ Performance optimized with image optimization and server components
- ✅ Full TypeScript support with WordPress API types
- ✅ Unit tests for core functionality

## Architecture

This project implements a headless WordPress architecture where:
1. **WordPress** serves as the CMS with REST API enabled
2. **Next.js** acts as the frontend with ISR caching
3. **Revalidation** happens automatically via webhook-based system

### Deployment Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   WordPress     │────│ Next.js Revalidate│───▶│   Next.js App   │
│    7.0          │    │   Plugin         │    │   (Next.js 16)  │
│                 │    │                  │    │                 │
│  MariaDB 11.4   │    │  Background      │    │  ISR Caching    │
│                 │    │  Workers         │    │  + CDN          │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                            │                        │
                            ▼                        ▼
                    ┌──────────────────┐   ┌──────────────────┐
                    │ WordPress Admin  │   │   Client Browser  │
                    │     (WP-Admin)   │   │                   │
                    └──────────────────┘   └──────────────────┘
```

### Caching Flow

```
┌─────────────┐
│   Content   │
│  Creation   │
│   Event     │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ WordPress        │
│ Admin / REST API │
└──────┬───────────┘
       │
       ▼
┌──────────────────────┐
│ Next.js Revalidate   │
│ Plugin (Async)       │
│ Background Workers   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────┐
│ WordPress Webhook Handler    │
│ /api/revalidate              │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Next.js App                  │
│ revalidateTag() /           │
│ revalidatePath()             │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ ISR Cache Invalidation       │
│ (Next.js)                    │
└──────────────────────────────┘
```

## Routing Configuration

### Content Listing Pages

The project includes listing pages for WordPress content types at the following paths:
- `/posts/categories` - Browse all categories
- `/posts/tags` - Browse all tags
- `/posts/authors` - Browse all authors

### Known Issue: Redirect Conflicts *(Resolved)*

**Problem**: The listing pages above were returning 404 errors.

**Root Cause**: A catch-all redirect in `next.config.ts`:
```ts
{ source: "/posts/:slug", destination: "/blog/:slug", permanent: true }
```
This wildcard pattern matched ALL routes under `/posts/`, including valid listing pages, redirecting them to non-existent `/blog/` paths.

**Fix**: Removed the `/posts/:slug` redirect from `next.config.ts`. Since WordPress uses `/%postname%/` permalink format (not `/posts/slug`), this redirect was unnecessary.

**Verification**: All listing pages confirmed returning HTTP 200:
- `GET /posts/categories` → 200 ✅
- `GET /posts/tags` → 200 ✅
- `GET /posts/authors` → 200 ✅

## Getting Started

### Prerequisites

- Node.js 24+
- Docker & Docker Compose (for local development)
- WordPress 7.0 with REST API enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/9d8dev/next-wp.git
cd next-wp
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
docker compose up -d
```

5. Access the application:
- Next.js: http://localhost:3000
- WordPress: http://localhost:8080

### Environment Variables

Required environment variables:
- `WORDPRESS_URL` - WordPress site URL (e.g., http://localhost:8080)
- `WORDPRESS_HOSTNAME` - WordPress hostname for image rendering (e.g., localhost)
- `WORDPRESS_WEBHOOK_SECRET` - Secret for webhook authentication
- `ISR_CACHE_TTL` - ISR cache time-to-live in seconds (default: 3600)

## Deployment

### Production Deployment

This project is designed to be deployed using Dokploy or similar deployment platforms. The Docker configuration supports production deployment with:

1. Multi-stage Docker builds
2. Production-ready Node.js settings
3. Optimized image sizes
4. Security headers

### CI/CD Pipeline

The project includes GitHub Actions workflow for automated testing and deployment. The pipeline:
- Runs tests on every commit
- Builds and pushes Docker images to container registry
- Deploys to production environment

## WordPress Configuration

### Next.js Revalidation Plugin

This starter template uses the Next.js Revalidation plugin (2.1.0) which provides automatic cache invalidation:

1. Install the plugin in WordPress admin
2. Configure the plugin settings:
   - Set Next.js Site URL to your deployed site URL
   - Generate and set Webhook Secret
3. The plugin automatically handles:
   - Post creation/update revalidation
   - Page creation/update revalidation  
   - Taxonomy (category/tag) changes
   - Background processing for optimal performance

## SEO Features

The implementation includes comprehensive SEO features:

- Dynamic metadata generation
- Open Graph tags for social sharing
- JSON-LD structured data for search engines
- XML sitemap generation
- RSS feed support
- Canonical URLs
- Responsive design

## Performance Optimization

Key performance optimizations included:

- ISR caching with appropriate TTL settings
- Image optimization using Next.js Image component
- Server components for efficient rendering
- Minimal JavaScript bundles
- Efficient API calls with React cache
- Docker optimization for container efficiency

## Testing

Unit tests are included for core functionality:

```bash
pnpm test
```

The test suite covers:
- WordPress API functions
- Revalidation endpoints
- Metadata generation
- SEO components

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the maintainers.