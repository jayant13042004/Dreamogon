import { defineCloudflareConfig } from '@opennextjs/cloudflare';

/**
 * Portable OpenNext config for Cloudflare Workers.
 * Incremental cache can later bind to R2 (NEXT_INC_CACHE_R2_BUCKET) without app rewrites.
 */
export default defineCloudflareConfig({});
