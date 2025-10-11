import { Prisma } from "@prisma/client";

export type Endpoint = Prisma.EndpointGetPayload<{
  include: {
    schema: {
      include: {
        fields: {
          include: {
            objectSchema: {
              include: {
                fields: true;
              };
            };
            arrayType: {
              include: {
                objectSchema: {
                  include: {
                    fields: true;
                  };
                };
              };
            };
          };
        };
      };
    };
    responseWrapper: true;
  };
}>;
