import { NextRequest, NextResponse } from "next/server";
import { apiLog } from "./api-log";
import { removeUndefinedFields } from "@/lib/utils";
import { AppError, handlePrismaError } from "@/data/helpers/error-handler";
import { STATUS_CODES } from "@/constants/status-codes";

interface INextResponse {
  message?: string;
  data?: any;
  status?: string;
  statusCode?: number;
  extra?: any;
  count?: number;
}

const nextResponse = (
  {
    message,
    data,
    status = 'SUCCESS',
    statusCode = STATUS_CODES.OK,
    extra,
    count,
  }: INextResponse
) => {
  const res = {
    message,
    data,
    count,
    status,
    extra,
  }
  const cleanRes = removeUndefinedFields(res); // TODO: test if this affect performance alot, if alot then just remove
  console.log(cleanRes); // log the response
  return NextResponse.json(cleanRes, { status: statusCode || STATUS_CODES.OK });
}

// TODO: design like this => apiResponse.success() & apiResponse.error() & apiResponse.custom()
// this will return error if data is empty
export const apiResponse = (req: NextRequest, {
  data,
  message,
  extra = undefined
}: { data: any; message?: string; extra?: any }) => {
  apiLog(req);
  if (Array.isArray(data) && data.length === 0) {
    return noResultArrayResponse();
  }
  if (data === null || data === undefined) return noResultResponse();

  const response = {
    message: message || 'Success',
    data: data,
    count: Array.isArray(data) ? data.length : undefined,
    extra,
  };

  return nextResponse(response);
};

export const errorResponse = (req: NextRequest, {
  message,
  error,
  statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR,
}: { message?: string; statusCode?: number; error?: unknown }) => {
  apiLog(req);

  if (error) {
    // Handle the error
    const handledError = error instanceof AppError
      ? error
      : handlePrismaError(error);

    return nextResponse({
      message: handledError.message,
      extra: handledError.data,
      status: 'FAILED',
      statusCode: handledError.statusCode,
    });
  }

  return nextResponse({
    message,
    status: 'FAILED',
    statusCode: statusCode,
  });
};

export const customResponse = (req: NextRequest, {
  message = "",
  data = undefined,
  status = 'SUCESS',
  statusCode = STATUS_CODES.OK,
  extra = undefined,
}: { message?: string; data?: any; status?: string; statusCode?: number, extra?: any }) => {
  apiLog(req);
  return nextResponse({
    message,
    data: data,
    status,
    statusCode: statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR,
    extra,
  });
};

const noResultResponse = () => {
  return nextResponse({
    message: 'Data not found',
    status: 'FAILED',
    statusCode: STATUS_CODES.NOT_FOUND,
  });
};

const noResultArrayResponse = () => {
  return nextResponse({
    message: 'No data found',
    data: [],
  });
};