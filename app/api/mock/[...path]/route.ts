// app/api/mock/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  FakerType,
  HttpMethod,
  IdFieldType,
  ResponseGeneration,
  SchemaFieldType,
} from "@prisma/client";
// import { Ollama } from 'ollama';
import prisma from "@/lib/db";
import { SchemaData } from "@/data/schema.data";
import { faker } from "@faker-js/faker";
import { SchemaField } from "@/models/schema-field.model";

// const ollama = new Ollama({ host: 'http://localhost:11434' });

// Counter for auto-incrementing IDs
let idCounter = 1;

function generateFakerValue(fakerType: FakerType): any {
  switch (fakerType) {
    // Person
    case FakerType.FIRST_NAME: return faker.person.firstName();
    case FakerType.LAST_NAME: return faker.person.lastName();
    case FakerType.FULL_NAME: return faker.person.fullName();
    case FakerType.JOB_TITLE: return faker.person.jobTitle();
    case FakerType.PHONE_NUMBER: return faker.phone.number();

    // Internet
    case FakerType.EMAIL: return faker.internet.email();
    case FakerType.USER_NAME: return faker.internet.userName();
    case FakerType.PASSWORD: return faker.internet.password();
    case FakerType.URL: return faker.internet.url();
    case FakerType.IP_ADDRESS: return faker.internet.ip();

    // Location
    case FakerType.CITY: return faker.location.city();
    case FakerType.COUNTRY: return faker.location.country();
    case FakerType.STATE: return faker.location.state();
    case FakerType.STREET_ADDRESS: return faker.location.streetAddress();
    case FakerType.ZIP_CODE: return faker.location.zipCode();
    case FakerType.LATITUDE: return faker.location.latitude();
    case FakerType.LONGITUDE: return faker.location.longitude();

    // Business
    case FakerType.COMPANY_NAME: return faker.company.name();
    case FakerType.DEPARTMENT: return faker.commerce.department();
    case FakerType.PRODUCT_NAME: return faker.commerce.productName();
    case FakerType.PRICE: return faker.commerce.price();

    // Date & Time
    case FakerType.PAST_DATE: return faker.date.past();
    case FakerType.FUTURE_DATE: return faker.date.future();
    case FakerType.RECENT_DATE: return faker.date.recent();

    // Finance
    case FakerType.CREDIT_CARD_NUMBER: return faker.finance.creditCardNumber();
    case FakerType.ACCOUNT_NUMBER: return faker.finance.accountNumber();
    case FakerType.AMOUNT: return faker.finance.amount();
    case FakerType.CURRENCY: return faker.finance.currencyCode();

    // Text
    case FakerType.WORD: return faker.word.sample();
    case FakerType.SENTENCE: return faker.lorem.sentence();
    case FakerType.PARAGRAPH: return faker.lorem.paragraph();

    // System
    case FakerType.FILE_NAME: return faker.system.fileName();
    case FakerType.DIRECTORY_PATH: return faker.system.directoryPath();
    case FakerType.MIME_TYPE: return faker.system.mimeType();

    // Identifiers
    case FakerType.UUID: return faker.string.uuid();
    case FakerType.DATABASE_ID: return faker.number.int({ min: 1, max: 1000000 }).toString();

    default: return null;
  }
}

async function generateSchemaValue(field: SchemaField): Promise<any> {
  if (field.type === SchemaFieldType.FAKER && field.fakerType) {
    return generateFakerValue(field.fakerType);
  }

  if (field.type === SchemaFieldType.OBJECT && field.objectSchemaId) {
    const result: any = {};
    for (const subField of field.objectSchema?.fields || []) {
      result[subField.name] = await generateSchemaValue(subField as SchemaField);
    }
    return result;
  }

  if (field.type === SchemaFieldType.ARRAY && field.arrayType) {
    const count = Math.floor(Math.random() * 5) + 1; // Generate 1-5 items
    const result = [];
    for (let i = 0; i < count; i++) {
      if (field.arrayType.elementType === SchemaFieldType.OBJECT) {
        const objResult: any = {};
        for (const subField of field.arrayType.objectSchema?.fields || []) {
          objResult[subField.name] = await generateSchemaValue(subField as SchemaField);
        }
        result.push(objResult);
      } else if (field.arrayType.elementType === SchemaFieldType.FAKER) {
        result.push(generateFakerValue(field.arrayType?.fakerType));
      }
    }
    return result;
  }

  // Default values for other types
  switch (field.type) {
    case SchemaFieldType.STRING: return faker.lorem.word();
    case SchemaFieldType.INTEGER: return faker.number.int({ min: 1, max: 1000 });
    case SchemaFieldType.FLOAT: return faker.number.float({ min: 0, max: 1000 });
    case SchemaFieldType.BOOLEAN: return faker.datatype.boolean();
    case SchemaFieldType.DATE: return faker.date.recent();
    case SchemaFieldType.ID: return field.idFieldType === IdFieldType.UUID ? faker.string.uuid() : idCounter++;
    default: return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(req, params, "GET");
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(req, params, "POST");
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(req, params, "PUT");
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(req, params, "DELETE");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(req, params, "PATCH");
}

async function handleRequest(
  req: NextRequest,
  params: { path: string[] },
  method: HttpMethod
) {
  try {
    const fullPath = params.path.join("/");
    
    // Find matching endpoint by checking if the request path matches the endpoint path pattern
    const endpoints = await prisma.endpoint.findMany({
      where: {
        method,
      },
      include: {
        schema: {
          include: {
            fields: {
              include: {
                objectSchema: {
                  include: {
                    fields: true
                  }
                },
                arrayType: {
                  include: {
                    objectSchema: {
                      include: {
                        fields: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Find the best matching endpoint and extract ID if present
    let matchingEndpoint: any = null;
    let extractedId: string | null = null;

    for (const endpoint of endpoints) {
      const endpointParts = endpoint.path.split('/');
      const requestParts = fullPath.split('/');
      
      if (endpointParts.length !== requestParts.length) continue;
      
      let isMatch = true;
      for (let i = 0; i < endpointParts.length; i++) {
        const part = endpointParts[i];
        const requestPart = requestParts[i];
        
        // Check if this part is an ID parameter (e.g. :id or {id})
        const isIdParam = part.startsWith(':') || (part.startsWith('{') && part.endsWith('}'));
        if (isIdParam) {
          // For ID parameters, check if the request part is a valid ID format
          if (/^\d+$/.test(requestPart) || /^[0-9a-fA-F-]+$/.test(requestPart)) {
            extractedId = requestPart;
            continue;
          }
          isMatch = false;
          break;
        }
        if (part !== requestPart) {
          isMatch = false;
          break;
        }
      }
      
      if (isMatch) {
        matchingEndpoint = endpoint;
        break;
      }
    }

    if (!matchingEndpoint) {
      return NextResponse.json(
        { error: "Endpoint not found" },
        { status: 404 }
      );
    }

    // Check if this is a GET request and if it's a collection endpoint (no ID parameter)
    const isCollectionEndpoint = !matchingEndpoint.path.includes('/:') && !matchingEndpoint.path.includes('/{');
    const shouldReturnArray = method === 'GET' && isCollectionEndpoint;

    // Generate response
    let response: any;
    if (matchingEndpoint.responseGen === ResponseGeneration.STATIC) {
      response = matchingEndpoint.staticResponse;
      // For GET requests to collection endpoints, wrap static response in array if it's not already
      if (shouldReturnArray && !Array.isArray(response)) {
        response = [response];
      }
      // For single item responses with ID, ensure the ID matches the URL
      else if (extractedId && !shouldReturnArray) {
        response = { ...response, id: extractedId };
      }
    } else if (
      matchingEndpoint.responseGen === ResponseGeneration.SCHEMA &&
      matchingEndpoint.schema
    ) {
      if (shouldReturnArray) {
        // Generate array of 5-10 items for collection endpoints
        const count = Math.floor(Math.random() * 6) + 5;
        response = [];
        for (let i = 0; i < count; i++) {
          const item: any = {};
          for (const field of matchingEndpoint.schema.fields) {
            if (field.name === 'id') {
              item[field.name] = (i + 1).toString(); // Generate sequential IDs
            } else {
              item[field.name] = await generateSchemaValue(field as SchemaField);
            }
          }
          response.push(item);
        }
      } else {
        // Generate single item for ID endpoints
        response = {};
        for (const field of matchingEndpoint.schema.fields) {
          if (field.name === 'id' && extractedId) {
            response[field.name] = extractedId;
          } else {
            response[field.name] = await generateSchemaValue(field as SchemaField);
          }
        }
      }
    } else {
      response = shouldReturnArray ? [] : "no data";
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error handling mock request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
