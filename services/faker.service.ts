import { faker } from "@faker-js/faker";
import { FakerType } from "@prisma/client";

export class FakerService {
    static generateFakerValue(fakerType: FakerType): any {
        switch (fakerType) {
          // Person
          case FakerType.FIRST_NAME: return faker.person.firstName();
          case FakerType.LAST_NAME: return faker.person.lastName();
          case FakerType.FULL_NAME: return faker.person.fullName();
          case FakerType.JOB_TITLE: return faker.person.jobTitle();
          case FakerType.PHONE_NUMBER: return faker.phone.number();
      
          // Internet
          case FakerType.EMAIL: return faker.internet.email();
          case FakerType.USER_NAME: return faker.internet.username();
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
}
    