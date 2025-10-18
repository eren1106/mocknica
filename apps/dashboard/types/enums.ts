/**
 * Frontend enum types
 * These mirror the Prisma enums but are not directly coupled to the database layer
 */

export enum EHttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export enum EProjectPermission {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

export enum EIdFieldType {
  UUID = "UUID",
  AUTOINCREMENT = "AUTOINCREMENT",
}

export enum ESchemaFieldType {
  ID = "ID",
  FAKER = "FAKER",
  STRING = "STRING",
  INTEGER = "INTEGER",
  FLOAT = "FLOAT",
  BOOLEAN = "BOOLEAN",
  OBJECT = "OBJECT",
  ARRAY = "ARRAY",
  DATE = "DATE",
}

export enum EFakerType {
  // Person
  FIRST_NAME = "FIRST_NAME",
  LAST_NAME = "LAST_NAME",
  FULL_NAME = "FULL_NAME",
  JOB_TITLE = "JOB_TITLE",
  PHONE_NUMBER = "PHONE_NUMBER",

  // Internet
  EMAIL = "EMAIL",
  USER_NAME = "USER_NAME",
  PASSWORD = "PASSWORD",
  URL = "URL",
  IP_ADDRESS = "IP_ADDRESS",

  // Location
  CITY = "CITY",
  COUNTRY = "COUNTRY",
  STATE = "STATE",
  STREET_ADDRESS = "STREET_ADDRESS",
  ZIP_CODE = "ZIP_CODE",
  LATITUDE = "LATITUDE",
  LONGITUDE = "LONGITUDE",

  // Business
  COMPANY_NAME = "COMPANY_NAME",
  DEPARTMENT = "DEPARTMENT",
  PRODUCT_NAME = "PRODUCT_NAME",
  PRICE = "PRICE",

  // Date & Time
  PAST_DATE = "PAST_DATE",
  FUTURE_DATE = "FUTURE_DATE",
  RECENT_DATE = "RECENT_DATE",

  // Finance
  CREDIT_CARD_NUMBER = "CREDIT_CARD_NUMBER",
  ACCOUNT_NUMBER = "ACCOUNT_NUMBER",
  AMOUNT = "AMOUNT",
  CURRENCY = "CURRENCY",

  // Text
  WORD = "WORD",
  SENTENCE = "SENTENCE",
  PARAGRAPH = "PARAGRAPH",

  // System
  FILE_NAME = "FILE_NAME",
  DIRECTORY_PATH = "DIRECTORY_PATH",
  MIME_TYPE = "MIME_TYPE",

  // Identifiers
  UUID = "UUID",
  DATABASE_ID = "DATABASE_ID",
}
