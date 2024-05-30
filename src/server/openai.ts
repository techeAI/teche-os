import { generateOpenApiDocument } from 'trpc-openapi';
import { rootRouter } from '~/server/api/root';

export const openApiDocument = generateOpenApiDocument(rootRouter, {
  title: 'TecheOS API',
  description: 'OpenAPI compliant REST API built of interfacing with TecheOS',
  version: '1.0.0',
  baseUrl: 'http://localhost:3000/api',
  docsUrl: 'https://teche.ai'
});