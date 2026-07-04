
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.DestinationScalarFieldEnum = {
  id: 'id',
  parentId: 'parentId',
  name: 'name',
  slug: 'slug',
  slugPath: 'slugPath',
  level: 'level',
  depth: 'depth',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  seoContent: 'seoContent',
  imageUrl: 'imageUrl',
  heroImageUrl: 'heroImageUrl',
  gallery: 'gallery',
  sortOrder: 'sortOrder',
  status: 'status',
  isFeatured: 'isFeatured',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  publishedAt: 'publishedAt'
};

exports.Prisma.DestinationTranslationScalarFieldEnum = {
  destinationId: 'destinationId',
  locale: 'locale',
  name: 'name',
  slug: 'slug',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  seoContent: 'seoContent'
};

exports.Prisma.DestinationCategoryScalarFieldEnum = {
  id: 'id',
  destinationId: 'destinationId',
  name: 'name',
  slug: 'slug',
  description: 'description',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  seoContent: 'seoContent',
  heroImageUrl: 'heroImageUrl',
  sortOrder: 'sortOrder',
  status: 'status',
  isFeatured: 'isFeatured',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  publishedAt: 'publishedAt'
};

exports.Prisma.HotelScalarFieldEnum = {
  id: 'id',
  destinationId: 'destinationId',
  name: 'name',
  slug: 'slug',
  starRating: 'starRating',
  shortDescription: 'shortDescription',
  heroImageUrl: 'heroImageUrl',
  gallery: 'gallery',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  seoContent: 'seoContent',
  status: 'status',
  isFeatured: 'isFeatured',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  publishedAt: 'publishedAt'
};

exports.Prisma.PackageScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  shortDescription: 'shortDescription',
  durationDays: 'durationDays',
  durationNights: 'durationNights',
  startingPrice: 'startingPrice',
  currency: 'currency',
  heroImageUrl: 'heroImageUrl',
  gallery: 'gallery',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  seoContent: 'seoContent',
  status: 'status',
  isFeatured: 'isFeatured',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  publishedAt: 'publishedAt'
};

exports.Prisma.PackageDestinationScalarFieldEnum = {
  packageId: 'packageId',
  destinationId: 'destinationId',
  isPrimary: 'isPrimary',
  sortOrder: 'sortOrder',
  nights: 'nights'
};

exports.Prisma.PackageHotelScalarFieldEnum = {
  packageId: 'packageId',
  hotelId: 'hotelId',
  nights: 'nights',
  sortOrder: 'sortOrder'
};

exports.Prisma.PackageCategoryScalarFieldEnum = {
  packageId: 'packageId',
  categoryId: 'categoryId',
  sortOrder: 'sortOrder'
};

exports.Prisma.GuideScalarFieldEnum = {
  id: 'id',
  destinationId: 'destinationId',
  title: 'title',
  slug: 'slug',
  excerpt: 'excerpt',
  body: 'body',
  readingMinutes: 'readingMinutes',
  heroImageUrl: 'heroImageUrl',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  status: 'status',
  isFeatured: 'isFeatured',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  publishedAt: 'publishedAt'
};

exports.Prisma.FerryRouteScalarFieldEnum = {
  id: 'id',
  destinationId: 'destinationId',
  name: 'name',
  slug: 'slug',
  originName: 'originName',
  destinationName: 'destinationName',
  operatorName: 'operatorName',
  durationMinutes: 'durationMinutes',
  startingPrice: 'startingPrice',
  currency: 'currency',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  status: 'status',
  isFeatured: 'isFeatured',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FlightRouteScalarFieldEnum = {
  id: 'id',
  destinationId: 'destinationId',
  name: 'name',
  slug: 'slug',
  originIATA: 'originIATA',
  destIATA: 'destIATA',
  originCity: 'originCity',
  destCity: 'destCity',
  approxDurationMinutes: 'approxDurationMinutes',
  startingPrice: 'startingPrice',
  currency: 'currency',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  status: 'status',
  isFeatured: 'isFeatured',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SlugHistoryScalarFieldEnum = {
  id: 'id',
  entityType: 'entityType',
  entityId: 'entityId',
  locale: 'locale',
  oldSlug: 'oldSlug',
  oldFullPath: 'oldFullPath',
  newFullPath: 'newFullPath',
  changedAt: 'changedAt',
  changedByUser: 'changedByUser',
  reason: 'reason'
};

exports.Prisma.RedirectScalarFieldEnum = {
  id: 'id',
  fromPath: 'fromPath',
  toPath: 'toPath',
  statusCode: 'statusCode',
  locale: 'locale',
  source: 'source',
  reason: 'reason',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.DestinationLevel = exports.$Enums.DestinationLevel = {
  REGION: 'REGION',
  COUNTRY: 'COUNTRY',
  DESTINATION: 'DESTINATION',
  SUB_DESTINATION: 'SUB_DESTINATION'
};

exports.DestinationStatus = exports.$Enums.DestinationStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
};

exports.SluggableEntity = exports.$Enums.SluggableEntity = {
  DESTINATION: 'DESTINATION',
  DESTINATION_CATEGORY: 'DESTINATION_CATEGORY',
  HOTEL: 'HOTEL',
  PACKAGE: 'PACKAGE',
  GUIDE: 'GUIDE',
  FERRY_ROUTE: 'FERRY_ROUTE',
  FLIGHT_ROUTE: 'FLIGHT_ROUTE'
};

exports.RedirectSource = exports.$Enums.RedirectSource = {
  MANUAL: 'MANUAL',
  SLUG_HISTORY: 'SLUG_HISTORY',
  IMPORT: 'IMPORT'
};

exports.Prisma.ModelName = {
  Destination: 'Destination',
  DestinationTranslation: 'DestinationTranslation',
  DestinationCategory: 'DestinationCategory',
  Hotel: 'Hotel',
  Package: 'Package',
  PackageDestination: 'PackageDestination',
  PackageHotel: 'PackageHotel',
  PackageCategory: 'PackageCategory',
  Guide: 'Guide',
  FerryRoute: 'FerryRoute',
  FlightRoute: 'FlightRoute',
  SlugHistory: 'SlugHistory',
  Redirect: 'Redirect'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
