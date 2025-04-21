import { Prisma } from "@prisma/client";

export type Endpoint = Prisma.EndpointGetPayload<{
  include: {
    schema: {
      include: {
        fields: {
          include: {
            objectSchema: true;
            arrayType: {
              include: {
                objectSchema: true;
              };
            };
          };
        };
      };
    };
  };
}>;
