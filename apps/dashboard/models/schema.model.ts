import { Prisma } from "@prisma/client"

export type Schema = Prisma.SchemaGetPayload<{
    include: { 
      fields: {
        include: {
          objectSchema: {
            include: {
              fields: true;
            }
          };
          arrayType: {
            include: {
              objectSchema: {
                include: {
                  fields: true;
                }
              };
            }
          }
        }
      }
    }
  }>