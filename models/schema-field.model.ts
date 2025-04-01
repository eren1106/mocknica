import { Prisma } from "@prisma/client";

export type SchemaField = Prisma.SchemaFieldGetPayload<{
  include: {
    objectType: true;
    arrayType: {
      include: {
        objectSchema: {
          include: {
            fields: true;
          };
        };
        fakerType: true;
      };
    };
    objectSchema: {
      include: {
        fields: true;
      };
    };
  };
}>;
