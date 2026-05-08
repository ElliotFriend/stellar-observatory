import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildOpenApiDocument } from '$lib/openapi/build';

const doc = buildOpenApiDocument({
    baseUrl: 'https://example.invalid',
    payTo: 'GA__PLACEHOLDER',
});

const outPath = join(process.cwd(), 'openapi.generated.json');
writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n', 'utf8');

console.log(`Wrote ${outPath}`);
