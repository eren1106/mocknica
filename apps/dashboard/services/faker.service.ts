import { faker } from "@faker-js/faker";
import { EFakerType } from "@/types";

export class FakerService {
    static generateFakerValue(fakerType: EFakerType): any {
        switch (fakerType) {
          // Person
          case EFakerType.FIRST_NAME: return faker.person.firstName();
          case EFakerType.LAST_NAME: return faker.person.lastName();
          case EFakerType.FULL_NAME: return faker.person.fullName();
          case EFakerType.JOB_TITLE: return faker.person.jobTitle();
          case EFakerType.PHONE_NUMBER: return faker.phone.number();
      
          // Internet
          case EFakerType.EMAIL: return faker.internet.email();
          case EFakerType.USER_NAME: return faker.internet.username();
          case EFakerType.PASSWORD: return faker.internet.password();
          case EFakerType.URL: return faker.internet.url();
          case EFakerType.IP_ADDRESS: return faker.internet.ip();
      
          // Location
          case EFakerType.CITY: return faker.location.city();
          case EFakerType.COUNTRY: return faker.location.country();
          case EFakerType.STATE: return faker.location.state();
          case EFakerType.STREET_ADDRESS: return faker.location.streetAddress();
          case EFakerType.ZIP_CODE: return faker.location.zipCode();
          case EFakerType.LATITUDE: return faker.location.latitude();
          case EFakerType.LONGITUDE: return faker.location.longitude();
      
          // Business
          case EFakerType.COMPANY_NAME: return faker.company.name();
          case EFakerType.DEPARTMENT: return faker.commerce.department();
          case EFakerType.PRODUCT_NAME: return faker.commerce.productName();
          case EFakerType.PRICE: return faker.commerce.price();
      
          // Date & Time
          case EFakerType.PAST_DATE: return faker.date.past();
          case EFakerType.FUTURE_DATE: return faker.date.future();
          case EFakerType.RECENT_DATE: return faker.date.recent();
      
          // Finance
          case EFakerType.CREDIT_CARD_NUMBER: return faker.finance.creditCardNumber();
          case EFakerType.ACCOUNT_NUMBER: return faker.finance.accountNumber();
          case EFakerType.AMOUNT: return faker.finance.amount();
          case EFakerType.CURRENCY: return faker.finance.currencyCode();
      
          // Text
          case EFakerType.WORD: return faker.word.sample();
          case EFakerType.SENTENCE: return faker.lorem.sentence();
          case EFakerType.PARAGRAPH: return faker.lorem.paragraph();
      
          // System
          case EFakerType.FILE_NAME: return faker.system.fileName();
          case EFakerType.DIRECTORY_PATH: return faker.system.directoryPath();
          case EFakerType.MIME_TYPE: return faker.system.mimeType();
      
          // Identifiers
          case EFakerType.UUID: return faker.string.uuid();
          case EFakerType.DATABASE_ID: return faker.number.int({ min: 1, max: 1000000 }).toString();
      
          default: return null;
        }
      }
}
    