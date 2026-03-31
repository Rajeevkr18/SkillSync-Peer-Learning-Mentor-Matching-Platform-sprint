const http = require('http');
const fs = require('fs');
const path = require('path');

const services = [
  { name: 'Auth Service', url: 'http://localhost:8081/auth/v3/api-docs', pathPrefix: '' },
  { name: 'User Service', url: 'http://localhost:8082/users/v3/api-docs', pathPrefix: '' },
  { name: 'Mentor Service', url: 'http://localhost:8083/mentors/v3/api-docs', pathPrefix: '' },
  { name: 'Skill Service', url: 'http://localhost:8084/skills/v3/api-docs', pathPrefix: '' },
  { name: 'Session Service', url: 'http://localhost:8085/sessions/v3/api-docs', pathPrefix: '' },
  { name: 'Group Service', url: 'http://localhost:8086/groups/v3/api-docs', pathPrefix: '' },
  { name: 'Review Service', url: 'http://localhost:8087/reviews/v3/api-docs', pathPrefix: '' },
  { name: 'Notification Service', url: 'http://localhost:8088/notifications/v3/api-docs', pathPrefix: '' }
];

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', (err) => {
      resolve(null);
    });
  });
}

function processSchema(schemaRef, schemas) {
  if (!schemaRef) return null;
  if (schemaRef.$ref) {
    const schemaName = schemaRef.$ref.split('/').pop();
    const schema = schemas[schemaName];
    if (!schema) return schemaName;
    if (schema.type === 'object' && schema.properties) {
      const obj = {};
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (prop.type === 'array' && prop.items) {
          obj[key] = [prop.items.type || prop.items.$ref?.split('/').pop() || 'any'];
        } else {
          obj[key] = prop.type === 'integer' ? 0 : prop.type === 'boolean' ? true : prop.type || schemaName;
        }
      }
      return obj;
    }
  } else if (schemaRef.type === 'array' && schemaRef.items) {
    return [processSchema(schemaRef.items, schemas)];
  } else if (schemaRef.type === 'object' && schemaRef.properties) {
	  const obj = {};
      for (const [key, prop] of Object.entries(schemaRef.properties)) {
        obj[key] = prop.type === 'integer' ? 0 : prop.type === 'boolean' ? true : prop.type;
      }
      return obj;
  }
  return schemaRef.type || 'any';
}

async function run() {
  let markdown = `# Comprehensive API Documentation\n\n`;
  markdown += `This document provides a complete guide to all available API endpoints across the SkillSync microservices platform, including URLs, methods, and required JSON bodies.\n\n`;
  markdown += `> **Base URL Note:** When accessing via the API Gateway, prepend \`http://localhost:8080\` to the endpoint paths.\n\n`;

  for (const service of services) {
    const spec = await fetchJson(service.url);
    if (!spec || !spec.paths) {
      markdown += `## ${service.name}\n\n*Service is down or OpenAPI specs unavailable.*\n\n`;
      continue;
    }

    markdown += `---

## ${service.name}

`;
    const schemas = spec.components?.schemas || {};

    for (const [pathStr, methods] of Object.entries(spec.paths)) {
      for (const [method, details] of Object.entries(methods)) {
        markdown += `### \`${method.toUpperCase()}\` ${pathStr}\n\n`;
        if (details.summary || details.operationId) {
          markdown += `**Description:** ${details.summary || details.operationId}\n\n`;
        }

        // Parameters
        if (details.parameters && details.parameters.length > 0) {
          markdown += `**Path/Query Parameters:**\n`;
          details.parameters.forEach(p => {
            markdown += `- \`${p.name}\` (${p.in}): ${p.required ? 'Required' : 'Optional'} - Type: ${p.schema?.type || 'string'}\n`;
          });
          markdown += `\n`;
        }

        // Request Body
        if (details.requestBody && details.requestBody.content) {
          const content = details.requestBody.content['application/json'];
          if (content && content.schema) {
            const bodyStructure = processSchema(content.schema, schemas);
            markdown += `**Request Body (JSON):**\n\`\`\`json\n${JSON.stringify(bodyStructure, null, 2)}\n\`\`\`\n\n`;
          }
        }

        // Response Body
        if (details.responses && details.responses['200']) {
           const content = details.responses['200'].content;
           if (content && content['*/*']) {
             const respSchema = content['*/*'].schema;
             if (respSchema) {
                const respStructure = processSchema(respSchema, schemas);
                if (respStructure) {
                    markdown += `**Success Response (200 OK):**\n\`\`\`json\n${JSON.stringify(respStructure, null, 2)}\n\`\`\`\n\n`;
                }
             }
           } else if (content && content['application/json']) {
        	   const respSchema = content['application/json'].schema;
               if (respSchema) {
                  const respStructure = processSchema(respSchema, schemas);
                  if (respStructure) {
                      markdown += `**Success Response (200 OK):**\n\`\`\`json\n${JSON.stringify(respStructure, null, 2)}\n\`\`\`\n\n`;
                  }
               }
           }
        } else if (details.responses && details.responses['201']) {
            markdown += `**Success Response (201 Created)**\n\n`;
        }
      }
    }
  }

  const outputPath = 'C:\\\\Users\\\\HP\\\\.gemini\\\\antigravity\\\\brain\\\\b078b822-74b4-4826-8d70-75d467dc682e\\\\api_documentation.md';
  fs.writeFileSync(outputPath, markdown);
  console.log('Successfully generated API Documentation to ' + outputPath);
}

run();
