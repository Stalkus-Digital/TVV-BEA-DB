
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Destination
 * 
 */
export type Destination = $Result.DefaultSelection<Prisma.$DestinationPayload>
/**
 * Model DestinationTranslation
 * 
 */
export type DestinationTranslation = $Result.DefaultSelection<Prisma.$DestinationTranslationPayload>
/**
 * Model DestinationCategory
 * 
 */
export type DestinationCategory = $Result.DefaultSelection<Prisma.$DestinationCategoryPayload>
/**
 * Model Hotel
 * 
 */
export type Hotel = $Result.DefaultSelection<Prisma.$HotelPayload>
/**
 * Model Package
 * 
 */
export type Package = $Result.DefaultSelection<Prisma.$PackagePayload>
/**
 * Model PackageDestination
 * 
 */
export type PackageDestination = $Result.DefaultSelection<Prisma.$PackageDestinationPayload>
/**
 * Model PackageHotel
 * 
 */
export type PackageHotel = $Result.DefaultSelection<Prisma.$PackageHotelPayload>
/**
 * Model PackageCategory
 * 
 */
export type PackageCategory = $Result.DefaultSelection<Prisma.$PackageCategoryPayload>
/**
 * Model Guide
 * 
 */
export type Guide = $Result.DefaultSelection<Prisma.$GuidePayload>
/**
 * Model FerryRoute
 * 
 */
export type FerryRoute = $Result.DefaultSelection<Prisma.$FerryRoutePayload>
/**
 * Model FlightRoute
 * 
 */
export type FlightRoute = $Result.DefaultSelection<Prisma.$FlightRoutePayload>
/**
 * Model SlugHistory
 * 
 */
export type SlugHistory = $Result.DefaultSelection<Prisma.$SlugHistoryPayload>
/**
 * Model Redirect
 * 
 */
export type Redirect = $Result.DefaultSelection<Prisma.$RedirectPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const DestinationLevel: {
  REGION: 'REGION',
  COUNTRY: 'COUNTRY',
  DESTINATION: 'DESTINATION',
  SUB_DESTINATION: 'SUB_DESTINATION'
};

export type DestinationLevel = (typeof DestinationLevel)[keyof typeof DestinationLevel]


export const DestinationStatus: {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
};

export type DestinationStatus = (typeof DestinationStatus)[keyof typeof DestinationStatus]


export const SluggableEntity: {
  DESTINATION: 'DESTINATION',
  DESTINATION_CATEGORY: 'DESTINATION_CATEGORY',
  HOTEL: 'HOTEL',
  PACKAGE: 'PACKAGE',
  GUIDE: 'GUIDE',
  FERRY_ROUTE: 'FERRY_ROUTE',
  FLIGHT_ROUTE: 'FLIGHT_ROUTE'
};

export type SluggableEntity = (typeof SluggableEntity)[keyof typeof SluggableEntity]


export const RedirectSource: {
  MANUAL: 'MANUAL',
  SLUG_HISTORY: 'SLUG_HISTORY',
  IMPORT: 'IMPORT'
};

export type RedirectSource = (typeof RedirectSource)[keyof typeof RedirectSource]

}

export type DestinationLevel = $Enums.DestinationLevel

export const DestinationLevel: typeof $Enums.DestinationLevel

export type DestinationStatus = $Enums.DestinationStatus

export const DestinationStatus: typeof $Enums.DestinationStatus

export type SluggableEntity = $Enums.SluggableEntity

export const SluggableEntity: typeof $Enums.SluggableEntity

export type RedirectSource = $Enums.RedirectSource

export const RedirectSource: typeof $Enums.RedirectSource

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Destinations
 * const destinations = await prisma.destination.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Destinations
   * const destinations = await prisma.destination.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.destination`: Exposes CRUD operations for the **Destination** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Destinations
    * const destinations = await prisma.destination.findMany()
    * ```
    */
  get destination(): Prisma.DestinationDelegate<ExtArgs>;

  /**
   * `prisma.destinationTranslation`: Exposes CRUD operations for the **DestinationTranslation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DestinationTranslations
    * const destinationTranslations = await prisma.destinationTranslation.findMany()
    * ```
    */
  get destinationTranslation(): Prisma.DestinationTranslationDelegate<ExtArgs>;

  /**
   * `prisma.destinationCategory`: Exposes CRUD operations for the **DestinationCategory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DestinationCategories
    * const destinationCategories = await prisma.destinationCategory.findMany()
    * ```
    */
  get destinationCategory(): Prisma.DestinationCategoryDelegate<ExtArgs>;

  /**
   * `prisma.hotel`: Exposes CRUD operations for the **Hotel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Hotels
    * const hotels = await prisma.hotel.findMany()
    * ```
    */
  get hotel(): Prisma.HotelDelegate<ExtArgs>;

  /**
   * `prisma.package`: Exposes CRUD operations for the **Package** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Packages
    * const packages = await prisma.package.findMany()
    * ```
    */
  get package(): Prisma.PackageDelegate<ExtArgs>;

  /**
   * `prisma.packageDestination`: Exposes CRUD operations for the **PackageDestination** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PackageDestinations
    * const packageDestinations = await prisma.packageDestination.findMany()
    * ```
    */
  get packageDestination(): Prisma.PackageDestinationDelegate<ExtArgs>;

  /**
   * `prisma.packageHotel`: Exposes CRUD operations for the **PackageHotel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PackageHotels
    * const packageHotels = await prisma.packageHotel.findMany()
    * ```
    */
  get packageHotel(): Prisma.PackageHotelDelegate<ExtArgs>;

  /**
   * `prisma.packageCategory`: Exposes CRUD operations for the **PackageCategory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PackageCategories
    * const packageCategories = await prisma.packageCategory.findMany()
    * ```
    */
  get packageCategory(): Prisma.PackageCategoryDelegate<ExtArgs>;

  /**
   * `prisma.guide`: Exposes CRUD operations for the **Guide** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Guides
    * const guides = await prisma.guide.findMany()
    * ```
    */
  get guide(): Prisma.GuideDelegate<ExtArgs>;

  /**
   * `prisma.ferryRoute`: Exposes CRUD operations for the **FerryRoute** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FerryRoutes
    * const ferryRoutes = await prisma.ferryRoute.findMany()
    * ```
    */
  get ferryRoute(): Prisma.FerryRouteDelegate<ExtArgs>;

  /**
   * `prisma.flightRoute`: Exposes CRUD operations for the **FlightRoute** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FlightRoutes
    * const flightRoutes = await prisma.flightRoute.findMany()
    * ```
    */
  get flightRoute(): Prisma.FlightRouteDelegate<ExtArgs>;

  /**
   * `prisma.slugHistory`: Exposes CRUD operations for the **SlugHistory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SlugHistories
    * const slugHistories = await prisma.slugHistory.findMany()
    * ```
    */
  get slugHistory(): Prisma.SlugHistoryDelegate<ExtArgs>;

  /**
   * `prisma.redirect`: Exposes CRUD operations for the **Redirect** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Redirects
    * const redirects = await prisma.redirect.findMany()
    * ```
    */
  get redirect(): Prisma.RedirectDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
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

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "destination" | "destinationTranslation" | "destinationCategory" | "hotel" | "package" | "packageDestination" | "packageHotel" | "packageCategory" | "guide" | "ferryRoute" | "flightRoute" | "slugHistory" | "redirect"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Destination: {
        payload: Prisma.$DestinationPayload<ExtArgs>
        fields: Prisma.DestinationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DestinationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DestinationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationPayload>
          }
          findFirst: {
            args: Prisma.DestinationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DestinationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationPayload>
          }
          findMany: {
            args: Prisma.DestinationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationPayload>[]
          }
          create: {
            args: Prisma.DestinationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationPayload>
          }
          createMany: {
            args: Prisma.DestinationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DestinationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationPayload>[]
          }
          delete: {
            args: Prisma.DestinationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationPayload>
          }
          update: {
            args: Prisma.DestinationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationPayload>
          }
          deleteMany: {
            args: Prisma.DestinationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DestinationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DestinationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationPayload>
          }
          aggregate: {
            args: Prisma.DestinationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDestination>
          }
          groupBy: {
            args: Prisma.DestinationGroupByArgs<ExtArgs>
            result: $Utils.Optional<DestinationGroupByOutputType>[]
          }
          count: {
            args: Prisma.DestinationCountArgs<ExtArgs>
            result: $Utils.Optional<DestinationCountAggregateOutputType> | number
          }
        }
      }
      DestinationTranslation: {
        payload: Prisma.$DestinationTranslationPayload<ExtArgs>
        fields: Prisma.DestinationTranslationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DestinationTranslationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationTranslationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DestinationTranslationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationTranslationPayload>
          }
          findFirst: {
            args: Prisma.DestinationTranslationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationTranslationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DestinationTranslationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationTranslationPayload>
          }
          findMany: {
            args: Prisma.DestinationTranslationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationTranslationPayload>[]
          }
          create: {
            args: Prisma.DestinationTranslationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationTranslationPayload>
          }
          createMany: {
            args: Prisma.DestinationTranslationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DestinationTranslationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationTranslationPayload>[]
          }
          delete: {
            args: Prisma.DestinationTranslationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationTranslationPayload>
          }
          update: {
            args: Prisma.DestinationTranslationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationTranslationPayload>
          }
          deleteMany: {
            args: Prisma.DestinationTranslationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DestinationTranslationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DestinationTranslationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationTranslationPayload>
          }
          aggregate: {
            args: Prisma.DestinationTranslationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDestinationTranslation>
          }
          groupBy: {
            args: Prisma.DestinationTranslationGroupByArgs<ExtArgs>
            result: $Utils.Optional<DestinationTranslationGroupByOutputType>[]
          }
          count: {
            args: Prisma.DestinationTranslationCountArgs<ExtArgs>
            result: $Utils.Optional<DestinationTranslationCountAggregateOutputType> | number
          }
        }
      }
      DestinationCategory: {
        payload: Prisma.$DestinationCategoryPayload<ExtArgs>
        fields: Prisma.DestinationCategoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DestinationCategoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationCategoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DestinationCategoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationCategoryPayload>
          }
          findFirst: {
            args: Prisma.DestinationCategoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationCategoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DestinationCategoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationCategoryPayload>
          }
          findMany: {
            args: Prisma.DestinationCategoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationCategoryPayload>[]
          }
          create: {
            args: Prisma.DestinationCategoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationCategoryPayload>
          }
          createMany: {
            args: Prisma.DestinationCategoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DestinationCategoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationCategoryPayload>[]
          }
          delete: {
            args: Prisma.DestinationCategoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationCategoryPayload>
          }
          update: {
            args: Prisma.DestinationCategoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationCategoryPayload>
          }
          deleteMany: {
            args: Prisma.DestinationCategoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DestinationCategoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DestinationCategoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinationCategoryPayload>
          }
          aggregate: {
            args: Prisma.DestinationCategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDestinationCategory>
          }
          groupBy: {
            args: Prisma.DestinationCategoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<DestinationCategoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.DestinationCategoryCountArgs<ExtArgs>
            result: $Utils.Optional<DestinationCategoryCountAggregateOutputType> | number
          }
        }
      }
      Hotel: {
        payload: Prisma.$HotelPayload<ExtArgs>
        fields: Prisma.HotelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.HotelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HotelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.HotelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HotelPayload>
          }
          findFirst: {
            args: Prisma.HotelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HotelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.HotelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HotelPayload>
          }
          findMany: {
            args: Prisma.HotelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HotelPayload>[]
          }
          create: {
            args: Prisma.HotelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HotelPayload>
          }
          createMany: {
            args: Prisma.HotelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.HotelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HotelPayload>[]
          }
          delete: {
            args: Prisma.HotelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HotelPayload>
          }
          update: {
            args: Prisma.HotelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HotelPayload>
          }
          deleteMany: {
            args: Prisma.HotelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.HotelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.HotelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HotelPayload>
          }
          aggregate: {
            args: Prisma.HotelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateHotel>
          }
          groupBy: {
            args: Prisma.HotelGroupByArgs<ExtArgs>
            result: $Utils.Optional<HotelGroupByOutputType>[]
          }
          count: {
            args: Prisma.HotelCountArgs<ExtArgs>
            result: $Utils.Optional<HotelCountAggregateOutputType> | number
          }
        }
      }
      Package: {
        payload: Prisma.$PackagePayload<ExtArgs>
        fields: Prisma.PackageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PackageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PackageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagePayload>
          }
          findFirst: {
            args: Prisma.PackageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PackageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagePayload>
          }
          findMany: {
            args: Prisma.PackageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagePayload>[]
          }
          create: {
            args: Prisma.PackageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagePayload>
          }
          createMany: {
            args: Prisma.PackageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PackageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagePayload>[]
          }
          delete: {
            args: Prisma.PackageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagePayload>
          }
          update: {
            args: Prisma.PackageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagePayload>
          }
          deleteMany: {
            args: Prisma.PackageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PackageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PackageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagePayload>
          }
          aggregate: {
            args: Prisma.PackageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePackage>
          }
          groupBy: {
            args: Prisma.PackageGroupByArgs<ExtArgs>
            result: $Utils.Optional<PackageGroupByOutputType>[]
          }
          count: {
            args: Prisma.PackageCountArgs<ExtArgs>
            result: $Utils.Optional<PackageCountAggregateOutputType> | number
          }
        }
      }
      PackageDestination: {
        payload: Prisma.$PackageDestinationPayload<ExtArgs>
        fields: Prisma.PackageDestinationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PackageDestinationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageDestinationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PackageDestinationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageDestinationPayload>
          }
          findFirst: {
            args: Prisma.PackageDestinationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageDestinationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PackageDestinationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageDestinationPayload>
          }
          findMany: {
            args: Prisma.PackageDestinationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageDestinationPayload>[]
          }
          create: {
            args: Prisma.PackageDestinationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageDestinationPayload>
          }
          createMany: {
            args: Prisma.PackageDestinationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PackageDestinationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageDestinationPayload>[]
          }
          delete: {
            args: Prisma.PackageDestinationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageDestinationPayload>
          }
          update: {
            args: Prisma.PackageDestinationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageDestinationPayload>
          }
          deleteMany: {
            args: Prisma.PackageDestinationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PackageDestinationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PackageDestinationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageDestinationPayload>
          }
          aggregate: {
            args: Prisma.PackageDestinationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePackageDestination>
          }
          groupBy: {
            args: Prisma.PackageDestinationGroupByArgs<ExtArgs>
            result: $Utils.Optional<PackageDestinationGroupByOutputType>[]
          }
          count: {
            args: Prisma.PackageDestinationCountArgs<ExtArgs>
            result: $Utils.Optional<PackageDestinationCountAggregateOutputType> | number
          }
        }
      }
      PackageHotel: {
        payload: Prisma.$PackageHotelPayload<ExtArgs>
        fields: Prisma.PackageHotelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PackageHotelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageHotelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PackageHotelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageHotelPayload>
          }
          findFirst: {
            args: Prisma.PackageHotelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageHotelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PackageHotelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageHotelPayload>
          }
          findMany: {
            args: Prisma.PackageHotelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageHotelPayload>[]
          }
          create: {
            args: Prisma.PackageHotelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageHotelPayload>
          }
          createMany: {
            args: Prisma.PackageHotelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PackageHotelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageHotelPayload>[]
          }
          delete: {
            args: Prisma.PackageHotelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageHotelPayload>
          }
          update: {
            args: Prisma.PackageHotelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageHotelPayload>
          }
          deleteMany: {
            args: Prisma.PackageHotelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PackageHotelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PackageHotelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageHotelPayload>
          }
          aggregate: {
            args: Prisma.PackageHotelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePackageHotel>
          }
          groupBy: {
            args: Prisma.PackageHotelGroupByArgs<ExtArgs>
            result: $Utils.Optional<PackageHotelGroupByOutputType>[]
          }
          count: {
            args: Prisma.PackageHotelCountArgs<ExtArgs>
            result: $Utils.Optional<PackageHotelCountAggregateOutputType> | number
          }
        }
      }
      PackageCategory: {
        payload: Prisma.$PackageCategoryPayload<ExtArgs>
        fields: Prisma.PackageCategoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PackageCategoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageCategoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PackageCategoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageCategoryPayload>
          }
          findFirst: {
            args: Prisma.PackageCategoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageCategoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PackageCategoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageCategoryPayload>
          }
          findMany: {
            args: Prisma.PackageCategoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageCategoryPayload>[]
          }
          create: {
            args: Prisma.PackageCategoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageCategoryPayload>
          }
          createMany: {
            args: Prisma.PackageCategoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PackageCategoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageCategoryPayload>[]
          }
          delete: {
            args: Prisma.PackageCategoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageCategoryPayload>
          }
          update: {
            args: Prisma.PackageCategoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageCategoryPayload>
          }
          deleteMany: {
            args: Prisma.PackageCategoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PackageCategoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PackageCategoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageCategoryPayload>
          }
          aggregate: {
            args: Prisma.PackageCategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePackageCategory>
          }
          groupBy: {
            args: Prisma.PackageCategoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<PackageCategoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.PackageCategoryCountArgs<ExtArgs>
            result: $Utils.Optional<PackageCategoryCountAggregateOutputType> | number
          }
        }
      }
      Guide: {
        payload: Prisma.$GuidePayload<ExtArgs>
        fields: Prisma.GuideFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GuideFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuidePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GuideFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuidePayload>
          }
          findFirst: {
            args: Prisma.GuideFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuidePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GuideFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuidePayload>
          }
          findMany: {
            args: Prisma.GuideFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuidePayload>[]
          }
          create: {
            args: Prisma.GuideCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuidePayload>
          }
          createMany: {
            args: Prisma.GuideCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GuideCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuidePayload>[]
          }
          delete: {
            args: Prisma.GuideDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuidePayload>
          }
          update: {
            args: Prisma.GuideUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuidePayload>
          }
          deleteMany: {
            args: Prisma.GuideDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GuideUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GuideUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuidePayload>
          }
          aggregate: {
            args: Prisma.GuideAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGuide>
          }
          groupBy: {
            args: Prisma.GuideGroupByArgs<ExtArgs>
            result: $Utils.Optional<GuideGroupByOutputType>[]
          }
          count: {
            args: Prisma.GuideCountArgs<ExtArgs>
            result: $Utils.Optional<GuideCountAggregateOutputType> | number
          }
        }
      }
      FerryRoute: {
        payload: Prisma.$FerryRoutePayload<ExtArgs>
        fields: Prisma.FerryRouteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FerryRouteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FerryRoutePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FerryRouteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FerryRoutePayload>
          }
          findFirst: {
            args: Prisma.FerryRouteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FerryRoutePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FerryRouteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FerryRoutePayload>
          }
          findMany: {
            args: Prisma.FerryRouteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FerryRoutePayload>[]
          }
          create: {
            args: Prisma.FerryRouteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FerryRoutePayload>
          }
          createMany: {
            args: Prisma.FerryRouteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FerryRouteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FerryRoutePayload>[]
          }
          delete: {
            args: Prisma.FerryRouteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FerryRoutePayload>
          }
          update: {
            args: Prisma.FerryRouteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FerryRoutePayload>
          }
          deleteMany: {
            args: Prisma.FerryRouteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FerryRouteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.FerryRouteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FerryRoutePayload>
          }
          aggregate: {
            args: Prisma.FerryRouteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFerryRoute>
          }
          groupBy: {
            args: Prisma.FerryRouteGroupByArgs<ExtArgs>
            result: $Utils.Optional<FerryRouteGroupByOutputType>[]
          }
          count: {
            args: Prisma.FerryRouteCountArgs<ExtArgs>
            result: $Utils.Optional<FerryRouteCountAggregateOutputType> | number
          }
        }
      }
      FlightRoute: {
        payload: Prisma.$FlightRoutePayload<ExtArgs>
        fields: Prisma.FlightRouteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FlightRouteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlightRoutePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FlightRouteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlightRoutePayload>
          }
          findFirst: {
            args: Prisma.FlightRouteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlightRoutePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FlightRouteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlightRoutePayload>
          }
          findMany: {
            args: Prisma.FlightRouteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlightRoutePayload>[]
          }
          create: {
            args: Prisma.FlightRouteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlightRoutePayload>
          }
          createMany: {
            args: Prisma.FlightRouteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FlightRouteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlightRoutePayload>[]
          }
          delete: {
            args: Prisma.FlightRouteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlightRoutePayload>
          }
          update: {
            args: Prisma.FlightRouteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlightRoutePayload>
          }
          deleteMany: {
            args: Prisma.FlightRouteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FlightRouteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.FlightRouteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlightRoutePayload>
          }
          aggregate: {
            args: Prisma.FlightRouteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFlightRoute>
          }
          groupBy: {
            args: Prisma.FlightRouteGroupByArgs<ExtArgs>
            result: $Utils.Optional<FlightRouteGroupByOutputType>[]
          }
          count: {
            args: Prisma.FlightRouteCountArgs<ExtArgs>
            result: $Utils.Optional<FlightRouteCountAggregateOutputType> | number
          }
        }
      }
      SlugHistory: {
        payload: Prisma.$SlugHistoryPayload<ExtArgs>
        fields: Prisma.SlugHistoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SlugHistoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SlugHistoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SlugHistoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SlugHistoryPayload>
          }
          findFirst: {
            args: Prisma.SlugHistoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SlugHistoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SlugHistoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SlugHistoryPayload>
          }
          findMany: {
            args: Prisma.SlugHistoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SlugHistoryPayload>[]
          }
          create: {
            args: Prisma.SlugHistoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SlugHistoryPayload>
          }
          createMany: {
            args: Prisma.SlugHistoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SlugHistoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SlugHistoryPayload>[]
          }
          delete: {
            args: Prisma.SlugHistoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SlugHistoryPayload>
          }
          update: {
            args: Prisma.SlugHistoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SlugHistoryPayload>
          }
          deleteMany: {
            args: Prisma.SlugHistoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SlugHistoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SlugHistoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SlugHistoryPayload>
          }
          aggregate: {
            args: Prisma.SlugHistoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSlugHistory>
          }
          groupBy: {
            args: Prisma.SlugHistoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<SlugHistoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.SlugHistoryCountArgs<ExtArgs>
            result: $Utils.Optional<SlugHistoryCountAggregateOutputType> | number
          }
        }
      }
      Redirect: {
        payload: Prisma.$RedirectPayload<ExtArgs>
        fields: Prisma.RedirectFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RedirectFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RedirectFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectPayload>
          }
          findFirst: {
            args: Prisma.RedirectFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RedirectFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectPayload>
          }
          findMany: {
            args: Prisma.RedirectFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectPayload>[]
          }
          create: {
            args: Prisma.RedirectCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectPayload>
          }
          createMany: {
            args: Prisma.RedirectCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RedirectCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectPayload>[]
          }
          delete: {
            args: Prisma.RedirectDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectPayload>
          }
          update: {
            args: Prisma.RedirectUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectPayload>
          }
          deleteMany: {
            args: Prisma.RedirectDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RedirectUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RedirectUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RedirectPayload>
          }
          aggregate: {
            args: Prisma.RedirectAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRedirect>
          }
          groupBy: {
            args: Prisma.RedirectGroupByArgs<ExtArgs>
            result: $Utils.Optional<RedirectGroupByOutputType>[]
          }
          count: {
            args: Prisma.RedirectCountArgs<ExtArgs>
            result: $Utils.Optional<RedirectCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type DestinationCountOutputType
   */

  export type DestinationCountOutputType = {
    children: number
    translations: number
    categories: number
    hotels: number
    guides: number
    ferryRoutes: number
    flightRoutes: number
    packageLinks: number
  }

  export type DestinationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    children?: boolean | DestinationCountOutputTypeCountChildrenArgs
    translations?: boolean | DestinationCountOutputTypeCountTranslationsArgs
    categories?: boolean | DestinationCountOutputTypeCountCategoriesArgs
    hotels?: boolean | DestinationCountOutputTypeCountHotelsArgs
    guides?: boolean | DestinationCountOutputTypeCountGuidesArgs
    ferryRoutes?: boolean | DestinationCountOutputTypeCountFerryRoutesArgs
    flightRoutes?: boolean | DestinationCountOutputTypeCountFlightRoutesArgs
    packageLinks?: boolean | DestinationCountOutputTypeCountPackageLinksArgs
  }

  // Custom InputTypes
  /**
   * DestinationCountOutputType without action
   */
  export type DestinationCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationCountOutputType
     */
    select?: DestinationCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DestinationCountOutputType without action
   */
  export type DestinationCountOutputTypeCountChildrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DestinationWhereInput
  }

  /**
   * DestinationCountOutputType without action
   */
  export type DestinationCountOutputTypeCountTranslationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DestinationTranslationWhereInput
  }

  /**
   * DestinationCountOutputType without action
   */
  export type DestinationCountOutputTypeCountCategoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DestinationCategoryWhereInput
  }

  /**
   * DestinationCountOutputType without action
   */
  export type DestinationCountOutputTypeCountHotelsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HotelWhereInput
  }

  /**
   * DestinationCountOutputType without action
   */
  export type DestinationCountOutputTypeCountGuidesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GuideWhereInput
  }

  /**
   * DestinationCountOutputType without action
   */
  export type DestinationCountOutputTypeCountFerryRoutesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FerryRouteWhereInput
  }

  /**
   * DestinationCountOutputType without action
   */
  export type DestinationCountOutputTypeCountFlightRoutesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FlightRouteWhereInput
  }

  /**
   * DestinationCountOutputType without action
   */
  export type DestinationCountOutputTypeCountPackageLinksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PackageDestinationWhereInput
  }


  /**
   * Count Type DestinationCategoryCountOutputType
   */

  export type DestinationCategoryCountOutputType = {
    packageLinks: number
  }

  export type DestinationCategoryCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    packageLinks?: boolean | DestinationCategoryCountOutputTypeCountPackageLinksArgs
  }

  // Custom InputTypes
  /**
   * DestinationCategoryCountOutputType without action
   */
  export type DestinationCategoryCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationCategoryCountOutputType
     */
    select?: DestinationCategoryCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DestinationCategoryCountOutputType without action
   */
  export type DestinationCategoryCountOutputTypeCountPackageLinksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PackageCategoryWhereInput
  }


  /**
   * Count Type HotelCountOutputType
   */

  export type HotelCountOutputType = {
    packageLinks: number
  }

  export type HotelCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    packageLinks?: boolean | HotelCountOutputTypeCountPackageLinksArgs
  }

  // Custom InputTypes
  /**
   * HotelCountOutputType without action
   */
  export type HotelCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HotelCountOutputType
     */
    select?: HotelCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * HotelCountOutputType without action
   */
  export type HotelCountOutputTypeCountPackageLinksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PackageHotelWhereInput
  }


  /**
   * Count Type PackageCountOutputType
   */

  export type PackageCountOutputType = {
    destinations: number
    hotels: number
    categories: number
  }

  export type PackageCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    destinations?: boolean | PackageCountOutputTypeCountDestinationsArgs
    hotels?: boolean | PackageCountOutputTypeCountHotelsArgs
    categories?: boolean | PackageCountOutputTypeCountCategoriesArgs
  }

  // Custom InputTypes
  /**
   * PackageCountOutputType without action
   */
  export type PackageCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageCountOutputType
     */
    select?: PackageCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PackageCountOutputType without action
   */
  export type PackageCountOutputTypeCountDestinationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PackageDestinationWhereInput
  }

  /**
   * PackageCountOutputType without action
   */
  export type PackageCountOutputTypeCountHotelsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PackageHotelWhereInput
  }

  /**
   * PackageCountOutputType without action
   */
  export type PackageCountOutputTypeCountCategoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PackageCategoryWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Destination
   */

  export type AggregateDestination = {
    _count: DestinationCountAggregateOutputType | null
    _avg: DestinationAvgAggregateOutputType | null
    _sum: DestinationSumAggregateOutputType | null
    _min: DestinationMinAggregateOutputType | null
    _max: DestinationMaxAggregateOutputType | null
  }

  export type DestinationAvgAggregateOutputType = {
    id: number | null
    parentId: number | null
    depth: number | null
    sortOrder: number | null
  }

  export type DestinationSumAggregateOutputType = {
    id: bigint | null
    parentId: bigint | null
    depth: number | null
    sortOrder: number | null
  }

  export type DestinationMinAggregateOutputType = {
    id: bigint | null
    parentId: bigint | null
    name: string | null
    slug: string | null
    slugPath: string | null
    level: $Enums.DestinationLevel | null
    depth: number | null
    metaTitle: string | null
    metaDescription: string | null
    seoContent: string | null
    imageUrl: string | null
    heroImageUrl: string | null
    sortOrder: number | null
    status: $Enums.DestinationStatus | null
    isFeatured: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    publishedAt: Date | null
  }

  export type DestinationMaxAggregateOutputType = {
    id: bigint | null
    parentId: bigint | null
    name: string | null
    slug: string | null
    slugPath: string | null
    level: $Enums.DestinationLevel | null
    depth: number | null
    metaTitle: string | null
    metaDescription: string | null
    seoContent: string | null
    imageUrl: string | null
    heroImageUrl: string | null
    sortOrder: number | null
    status: $Enums.DestinationStatus | null
    isFeatured: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    publishedAt: Date | null
  }

  export type DestinationCountAggregateOutputType = {
    id: number
    parentId: number
    name: number
    slug: number
    slugPath: number
    level: number
    depth: number
    metaTitle: number
    metaDescription: number
    seoContent: number
    imageUrl: number
    heroImageUrl: number
    gallery: number
    sortOrder: number
    status: number
    isFeatured: number
    createdAt: number
    updatedAt: number
    publishedAt: number
    _all: number
  }


  export type DestinationAvgAggregateInputType = {
    id?: true
    parentId?: true
    depth?: true
    sortOrder?: true
  }

  export type DestinationSumAggregateInputType = {
    id?: true
    parentId?: true
    depth?: true
    sortOrder?: true
  }

  export type DestinationMinAggregateInputType = {
    id?: true
    parentId?: true
    name?: true
    slug?: true
    slugPath?: true
    level?: true
    depth?: true
    metaTitle?: true
    metaDescription?: true
    seoContent?: true
    imageUrl?: true
    heroImageUrl?: true
    sortOrder?: true
    status?: true
    isFeatured?: true
    createdAt?: true
    updatedAt?: true
    publishedAt?: true
  }

  export type DestinationMaxAggregateInputType = {
    id?: true
    parentId?: true
    name?: true
    slug?: true
    slugPath?: true
    level?: true
    depth?: true
    metaTitle?: true
    metaDescription?: true
    seoContent?: true
    imageUrl?: true
    heroImageUrl?: true
    sortOrder?: true
    status?: true
    isFeatured?: true
    createdAt?: true
    updatedAt?: true
    publishedAt?: true
  }

  export type DestinationCountAggregateInputType = {
    id?: true
    parentId?: true
    name?: true
    slug?: true
    slugPath?: true
    level?: true
    depth?: true
    metaTitle?: true
    metaDescription?: true
    seoContent?: true
    imageUrl?: true
    heroImageUrl?: true
    gallery?: true
    sortOrder?: true
    status?: true
    isFeatured?: true
    createdAt?: true
    updatedAt?: true
    publishedAt?: true
    _all?: true
  }

  export type DestinationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Destination to aggregate.
     */
    where?: DestinationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Destinations to fetch.
     */
    orderBy?: DestinationOrderByWithRelationInput | DestinationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DestinationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Destinations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Destinations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Destinations
    **/
    _count?: true | DestinationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DestinationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DestinationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DestinationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DestinationMaxAggregateInputType
  }

  export type GetDestinationAggregateType<T extends DestinationAggregateArgs> = {
        [P in keyof T & keyof AggregateDestination]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDestination[P]>
      : GetScalarType<T[P], AggregateDestination[P]>
  }




  export type DestinationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DestinationWhereInput
    orderBy?: DestinationOrderByWithAggregationInput | DestinationOrderByWithAggregationInput[]
    by: DestinationScalarFieldEnum[] | DestinationScalarFieldEnum
    having?: DestinationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DestinationCountAggregateInputType | true
    _avg?: DestinationAvgAggregateInputType
    _sum?: DestinationSumAggregateInputType
    _min?: DestinationMinAggregateInputType
    _max?: DestinationMaxAggregateInputType
  }

  export type DestinationGroupByOutputType = {
    id: bigint
    parentId: bigint | null
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle: string | null
    metaDescription: string | null
    seoContent: string | null
    imageUrl: string | null
    heroImageUrl: string | null
    gallery: string[]
    sortOrder: number
    status: $Enums.DestinationStatus
    isFeatured: boolean
    createdAt: Date
    updatedAt: Date
    publishedAt: Date | null
    _count: DestinationCountAggregateOutputType | null
    _avg: DestinationAvgAggregateOutputType | null
    _sum: DestinationSumAggregateOutputType | null
    _min: DestinationMinAggregateOutputType | null
    _max: DestinationMaxAggregateOutputType | null
  }

  type GetDestinationGroupByPayload<T extends DestinationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DestinationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DestinationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DestinationGroupByOutputType[P]>
            : GetScalarType<T[P], DestinationGroupByOutputType[P]>
        }
      >
    >


  export type DestinationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    parentId?: boolean
    name?: boolean
    slug?: boolean
    slugPath?: boolean
    level?: boolean
    depth?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    seoContent?: boolean
    imageUrl?: boolean
    heroImageUrl?: boolean
    gallery?: boolean
    sortOrder?: boolean
    status?: boolean
    isFeatured?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    publishedAt?: boolean
    parent?: boolean | Destination$parentArgs<ExtArgs>
    children?: boolean | Destination$childrenArgs<ExtArgs>
    translations?: boolean | Destination$translationsArgs<ExtArgs>
    categories?: boolean | Destination$categoriesArgs<ExtArgs>
    hotels?: boolean | Destination$hotelsArgs<ExtArgs>
    guides?: boolean | Destination$guidesArgs<ExtArgs>
    ferryRoutes?: boolean | Destination$ferryRoutesArgs<ExtArgs>
    flightRoutes?: boolean | Destination$flightRoutesArgs<ExtArgs>
    packageLinks?: boolean | Destination$packageLinksArgs<ExtArgs>
    _count?: boolean | DestinationCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["destination"]>

  export type DestinationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    parentId?: boolean
    name?: boolean
    slug?: boolean
    slugPath?: boolean
    level?: boolean
    depth?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    seoContent?: boolean
    imageUrl?: boolean
    heroImageUrl?: boolean
    gallery?: boolean
    sortOrder?: boolean
    status?: boolean
    isFeatured?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    publishedAt?: boolean
    parent?: boolean | Destination$parentArgs<ExtArgs>
  }, ExtArgs["result"]["destination"]>

  export type DestinationSelectScalar = {
    id?: boolean
    parentId?: boolean
    name?: boolean
    slug?: boolean
    slugPath?: boolean
    level?: boolean
    depth?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    seoContent?: boolean
    imageUrl?: boolean
    heroImageUrl?: boolean
    gallery?: boolean
    sortOrder?: boolean
    status?: boolean
    isFeatured?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    publishedAt?: boolean
  }

  export type DestinationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | Destination$parentArgs<ExtArgs>
    children?: boolean | Destination$childrenArgs<ExtArgs>
    translations?: boolean | Destination$translationsArgs<ExtArgs>
    categories?: boolean | Destination$categoriesArgs<ExtArgs>
    hotels?: boolean | Destination$hotelsArgs<ExtArgs>
    guides?: boolean | Destination$guidesArgs<ExtArgs>
    ferryRoutes?: boolean | Destination$ferryRoutesArgs<ExtArgs>
    flightRoutes?: boolean | Destination$flightRoutesArgs<ExtArgs>
    packageLinks?: boolean | Destination$packageLinksArgs<ExtArgs>
    _count?: boolean | DestinationCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DestinationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | Destination$parentArgs<ExtArgs>
  }

  export type $DestinationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Destination"
    objects: {
      parent: Prisma.$DestinationPayload<ExtArgs> | null
      children: Prisma.$DestinationPayload<ExtArgs>[]
      translations: Prisma.$DestinationTranslationPayload<ExtArgs>[]
      categories: Prisma.$DestinationCategoryPayload<ExtArgs>[]
      hotels: Prisma.$HotelPayload<ExtArgs>[]
      guides: Prisma.$GuidePayload<ExtArgs>[]
      ferryRoutes: Prisma.$FerryRoutePayload<ExtArgs>[]
      flightRoutes: Prisma.$FlightRoutePayload<ExtArgs>[]
      packageLinks: Prisma.$PackageDestinationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      parentId: bigint | null
      name: string
      slug: string
      slugPath: string
      level: $Enums.DestinationLevel
      depth: number
      metaTitle: string | null
      metaDescription: string | null
      seoContent: string | null
      imageUrl: string | null
      heroImageUrl: string | null
      gallery: string[]
      sortOrder: number
      status: $Enums.DestinationStatus
      isFeatured: boolean
      createdAt: Date
      updatedAt: Date
      publishedAt: Date | null
    }, ExtArgs["result"]["destination"]>
    composites: {}
  }

  type DestinationGetPayload<S extends boolean | null | undefined | DestinationDefaultArgs> = $Result.GetResult<Prisma.$DestinationPayload, S>

  type DestinationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DestinationFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DestinationCountAggregateInputType | true
    }

  export interface DestinationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Destination'], meta: { name: 'Destination' } }
    /**
     * Find zero or one Destination that matches the filter.
     * @param {DestinationFindUniqueArgs} args - Arguments to find a Destination
     * @example
     * // Get one Destination
     * const destination = await prisma.destination.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DestinationFindUniqueArgs>(args: SelectSubset<T, DestinationFindUniqueArgs<ExtArgs>>): Prisma__DestinationClient<$Result.GetResult<Prisma.$DestinationPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Destination that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DestinationFindUniqueOrThrowArgs} args - Arguments to find a Destination
     * @example
     * // Get one Destination
     * const destination = await prisma.destination.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DestinationFindUniqueOrThrowArgs>(args: SelectSubset<T, DestinationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DestinationClient<$Result.GetResult<Prisma.$DestinationPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Destination that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinationFindFirstArgs} args - Arguments to find a Destination
     * @example
     * // Get one Destination
     * const destination = await prisma.destination.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DestinationFindFirstArgs>(args?: SelectSubset<T, DestinationFindFirstArgs<ExtArgs>>): Prisma__DestinationClient<$Result.GetResult<Prisma.$DestinationPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Destination that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinationFindFirstOrThrowArgs} args - Arguments to find a Destination
     * @example
     * // Get one Destination
     * const destination = await prisma.destination.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DestinationFindFirstOrThrowArgs>(args?: SelectSubset<T, DestinationFindFirstOrThrowArgs<ExtArgs>>): Prisma__DestinationClient<$Result.GetResult<Prisma.$DestinationPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Destinations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Destinations
     * const destinations = await prisma.destination.findMany()
     * 
     * // Get first 10 Destinations
     * const destinations = await prisma.destination.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const destinationWithIdOnly = await prisma.destination.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DestinationFindManyArgs>(args?: SelectSubset<T, DestinationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DestinationPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Destination.
     * @param {DestinationCreateArgs} args - Arguments to create a Destination.
     * @example
     * // Create one Destination
     * const Destination = await prisma.destination.create({
     *   data: {
     *     // ... data to create a Destination
     *   }
     * })
     * 
     */
    create<T extends DestinationCreateArgs>(args: SelectSubset<T, DestinationCreateArgs<ExtArgs>>): Prisma__DestinationClient<$Result.GetResult<Prisma.$DestinationPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Destinations.
     * @param {DestinationCreateManyArgs} args - Arguments to create many Destinations.
     * @example
     * // Create many Destinations
     * const destination = await prisma.destination.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DestinationCreateManyArgs>(args?: SelectSubset<T, DestinationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Destinations and returns the data saved in the database.
     * @param {DestinationCreateManyAndReturnArgs} args - Arguments to create many Destinations.
     * @example
     * // Create many Destinations
     * const destination = await prisma.destination.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Destinations and only return the `id`
     * const destinationWithIdOnly = await prisma.destination.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DestinationCreateManyAndReturnArgs>(args?: SelectSubset<T, DestinationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DestinationPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Destination.
     * @param {DestinationDeleteArgs} args - Arguments to delete one Destination.
     * @example
     * // Delete one Destination
     * const Destination = await prisma.destination.delete({
     *   where: {
     *     // ... filter to delete one Destination
     *   }
     * })
     * 
     */
    delete<T extends DestinationDeleteArgs>(args: SelectSubset<T, DestinationDeleteArgs<ExtArgs>>): Prisma__DestinationClient<$Result.GetResult<Prisma.$DestinationPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Destination.
     * @param {DestinationUpdateArgs} args - Arguments to update one Destination.
     * @example
     * // Update one Destination
     * const destination = await prisma.destination.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DestinationUpdateArgs>(args: SelectSubset<T, DestinationUpdateArgs<ExtArgs>>): Prisma__DestinationClient<$Result.GetResult<Prisma.$DestinationPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Destinations.
     * @param {DestinationDeleteManyArgs} args - Arguments to filter Destinations to delete.
     * @example
     * // Delete a few Destinations
     * const { count } = await prisma.destination.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DestinationDeleteManyArgs>(args?: SelectSubset<T, DestinationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Destinations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Destinations
     * const destination = await prisma.destination.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DestinationUpdateManyArgs>(args: SelectSubset<T, DestinationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Destination.
     * @param {DestinationUpsertArgs} args - Arguments to update or create a Destination.
     * @example
     * // Update or create a Destination
     * const destination = await prisma.destination.upsert({
     *   create: {
     *     // ... data to create a Destination
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Destination we want to update
     *   }
     * })
     */
    upsert<T extends DestinationUpsertArgs>(args: SelectSubset<T, DestinationUpsertArgs<ExtArgs>>): Prisma__DestinationClient<$Result.GetResult<Prisma.$DestinationPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Destinations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinationCountArgs} args - Arguments to filter Destinations to count.
     * @example
     * // Count the number of Destinations
     * const count = await prisma.destination.count({
     *   where: {
     *     // ... the filter for the Destinations we want to count
     *   }
     * })
    **/
    count<T extends DestinationCountArgs>(
      args?: Subset<T, DestinationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DestinationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Destination.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DestinationAggregateArgs>(args: Subset<T, DestinationAggregateArgs>): Prisma.PrismaPromise<GetDestinationAggregateType<T>>

    /**
     * Group by Destination.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DestinationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DestinationGroupByArgs['orderBy'] }
        : { orderBy?: DestinationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DestinationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDestinationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Destination model
   */
  readonly fields: DestinationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Destination.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DestinationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    parent<T extends Destination$parentArgs<ExtArgs> = {}>(args?: Subset<T, Destination$parentArgs<ExtArgs>>): Prisma__DestinationClient<$Result.GetResult<Prisma.$DestinationPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    children<T extends Destination$childrenArgs<ExtArgs> = {}>(args?: Subset<T, Destination$childrenArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DestinationPayload<ExtArgs>, T, "findMany"> | Null>
    translations<T extends Destination$translationsArgs<ExtArgs> = {}>(args?: Subset<T, Destination$translationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DestinationTranslationPayload<ExtArgs>, T, "findMany"> | Null>
    categories<T extends Destination$categoriesArgs<ExtArgs> = {}>(args?: Subset<T, Destination$categoriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DestinationCategoryPayload<ExtArgs>, T, "findMany"> | Null>
    hotels<T extends Destination$hotelsArgs<ExtArgs> = {}>(args?: Subset<T, Destination$hotelsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HotelPayload<ExtArgs>, T, "findMany"> | Null>
    guides<T extends Destination$guidesArgs<ExtArgs> = {}>(args?: Subset<T, Destination$guidesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "findMany"> | Null>
    ferryRoutes<T extends Destination$ferryRoutesArgs<ExtArgs> = {}>(args?: Subset<T, Destination$ferryRoutesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FerryRoutePayload<ExtArgs>, T, "findMany"> | Null>
    flightRoutes<T extends Destination$flightRoutesArgs<ExtArgs> = {}>(args?: Subset<T, Destination$flightRoutesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FlightRoutePayload<ExtArgs>, T, "findMany"> | Null>
    packageLinks<T extends Destination$packageLinksArgs<ExtArgs> = {}>(args?: Subset<T, Destination$packageLinksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackageDestinationPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Destination model
   */ 
  interface DestinationFieldRefs {
    readonly id: FieldRef<"Destination", 'BigInt'>
    readonly parentId: FieldRef<"Destination", 'BigInt'>
    readonly name: FieldRef<"Destination", 'String'>
    readonly slug: FieldRef<"Destination", 'String'>
    readonly slugPath: FieldRef<"Destination", 'String'>
    readonly level: FieldRef<"Destination", 'DestinationLevel'>
    readonly depth: FieldRef<"Destination", 'Int'>
    readonly metaTitle: FieldRef<"Destination", 'String'>
    readonly metaDescription: FieldRef<"Destination", 'String'>
    readonly seoContent: FieldRef<"Destination", 'String'>
    readonly imageUrl: FieldRef<"Destination", 'String'>
    readonly heroImageUrl: FieldRef<"Destination", 'String'>
    readonly gallery: FieldRef<"Destination", 'String[]'>
    readonly sortOrder: FieldRef<"Destination", 'Int'>
    readonly status: FieldRef<"Destination", 'DestinationStatus'>
    readonly isFeatured: FieldRef<"Destination", 'Boolean'>
    readonly createdAt: FieldRef<"Destination", 'DateTime'>
    readonly updatedAt: FieldRef<"Destination", 'DateTime'>
    readonly publishedAt: FieldRef<"Destination", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Destination findUnique
   */
  export type DestinationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Destination
     */
    select?: DestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationInclude<ExtArgs> | null
    /**
     * Filter, which Destination to fetch.
     */
    where: DestinationWhereUniqueInput
  }

  /**
   * Destination findUniqueOrThrow
   */
  export type DestinationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Destination
     */
    select?: DestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationInclude<ExtArgs> | null
    /**
     * Filter, which Destination to fetch.
     */
    where: DestinationWhereUniqueInput
  }

  /**
   * Destination findFirst
   */
  export type DestinationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Destination
     */
    select?: DestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationInclude<ExtArgs> | null
    /**
     * Filter, which Destination to fetch.
     */
    where?: DestinationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Destinations to fetch.
     */
    orderBy?: DestinationOrderByWithRelationInput | DestinationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Destinations.
     */
    cursor?: DestinationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Destinations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Destinations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Destinations.
     */
    distinct?: DestinationScalarFieldEnum | DestinationScalarFieldEnum[]
  }

  /**
   * Destination findFirstOrThrow
   */
  export type DestinationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Destination
     */
    select?: DestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationInclude<ExtArgs> | null
    /**
     * Filter, which Destination to fetch.
     */
    where?: DestinationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Destinations to fetch.
     */
    orderBy?: DestinationOrderByWithRelationInput | DestinationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Destinations.
     */
    cursor?: DestinationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Destinations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Destinations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Destinations.
     */
    distinct?: DestinationScalarFieldEnum | DestinationScalarFieldEnum[]
  }

  /**
   * Destination findMany
   */
  export type DestinationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Destination
     */
    select?: DestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationInclude<ExtArgs> | null
    /**
     * Filter, which Destinations to fetch.
     */
    where?: DestinationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Destinations to fetch.
     */
    orderBy?: DestinationOrderByWithRelationInput | DestinationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Destinations.
     */
    cursor?: DestinationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Destinations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Destinations.
     */
    skip?: number
    distinct?: DestinationScalarFieldEnum | DestinationScalarFieldEnum[]
  }

  /**
   * Destination create
   */
  export type DestinationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Destination
     */
    select?: DestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationInclude<ExtArgs> | null
    /**
     * The data needed to create a Destination.
     */
    data: XOR<DestinationCreateInput, DestinationUncheckedCreateInput>
  }

  /**
   * Destination createMany
   */
  export type DestinationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Destinations.
     */
    data: DestinationCreateManyInput | DestinationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Destination createManyAndReturn
   */
  export type DestinationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Destination
     */
    select?: DestinationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Destinations.
     */
    data: DestinationCreateManyInput | DestinationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Destination update
   */
  export type DestinationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Destination
     */
    select?: DestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationInclude<ExtArgs> | null
    /**
     * The data needed to update a Destination.
     */
    data: XOR<DestinationUpdateInput, DestinationUncheckedUpdateInput>
    /**
     * Choose, which Destination to update.
     */
    where: DestinationWhereUniqueInput
  }

  /**
   * Destination updateMany
   */
  export type DestinationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Destinations.
     */
    data: XOR<DestinationUpdateManyMutationInput, DestinationUncheckedUpdateManyInput>
    /**
     * Filter which Destinations to update
     */
    where?: DestinationWhereInput
  }

  /**
   * Destination upsert
   */
  export type DestinationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Destination
     */
    select?: DestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationInclude<ExtArgs> | null
    /**
     * The filter to search for the Destination to update in case it exists.
     */
    where: DestinationWhereUniqueInput
    /**
     * In case the Destination found by the `where` argument doesn't exist, create a new Destination with this data.
     */
    create: XOR<DestinationCreateInput, DestinationUncheckedCreateInput>
    /**
     * In case the Destination was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DestinationUpdateInput, DestinationUncheckedUpdateInput>
  }

  /**
   * Destination delete
   */
  export type DestinationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Destination
     */
    select?: DestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationInclude<ExtArgs> | null
    /**
     * Filter which Destination to delete.
     */
    where: DestinationWhereUniqueInput
  }

  /**
   * Destination deleteMany
   */
  export type DestinationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Destinations to delete
     */
    where?: DestinationWhereInput
  }

  /**
   * Destination.parent
   */
  export type Destination$parentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Destination
     */
    select?: DestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationInclude<ExtArgs> | null
    where?: DestinationWhereInput
  }

  /**
   * Destination.children
   */
  export type Destination$childrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Destination
     */
    select?: DestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationInclude<ExtArgs> | null
    where?: DestinationWhereInput
    orderBy?: DestinationOrderByWithRelationInput | DestinationOrderByWithRelationInput[]
    cursor?: DestinationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DestinationScalarFieldEnum | DestinationScalarFieldEnum[]
  }

  /**
   * Destination.translations
   */
  export type Destination$translationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationTranslation
     */
    select?: DestinationTranslationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationTranslationInclude<ExtArgs> | null
    where?: DestinationTranslationWhereInput
    orderBy?: DestinationTranslationOrderByWithRelationInput | DestinationTranslationOrderByWithRelationInput[]
    cursor?: DestinationTranslationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DestinationTranslationScalarFieldEnum | DestinationTranslationScalarFieldEnum[]
  }

  /**
   * Destination.categories
   */
  export type Destination$categoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationCategory
     */
    select?: DestinationCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationCategoryInclude<ExtArgs> | null
    where?: DestinationCategoryWhereInput
    orderBy?: DestinationCategoryOrderByWithRelationInput | DestinationCategoryOrderByWithRelationInput[]
    cursor?: DestinationCategoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DestinationCategoryScalarFieldEnum | DestinationCategoryScalarFieldEnum[]
  }

  /**
   * Destination.hotels
   */
  export type Destination$hotelsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Hotel
     */
    select?: HotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HotelInclude<ExtArgs> | null
    where?: HotelWhereInput
    orderBy?: HotelOrderByWithRelationInput | HotelOrderByWithRelationInput[]
    cursor?: HotelWhereUniqueInput
    take?: number
    skip?: number
    distinct?: HotelScalarFieldEnum | HotelScalarFieldEnum[]
  }

  /**
   * Destination.guides
   */
  export type Destination$guidesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideInclude<ExtArgs> | null
    where?: GuideWhereInput
    orderBy?: GuideOrderByWithRelationInput | GuideOrderByWithRelationInput[]
    cursor?: GuideWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GuideScalarFieldEnum | GuideScalarFieldEnum[]
  }

  /**
   * Destination.ferryRoutes
   */
  export type Destination$ferryRoutesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FerryRoute
     */
    select?: FerryRouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FerryRouteInclude<ExtArgs> | null
    where?: FerryRouteWhereInput
    orderBy?: FerryRouteOrderByWithRelationInput | FerryRouteOrderByWithRelationInput[]
    cursor?: FerryRouteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FerryRouteScalarFieldEnum | FerryRouteScalarFieldEnum[]
  }

  /**
   * Destination.flightRoutes
   */
  export type Destination$flightRoutesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlightRoute
     */
    select?: FlightRouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlightRouteInclude<ExtArgs> | null
    where?: FlightRouteWhereInput
    orderBy?: FlightRouteOrderByWithRelationInput | FlightRouteOrderByWithRelationInput[]
    cursor?: FlightRouteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FlightRouteScalarFieldEnum | FlightRouteScalarFieldEnum[]
  }

  /**
   * Destination.packageLinks
   */
  export type Destination$packageLinksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageDestination
     */
    select?: PackageDestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageDestinationInclude<ExtArgs> | null
    where?: PackageDestinationWhereInput
    orderBy?: PackageDestinationOrderByWithRelationInput | PackageDestinationOrderByWithRelationInput[]
    cursor?: PackageDestinationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PackageDestinationScalarFieldEnum | PackageDestinationScalarFieldEnum[]
  }

  /**
   * Destination without action
   */
  export type DestinationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Destination
     */
    select?: DestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationInclude<ExtArgs> | null
  }


  /**
   * Model DestinationTranslation
   */

  export type AggregateDestinationTranslation = {
    _count: DestinationTranslationCountAggregateOutputType | null
    _avg: DestinationTranslationAvgAggregateOutputType | null
    _sum: DestinationTranslationSumAggregateOutputType | null
    _min: DestinationTranslationMinAggregateOutputType | null
    _max: DestinationTranslationMaxAggregateOutputType | null
  }

  export type DestinationTranslationAvgAggregateOutputType = {
    destinationId: number | null
  }

  export type DestinationTranslationSumAggregateOutputType = {
    destinationId: bigint | null
  }

  export type DestinationTranslationMinAggregateOutputType = {
    destinationId: bigint | null
    locale: string | null
    name: string | null
    slug: string | null
    metaTitle: string | null
    metaDescription: string | null
    seoContent: string | null
  }

  export type DestinationTranslationMaxAggregateOutputType = {
    destinationId: bigint | null
    locale: string | null
    name: string | null
    slug: string | null
    metaTitle: string | null
    metaDescription: string | null
    seoContent: string | null
  }

  export type DestinationTranslationCountAggregateOutputType = {
    destinationId: number
    locale: number
    name: number
    slug: number
    metaTitle: number
    metaDescription: number
    seoContent: number
    _all: number
  }


  export type DestinationTranslationAvgAggregateInputType = {
    destinationId?: true
  }

  export type DestinationTranslationSumAggregateInputType = {
    destinationId?: true
  }

  export type DestinationTranslationMinAggregateInputType = {
    destinationId?: true
    locale?: true
    name?: true
    slug?: true
    metaTitle?: true
    metaDescription?: true
    seoContent?: true
  }

  export type DestinationTranslationMaxAggregateInputType = {
    destinationId?: true
    locale?: true
    name?: true
    slug?: true
    metaTitle?: true
    metaDescription?: true
    seoContent?: true
  }

  export type DestinationTranslationCountAggregateInputType = {
    destinationId?: true
    locale?: true
    name?: true
    slug?: true
    metaTitle?: true
    metaDescription?: true
    seoContent?: true
    _all?: true
  }

  export type DestinationTranslationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DestinationTranslation to aggregate.
     */
    where?: DestinationTranslationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DestinationTranslations to fetch.
     */
    orderBy?: DestinationTranslationOrderByWithRelationInput | DestinationTranslationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DestinationTranslationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DestinationTranslations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DestinationTranslations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DestinationTranslations
    **/
    _count?: true | DestinationTranslationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DestinationTranslationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DestinationTranslationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DestinationTranslationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DestinationTranslationMaxAggregateInputType
  }

  export type GetDestinationTranslationAggregateType<T extends DestinationTranslationAggregateArgs> = {
        [P in keyof T & keyof AggregateDestinationTranslation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDestinationTranslation[P]>
      : GetScalarType<T[P], AggregateDestinationTranslation[P]>
  }




  export type DestinationTranslationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DestinationTranslationWhereInput
    orderBy?: DestinationTranslationOrderByWithAggregationInput | DestinationTranslationOrderByWithAggregationInput[]
    by: DestinationTranslationScalarFieldEnum[] | DestinationTranslationScalarFieldEnum
    having?: DestinationTranslationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DestinationTranslationCountAggregateInputType | true
    _avg?: DestinationTranslationAvgAggregateInputType
    _sum?: DestinationTranslationSumAggregateInputType
    _min?: DestinationTranslationMinAggregateInputType
    _max?: DestinationTranslationMaxAggregateInputType
  }

  export type DestinationTranslationGroupByOutputType = {
    destinationId: bigint
    locale: string
    name: string
    slug: string
    metaTitle: string | null
    metaDescription: string | null
    seoContent: string | null
    _count: DestinationTranslationCountAggregateOutputType | null
    _avg: DestinationTranslationAvgAggregateOutputType | null
    _sum: DestinationTranslationSumAggregateOutputType | null
    _min: DestinationTranslationMinAggregateOutputType | null
    _max: DestinationTranslationMaxAggregateOutputType | null
  }

  type GetDestinationTranslationGroupByPayload<T extends DestinationTranslationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DestinationTranslationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DestinationTranslationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DestinationTranslationGroupByOutputType[P]>
            : GetScalarType<T[P], DestinationTranslationGroupByOutputType[P]>
        }
      >
    >


  export type DestinationTranslationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    destinationId?: boolean
    locale?: boolean
    name?: boolean
    slug?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    seoContent?: boolean
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["destinationTranslation"]>

  export type DestinationTranslationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    destinationId?: boolean
    locale?: boolean
    name?: boolean
    slug?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    seoContent?: boolean
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["destinationTranslation"]>

  export type DestinationTranslationSelectScalar = {
    destinationId?: boolean
    locale?: boolean
    name?: boolean
    slug?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    seoContent?: boolean
  }

  export type DestinationTranslationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }
  export type DestinationTranslationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }

  export type $DestinationTranslationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DestinationTranslation"
    objects: {
      destination: Prisma.$DestinationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      destinationId: bigint
      locale: string
      name: string
      slug: string
      metaTitle: string | null
      metaDescription: string | null
      seoContent: string | null
    }, ExtArgs["result"]["destinationTranslation"]>
    composites: {}
  }

  type DestinationTranslationGetPayload<S extends boolean | null | undefined | DestinationTranslationDefaultArgs> = $Result.GetResult<Prisma.$DestinationTranslationPayload, S>

  type DestinationTranslationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DestinationTranslationFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DestinationTranslationCountAggregateInputType | true
    }

  export interface DestinationTranslationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DestinationTranslation'], meta: { name: 'DestinationTranslation' } }
    /**
     * Find zero or one DestinationTranslation that matches the filter.
     * @param {DestinationTranslationFindUniqueArgs} args - Arguments to find a DestinationTranslation
     * @example
     * // Get one DestinationTranslation
     * const destinationTranslation = await prisma.destinationTranslation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DestinationTranslationFindUniqueArgs>(args: SelectSubset<T, DestinationTranslationFindUniqueArgs<ExtArgs>>): Prisma__DestinationTranslationClient<$Result.GetResult<Prisma.$DestinationTranslationPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one DestinationTranslation that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DestinationTranslationFindUniqueOrThrowArgs} args - Arguments to find a DestinationTranslation
     * @example
     * // Get one DestinationTranslation
     * const destinationTranslation = await prisma.destinationTranslation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DestinationTranslationFindUniqueOrThrowArgs>(args: SelectSubset<T, DestinationTranslationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DestinationTranslationClient<$Result.GetResult<Prisma.$DestinationTranslationPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first DestinationTranslation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinationTranslationFindFirstArgs} args - Arguments to find a DestinationTranslation
     * @example
     * // Get one DestinationTranslation
     * const destinationTranslation = await prisma.destinationTranslation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DestinationTranslationFindFirstArgs>(args?: SelectSubset<T, DestinationTranslationFindFirstArgs<ExtArgs>>): Prisma__DestinationTranslationClient<$Result.GetResult<Prisma.$DestinationTranslationPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first DestinationTranslation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinationTranslationFindFirstOrThrowArgs} args - Arguments to find a DestinationTranslation
     * @example
     * // Get one DestinationTranslation
     * const destinationTranslation = await prisma.destinationTranslation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DestinationTranslationFindFirstOrThrowArgs>(args?: SelectSubset<T, DestinationTranslationFindFirstOrThrowArgs<ExtArgs>>): Prisma__DestinationTranslationClient<$Result.GetResult<Prisma.$DestinationTranslationPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more DestinationTranslations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinationTranslationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DestinationTranslations
     * const destinationTranslations = await prisma.destinationTranslation.findMany()
     * 
     * // Get first 10 DestinationTranslations
     * const destinationTranslations = await prisma.destinationTranslation.findMany({ take: 10 })
     * 
     * // Only select the `destinationId`
     * const destinationTranslationWithDestinationIdOnly = await prisma.destinationTranslation.findMany({ select: { destinationId: true } })
     * 
     */
    findMany<T extends DestinationTranslationFindManyArgs>(args?: SelectSubset<T, DestinationTranslationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DestinationTranslationPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a DestinationTranslation.
     * @param {DestinationTranslationCreateArgs} args - Arguments to create a DestinationTranslation.
     * @example
     * // Create one DestinationTranslation
     * const DestinationTranslation = await prisma.destinationTranslation.create({
     *   data: {
     *     // ... data to create a DestinationTranslation
     *   }
     * })
     * 
     */
    create<T extends DestinationTranslationCreateArgs>(args: SelectSubset<T, DestinationTranslationCreateArgs<ExtArgs>>): Prisma__DestinationTranslationClient<$Result.GetResult<Prisma.$DestinationTranslationPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many DestinationTranslations.
     * @param {DestinationTranslationCreateManyArgs} args - Arguments to create many DestinationTranslations.
     * @example
     * // Create many DestinationTranslations
     * const destinationTranslation = await prisma.destinationTranslation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DestinationTranslationCreateManyArgs>(args?: SelectSubset<T, DestinationTranslationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DestinationTranslations and returns the data saved in the database.
     * @param {DestinationTranslationCreateManyAndReturnArgs} args - Arguments to create many DestinationTranslations.
     * @example
     * // Create many DestinationTranslations
     * const destinationTranslation = await prisma.destinationTranslation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DestinationTranslations and only return the `destinationId`
     * const destinationTranslationWithDestinationIdOnly = await prisma.destinationTranslation.createManyAndReturn({ 
     *   select: { destinationId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DestinationTranslationCreateManyAndReturnArgs>(args?: SelectSubset<T, DestinationTranslationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DestinationTranslationPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a DestinationTranslation.
     * @param {DestinationTranslationDeleteArgs} args - Arguments to delete one DestinationTranslation.
     * @example
     * // Delete one DestinationTranslation
     * const DestinationTranslation = await prisma.destinationTranslation.delete({
     *   where: {
     *     // ... filter to delete one DestinationTranslation
     *   }
     * })
     * 
     */
    delete<T extends DestinationTranslationDeleteArgs>(args: SelectSubset<T, DestinationTranslationDeleteArgs<ExtArgs>>): Prisma__DestinationTranslationClient<$Result.GetResult<Prisma.$DestinationTranslationPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one DestinationTranslation.
     * @param {DestinationTranslationUpdateArgs} args - Arguments to update one DestinationTranslation.
     * @example
     * // Update one DestinationTranslation
     * const destinationTranslation = await prisma.destinationTranslation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DestinationTranslationUpdateArgs>(args: SelectSubset<T, DestinationTranslationUpdateArgs<ExtArgs>>): Prisma__DestinationTranslationClient<$Result.GetResult<Prisma.$DestinationTranslationPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more DestinationTranslations.
     * @param {DestinationTranslationDeleteManyArgs} args - Arguments to filter DestinationTranslations to delete.
     * @example
     * // Delete a few DestinationTranslations
     * const { count } = await prisma.destinationTranslation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DestinationTranslationDeleteManyArgs>(args?: SelectSubset<T, DestinationTranslationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DestinationTranslations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinationTranslationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DestinationTranslations
     * const destinationTranslation = await prisma.destinationTranslation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DestinationTranslationUpdateManyArgs>(args: SelectSubset<T, DestinationTranslationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DestinationTranslation.
     * @param {DestinationTranslationUpsertArgs} args - Arguments to update or create a DestinationTranslation.
     * @example
     * // Update or create a DestinationTranslation
     * const destinationTranslation = await prisma.destinationTranslation.upsert({
     *   create: {
     *     // ... data to create a DestinationTranslation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DestinationTranslation we want to update
     *   }
     * })
     */
    upsert<T extends DestinationTranslationUpsertArgs>(args: SelectSubset<T, DestinationTranslationUpsertArgs<ExtArgs>>): Prisma__DestinationTranslationClient<$Result.GetResult<Prisma.$DestinationTranslationPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of DestinationTranslations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinationTranslationCountArgs} args - Arguments to filter DestinationTranslations to count.
     * @example
     * // Count the number of DestinationTranslations
     * const count = await prisma.destinationTranslation.count({
     *   where: {
     *     // ... the filter for the DestinationTranslations we want to count
     *   }
     * })
    **/
    count<T extends DestinationTranslationCountArgs>(
      args?: Subset<T, DestinationTranslationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DestinationTranslationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DestinationTranslation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinationTranslationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DestinationTranslationAggregateArgs>(args: Subset<T, DestinationTranslationAggregateArgs>): Prisma.PrismaPromise<GetDestinationTranslationAggregateType<T>>

    /**
     * Group by DestinationTranslation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinationTranslationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DestinationTranslationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DestinationTranslationGroupByArgs['orderBy'] }
        : { orderBy?: DestinationTranslationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DestinationTranslationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDestinationTranslationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DestinationTranslation model
   */
  readonly fields: DestinationTranslationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DestinationTranslation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DestinationTranslationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    destination<T extends DestinationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DestinationDefaultArgs<ExtArgs>>): Prisma__DestinationClient<$Result.GetResult<Prisma.$DestinationPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DestinationTranslation model
   */ 
  interface DestinationTranslationFieldRefs {
    readonly destinationId: FieldRef<"DestinationTranslation", 'BigInt'>
    readonly locale: FieldRef<"DestinationTranslation", 'String'>
    readonly name: FieldRef<"DestinationTranslation", 'String'>
    readonly slug: FieldRef<"DestinationTranslation", 'String'>
    readonly metaTitle: FieldRef<"DestinationTranslation", 'String'>
    readonly metaDescription: FieldRef<"DestinationTranslation", 'String'>
    readonly seoContent: FieldRef<"DestinationTranslation", 'String'>
  }
    

  // Custom InputTypes
  /**
   * DestinationTranslation findUnique
   */
  export type DestinationTranslationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationTranslation
     */
    select?: DestinationTranslationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationTranslationInclude<ExtArgs> | null
    /**
     * Filter, which DestinationTranslation to fetch.
     */
    where: DestinationTranslationWhereUniqueInput
  }

  /**
   * DestinationTranslation findUniqueOrThrow
   */
  export type DestinationTranslationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationTranslation
     */
    select?: DestinationTranslationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationTranslationInclude<ExtArgs> | null
    /**
     * Filter, which DestinationTranslation to fetch.
     */
    where: DestinationTranslationWhereUniqueInput
  }

  /**
   * DestinationTranslation findFirst
   */
  export type DestinationTranslationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationTranslation
     */
    select?: DestinationTranslationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationTranslationInclude<ExtArgs> | null
    /**
     * Filter, which DestinationTranslation to fetch.
     */
    where?: DestinationTranslationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DestinationTranslations to fetch.
     */
    orderBy?: DestinationTranslationOrderByWithRelationInput | DestinationTranslationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DestinationTranslations.
     */
    cursor?: DestinationTranslationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DestinationTranslations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DestinationTranslations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DestinationTranslations.
     */
    distinct?: DestinationTranslationScalarFieldEnum | DestinationTranslationScalarFieldEnum[]
  }

  /**
   * DestinationTranslation findFirstOrThrow
   */
  export type DestinationTranslationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationTranslation
     */
    select?: DestinationTranslationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationTranslationInclude<ExtArgs> | null
    /**
     * Filter, which DestinationTranslation to fetch.
     */
    where?: DestinationTranslationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DestinationTranslations to fetch.
     */
    orderBy?: DestinationTranslationOrderByWithRelationInput | DestinationTranslationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DestinationTranslations.
     */
    cursor?: DestinationTranslationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DestinationTranslations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DestinationTranslations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DestinationTranslations.
     */
    distinct?: DestinationTranslationScalarFieldEnum | DestinationTranslationScalarFieldEnum[]
  }

  /**
   * DestinationTranslation findMany
   */
  export type DestinationTranslationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationTranslation
     */
    select?: DestinationTranslationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationTranslationInclude<ExtArgs> | null
    /**
     * Filter, which DestinationTranslations to fetch.
     */
    where?: DestinationTranslationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DestinationTranslations to fetch.
     */
    orderBy?: DestinationTranslationOrderByWithRelationInput | DestinationTranslationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DestinationTranslations.
     */
    cursor?: DestinationTranslationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DestinationTranslations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DestinationTranslations.
     */
    skip?: number
    distinct?: DestinationTranslationScalarFieldEnum | DestinationTranslationScalarFieldEnum[]
  }

  /**
   * DestinationTranslation create
   */
  export type DestinationTranslationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationTranslation
     */
    select?: DestinationTranslationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationTranslationInclude<ExtArgs> | null
    /**
     * The data needed to create a DestinationTranslation.
     */
    data: XOR<DestinationTranslationCreateInput, DestinationTranslationUncheckedCreateInput>
  }

  /**
   * DestinationTranslation createMany
   */
  export type DestinationTranslationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DestinationTranslations.
     */
    data: DestinationTranslationCreateManyInput | DestinationTranslationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DestinationTranslation createManyAndReturn
   */
  export type DestinationTranslationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationTranslation
     */
    select?: DestinationTranslationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many DestinationTranslations.
     */
    data: DestinationTranslationCreateManyInput | DestinationTranslationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationTranslationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DestinationTranslation update
   */
  export type DestinationTranslationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationTranslation
     */
    select?: DestinationTranslationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationTranslationInclude<ExtArgs> | null
    /**
     * The data needed to update a DestinationTranslation.
     */
    data: XOR<DestinationTranslationUpdateInput, DestinationTranslationUncheckedUpdateInput>
    /**
     * Choose, which DestinationTranslation to update.
     */
    where: DestinationTranslationWhereUniqueInput
  }

  /**
   * DestinationTranslation updateMany
   */
  export type DestinationTranslationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DestinationTranslations.
     */
    data: XOR<DestinationTranslationUpdateManyMutationInput, DestinationTranslationUncheckedUpdateManyInput>
    /**
     * Filter which DestinationTranslations to update
     */
    where?: DestinationTranslationWhereInput
  }

  /**
   * DestinationTranslation upsert
   */
  export type DestinationTranslationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationTranslation
     */
    select?: DestinationTranslationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationTranslationInclude<ExtArgs> | null
    /**
     * The filter to search for the DestinationTranslation to update in case it exists.
     */
    where: DestinationTranslationWhereUniqueInput
    /**
     * In case the DestinationTranslation found by the `where` argument doesn't exist, create a new DestinationTranslation with this data.
     */
    create: XOR<DestinationTranslationCreateInput, DestinationTranslationUncheckedCreateInput>
    /**
     * In case the DestinationTranslation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DestinationTranslationUpdateInput, DestinationTranslationUncheckedUpdateInput>
  }

  /**
   * DestinationTranslation delete
   */
  export type DestinationTranslationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationTranslation
     */
    select?: DestinationTranslationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationTranslationInclude<ExtArgs> | null
    /**
     * Filter which DestinationTranslation to delete.
     */
    where: DestinationTranslationWhereUniqueInput
  }

  /**
   * DestinationTranslation deleteMany
   */
  export type DestinationTranslationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DestinationTranslations to delete
     */
    where?: DestinationTranslationWhereInput
  }

  /**
   * DestinationTranslation without action
   */
  export type DestinationTranslationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationTranslation
     */
    select?: DestinationTranslationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationTranslationInclude<ExtArgs> | null
  }


  /**
   * Model DestinationCategory
   */

  export type AggregateDestinationCategory = {
    _count: DestinationCategoryCountAggregateOutputType | null
    _avg: DestinationCategoryAvgAggregateOutputType | null
    _sum: DestinationCategorySumAggregateOutputType | null
    _min: DestinationCategoryMinAggregateOutputType | null
    _max: DestinationCategoryMaxAggregateOutputType | null
  }

  export type DestinationCategoryAvgAggregateOutputType = {
    id: number | null
    destinationId: number | null
    sortOrder: number | null
  }

  export type DestinationCategorySumAggregateOutputType = {
    id: bigint | null
    destinationId: bigint | null
    sortOrder: number | null
  }

  export type DestinationCategoryMinAggregateOutputType = {
    id: bigint | null
    destinationId: bigint | null
    name: string | null
    slug: string | null
    description: string | null
    metaTitle: string | null
    metaDescription: string | null
    seoContent: string | null
    heroImageUrl: string | null
    sortOrder: number | null
    status: $Enums.DestinationStatus | null
    isFeatured: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    publishedAt: Date | null
  }

  export type DestinationCategoryMaxAggregateOutputType = {
    id: bigint | null
    destinationId: bigint | null
    name: string | null
    slug: string | null
    description: string | null
    metaTitle: string | null
    metaDescription: string | null
    seoContent: string | null
    heroImageUrl: string | null
    sortOrder: number | null
    status: $Enums.DestinationStatus | null
    isFeatured: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    publishedAt: Date | null
  }

  export type DestinationCategoryCountAggregateOutputType = {
    id: number
    destinationId: number
    name: number
    slug: number
    description: number
    metaTitle: number
    metaDescription: number
    seoContent: number
    heroImageUrl: number
    sortOrder: number
    status: number
    isFeatured: number
    createdAt: number
    updatedAt: number
    publishedAt: number
    _all: number
  }


  export type DestinationCategoryAvgAggregateInputType = {
    id?: true
    destinationId?: true
    sortOrder?: true
  }

  export type DestinationCategorySumAggregateInputType = {
    id?: true
    destinationId?: true
    sortOrder?: true
  }

  export type DestinationCategoryMinAggregateInputType = {
    id?: true
    destinationId?: true
    name?: true
    slug?: true
    description?: true
    metaTitle?: true
    metaDescription?: true
    seoContent?: true
    heroImageUrl?: true
    sortOrder?: true
    status?: true
    isFeatured?: true
    createdAt?: true
    updatedAt?: true
    publishedAt?: true
  }

  export type DestinationCategoryMaxAggregateInputType = {
    id?: true
    destinationId?: true
    name?: true
    slug?: true
    description?: true
    metaTitle?: true
    metaDescription?: true
    seoContent?: true
    heroImageUrl?: true
    sortOrder?: true
    status?: true
    isFeatured?: true
    createdAt?: true
    updatedAt?: true
    publishedAt?: true
  }

  export type DestinationCategoryCountAggregateInputType = {
    id?: true
    destinationId?: true
    name?: true
    slug?: true
    description?: true
    metaTitle?: true
    metaDescription?: true
    seoContent?: true
    heroImageUrl?: true
    sortOrder?: true
    status?: true
    isFeatured?: true
    createdAt?: true
    updatedAt?: true
    publishedAt?: true
    _all?: true
  }

  export type DestinationCategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DestinationCategory to aggregate.
     */
    where?: DestinationCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DestinationCategories to fetch.
     */
    orderBy?: DestinationCategoryOrderByWithRelationInput | DestinationCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DestinationCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DestinationCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DestinationCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DestinationCategories
    **/
    _count?: true | DestinationCategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DestinationCategoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DestinationCategorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DestinationCategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DestinationCategoryMaxAggregateInputType
  }

  export type GetDestinationCategoryAggregateType<T extends DestinationCategoryAggregateArgs> = {
        [P in keyof T & keyof AggregateDestinationCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDestinationCategory[P]>
      : GetScalarType<T[P], AggregateDestinationCategory[P]>
  }




  export type DestinationCategoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DestinationCategoryWhereInput
    orderBy?: DestinationCategoryOrderByWithAggregationInput | DestinationCategoryOrderByWithAggregationInput[]
    by: DestinationCategoryScalarFieldEnum[] | DestinationCategoryScalarFieldEnum
    having?: DestinationCategoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DestinationCategoryCountAggregateInputType | true
    _avg?: DestinationCategoryAvgAggregateInputType
    _sum?: DestinationCategorySumAggregateInputType
    _min?: DestinationCategoryMinAggregateInputType
    _max?: DestinationCategoryMaxAggregateInputType
  }

  export type DestinationCategoryGroupByOutputType = {
    id: bigint
    destinationId: bigint
    name: string
    slug: string
    description: string | null
    metaTitle: string | null
    metaDescription: string | null
    seoContent: string | null
    heroImageUrl: string | null
    sortOrder: number
    status: $Enums.DestinationStatus
    isFeatured: boolean
    createdAt: Date
    updatedAt: Date
    publishedAt: Date | null
    _count: DestinationCategoryCountAggregateOutputType | null
    _avg: DestinationCategoryAvgAggregateOutputType | null
    _sum: DestinationCategorySumAggregateOutputType | null
    _min: DestinationCategoryMinAggregateOutputType | null
    _max: DestinationCategoryMaxAggregateOutputType | null
  }

  type GetDestinationCategoryGroupByPayload<T extends DestinationCategoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DestinationCategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DestinationCategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DestinationCategoryGroupByOutputType[P]>
            : GetScalarType<T[P], DestinationCategoryGroupByOutputType[P]>
        }
      >
    >


  export type DestinationCategorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    destinationId?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    seoContent?: boolean
    heroImageUrl?: boolean
    sortOrder?: boolean
    status?: boolean
    isFeatured?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    publishedAt?: boolean
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
    packageLinks?: boolean | DestinationCategory$packageLinksArgs<ExtArgs>
    _count?: boolean | DestinationCategoryCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["destinationCategory"]>

  export type DestinationCategorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    destinationId?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    seoContent?: boolean
    heroImageUrl?: boolean
    sortOrder?: boolean
    status?: boolean
    isFeatured?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    publishedAt?: boolean
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["destinationCategory"]>

  export type DestinationCategorySelectScalar = {
    id?: boolean
    destinationId?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    seoContent?: boolean
    heroImageUrl?: boolean
    sortOrder?: boolean
    status?: boolean
    isFeatured?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    publishedAt?: boolean
  }

  export type DestinationCategoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
    packageLinks?: boolean | DestinationCategory$packageLinksArgs<ExtArgs>
    _count?: boolean | DestinationCategoryCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DestinationCategoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }

  export type $DestinationCategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DestinationCategory"
    objects: {
      destination: Prisma.$DestinationPayload<ExtArgs>
      packageLinks: Prisma.$PackageCategoryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      destinationId: bigint
      name: string
      slug: string
      description: string | null
      metaTitle: string | null
      metaDescription: string | null
      seoContent: string | null
      heroImageUrl: string | null
      sortOrder: number
      status: $Enums.DestinationStatus
      isFeatured: boolean
      createdAt: Date
      updatedAt: Date
      publishedAt: Date | null
    }, ExtArgs["result"]["destinationCategory"]>
    composites: {}
  }

  type DestinationCategoryGetPayload<S extends boolean | null | undefined | DestinationCategoryDefaultArgs> = $Result.GetResult<Prisma.$DestinationCategoryPayload, S>

  type DestinationCategoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DestinationCategoryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DestinationCategoryCountAggregateInputType | true
    }

  export interface DestinationCategoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DestinationCategory'], meta: { name: 'DestinationCategory' } }
    /**
     * Find zero or one DestinationCategory that matches the filter.
     * @param {DestinationCategoryFindUniqueArgs} args - Arguments to find a DestinationCategory
     * @example
     * // Get one DestinationCategory
     * const destinationCategory = await prisma.destinationCategory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DestinationCategoryFindUniqueArgs>(args: SelectSubset<T, DestinationCategoryFindUniqueArgs<ExtArgs>>): Prisma__DestinationCategoryClient<$Result.GetResult<Prisma.$DestinationCategoryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one DestinationCategory that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DestinationCategoryFindUniqueOrThrowArgs} args - Arguments to find a DestinationCategory
     * @example
     * // Get one DestinationCategory
     * const destinationCategory = await prisma.destinationCategory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DestinationCategoryFindUniqueOrThrowArgs>(args: SelectSubset<T, DestinationCategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DestinationCategoryClient<$Result.GetResult<Prisma.$DestinationCategoryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first DestinationCategory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinationCategoryFindFirstArgs} args - Arguments to find a DestinationCategory
     * @example
     * // Get one DestinationCategory
     * const destinationCategory = await prisma.destinationCategory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DestinationCategoryFindFirstArgs>(args?: SelectSubset<T, DestinationCategoryFindFirstArgs<ExtArgs>>): Prisma__DestinationCategoryClient<$Result.GetResult<Prisma.$DestinationCategoryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first DestinationCategory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinationCategoryFindFirstOrThrowArgs} args - Arguments to find a DestinationCategory
     * @example
     * // Get one DestinationCategory
     * const destinationCategory = await prisma.destinationCategory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DestinationCategoryFindFirstOrThrowArgs>(args?: SelectSubset<T, DestinationCategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__DestinationCategoryClient<$Result.GetResult<Prisma.$DestinationCategoryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more DestinationCategories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinationCategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DestinationCategories
     * const destinationCategories = await prisma.destinationCategory.findMany()
     * 
     * // Get first 10 DestinationCategories
     * const destinationCategories = await prisma.destinationCategory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const destinationCategoryWithIdOnly = await prisma.destinationCategory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DestinationCategoryFindManyArgs>(args?: SelectSubset<T, DestinationCategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DestinationCategoryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a DestinationCategory.
     * @param {DestinationCategoryCreateArgs} args - Arguments to create a DestinationCategory.
     * @example
     * // Create one DestinationCategory
     * const DestinationCategory = await prisma.destinationCategory.create({
     *   data: {
     *     // ... data to create a DestinationCategory
     *   }
     * })
     * 
     */
    create<T extends DestinationCategoryCreateArgs>(args: SelectSubset<T, DestinationCategoryCreateArgs<ExtArgs>>): Prisma__DestinationCategoryClient<$Result.GetResult<Prisma.$DestinationCategoryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many DestinationCategories.
     * @param {DestinationCategoryCreateManyArgs} args - Arguments to create many DestinationCategories.
     * @example
     * // Create many DestinationCategories
     * const destinationCategory = await prisma.destinationCategory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DestinationCategoryCreateManyArgs>(args?: SelectSubset<T, DestinationCategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DestinationCategories and returns the data saved in the database.
     * @param {DestinationCategoryCreateManyAndReturnArgs} args - Arguments to create many DestinationCategories.
     * @example
     * // Create many DestinationCategories
     * const destinationCategory = await prisma.destinationCategory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DestinationCategories and only return the `id`
     * const destinationCategoryWithIdOnly = await prisma.destinationCategory.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DestinationCategoryCreateManyAndReturnArgs>(args?: SelectSubset<T, DestinationCategoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DestinationCategoryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a DestinationCategory.
     * @param {DestinationCategoryDeleteArgs} args - Arguments to delete one DestinationCategory.
     * @example
     * // Delete one DestinationCategory
     * const DestinationCategory = await prisma.destinationCategory.delete({
     *   where: {
     *     // ... filter to delete one DestinationCategory
     *   }
     * })
     * 
     */
    delete<T extends DestinationCategoryDeleteArgs>(args: SelectSubset<T, DestinationCategoryDeleteArgs<ExtArgs>>): Prisma__DestinationCategoryClient<$Result.GetResult<Prisma.$DestinationCategoryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one DestinationCategory.
     * @param {DestinationCategoryUpdateArgs} args - Arguments to update one DestinationCategory.
     * @example
     * // Update one DestinationCategory
     * const destinationCategory = await prisma.destinationCategory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DestinationCategoryUpdateArgs>(args: SelectSubset<T, DestinationCategoryUpdateArgs<ExtArgs>>): Prisma__DestinationCategoryClient<$Result.GetResult<Prisma.$DestinationCategoryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more DestinationCategories.
     * @param {DestinationCategoryDeleteManyArgs} args - Arguments to filter DestinationCategories to delete.
     * @example
     * // Delete a few DestinationCategories
     * const { count } = await prisma.destinationCategory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DestinationCategoryDeleteManyArgs>(args?: SelectSubset<T, DestinationCategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DestinationCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinationCategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DestinationCategories
     * const destinationCategory = await prisma.destinationCategory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DestinationCategoryUpdateManyArgs>(args: SelectSubset<T, DestinationCategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DestinationCategory.
     * @param {DestinationCategoryUpsertArgs} args - Arguments to update or create a DestinationCategory.
     * @example
     * // Update or create a DestinationCategory
     * const destinationCategory = await prisma.destinationCategory.upsert({
     *   create: {
     *     // ... data to create a DestinationCategory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DestinationCategory we want to update
     *   }
     * })
     */
    upsert<T extends DestinationCategoryUpsertArgs>(args: SelectSubset<T, DestinationCategoryUpsertArgs<ExtArgs>>): Prisma__DestinationCategoryClient<$Result.GetResult<Prisma.$DestinationCategoryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of DestinationCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinationCategoryCountArgs} args - Arguments to filter DestinationCategories to count.
     * @example
     * // Count the number of DestinationCategories
     * const count = await prisma.destinationCategory.count({
     *   where: {
     *     // ... the filter for the DestinationCategories we want to count
     *   }
     * })
    **/
    count<T extends DestinationCategoryCountArgs>(
      args?: Subset<T, DestinationCategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DestinationCategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DestinationCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinationCategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DestinationCategoryAggregateArgs>(args: Subset<T, DestinationCategoryAggregateArgs>): Prisma.PrismaPromise<GetDestinationCategoryAggregateType<T>>

    /**
     * Group by DestinationCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinationCategoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DestinationCategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DestinationCategoryGroupByArgs['orderBy'] }
        : { orderBy?: DestinationCategoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DestinationCategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDestinationCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DestinationCategory model
   */
  readonly fields: DestinationCategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DestinationCategory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DestinationCategoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    destination<T extends DestinationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DestinationDefaultArgs<ExtArgs>>): Prisma__DestinationClient<$Result.GetResult<Prisma.$DestinationPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    packageLinks<T extends DestinationCategory$packageLinksArgs<ExtArgs> = {}>(args?: Subset<T, DestinationCategory$packageLinksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackageCategoryPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DestinationCategory model
   */ 
  interface DestinationCategoryFieldRefs {
    readonly id: FieldRef<"DestinationCategory", 'BigInt'>
    readonly destinationId: FieldRef<"DestinationCategory", 'BigInt'>
    readonly name: FieldRef<"DestinationCategory", 'String'>
    readonly slug: FieldRef<"DestinationCategory", 'String'>
    readonly description: FieldRef<"DestinationCategory", 'String'>
    readonly metaTitle: FieldRef<"DestinationCategory", 'String'>
    readonly metaDescription: FieldRef<"DestinationCategory", 'String'>
    readonly seoContent: FieldRef<"DestinationCategory", 'String'>
    readonly heroImageUrl: FieldRef<"DestinationCategory", 'String'>
    readonly sortOrder: FieldRef<"DestinationCategory", 'Int'>
    readonly status: FieldRef<"DestinationCategory", 'DestinationStatus'>
    readonly isFeatured: FieldRef<"DestinationCategory", 'Boolean'>
    readonly createdAt: FieldRef<"DestinationCategory", 'DateTime'>
    readonly updatedAt: FieldRef<"DestinationCategory", 'DateTime'>
    readonly publishedAt: FieldRef<"DestinationCategory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DestinationCategory findUnique
   */
  export type DestinationCategoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationCategory
     */
    select?: DestinationCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationCategoryInclude<ExtArgs> | null
    /**
     * Filter, which DestinationCategory to fetch.
     */
    where: DestinationCategoryWhereUniqueInput
  }

  /**
   * DestinationCategory findUniqueOrThrow
   */
  export type DestinationCategoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationCategory
     */
    select?: DestinationCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationCategoryInclude<ExtArgs> | null
    /**
     * Filter, which DestinationCategory to fetch.
     */
    where: DestinationCategoryWhereUniqueInput
  }

  /**
   * DestinationCategory findFirst
   */
  export type DestinationCategoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationCategory
     */
    select?: DestinationCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationCategoryInclude<ExtArgs> | null
    /**
     * Filter, which DestinationCategory to fetch.
     */
    where?: DestinationCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DestinationCategories to fetch.
     */
    orderBy?: DestinationCategoryOrderByWithRelationInput | DestinationCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DestinationCategories.
     */
    cursor?: DestinationCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DestinationCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DestinationCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DestinationCategories.
     */
    distinct?: DestinationCategoryScalarFieldEnum | DestinationCategoryScalarFieldEnum[]
  }

  /**
   * DestinationCategory findFirstOrThrow
   */
  export type DestinationCategoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationCategory
     */
    select?: DestinationCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationCategoryInclude<ExtArgs> | null
    /**
     * Filter, which DestinationCategory to fetch.
     */
    where?: DestinationCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DestinationCategories to fetch.
     */
    orderBy?: DestinationCategoryOrderByWithRelationInput | DestinationCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DestinationCategories.
     */
    cursor?: DestinationCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DestinationCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DestinationCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DestinationCategories.
     */
    distinct?: DestinationCategoryScalarFieldEnum | DestinationCategoryScalarFieldEnum[]
  }

  /**
   * DestinationCategory findMany
   */
  export type DestinationCategoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationCategory
     */
    select?: DestinationCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationCategoryInclude<ExtArgs> | null
    /**
     * Filter, which DestinationCategories to fetch.
     */
    where?: DestinationCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DestinationCategories to fetch.
     */
    orderBy?: DestinationCategoryOrderByWithRelationInput | DestinationCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DestinationCategories.
     */
    cursor?: DestinationCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DestinationCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DestinationCategories.
     */
    skip?: number
    distinct?: DestinationCategoryScalarFieldEnum | DestinationCategoryScalarFieldEnum[]
  }

  /**
   * DestinationCategory create
   */
  export type DestinationCategoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationCategory
     */
    select?: DestinationCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationCategoryInclude<ExtArgs> | null
    /**
     * The data needed to create a DestinationCategory.
     */
    data: XOR<DestinationCategoryCreateInput, DestinationCategoryUncheckedCreateInput>
  }

  /**
   * DestinationCategory createMany
   */
  export type DestinationCategoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DestinationCategories.
     */
    data: DestinationCategoryCreateManyInput | DestinationCategoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DestinationCategory createManyAndReturn
   */
  export type DestinationCategoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationCategory
     */
    select?: DestinationCategorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many DestinationCategories.
     */
    data: DestinationCategoryCreateManyInput | DestinationCategoryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationCategoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DestinationCategory update
   */
  export type DestinationCategoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationCategory
     */
    select?: DestinationCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationCategoryInclude<ExtArgs> | null
    /**
     * The data needed to update a DestinationCategory.
     */
    data: XOR<DestinationCategoryUpdateInput, DestinationCategoryUncheckedUpdateInput>
    /**
     * Choose, which DestinationCategory to update.
     */
    where: DestinationCategoryWhereUniqueInput
  }

  /**
   * DestinationCategory updateMany
   */
  export type DestinationCategoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DestinationCategories.
     */
    data: XOR<DestinationCategoryUpdateManyMutationInput, DestinationCategoryUncheckedUpdateManyInput>
    /**
     * Filter which DestinationCategories to update
     */
    where?: DestinationCategoryWhereInput
  }

  /**
   * DestinationCategory upsert
   */
  export type DestinationCategoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationCategory
     */
    select?: DestinationCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationCategoryInclude<ExtArgs> | null
    /**
     * The filter to search for the DestinationCategory to update in case it exists.
     */
    where: DestinationCategoryWhereUniqueInput
    /**
     * In case the DestinationCategory found by the `where` argument doesn't exist, create a new DestinationCategory with this data.
     */
    create: XOR<DestinationCategoryCreateInput, DestinationCategoryUncheckedCreateInput>
    /**
     * In case the DestinationCategory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DestinationCategoryUpdateInput, DestinationCategoryUncheckedUpdateInput>
  }

  /**
   * DestinationCategory delete
   */
  export type DestinationCategoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationCategory
     */
    select?: DestinationCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationCategoryInclude<ExtArgs> | null
    /**
     * Filter which DestinationCategory to delete.
     */
    where: DestinationCategoryWhereUniqueInput
  }

  /**
   * DestinationCategory deleteMany
   */
  export type DestinationCategoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DestinationCategories to delete
     */
    where?: DestinationCategoryWhereInput
  }

  /**
   * DestinationCategory.packageLinks
   */
  export type DestinationCategory$packageLinksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageCategory
     */
    select?: PackageCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageCategoryInclude<ExtArgs> | null
    where?: PackageCategoryWhereInput
    orderBy?: PackageCategoryOrderByWithRelationInput | PackageCategoryOrderByWithRelationInput[]
    cursor?: PackageCategoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PackageCategoryScalarFieldEnum | PackageCategoryScalarFieldEnum[]
  }

  /**
   * DestinationCategory without action
   */
  export type DestinationCategoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinationCategory
     */
    select?: DestinationCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinationCategoryInclude<ExtArgs> | null
  }


  /**
   * Model Hotel
   */

  export type AggregateHotel = {
    _count: HotelCountAggregateOutputType | null
    _avg: HotelAvgAggregateOutputType | null
    _sum: HotelSumAggregateOutputType | null
    _min: HotelMinAggregateOutputType | null
    _max: HotelMaxAggregateOutputType | null
  }

  export type HotelAvgAggregateOutputType = {
    id: number | null
    destinationId: number | null
    starRating: number | null
    sortOrder: number | null
  }

  export type HotelSumAggregateOutputType = {
    id: bigint | null
    destinationId: bigint | null
    starRating: number | null
    sortOrder: number | null
  }

  export type HotelMinAggregateOutputType = {
    id: bigint | null
    destinationId: bigint | null
    name: string | null
    slug: string | null
    starRating: number | null
    shortDescription: string | null
    heroImageUrl: string | null
    metaTitle: string | null
    metaDescription: string | null
    seoContent: string | null
    status: $Enums.DestinationStatus | null
    isFeatured: boolean | null
    sortOrder: number | null
    createdAt: Date | null
    updatedAt: Date | null
    publishedAt: Date | null
  }

  export type HotelMaxAggregateOutputType = {
    id: bigint | null
    destinationId: bigint | null
    name: string | null
    slug: string | null
    starRating: number | null
    shortDescription: string | null
    heroImageUrl: string | null
    metaTitle: string | null
    metaDescription: string | null
    seoContent: string | null
    status: $Enums.DestinationStatus | null
    isFeatured: boolean | null
    sortOrder: number | null
    createdAt: Date | null
    updatedAt: Date | null
    publishedAt: Date | null
  }

  export type HotelCountAggregateOutputType = {
    id: number
    destinationId: number
    name: number
    slug: number
    starRating: number
    shortDescription: number
    heroImageUrl: number
    gallery: number
    metaTitle: number
    metaDescription: number
    seoContent: number
    status: number
    isFeatured: number
    sortOrder: number
    createdAt: number
    updatedAt: number
    publishedAt: number
    _all: number
  }


  export type HotelAvgAggregateInputType = {
    id?: true
    destinationId?: true
    starRating?: true
    sortOrder?: true
  }

  export type HotelSumAggregateInputType = {
    id?: true
    destinationId?: true
    starRating?: true
    sortOrder?: true
  }

  export type HotelMinAggregateInputType = {
    id?: true
    destinationId?: true
    name?: true
    slug?: true
    starRating?: true
    shortDescription?: true
    heroImageUrl?: true
    metaTitle?: true
    metaDescription?: true
    seoContent?: true
    status?: true
    isFeatured?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
    publishedAt?: true
  }

  export type HotelMaxAggregateInputType = {
    id?: true
    destinationId?: true
    name?: true
    slug?: true
    starRating?: true
    shortDescription?: true
    heroImageUrl?: true
    metaTitle?: true
    metaDescription?: true
    seoContent?: true
    status?: true
    isFeatured?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
    publishedAt?: true
  }

  export type HotelCountAggregateInputType = {
    id?: true
    destinationId?: true
    name?: true
    slug?: true
    starRating?: true
    shortDescription?: true
    heroImageUrl?: true
    gallery?: true
    metaTitle?: true
    metaDescription?: true
    seoContent?: true
    status?: true
    isFeatured?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
    publishedAt?: true
    _all?: true
  }

  export type HotelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Hotel to aggregate.
     */
    where?: HotelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Hotels to fetch.
     */
    orderBy?: HotelOrderByWithRelationInput | HotelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: HotelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Hotels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Hotels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Hotels
    **/
    _count?: true | HotelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: HotelAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: HotelSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: HotelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: HotelMaxAggregateInputType
  }

  export type GetHotelAggregateType<T extends HotelAggregateArgs> = {
        [P in keyof T & keyof AggregateHotel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateHotel[P]>
      : GetScalarType<T[P], AggregateHotel[P]>
  }




  export type HotelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HotelWhereInput
    orderBy?: HotelOrderByWithAggregationInput | HotelOrderByWithAggregationInput[]
    by: HotelScalarFieldEnum[] | HotelScalarFieldEnum
    having?: HotelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: HotelCountAggregateInputType | true
    _avg?: HotelAvgAggregateInputType
    _sum?: HotelSumAggregateInputType
    _min?: HotelMinAggregateInputType
    _max?: HotelMaxAggregateInputType
  }

  export type HotelGroupByOutputType = {
    id: bigint
    destinationId: bigint
    name: string
    slug: string
    starRating: number | null
    shortDescription: string | null
    heroImageUrl: string | null
    gallery: string[]
    metaTitle: string | null
    metaDescription: string | null
    seoContent: string | null
    status: $Enums.DestinationStatus
    isFeatured: boolean
    sortOrder: number
    createdAt: Date
    updatedAt: Date
    publishedAt: Date | null
    _count: HotelCountAggregateOutputType | null
    _avg: HotelAvgAggregateOutputType | null
    _sum: HotelSumAggregateOutputType | null
    _min: HotelMinAggregateOutputType | null
    _max: HotelMaxAggregateOutputType | null
  }

  type GetHotelGroupByPayload<T extends HotelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<HotelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof HotelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], HotelGroupByOutputType[P]>
            : GetScalarType<T[P], HotelGroupByOutputType[P]>
        }
      >
    >


  export type HotelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    destinationId?: boolean
    name?: boolean
    slug?: boolean
    starRating?: boolean
    shortDescription?: boolean
    heroImageUrl?: boolean
    gallery?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    seoContent?: boolean
    status?: boolean
    isFeatured?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    publishedAt?: boolean
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
    packageLinks?: boolean | Hotel$packageLinksArgs<ExtArgs>
    _count?: boolean | HotelCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["hotel"]>

  export type HotelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    destinationId?: boolean
    name?: boolean
    slug?: boolean
    starRating?: boolean
    shortDescription?: boolean
    heroImageUrl?: boolean
    gallery?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    seoContent?: boolean
    status?: boolean
    isFeatured?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    publishedAt?: boolean
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["hotel"]>

  export type HotelSelectScalar = {
    id?: boolean
    destinationId?: boolean
    name?: boolean
    slug?: boolean
    starRating?: boolean
    shortDescription?: boolean
    heroImageUrl?: boolean
    gallery?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    seoContent?: boolean
    status?: boolean
    isFeatured?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    publishedAt?: boolean
  }

  export type HotelInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
    packageLinks?: boolean | Hotel$packageLinksArgs<ExtArgs>
    _count?: boolean | HotelCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type HotelIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }

  export type $HotelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Hotel"
    objects: {
      destination: Prisma.$DestinationPayload<ExtArgs>
      packageLinks: Prisma.$PackageHotelPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      destinationId: bigint
      name: string
      slug: string
      starRating: number | null
      shortDescription: string | null
      heroImageUrl: string | null
      gallery: string[]
      metaTitle: string | null
      metaDescription: string | null
      seoContent: string | null
      status: $Enums.DestinationStatus
      isFeatured: boolean
      sortOrder: number
      createdAt: Date
      updatedAt: Date
      publishedAt: Date | null
    }, ExtArgs["result"]["hotel"]>
    composites: {}
  }

  type HotelGetPayload<S extends boolean | null | undefined | HotelDefaultArgs> = $Result.GetResult<Prisma.$HotelPayload, S>

  type HotelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<HotelFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: HotelCountAggregateInputType | true
    }

  export interface HotelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Hotel'], meta: { name: 'Hotel' } }
    /**
     * Find zero or one Hotel that matches the filter.
     * @param {HotelFindUniqueArgs} args - Arguments to find a Hotel
     * @example
     * // Get one Hotel
     * const hotel = await prisma.hotel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends HotelFindUniqueArgs>(args: SelectSubset<T, HotelFindUniqueArgs<ExtArgs>>): Prisma__HotelClient<$Result.GetResult<Prisma.$HotelPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Hotel that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {HotelFindUniqueOrThrowArgs} args - Arguments to find a Hotel
     * @example
     * // Get one Hotel
     * const hotel = await prisma.hotel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends HotelFindUniqueOrThrowArgs>(args: SelectSubset<T, HotelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__HotelClient<$Result.GetResult<Prisma.$HotelPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Hotel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HotelFindFirstArgs} args - Arguments to find a Hotel
     * @example
     * // Get one Hotel
     * const hotel = await prisma.hotel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends HotelFindFirstArgs>(args?: SelectSubset<T, HotelFindFirstArgs<ExtArgs>>): Prisma__HotelClient<$Result.GetResult<Prisma.$HotelPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Hotel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HotelFindFirstOrThrowArgs} args - Arguments to find a Hotel
     * @example
     * // Get one Hotel
     * const hotel = await prisma.hotel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends HotelFindFirstOrThrowArgs>(args?: SelectSubset<T, HotelFindFirstOrThrowArgs<ExtArgs>>): Prisma__HotelClient<$Result.GetResult<Prisma.$HotelPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Hotels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HotelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Hotels
     * const hotels = await prisma.hotel.findMany()
     * 
     * // Get first 10 Hotels
     * const hotels = await prisma.hotel.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const hotelWithIdOnly = await prisma.hotel.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends HotelFindManyArgs>(args?: SelectSubset<T, HotelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HotelPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Hotel.
     * @param {HotelCreateArgs} args - Arguments to create a Hotel.
     * @example
     * // Create one Hotel
     * const Hotel = await prisma.hotel.create({
     *   data: {
     *     // ... data to create a Hotel
     *   }
     * })
     * 
     */
    create<T extends HotelCreateArgs>(args: SelectSubset<T, HotelCreateArgs<ExtArgs>>): Prisma__HotelClient<$Result.GetResult<Prisma.$HotelPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Hotels.
     * @param {HotelCreateManyArgs} args - Arguments to create many Hotels.
     * @example
     * // Create many Hotels
     * const hotel = await prisma.hotel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends HotelCreateManyArgs>(args?: SelectSubset<T, HotelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Hotels and returns the data saved in the database.
     * @param {HotelCreateManyAndReturnArgs} args - Arguments to create many Hotels.
     * @example
     * // Create many Hotels
     * const hotel = await prisma.hotel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Hotels and only return the `id`
     * const hotelWithIdOnly = await prisma.hotel.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends HotelCreateManyAndReturnArgs>(args?: SelectSubset<T, HotelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HotelPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Hotel.
     * @param {HotelDeleteArgs} args - Arguments to delete one Hotel.
     * @example
     * // Delete one Hotel
     * const Hotel = await prisma.hotel.delete({
     *   where: {
     *     // ... filter to delete one Hotel
     *   }
     * })
     * 
     */
    delete<T extends HotelDeleteArgs>(args: SelectSubset<T, HotelDeleteArgs<ExtArgs>>): Prisma__HotelClient<$Result.GetResult<Prisma.$HotelPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Hotel.
     * @param {HotelUpdateArgs} args - Arguments to update one Hotel.
     * @example
     * // Update one Hotel
     * const hotel = await prisma.hotel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends HotelUpdateArgs>(args: SelectSubset<T, HotelUpdateArgs<ExtArgs>>): Prisma__HotelClient<$Result.GetResult<Prisma.$HotelPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Hotels.
     * @param {HotelDeleteManyArgs} args - Arguments to filter Hotels to delete.
     * @example
     * // Delete a few Hotels
     * const { count } = await prisma.hotel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends HotelDeleteManyArgs>(args?: SelectSubset<T, HotelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Hotels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HotelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Hotels
     * const hotel = await prisma.hotel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends HotelUpdateManyArgs>(args: SelectSubset<T, HotelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Hotel.
     * @param {HotelUpsertArgs} args - Arguments to update or create a Hotel.
     * @example
     * // Update or create a Hotel
     * const hotel = await prisma.hotel.upsert({
     *   create: {
     *     // ... data to create a Hotel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Hotel we want to update
     *   }
     * })
     */
    upsert<T extends HotelUpsertArgs>(args: SelectSubset<T, HotelUpsertArgs<ExtArgs>>): Prisma__HotelClient<$Result.GetResult<Prisma.$HotelPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Hotels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HotelCountArgs} args - Arguments to filter Hotels to count.
     * @example
     * // Count the number of Hotels
     * const count = await prisma.hotel.count({
     *   where: {
     *     // ... the filter for the Hotels we want to count
     *   }
     * })
    **/
    count<T extends HotelCountArgs>(
      args?: Subset<T, HotelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], HotelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Hotel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HotelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends HotelAggregateArgs>(args: Subset<T, HotelAggregateArgs>): Prisma.PrismaPromise<GetHotelAggregateType<T>>

    /**
     * Group by Hotel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HotelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends HotelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: HotelGroupByArgs['orderBy'] }
        : { orderBy?: HotelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, HotelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHotelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Hotel model
   */
  readonly fields: HotelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Hotel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__HotelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    destination<T extends DestinationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DestinationDefaultArgs<ExtArgs>>): Prisma__DestinationClient<$Result.GetResult<Prisma.$DestinationPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    packageLinks<T extends Hotel$packageLinksArgs<ExtArgs> = {}>(args?: Subset<T, Hotel$packageLinksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackageHotelPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Hotel model
   */ 
  interface HotelFieldRefs {
    readonly id: FieldRef<"Hotel", 'BigInt'>
    readonly destinationId: FieldRef<"Hotel", 'BigInt'>
    readonly name: FieldRef<"Hotel", 'String'>
    readonly slug: FieldRef<"Hotel", 'String'>
    readonly starRating: FieldRef<"Hotel", 'Int'>
    readonly shortDescription: FieldRef<"Hotel", 'String'>
    readonly heroImageUrl: FieldRef<"Hotel", 'String'>
    readonly gallery: FieldRef<"Hotel", 'String[]'>
    readonly metaTitle: FieldRef<"Hotel", 'String'>
    readonly metaDescription: FieldRef<"Hotel", 'String'>
    readonly seoContent: FieldRef<"Hotel", 'String'>
    readonly status: FieldRef<"Hotel", 'DestinationStatus'>
    readonly isFeatured: FieldRef<"Hotel", 'Boolean'>
    readonly sortOrder: FieldRef<"Hotel", 'Int'>
    readonly createdAt: FieldRef<"Hotel", 'DateTime'>
    readonly updatedAt: FieldRef<"Hotel", 'DateTime'>
    readonly publishedAt: FieldRef<"Hotel", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Hotel findUnique
   */
  export type HotelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Hotel
     */
    select?: HotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HotelInclude<ExtArgs> | null
    /**
     * Filter, which Hotel to fetch.
     */
    where: HotelWhereUniqueInput
  }

  /**
   * Hotel findUniqueOrThrow
   */
  export type HotelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Hotel
     */
    select?: HotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HotelInclude<ExtArgs> | null
    /**
     * Filter, which Hotel to fetch.
     */
    where: HotelWhereUniqueInput
  }

  /**
   * Hotel findFirst
   */
  export type HotelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Hotel
     */
    select?: HotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HotelInclude<ExtArgs> | null
    /**
     * Filter, which Hotel to fetch.
     */
    where?: HotelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Hotels to fetch.
     */
    orderBy?: HotelOrderByWithRelationInput | HotelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Hotels.
     */
    cursor?: HotelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Hotels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Hotels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Hotels.
     */
    distinct?: HotelScalarFieldEnum | HotelScalarFieldEnum[]
  }

  /**
   * Hotel findFirstOrThrow
   */
  export type HotelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Hotel
     */
    select?: HotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HotelInclude<ExtArgs> | null
    /**
     * Filter, which Hotel to fetch.
     */
    where?: HotelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Hotels to fetch.
     */
    orderBy?: HotelOrderByWithRelationInput | HotelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Hotels.
     */
    cursor?: HotelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Hotels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Hotels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Hotels.
     */
    distinct?: HotelScalarFieldEnum | HotelScalarFieldEnum[]
  }

  /**
   * Hotel findMany
   */
  export type HotelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Hotel
     */
    select?: HotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HotelInclude<ExtArgs> | null
    /**
     * Filter, which Hotels to fetch.
     */
    where?: HotelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Hotels to fetch.
     */
    orderBy?: HotelOrderByWithRelationInput | HotelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Hotels.
     */
    cursor?: HotelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Hotels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Hotels.
     */
    skip?: number
    distinct?: HotelScalarFieldEnum | HotelScalarFieldEnum[]
  }

  /**
   * Hotel create
   */
  export type HotelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Hotel
     */
    select?: HotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HotelInclude<ExtArgs> | null
    /**
     * The data needed to create a Hotel.
     */
    data: XOR<HotelCreateInput, HotelUncheckedCreateInput>
  }

  /**
   * Hotel createMany
   */
  export type HotelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Hotels.
     */
    data: HotelCreateManyInput | HotelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Hotel createManyAndReturn
   */
  export type HotelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Hotel
     */
    select?: HotelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Hotels.
     */
    data: HotelCreateManyInput | HotelCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HotelIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Hotel update
   */
  export type HotelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Hotel
     */
    select?: HotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HotelInclude<ExtArgs> | null
    /**
     * The data needed to update a Hotel.
     */
    data: XOR<HotelUpdateInput, HotelUncheckedUpdateInput>
    /**
     * Choose, which Hotel to update.
     */
    where: HotelWhereUniqueInput
  }

  /**
   * Hotel updateMany
   */
  export type HotelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Hotels.
     */
    data: XOR<HotelUpdateManyMutationInput, HotelUncheckedUpdateManyInput>
    /**
     * Filter which Hotels to update
     */
    where?: HotelWhereInput
  }

  /**
   * Hotel upsert
   */
  export type HotelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Hotel
     */
    select?: HotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HotelInclude<ExtArgs> | null
    /**
     * The filter to search for the Hotel to update in case it exists.
     */
    where: HotelWhereUniqueInput
    /**
     * In case the Hotel found by the `where` argument doesn't exist, create a new Hotel with this data.
     */
    create: XOR<HotelCreateInput, HotelUncheckedCreateInput>
    /**
     * In case the Hotel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<HotelUpdateInput, HotelUncheckedUpdateInput>
  }

  /**
   * Hotel delete
   */
  export type HotelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Hotel
     */
    select?: HotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HotelInclude<ExtArgs> | null
    /**
     * Filter which Hotel to delete.
     */
    where: HotelWhereUniqueInput
  }

  /**
   * Hotel deleteMany
   */
  export type HotelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Hotels to delete
     */
    where?: HotelWhereInput
  }

  /**
   * Hotel.packageLinks
   */
  export type Hotel$packageLinksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageHotel
     */
    select?: PackageHotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageHotelInclude<ExtArgs> | null
    where?: PackageHotelWhereInput
    orderBy?: PackageHotelOrderByWithRelationInput | PackageHotelOrderByWithRelationInput[]
    cursor?: PackageHotelWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PackageHotelScalarFieldEnum | PackageHotelScalarFieldEnum[]
  }

  /**
   * Hotel without action
   */
  export type HotelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Hotel
     */
    select?: HotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HotelInclude<ExtArgs> | null
  }


  /**
   * Model Package
   */

  export type AggregatePackage = {
    _count: PackageCountAggregateOutputType | null
    _avg: PackageAvgAggregateOutputType | null
    _sum: PackageSumAggregateOutputType | null
    _min: PackageMinAggregateOutputType | null
    _max: PackageMaxAggregateOutputType | null
  }

  export type PackageAvgAggregateOutputType = {
    id: number | null
    durationDays: number | null
    durationNights: number | null
    startingPrice: number | null
    sortOrder: number | null
  }

  export type PackageSumAggregateOutputType = {
    id: bigint | null
    durationDays: number | null
    durationNights: number | null
    startingPrice: number | null
    sortOrder: number | null
  }

  export type PackageMinAggregateOutputType = {
    id: bigint | null
    title: string | null
    slug: string | null
    shortDescription: string | null
    durationDays: number | null
    durationNights: number | null
    startingPrice: number | null
    currency: string | null
    heroImageUrl: string | null
    metaTitle: string | null
    metaDescription: string | null
    seoContent: string | null
    status: $Enums.DestinationStatus | null
    isFeatured: boolean | null
    sortOrder: number | null
    createdAt: Date | null
    updatedAt: Date | null
    publishedAt: Date | null
  }

  export type PackageMaxAggregateOutputType = {
    id: bigint | null
    title: string | null
    slug: string | null
    shortDescription: string | null
    durationDays: number | null
    durationNights: number | null
    startingPrice: number | null
    currency: string | null
    heroImageUrl: string | null
    metaTitle: string | null
    metaDescription: string | null
    seoContent: string | null
    status: $Enums.DestinationStatus | null
    isFeatured: boolean | null
    sortOrder: number | null
    createdAt: Date | null
    updatedAt: Date | null
    publishedAt: Date | null
  }

  export type PackageCountAggregateOutputType = {
    id: number
    title: number
    slug: number
    shortDescription: number
    durationDays: number
    durationNights: number
    startingPrice: number
    currency: number
    heroImageUrl: number
    gallery: number
    metaTitle: number
    metaDescription: number
    seoContent: number
    status: number
    isFeatured: number
    sortOrder: number
    createdAt: number
    updatedAt: number
    publishedAt: number
    _all: number
  }


  export type PackageAvgAggregateInputType = {
    id?: true
    durationDays?: true
    durationNights?: true
    startingPrice?: true
    sortOrder?: true
  }

  export type PackageSumAggregateInputType = {
    id?: true
    durationDays?: true
    durationNights?: true
    startingPrice?: true
    sortOrder?: true
  }

  export type PackageMinAggregateInputType = {
    id?: true
    title?: true
    slug?: true
    shortDescription?: true
    durationDays?: true
    durationNights?: true
    startingPrice?: true
    currency?: true
    heroImageUrl?: true
    metaTitle?: true
    metaDescription?: true
    seoContent?: true
    status?: true
    isFeatured?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
    publishedAt?: true
  }

  export type PackageMaxAggregateInputType = {
    id?: true
    title?: true
    slug?: true
    shortDescription?: true
    durationDays?: true
    durationNights?: true
    startingPrice?: true
    currency?: true
    heroImageUrl?: true
    metaTitle?: true
    metaDescription?: true
    seoContent?: true
    status?: true
    isFeatured?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
    publishedAt?: true
  }

  export type PackageCountAggregateInputType = {
    id?: true
    title?: true
    slug?: true
    shortDescription?: true
    durationDays?: true
    durationNights?: true
    startingPrice?: true
    currency?: true
    heroImageUrl?: true
    gallery?: true
    metaTitle?: true
    metaDescription?: true
    seoContent?: true
    status?: true
    isFeatured?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
    publishedAt?: true
    _all?: true
  }

  export type PackageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Package to aggregate.
     */
    where?: PackageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Packages to fetch.
     */
    orderBy?: PackageOrderByWithRelationInput | PackageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PackageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Packages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Packages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Packages
    **/
    _count?: true | PackageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PackageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PackageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PackageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PackageMaxAggregateInputType
  }

  export type GetPackageAggregateType<T extends PackageAggregateArgs> = {
        [P in keyof T & keyof AggregatePackage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePackage[P]>
      : GetScalarType<T[P], AggregatePackage[P]>
  }




  export type PackageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PackageWhereInput
    orderBy?: PackageOrderByWithAggregationInput | PackageOrderByWithAggregationInput[]
    by: PackageScalarFieldEnum[] | PackageScalarFieldEnum
    having?: PackageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PackageCountAggregateInputType | true
    _avg?: PackageAvgAggregateInputType
    _sum?: PackageSumAggregateInputType
    _min?: PackageMinAggregateInputType
    _max?: PackageMaxAggregateInputType
  }

  export type PackageGroupByOutputType = {
    id: bigint
    title: string
    slug: string
    shortDescription: string | null
    durationDays: number | null
    durationNights: number | null
    startingPrice: number | null
    currency: string
    heroImageUrl: string | null
    gallery: string[]
    metaTitle: string | null
    metaDescription: string | null
    seoContent: string | null
    status: $Enums.DestinationStatus
    isFeatured: boolean
    sortOrder: number
    createdAt: Date
    updatedAt: Date
    publishedAt: Date | null
    _count: PackageCountAggregateOutputType | null
    _avg: PackageAvgAggregateOutputType | null
    _sum: PackageSumAggregateOutputType | null
    _min: PackageMinAggregateOutputType | null
    _max: PackageMaxAggregateOutputType | null
  }

  type GetPackageGroupByPayload<T extends PackageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PackageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PackageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PackageGroupByOutputType[P]>
            : GetScalarType<T[P], PackageGroupByOutputType[P]>
        }
      >
    >


  export type PackageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    slug?: boolean
    shortDescription?: boolean
    durationDays?: boolean
    durationNights?: boolean
    startingPrice?: boolean
    currency?: boolean
    heroImageUrl?: boolean
    gallery?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    seoContent?: boolean
    status?: boolean
    isFeatured?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    publishedAt?: boolean
    destinations?: boolean | Package$destinationsArgs<ExtArgs>
    hotels?: boolean | Package$hotelsArgs<ExtArgs>
    categories?: boolean | Package$categoriesArgs<ExtArgs>
    _count?: boolean | PackageCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["package"]>

  export type PackageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    slug?: boolean
    shortDescription?: boolean
    durationDays?: boolean
    durationNights?: boolean
    startingPrice?: boolean
    currency?: boolean
    heroImageUrl?: boolean
    gallery?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    seoContent?: boolean
    status?: boolean
    isFeatured?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    publishedAt?: boolean
  }, ExtArgs["result"]["package"]>

  export type PackageSelectScalar = {
    id?: boolean
    title?: boolean
    slug?: boolean
    shortDescription?: boolean
    durationDays?: boolean
    durationNights?: boolean
    startingPrice?: boolean
    currency?: boolean
    heroImageUrl?: boolean
    gallery?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    seoContent?: boolean
    status?: boolean
    isFeatured?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    publishedAt?: boolean
  }

  export type PackageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    destinations?: boolean | Package$destinationsArgs<ExtArgs>
    hotels?: boolean | Package$hotelsArgs<ExtArgs>
    categories?: boolean | Package$categoriesArgs<ExtArgs>
    _count?: boolean | PackageCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PackageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $PackagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Package"
    objects: {
      destinations: Prisma.$PackageDestinationPayload<ExtArgs>[]
      hotels: Prisma.$PackageHotelPayload<ExtArgs>[]
      categories: Prisma.$PackageCategoryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      title: string
      slug: string
      shortDescription: string | null
      durationDays: number | null
      durationNights: number | null
      startingPrice: number | null
      currency: string
      heroImageUrl: string | null
      gallery: string[]
      metaTitle: string | null
      metaDescription: string | null
      seoContent: string | null
      status: $Enums.DestinationStatus
      isFeatured: boolean
      sortOrder: number
      createdAt: Date
      updatedAt: Date
      publishedAt: Date | null
    }, ExtArgs["result"]["package"]>
    composites: {}
  }

  type PackageGetPayload<S extends boolean | null | undefined | PackageDefaultArgs> = $Result.GetResult<Prisma.$PackagePayload, S>

  type PackageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PackageFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PackageCountAggregateInputType | true
    }

  export interface PackageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Package'], meta: { name: 'Package' } }
    /**
     * Find zero or one Package that matches the filter.
     * @param {PackageFindUniqueArgs} args - Arguments to find a Package
     * @example
     * // Get one Package
     * const package = await prisma.package.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PackageFindUniqueArgs>(args: SelectSubset<T, PackageFindUniqueArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Package that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PackageFindUniqueOrThrowArgs} args - Arguments to find a Package
     * @example
     * // Get one Package
     * const package = await prisma.package.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PackageFindUniqueOrThrowArgs>(args: SelectSubset<T, PackageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Package that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageFindFirstArgs} args - Arguments to find a Package
     * @example
     * // Get one Package
     * const package = await prisma.package.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PackageFindFirstArgs>(args?: SelectSubset<T, PackageFindFirstArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Package that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageFindFirstOrThrowArgs} args - Arguments to find a Package
     * @example
     * // Get one Package
     * const package = await prisma.package.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PackageFindFirstOrThrowArgs>(args?: SelectSubset<T, PackageFindFirstOrThrowArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Packages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Packages
     * const packages = await prisma.package.findMany()
     * 
     * // Get first 10 Packages
     * const packages = await prisma.package.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const packageWithIdOnly = await prisma.package.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PackageFindManyArgs>(args?: SelectSubset<T, PackageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Package.
     * @param {PackageCreateArgs} args - Arguments to create a Package.
     * @example
     * // Create one Package
     * const Package = await prisma.package.create({
     *   data: {
     *     // ... data to create a Package
     *   }
     * })
     * 
     */
    create<T extends PackageCreateArgs>(args: SelectSubset<T, PackageCreateArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Packages.
     * @param {PackageCreateManyArgs} args - Arguments to create many Packages.
     * @example
     * // Create many Packages
     * const package = await prisma.package.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PackageCreateManyArgs>(args?: SelectSubset<T, PackageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Packages and returns the data saved in the database.
     * @param {PackageCreateManyAndReturnArgs} args - Arguments to create many Packages.
     * @example
     * // Create many Packages
     * const package = await prisma.package.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Packages and only return the `id`
     * const packageWithIdOnly = await prisma.package.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PackageCreateManyAndReturnArgs>(args?: SelectSubset<T, PackageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Package.
     * @param {PackageDeleteArgs} args - Arguments to delete one Package.
     * @example
     * // Delete one Package
     * const Package = await prisma.package.delete({
     *   where: {
     *     // ... filter to delete one Package
     *   }
     * })
     * 
     */
    delete<T extends PackageDeleteArgs>(args: SelectSubset<T, PackageDeleteArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Package.
     * @param {PackageUpdateArgs} args - Arguments to update one Package.
     * @example
     * // Update one Package
     * const package = await prisma.package.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PackageUpdateArgs>(args: SelectSubset<T, PackageUpdateArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Packages.
     * @param {PackageDeleteManyArgs} args - Arguments to filter Packages to delete.
     * @example
     * // Delete a few Packages
     * const { count } = await prisma.package.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PackageDeleteManyArgs>(args?: SelectSubset<T, PackageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Packages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Packages
     * const package = await prisma.package.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PackageUpdateManyArgs>(args: SelectSubset<T, PackageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Package.
     * @param {PackageUpsertArgs} args - Arguments to update or create a Package.
     * @example
     * // Update or create a Package
     * const package = await prisma.package.upsert({
     *   create: {
     *     // ... data to create a Package
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Package we want to update
     *   }
     * })
     */
    upsert<T extends PackageUpsertArgs>(args: SelectSubset<T, PackageUpsertArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Packages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageCountArgs} args - Arguments to filter Packages to count.
     * @example
     * // Count the number of Packages
     * const count = await prisma.package.count({
     *   where: {
     *     // ... the filter for the Packages we want to count
     *   }
     * })
    **/
    count<T extends PackageCountArgs>(
      args?: Subset<T, PackageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PackageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Package.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PackageAggregateArgs>(args: Subset<T, PackageAggregateArgs>): Prisma.PrismaPromise<GetPackageAggregateType<T>>

    /**
     * Group by Package.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PackageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PackageGroupByArgs['orderBy'] }
        : { orderBy?: PackageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PackageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPackageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Package model
   */
  readonly fields: PackageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Package.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PackageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    destinations<T extends Package$destinationsArgs<ExtArgs> = {}>(args?: Subset<T, Package$destinationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackageDestinationPayload<ExtArgs>, T, "findMany"> | Null>
    hotels<T extends Package$hotelsArgs<ExtArgs> = {}>(args?: Subset<T, Package$hotelsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackageHotelPayload<ExtArgs>, T, "findMany"> | Null>
    categories<T extends Package$categoriesArgs<ExtArgs> = {}>(args?: Subset<T, Package$categoriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackageCategoryPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Package model
   */ 
  interface PackageFieldRefs {
    readonly id: FieldRef<"Package", 'BigInt'>
    readonly title: FieldRef<"Package", 'String'>
    readonly slug: FieldRef<"Package", 'String'>
    readonly shortDescription: FieldRef<"Package", 'String'>
    readonly durationDays: FieldRef<"Package", 'Int'>
    readonly durationNights: FieldRef<"Package", 'Int'>
    readonly startingPrice: FieldRef<"Package", 'Int'>
    readonly currency: FieldRef<"Package", 'String'>
    readonly heroImageUrl: FieldRef<"Package", 'String'>
    readonly gallery: FieldRef<"Package", 'String[]'>
    readonly metaTitle: FieldRef<"Package", 'String'>
    readonly metaDescription: FieldRef<"Package", 'String'>
    readonly seoContent: FieldRef<"Package", 'String'>
    readonly status: FieldRef<"Package", 'DestinationStatus'>
    readonly isFeatured: FieldRef<"Package", 'Boolean'>
    readonly sortOrder: FieldRef<"Package", 'Int'>
    readonly createdAt: FieldRef<"Package", 'DateTime'>
    readonly updatedAt: FieldRef<"Package", 'DateTime'>
    readonly publishedAt: FieldRef<"Package", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Package findUnique
   */
  export type PackageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
    /**
     * Filter, which Package to fetch.
     */
    where: PackageWhereUniqueInput
  }

  /**
   * Package findUniqueOrThrow
   */
  export type PackageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
    /**
     * Filter, which Package to fetch.
     */
    where: PackageWhereUniqueInput
  }

  /**
   * Package findFirst
   */
  export type PackageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
    /**
     * Filter, which Package to fetch.
     */
    where?: PackageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Packages to fetch.
     */
    orderBy?: PackageOrderByWithRelationInput | PackageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Packages.
     */
    cursor?: PackageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Packages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Packages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Packages.
     */
    distinct?: PackageScalarFieldEnum | PackageScalarFieldEnum[]
  }

  /**
   * Package findFirstOrThrow
   */
  export type PackageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
    /**
     * Filter, which Package to fetch.
     */
    where?: PackageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Packages to fetch.
     */
    orderBy?: PackageOrderByWithRelationInput | PackageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Packages.
     */
    cursor?: PackageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Packages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Packages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Packages.
     */
    distinct?: PackageScalarFieldEnum | PackageScalarFieldEnum[]
  }

  /**
   * Package findMany
   */
  export type PackageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
    /**
     * Filter, which Packages to fetch.
     */
    where?: PackageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Packages to fetch.
     */
    orderBy?: PackageOrderByWithRelationInput | PackageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Packages.
     */
    cursor?: PackageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Packages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Packages.
     */
    skip?: number
    distinct?: PackageScalarFieldEnum | PackageScalarFieldEnum[]
  }

  /**
   * Package create
   */
  export type PackageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
    /**
     * The data needed to create a Package.
     */
    data: XOR<PackageCreateInput, PackageUncheckedCreateInput>
  }

  /**
   * Package createMany
   */
  export type PackageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Packages.
     */
    data: PackageCreateManyInput | PackageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Package createManyAndReturn
   */
  export type PackageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Packages.
     */
    data: PackageCreateManyInput | PackageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Package update
   */
  export type PackageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
    /**
     * The data needed to update a Package.
     */
    data: XOR<PackageUpdateInput, PackageUncheckedUpdateInput>
    /**
     * Choose, which Package to update.
     */
    where: PackageWhereUniqueInput
  }

  /**
   * Package updateMany
   */
  export type PackageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Packages.
     */
    data: XOR<PackageUpdateManyMutationInput, PackageUncheckedUpdateManyInput>
    /**
     * Filter which Packages to update
     */
    where?: PackageWhereInput
  }

  /**
   * Package upsert
   */
  export type PackageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
    /**
     * The filter to search for the Package to update in case it exists.
     */
    where: PackageWhereUniqueInput
    /**
     * In case the Package found by the `where` argument doesn't exist, create a new Package with this data.
     */
    create: XOR<PackageCreateInput, PackageUncheckedCreateInput>
    /**
     * In case the Package was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PackageUpdateInput, PackageUncheckedUpdateInput>
  }

  /**
   * Package delete
   */
  export type PackageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
    /**
     * Filter which Package to delete.
     */
    where: PackageWhereUniqueInput
  }

  /**
   * Package deleteMany
   */
  export type PackageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Packages to delete
     */
    where?: PackageWhereInput
  }

  /**
   * Package.destinations
   */
  export type Package$destinationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageDestination
     */
    select?: PackageDestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageDestinationInclude<ExtArgs> | null
    where?: PackageDestinationWhereInput
    orderBy?: PackageDestinationOrderByWithRelationInput | PackageDestinationOrderByWithRelationInput[]
    cursor?: PackageDestinationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PackageDestinationScalarFieldEnum | PackageDestinationScalarFieldEnum[]
  }

  /**
   * Package.hotels
   */
  export type Package$hotelsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageHotel
     */
    select?: PackageHotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageHotelInclude<ExtArgs> | null
    where?: PackageHotelWhereInput
    orderBy?: PackageHotelOrderByWithRelationInput | PackageHotelOrderByWithRelationInput[]
    cursor?: PackageHotelWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PackageHotelScalarFieldEnum | PackageHotelScalarFieldEnum[]
  }

  /**
   * Package.categories
   */
  export type Package$categoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageCategory
     */
    select?: PackageCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageCategoryInclude<ExtArgs> | null
    where?: PackageCategoryWhereInput
    orderBy?: PackageCategoryOrderByWithRelationInput | PackageCategoryOrderByWithRelationInput[]
    cursor?: PackageCategoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PackageCategoryScalarFieldEnum | PackageCategoryScalarFieldEnum[]
  }

  /**
   * Package without action
   */
  export type PackageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
  }


  /**
   * Model PackageDestination
   */

  export type AggregatePackageDestination = {
    _count: PackageDestinationCountAggregateOutputType | null
    _avg: PackageDestinationAvgAggregateOutputType | null
    _sum: PackageDestinationSumAggregateOutputType | null
    _min: PackageDestinationMinAggregateOutputType | null
    _max: PackageDestinationMaxAggregateOutputType | null
  }

  export type PackageDestinationAvgAggregateOutputType = {
    packageId: number | null
    destinationId: number | null
    sortOrder: number | null
    nights: number | null
  }

  export type PackageDestinationSumAggregateOutputType = {
    packageId: bigint | null
    destinationId: bigint | null
    sortOrder: number | null
    nights: number | null
  }

  export type PackageDestinationMinAggregateOutputType = {
    packageId: bigint | null
    destinationId: bigint | null
    isPrimary: boolean | null
    sortOrder: number | null
    nights: number | null
  }

  export type PackageDestinationMaxAggregateOutputType = {
    packageId: bigint | null
    destinationId: bigint | null
    isPrimary: boolean | null
    sortOrder: number | null
    nights: number | null
  }

  export type PackageDestinationCountAggregateOutputType = {
    packageId: number
    destinationId: number
    isPrimary: number
    sortOrder: number
    nights: number
    _all: number
  }


  export type PackageDestinationAvgAggregateInputType = {
    packageId?: true
    destinationId?: true
    sortOrder?: true
    nights?: true
  }

  export type PackageDestinationSumAggregateInputType = {
    packageId?: true
    destinationId?: true
    sortOrder?: true
    nights?: true
  }

  export type PackageDestinationMinAggregateInputType = {
    packageId?: true
    destinationId?: true
    isPrimary?: true
    sortOrder?: true
    nights?: true
  }

  export type PackageDestinationMaxAggregateInputType = {
    packageId?: true
    destinationId?: true
    isPrimary?: true
    sortOrder?: true
    nights?: true
  }

  export type PackageDestinationCountAggregateInputType = {
    packageId?: true
    destinationId?: true
    isPrimary?: true
    sortOrder?: true
    nights?: true
    _all?: true
  }

  export type PackageDestinationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PackageDestination to aggregate.
     */
    where?: PackageDestinationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PackageDestinations to fetch.
     */
    orderBy?: PackageDestinationOrderByWithRelationInput | PackageDestinationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PackageDestinationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PackageDestinations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PackageDestinations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PackageDestinations
    **/
    _count?: true | PackageDestinationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PackageDestinationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PackageDestinationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PackageDestinationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PackageDestinationMaxAggregateInputType
  }

  export type GetPackageDestinationAggregateType<T extends PackageDestinationAggregateArgs> = {
        [P in keyof T & keyof AggregatePackageDestination]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePackageDestination[P]>
      : GetScalarType<T[P], AggregatePackageDestination[P]>
  }




  export type PackageDestinationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PackageDestinationWhereInput
    orderBy?: PackageDestinationOrderByWithAggregationInput | PackageDestinationOrderByWithAggregationInput[]
    by: PackageDestinationScalarFieldEnum[] | PackageDestinationScalarFieldEnum
    having?: PackageDestinationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PackageDestinationCountAggregateInputType | true
    _avg?: PackageDestinationAvgAggregateInputType
    _sum?: PackageDestinationSumAggregateInputType
    _min?: PackageDestinationMinAggregateInputType
    _max?: PackageDestinationMaxAggregateInputType
  }

  export type PackageDestinationGroupByOutputType = {
    packageId: bigint
    destinationId: bigint
    isPrimary: boolean
    sortOrder: number
    nights: number | null
    _count: PackageDestinationCountAggregateOutputType | null
    _avg: PackageDestinationAvgAggregateOutputType | null
    _sum: PackageDestinationSumAggregateOutputType | null
    _min: PackageDestinationMinAggregateOutputType | null
    _max: PackageDestinationMaxAggregateOutputType | null
  }

  type GetPackageDestinationGroupByPayload<T extends PackageDestinationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PackageDestinationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PackageDestinationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PackageDestinationGroupByOutputType[P]>
            : GetScalarType<T[P], PackageDestinationGroupByOutputType[P]>
        }
      >
    >


  export type PackageDestinationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    packageId?: boolean
    destinationId?: boolean
    isPrimary?: boolean
    sortOrder?: boolean
    nights?: boolean
    package?: boolean | PackageDefaultArgs<ExtArgs>
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["packageDestination"]>

  export type PackageDestinationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    packageId?: boolean
    destinationId?: boolean
    isPrimary?: boolean
    sortOrder?: boolean
    nights?: boolean
    package?: boolean | PackageDefaultArgs<ExtArgs>
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["packageDestination"]>

  export type PackageDestinationSelectScalar = {
    packageId?: boolean
    destinationId?: boolean
    isPrimary?: boolean
    sortOrder?: boolean
    nights?: boolean
  }

  export type PackageDestinationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    package?: boolean | PackageDefaultArgs<ExtArgs>
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }
  export type PackageDestinationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    package?: boolean | PackageDefaultArgs<ExtArgs>
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }

  export type $PackageDestinationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PackageDestination"
    objects: {
      package: Prisma.$PackagePayload<ExtArgs>
      destination: Prisma.$DestinationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      packageId: bigint
      destinationId: bigint
      isPrimary: boolean
      sortOrder: number
      nights: number | null
    }, ExtArgs["result"]["packageDestination"]>
    composites: {}
  }

  type PackageDestinationGetPayload<S extends boolean | null | undefined | PackageDestinationDefaultArgs> = $Result.GetResult<Prisma.$PackageDestinationPayload, S>

  type PackageDestinationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PackageDestinationFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PackageDestinationCountAggregateInputType | true
    }

  export interface PackageDestinationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PackageDestination'], meta: { name: 'PackageDestination' } }
    /**
     * Find zero or one PackageDestination that matches the filter.
     * @param {PackageDestinationFindUniqueArgs} args - Arguments to find a PackageDestination
     * @example
     * // Get one PackageDestination
     * const packageDestination = await prisma.packageDestination.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PackageDestinationFindUniqueArgs>(args: SelectSubset<T, PackageDestinationFindUniqueArgs<ExtArgs>>): Prisma__PackageDestinationClient<$Result.GetResult<Prisma.$PackageDestinationPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PackageDestination that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PackageDestinationFindUniqueOrThrowArgs} args - Arguments to find a PackageDestination
     * @example
     * // Get one PackageDestination
     * const packageDestination = await prisma.packageDestination.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PackageDestinationFindUniqueOrThrowArgs>(args: SelectSubset<T, PackageDestinationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PackageDestinationClient<$Result.GetResult<Prisma.$PackageDestinationPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PackageDestination that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageDestinationFindFirstArgs} args - Arguments to find a PackageDestination
     * @example
     * // Get one PackageDestination
     * const packageDestination = await prisma.packageDestination.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PackageDestinationFindFirstArgs>(args?: SelectSubset<T, PackageDestinationFindFirstArgs<ExtArgs>>): Prisma__PackageDestinationClient<$Result.GetResult<Prisma.$PackageDestinationPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PackageDestination that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageDestinationFindFirstOrThrowArgs} args - Arguments to find a PackageDestination
     * @example
     * // Get one PackageDestination
     * const packageDestination = await prisma.packageDestination.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PackageDestinationFindFirstOrThrowArgs>(args?: SelectSubset<T, PackageDestinationFindFirstOrThrowArgs<ExtArgs>>): Prisma__PackageDestinationClient<$Result.GetResult<Prisma.$PackageDestinationPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PackageDestinations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageDestinationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PackageDestinations
     * const packageDestinations = await prisma.packageDestination.findMany()
     * 
     * // Get first 10 PackageDestinations
     * const packageDestinations = await prisma.packageDestination.findMany({ take: 10 })
     * 
     * // Only select the `packageId`
     * const packageDestinationWithPackageIdOnly = await prisma.packageDestination.findMany({ select: { packageId: true } })
     * 
     */
    findMany<T extends PackageDestinationFindManyArgs>(args?: SelectSubset<T, PackageDestinationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackageDestinationPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PackageDestination.
     * @param {PackageDestinationCreateArgs} args - Arguments to create a PackageDestination.
     * @example
     * // Create one PackageDestination
     * const PackageDestination = await prisma.packageDestination.create({
     *   data: {
     *     // ... data to create a PackageDestination
     *   }
     * })
     * 
     */
    create<T extends PackageDestinationCreateArgs>(args: SelectSubset<T, PackageDestinationCreateArgs<ExtArgs>>): Prisma__PackageDestinationClient<$Result.GetResult<Prisma.$PackageDestinationPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PackageDestinations.
     * @param {PackageDestinationCreateManyArgs} args - Arguments to create many PackageDestinations.
     * @example
     * // Create many PackageDestinations
     * const packageDestination = await prisma.packageDestination.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PackageDestinationCreateManyArgs>(args?: SelectSubset<T, PackageDestinationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PackageDestinations and returns the data saved in the database.
     * @param {PackageDestinationCreateManyAndReturnArgs} args - Arguments to create many PackageDestinations.
     * @example
     * // Create many PackageDestinations
     * const packageDestination = await prisma.packageDestination.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PackageDestinations and only return the `packageId`
     * const packageDestinationWithPackageIdOnly = await prisma.packageDestination.createManyAndReturn({ 
     *   select: { packageId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PackageDestinationCreateManyAndReturnArgs>(args?: SelectSubset<T, PackageDestinationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackageDestinationPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PackageDestination.
     * @param {PackageDestinationDeleteArgs} args - Arguments to delete one PackageDestination.
     * @example
     * // Delete one PackageDestination
     * const PackageDestination = await prisma.packageDestination.delete({
     *   where: {
     *     // ... filter to delete one PackageDestination
     *   }
     * })
     * 
     */
    delete<T extends PackageDestinationDeleteArgs>(args: SelectSubset<T, PackageDestinationDeleteArgs<ExtArgs>>): Prisma__PackageDestinationClient<$Result.GetResult<Prisma.$PackageDestinationPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PackageDestination.
     * @param {PackageDestinationUpdateArgs} args - Arguments to update one PackageDestination.
     * @example
     * // Update one PackageDestination
     * const packageDestination = await prisma.packageDestination.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PackageDestinationUpdateArgs>(args: SelectSubset<T, PackageDestinationUpdateArgs<ExtArgs>>): Prisma__PackageDestinationClient<$Result.GetResult<Prisma.$PackageDestinationPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PackageDestinations.
     * @param {PackageDestinationDeleteManyArgs} args - Arguments to filter PackageDestinations to delete.
     * @example
     * // Delete a few PackageDestinations
     * const { count } = await prisma.packageDestination.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PackageDestinationDeleteManyArgs>(args?: SelectSubset<T, PackageDestinationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PackageDestinations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageDestinationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PackageDestinations
     * const packageDestination = await prisma.packageDestination.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PackageDestinationUpdateManyArgs>(args: SelectSubset<T, PackageDestinationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PackageDestination.
     * @param {PackageDestinationUpsertArgs} args - Arguments to update or create a PackageDestination.
     * @example
     * // Update or create a PackageDestination
     * const packageDestination = await prisma.packageDestination.upsert({
     *   create: {
     *     // ... data to create a PackageDestination
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PackageDestination we want to update
     *   }
     * })
     */
    upsert<T extends PackageDestinationUpsertArgs>(args: SelectSubset<T, PackageDestinationUpsertArgs<ExtArgs>>): Prisma__PackageDestinationClient<$Result.GetResult<Prisma.$PackageDestinationPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PackageDestinations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageDestinationCountArgs} args - Arguments to filter PackageDestinations to count.
     * @example
     * // Count the number of PackageDestinations
     * const count = await prisma.packageDestination.count({
     *   where: {
     *     // ... the filter for the PackageDestinations we want to count
     *   }
     * })
    **/
    count<T extends PackageDestinationCountArgs>(
      args?: Subset<T, PackageDestinationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PackageDestinationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PackageDestination.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageDestinationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PackageDestinationAggregateArgs>(args: Subset<T, PackageDestinationAggregateArgs>): Prisma.PrismaPromise<GetPackageDestinationAggregateType<T>>

    /**
     * Group by PackageDestination.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageDestinationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PackageDestinationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PackageDestinationGroupByArgs['orderBy'] }
        : { orderBy?: PackageDestinationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PackageDestinationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPackageDestinationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PackageDestination model
   */
  readonly fields: PackageDestinationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PackageDestination.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PackageDestinationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    package<T extends PackageDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PackageDefaultArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    destination<T extends DestinationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DestinationDefaultArgs<ExtArgs>>): Prisma__DestinationClient<$Result.GetResult<Prisma.$DestinationPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PackageDestination model
   */ 
  interface PackageDestinationFieldRefs {
    readonly packageId: FieldRef<"PackageDestination", 'BigInt'>
    readonly destinationId: FieldRef<"PackageDestination", 'BigInt'>
    readonly isPrimary: FieldRef<"PackageDestination", 'Boolean'>
    readonly sortOrder: FieldRef<"PackageDestination", 'Int'>
    readonly nights: FieldRef<"PackageDestination", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * PackageDestination findUnique
   */
  export type PackageDestinationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageDestination
     */
    select?: PackageDestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageDestinationInclude<ExtArgs> | null
    /**
     * Filter, which PackageDestination to fetch.
     */
    where: PackageDestinationWhereUniqueInput
  }

  /**
   * PackageDestination findUniqueOrThrow
   */
  export type PackageDestinationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageDestination
     */
    select?: PackageDestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageDestinationInclude<ExtArgs> | null
    /**
     * Filter, which PackageDestination to fetch.
     */
    where: PackageDestinationWhereUniqueInput
  }

  /**
   * PackageDestination findFirst
   */
  export type PackageDestinationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageDestination
     */
    select?: PackageDestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageDestinationInclude<ExtArgs> | null
    /**
     * Filter, which PackageDestination to fetch.
     */
    where?: PackageDestinationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PackageDestinations to fetch.
     */
    orderBy?: PackageDestinationOrderByWithRelationInput | PackageDestinationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PackageDestinations.
     */
    cursor?: PackageDestinationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PackageDestinations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PackageDestinations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PackageDestinations.
     */
    distinct?: PackageDestinationScalarFieldEnum | PackageDestinationScalarFieldEnum[]
  }

  /**
   * PackageDestination findFirstOrThrow
   */
  export type PackageDestinationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageDestination
     */
    select?: PackageDestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageDestinationInclude<ExtArgs> | null
    /**
     * Filter, which PackageDestination to fetch.
     */
    where?: PackageDestinationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PackageDestinations to fetch.
     */
    orderBy?: PackageDestinationOrderByWithRelationInput | PackageDestinationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PackageDestinations.
     */
    cursor?: PackageDestinationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PackageDestinations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PackageDestinations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PackageDestinations.
     */
    distinct?: PackageDestinationScalarFieldEnum | PackageDestinationScalarFieldEnum[]
  }

  /**
   * PackageDestination findMany
   */
  export type PackageDestinationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageDestination
     */
    select?: PackageDestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageDestinationInclude<ExtArgs> | null
    /**
     * Filter, which PackageDestinations to fetch.
     */
    where?: PackageDestinationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PackageDestinations to fetch.
     */
    orderBy?: PackageDestinationOrderByWithRelationInput | PackageDestinationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PackageDestinations.
     */
    cursor?: PackageDestinationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PackageDestinations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PackageDestinations.
     */
    skip?: number
    distinct?: PackageDestinationScalarFieldEnum | PackageDestinationScalarFieldEnum[]
  }

  /**
   * PackageDestination create
   */
  export type PackageDestinationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageDestination
     */
    select?: PackageDestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageDestinationInclude<ExtArgs> | null
    /**
     * The data needed to create a PackageDestination.
     */
    data: XOR<PackageDestinationCreateInput, PackageDestinationUncheckedCreateInput>
  }

  /**
   * PackageDestination createMany
   */
  export type PackageDestinationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PackageDestinations.
     */
    data: PackageDestinationCreateManyInput | PackageDestinationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PackageDestination createManyAndReturn
   */
  export type PackageDestinationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageDestination
     */
    select?: PackageDestinationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PackageDestinations.
     */
    data: PackageDestinationCreateManyInput | PackageDestinationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageDestinationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PackageDestination update
   */
  export type PackageDestinationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageDestination
     */
    select?: PackageDestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageDestinationInclude<ExtArgs> | null
    /**
     * The data needed to update a PackageDestination.
     */
    data: XOR<PackageDestinationUpdateInput, PackageDestinationUncheckedUpdateInput>
    /**
     * Choose, which PackageDestination to update.
     */
    where: PackageDestinationWhereUniqueInput
  }

  /**
   * PackageDestination updateMany
   */
  export type PackageDestinationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PackageDestinations.
     */
    data: XOR<PackageDestinationUpdateManyMutationInput, PackageDestinationUncheckedUpdateManyInput>
    /**
     * Filter which PackageDestinations to update
     */
    where?: PackageDestinationWhereInput
  }

  /**
   * PackageDestination upsert
   */
  export type PackageDestinationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageDestination
     */
    select?: PackageDestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageDestinationInclude<ExtArgs> | null
    /**
     * The filter to search for the PackageDestination to update in case it exists.
     */
    where: PackageDestinationWhereUniqueInput
    /**
     * In case the PackageDestination found by the `where` argument doesn't exist, create a new PackageDestination with this data.
     */
    create: XOR<PackageDestinationCreateInput, PackageDestinationUncheckedCreateInput>
    /**
     * In case the PackageDestination was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PackageDestinationUpdateInput, PackageDestinationUncheckedUpdateInput>
  }

  /**
   * PackageDestination delete
   */
  export type PackageDestinationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageDestination
     */
    select?: PackageDestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageDestinationInclude<ExtArgs> | null
    /**
     * Filter which PackageDestination to delete.
     */
    where: PackageDestinationWhereUniqueInput
  }

  /**
   * PackageDestination deleteMany
   */
  export type PackageDestinationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PackageDestinations to delete
     */
    where?: PackageDestinationWhereInput
  }

  /**
   * PackageDestination without action
   */
  export type PackageDestinationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageDestination
     */
    select?: PackageDestinationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageDestinationInclude<ExtArgs> | null
  }


  /**
   * Model PackageHotel
   */

  export type AggregatePackageHotel = {
    _count: PackageHotelCountAggregateOutputType | null
    _avg: PackageHotelAvgAggregateOutputType | null
    _sum: PackageHotelSumAggregateOutputType | null
    _min: PackageHotelMinAggregateOutputType | null
    _max: PackageHotelMaxAggregateOutputType | null
  }

  export type PackageHotelAvgAggregateOutputType = {
    packageId: number | null
    hotelId: number | null
    nights: number | null
    sortOrder: number | null
  }

  export type PackageHotelSumAggregateOutputType = {
    packageId: bigint | null
    hotelId: bigint | null
    nights: number | null
    sortOrder: number | null
  }

  export type PackageHotelMinAggregateOutputType = {
    packageId: bigint | null
    hotelId: bigint | null
    nights: number | null
    sortOrder: number | null
  }

  export type PackageHotelMaxAggregateOutputType = {
    packageId: bigint | null
    hotelId: bigint | null
    nights: number | null
    sortOrder: number | null
  }

  export type PackageHotelCountAggregateOutputType = {
    packageId: number
    hotelId: number
    nights: number
    sortOrder: number
    _all: number
  }


  export type PackageHotelAvgAggregateInputType = {
    packageId?: true
    hotelId?: true
    nights?: true
    sortOrder?: true
  }

  export type PackageHotelSumAggregateInputType = {
    packageId?: true
    hotelId?: true
    nights?: true
    sortOrder?: true
  }

  export type PackageHotelMinAggregateInputType = {
    packageId?: true
    hotelId?: true
    nights?: true
    sortOrder?: true
  }

  export type PackageHotelMaxAggregateInputType = {
    packageId?: true
    hotelId?: true
    nights?: true
    sortOrder?: true
  }

  export type PackageHotelCountAggregateInputType = {
    packageId?: true
    hotelId?: true
    nights?: true
    sortOrder?: true
    _all?: true
  }

  export type PackageHotelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PackageHotel to aggregate.
     */
    where?: PackageHotelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PackageHotels to fetch.
     */
    orderBy?: PackageHotelOrderByWithRelationInput | PackageHotelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PackageHotelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PackageHotels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PackageHotels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PackageHotels
    **/
    _count?: true | PackageHotelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PackageHotelAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PackageHotelSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PackageHotelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PackageHotelMaxAggregateInputType
  }

  export type GetPackageHotelAggregateType<T extends PackageHotelAggregateArgs> = {
        [P in keyof T & keyof AggregatePackageHotel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePackageHotel[P]>
      : GetScalarType<T[P], AggregatePackageHotel[P]>
  }




  export type PackageHotelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PackageHotelWhereInput
    orderBy?: PackageHotelOrderByWithAggregationInput | PackageHotelOrderByWithAggregationInput[]
    by: PackageHotelScalarFieldEnum[] | PackageHotelScalarFieldEnum
    having?: PackageHotelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PackageHotelCountAggregateInputType | true
    _avg?: PackageHotelAvgAggregateInputType
    _sum?: PackageHotelSumAggregateInputType
    _min?: PackageHotelMinAggregateInputType
    _max?: PackageHotelMaxAggregateInputType
  }

  export type PackageHotelGroupByOutputType = {
    packageId: bigint
    hotelId: bigint
    nights: number | null
    sortOrder: number
    _count: PackageHotelCountAggregateOutputType | null
    _avg: PackageHotelAvgAggregateOutputType | null
    _sum: PackageHotelSumAggregateOutputType | null
    _min: PackageHotelMinAggregateOutputType | null
    _max: PackageHotelMaxAggregateOutputType | null
  }

  type GetPackageHotelGroupByPayload<T extends PackageHotelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PackageHotelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PackageHotelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PackageHotelGroupByOutputType[P]>
            : GetScalarType<T[P], PackageHotelGroupByOutputType[P]>
        }
      >
    >


  export type PackageHotelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    packageId?: boolean
    hotelId?: boolean
    nights?: boolean
    sortOrder?: boolean
    package?: boolean | PackageDefaultArgs<ExtArgs>
    hotel?: boolean | HotelDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["packageHotel"]>

  export type PackageHotelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    packageId?: boolean
    hotelId?: boolean
    nights?: boolean
    sortOrder?: boolean
    package?: boolean | PackageDefaultArgs<ExtArgs>
    hotel?: boolean | HotelDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["packageHotel"]>

  export type PackageHotelSelectScalar = {
    packageId?: boolean
    hotelId?: boolean
    nights?: boolean
    sortOrder?: boolean
  }

  export type PackageHotelInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    package?: boolean | PackageDefaultArgs<ExtArgs>
    hotel?: boolean | HotelDefaultArgs<ExtArgs>
  }
  export type PackageHotelIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    package?: boolean | PackageDefaultArgs<ExtArgs>
    hotel?: boolean | HotelDefaultArgs<ExtArgs>
  }

  export type $PackageHotelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PackageHotel"
    objects: {
      package: Prisma.$PackagePayload<ExtArgs>
      hotel: Prisma.$HotelPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      packageId: bigint
      hotelId: bigint
      nights: number | null
      sortOrder: number
    }, ExtArgs["result"]["packageHotel"]>
    composites: {}
  }

  type PackageHotelGetPayload<S extends boolean | null | undefined | PackageHotelDefaultArgs> = $Result.GetResult<Prisma.$PackageHotelPayload, S>

  type PackageHotelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PackageHotelFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PackageHotelCountAggregateInputType | true
    }

  export interface PackageHotelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PackageHotel'], meta: { name: 'PackageHotel' } }
    /**
     * Find zero or one PackageHotel that matches the filter.
     * @param {PackageHotelFindUniqueArgs} args - Arguments to find a PackageHotel
     * @example
     * // Get one PackageHotel
     * const packageHotel = await prisma.packageHotel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PackageHotelFindUniqueArgs>(args: SelectSubset<T, PackageHotelFindUniqueArgs<ExtArgs>>): Prisma__PackageHotelClient<$Result.GetResult<Prisma.$PackageHotelPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PackageHotel that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PackageHotelFindUniqueOrThrowArgs} args - Arguments to find a PackageHotel
     * @example
     * // Get one PackageHotel
     * const packageHotel = await prisma.packageHotel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PackageHotelFindUniqueOrThrowArgs>(args: SelectSubset<T, PackageHotelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PackageHotelClient<$Result.GetResult<Prisma.$PackageHotelPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PackageHotel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageHotelFindFirstArgs} args - Arguments to find a PackageHotel
     * @example
     * // Get one PackageHotel
     * const packageHotel = await prisma.packageHotel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PackageHotelFindFirstArgs>(args?: SelectSubset<T, PackageHotelFindFirstArgs<ExtArgs>>): Prisma__PackageHotelClient<$Result.GetResult<Prisma.$PackageHotelPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PackageHotel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageHotelFindFirstOrThrowArgs} args - Arguments to find a PackageHotel
     * @example
     * // Get one PackageHotel
     * const packageHotel = await prisma.packageHotel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PackageHotelFindFirstOrThrowArgs>(args?: SelectSubset<T, PackageHotelFindFirstOrThrowArgs<ExtArgs>>): Prisma__PackageHotelClient<$Result.GetResult<Prisma.$PackageHotelPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PackageHotels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageHotelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PackageHotels
     * const packageHotels = await prisma.packageHotel.findMany()
     * 
     * // Get first 10 PackageHotels
     * const packageHotels = await prisma.packageHotel.findMany({ take: 10 })
     * 
     * // Only select the `packageId`
     * const packageHotelWithPackageIdOnly = await prisma.packageHotel.findMany({ select: { packageId: true } })
     * 
     */
    findMany<T extends PackageHotelFindManyArgs>(args?: SelectSubset<T, PackageHotelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackageHotelPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PackageHotel.
     * @param {PackageHotelCreateArgs} args - Arguments to create a PackageHotel.
     * @example
     * // Create one PackageHotel
     * const PackageHotel = await prisma.packageHotel.create({
     *   data: {
     *     // ... data to create a PackageHotel
     *   }
     * })
     * 
     */
    create<T extends PackageHotelCreateArgs>(args: SelectSubset<T, PackageHotelCreateArgs<ExtArgs>>): Prisma__PackageHotelClient<$Result.GetResult<Prisma.$PackageHotelPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PackageHotels.
     * @param {PackageHotelCreateManyArgs} args - Arguments to create many PackageHotels.
     * @example
     * // Create many PackageHotels
     * const packageHotel = await prisma.packageHotel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PackageHotelCreateManyArgs>(args?: SelectSubset<T, PackageHotelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PackageHotels and returns the data saved in the database.
     * @param {PackageHotelCreateManyAndReturnArgs} args - Arguments to create many PackageHotels.
     * @example
     * // Create many PackageHotels
     * const packageHotel = await prisma.packageHotel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PackageHotels and only return the `packageId`
     * const packageHotelWithPackageIdOnly = await prisma.packageHotel.createManyAndReturn({ 
     *   select: { packageId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PackageHotelCreateManyAndReturnArgs>(args?: SelectSubset<T, PackageHotelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackageHotelPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PackageHotel.
     * @param {PackageHotelDeleteArgs} args - Arguments to delete one PackageHotel.
     * @example
     * // Delete one PackageHotel
     * const PackageHotel = await prisma.packageHotel.delete({
     *   where: {
     *     // ... filter to delete one PackageHotel
     *   }
     * })
     * 
     */
    delete<T extends PackageHotelDeleteArgs>(args: SelectSubset<T, PackageHotelDeleteArgs<ExtArgs>>): Prisma__PackageHotelClient<$Result.GetResult<Prisma.$PackageHotelPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PackageHotel.
     * @param {PackageHotelUpdateArgs} args - Arguments to update one PackageHotel.
     * @example
     * // Update one PackageHotel
     * const packageHotel = await prisma.packageHotel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PackageHotelUpdateArgs>(args: SelectSubset<T, PackageHotelUpdateArgs<ExtArgs>>): Prisma__PackageHotelClient<$Result.GetResult<Prisma.$PackageHotelPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PackageHotels.
     * @param {PackageHotelDeleteManyArgs} args - Arguments to filter PackageHotels to delete.
     * @example
     * // Delete a few PackageHotels
     * const { count } = await prisma.packageHotel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PackageHotelDeleteManyArgs>(args?: SelectSubset<T, PackageHotelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PackageHotels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageHotelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PackageHotels
     * const packageHotel = await prisma.packageHotel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PackageHotelUpdateManyArgs>(args: SelectSubset<T, PackageHotelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PackageHotel.
     * @param {PackageHotelUpsertArgs} args - Arguments to update or create a PackageHotel.
     * @example
     * // Update or create a PackageHotel
     * const packageHotel = await prisma.packageHotel.upsert({
     *   create: {
     *     // ... data to create a PackageHotel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PackageHotel we want to update
     *   }
     * })
     */
    upsert<T extends PackageHotelUpsertArgs>(args: SelectSubset<T, PackageHotelUpsertArgs<ExtArgs>>): Prisma__PackageHotelClient<$Result.GetResult<Prisma.$PackageHotelPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PackageHotels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageHotelCountArgs} args - Arguments to filter PackageHotels to count.
     * @example
     * // Count the number of PackageHotels
     * const count = await prisma.packageHotel.count({
     *   where: {
     *     // ... the filter for the PackageHotels we want to count
     *   }
     * })
    **/
    count<T extends PackageHotelCountArgs>(
      args?: Subset<T, PackageHotelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PackageHotelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PackageHotel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageHotelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PackageHotelAggregateArgs>(args: Subset<T, PackageHotelAggregateArgs>): Prisma.PrismaPromise<GetPackageHotelAggregateType<T>>

    /**
     * Group by PackageHotel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageHotelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PackageHotelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PackageHotelGroupByArgs['orderBy'] }
        : { orderBy?: PackageHotelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PackageHotelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPackageHotelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PackageHotel model
   */
  readonly fields: PackageHotelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PackageHotel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PackageHotelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    package<T extends PackageDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PackageDefaultArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    hotel<T extends HotelDefaultArgs<ExtArgs> = {}>(args?: Subset<T, HotelDefaultArgs<ExtArgs>>): Prisma__HotelClient<$Result.GetResult<Prisma.$HotelPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PackageHotel model
   */ 
  interface PackageHotelFieldRefs {
    readonly packageId: FieldRef<"PackageHotel", 'BigInt'>
    readonly hotelId: FieldRef<"PackageHotel", 'BigInt'>
    readonly nights: FieldRef<"PackageHotel", 'Int'>
    readonly sortOrder: FieldRef<"PackageHotel", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * PackageHotel findUnique
   */
  export type PackageHotelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageHotel
     */
    select?: PackageHotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageHotelInclude<ExtArgs> | null
    /**
     * Filter, which PackageHotel to fetch.
     */
    where: PackageHotelWhereUniqueInput
  }

  /**
   * PackageHotel findUniqueOrThrow
   */
  export type PackageHotelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageHotel
     */
    select?: PackageHotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageHotelInclude<ExtArgs> | null
    /**
     * Filter, which PackageHotel to fetch.
     */
    where: PackageHotelWhereUniqueInput
  }

  /**
   * PackageHotel findFirst
   */
  export type PackageHotelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageHotel
     */
    select?: PackageHotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageHotelInclude<ExtArgs> | null
    /**
     * Filter, which PackageHotel to fetch.
     */
    where?: PackageHotelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PackageHotels to fetch.
     */
    orderBy?: PackageHotelOrderByWithRelationInput | PackageHotelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PackageHotels.
     */
    cursor?: PackageHotelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PackageHotels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PackageHotels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PackageHotels.
     */
    distinct?: PackageHotelScalarFieldEnum | PackageHotelScalarFieldEnum[]
  }

  /**
   * PackageHotel findFirstOrThrow
   */
  export type PackageHotelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageHotel
     */
    select?: PackageHotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageHotelInclude<ExtArgs> | null
    /**
     * Filter, which PackageHotel to fetch.
     */
    where?: PackageHotelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PackageHotels to fetch.
     */
    orderBy?: PackageHotelOrderByWithRelationInput | PackageHotelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PackageHotels.
     */
    cursor?: PackageHotelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PackageHotels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PackageHotels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PackageHotels.
     */
    distinct?: PackageHotelScalarFieldEnum | PackageHotelScalarFieldEnum[]
  }

  /**
   * PackageHotel findMany
   */
  export type PackageHotelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageHotel
     */
    select?: PackageHotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageHotelInclude<ExtArgs> | null
    /**
     * Filter, which PackageHotels to fetch.
     */
    where?: PackageHotelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PackageHotels to fetch.
     */
    orderBy?: PackageHotelOrderByWithRelationInput | PackageHotelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PackageHotels.
     */
    cursor?: PackageHotelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PackageHotels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PackageHotels.
     */
    skip?: number
    distinct?: PackageHotelScalarFieldEnum | PackageHotelScalarFieldEnum[]
  }

  /**
   * PackageHotel create
   */
  export type PackageHotelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageHotel
     */
    select?: PackageHotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageHotelInclude<ExtArgs> | null
    /**
     * The data needed to create a PackageHotel.
     */
    data: XOR<PackageHotelCreateInput, PackageHotelUncheckedCreateInput>
  }

  /**
   * PackageHotel createMany
   */
  export type PackageHotelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PackageHotels.
     */
    data: PackageHotelCreateManyInput | PackageHotelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PackageHotel createManyAndReturn
   */
  export type PackageHotelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageHotel
     */
    select?: PackageHotelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PackageHotels.
     */
    data: PackageHotelCreateManyInput | PackageHotelCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageHotelIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PackageHotel update
   */
  export type PackageHotelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageHotel
     */
    select?: PackageHotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageHotelInclude<ExtArgs> | null
    /**
     * The data needed to update a PackageHotel.
     */
    data: XOR<PackageHotelUpdateInput, PackageHotelUncheckedUpdateInput>
    /**
     * Choose, which PackageHotel to update.
     */
    where: PackageHotelWhereUniqueInput
  }

  /**
   * PackageHotel updateMany
   */
  export type PackageHotelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PackageHotels.
     */
    data: XOR<PackageHotelUpdateManyMutationInput, PackageHotelUncheckedUpdateManyInput>
    /**
     * Filter which PackageHotels to update
     */
    where?: PackageHotelWhereInput
  }

  /**
   * PackageHotel upsert
   */
  export type PackageHotelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageHotel
     */
    select?: PackageHotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageHotelInclude<ExtArgs> | null
    /**
     * The filter to search for the PackageHotel to update in case it exists.
     */
    where: PackageHotelWhereUniqueInput
    /**
     * In case the PackageHotel found by the `where` argument doesn't exist, create a new PackageHotel with this data.
     */
    create: XOR<PackageHotelCreateInput, PackageHotelUncheckedCreateInput>
    /**
     * In case the PackageHotel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PackageHotelUpdateInput, PackageHotelUncheckedUpdateInput>
  }

  /**
   * PackageHotel delete
   */
  export type PackageHotelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageHotel
     */
    select?: PackageHotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageHotelInclude<ExtArgs> | null
    /**
     * Filter which PackageHotel to delete.
     */
    where: PackageHotelWhereUniqueInput
  }

  /**
   * PackageHotel deleteMany
   */
  export type PackageHotelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PackageHotels to delete
     */
    where?: PackageHotelWhereInput
  }

  /**
   * PackageHotel without action
   */
  export type PackageHotelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageHotel
     */
    select?: PackageHotelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageHotelInclude<ExtArgs> | null
  }


  /**
   * Model PackageCategory
   */

  export type AggregatePackageCategory = {
    _count: PackageCategoryCountAggregateOutputType | null
    _avg: PackageCategoryAvgAggregateOutputType | null
    _sum: PackageCategorySumAggregateOutputType | null
    _min: PackageCategoryMinAggregateOutputType | null
    _max: PackageCategoryMaxAggregateOutputType | null
  }

  export type PackageCategoryAvgAggregateOutputType = {
    packageId: number | null
    categoryId: number | null
    sortOrder: number | null
  }

  export type PackageCategorySumAggregateOutputType = {
    packageId: bigint | null
    categoryId: bigint | null
    sortOrder: number | null
  }

  export type PackageCategoryMinAggregateOutputType = {
    packageId: bigint | null
    categoryId: bigint | null
    sortOrder: number | null
  }

  export type PackageCategoryMaxAggregateOutputType = {
    packageId: bigint | null
    categoryId: bigint | null
    sortOrder: number | null
  }

  export type PackageCategoryCountAggregateOutputType = {
    packageId: number
    categoryId: number
    sortOrder: number
    _all: number
  }


  export type PackageCategoryAvgAggregateInputType = {
    packageId?: true
    categoryId?: true
    sortOrder?: true
  }

  export type PackageCategorySumAggregateInputType = {
    packageId?: true
    categoryId?: true
    sortOrder?: true
  }

  export type PackageCategoryMinAggregateInputType = {
    packageId?: true
    categoryId?: true
    sortOrder?: true
  }

  export type PackageCategoryMaxAggregateInputType = {
    packageId?: true
    categoryId?: true
    sortOrder?: true
  }

  export type PackageCategoryCountAggregateInputType = {
    packageId?: true
    categoryId?: true
    sortOrder?: true
    _all?: true
  }

  export type PackageCategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PackageCategory to aggregate.
     */
    where?: PackageCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PackageCategories to fetch.
     */
    orderBy?: PackageCategoryOrderByWithRelationInput | PackageCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PackageCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PackageCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PackageCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PackageCategories
    **/
    _count?: true | PackageCategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PackageCategoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PackageCategorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PackageCategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PackageCategoryMaxAggregateInputType
  }

  export type GetPackageCategoryAggregateType<T extends PackageCategoryAggregateArgs> = {
        [P in keyof T & keyof AggregatePackageCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePackageCategory[P]>
      : GetScalarType<T[P], AggregatePackageCategory[P]>
  }




  export type PackageCategoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PackageCategoryWhereInput
    orderBy?: PackageCategoryOrderByWithAggregationInput | PackageCategoryOrderByWithAggregationInput[]
    by: PackageCategoryScalarFieldEnum[] | PackageCategoryScalarFieldEnum
    having?: PackageCategoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PackageCategoryCountAggregateInputType | true
    _avg?: PackageCategoryAvgAggregateInputType
    _sum?: PackageCategorySumAggregateInputType
    _min?: PackageCategoryMinAggregateInputType
    _max?: PackageCategoryMaxAggregateInputType
  }

  export type PackageCategoryGroupByOutputType = {
    packageId: bigint
    categoryId: bigint
    sortOrder: number
    _count: PackageCategoryCountAggregateOutputType | null
    _avg: PackageCategoryAvgAggregateOutputType | null
    _sum: PackageCategorySumAggregateOutputType | null
    _min: PackageCategoryMinAggregateOutputType | null
    _max: PackageCategoryMaxAggregateOutputType | null
  }

  type GetPackageCategoryGroupByPayload<T extends PackageCategoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PackageCategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PackageCategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PackageCategoryGroupByOutputType[P]>
            : GetScalarType<T[P], PackageCategoryGroupByOutputType[P]>
        }
      >
    >


  export type PackageCategorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    packageId?: boolean
    categoryId?: boolean
    sortOrder?: boolean
    package?: boolean | PackageDefaultArgs<ExtArgs>
    category?: boolean | DestinationCategoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["packageCategory"]>

  export type PackageCategorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    packageId?: boolean
    categoryId?: boolean
    sortOrder?: boolean
    package?: boolean | PackageDefaultArgs<ExtArgs>
    category?: boolean | DestinationCategoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["packageCategory"]>

  export type PackageCategorySelectScalar = {
    packageId?: boolean
    categoryId?: boolean
    sortOrder?: boolean
  }

  export type PackageCategoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    package?: boolean | PackageDefaultArgs<ExtArgs>
    category?: boolean | DestinationCategoryDefaultArgs<ExtArgs>
  }
  export type PackageCategoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    package?: boolean | PackageDefaultArgs<ExtArgs>
    category?: boolean | DestinationCategoryDefaultArgs<ExtArgs>
  }

  export type $PackageCategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PackageCategory"
    objects: {
      package: Prisma.$PackagePayload<ExtArgs>
      category: Prisma.$DestinationCategoryPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      packageId: bigint
      categoryId: bigint
      sortOrder: number
    }, ExtArgs["result"]["packageCategory"]>
    composites: {}
  }

  type PackageCategoryGetPayload<S extends boolean | null | undefined | PackageCategoryDefaultArgs> = $Result.GetResult<Prisma.$PackageCategoryPayload, S>

  type PackageCategoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PackageCategoryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PackageCategoryCountAggregateInputType | true
    }

  export interface PackageCategoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PackageCategory'], meta: { name: 'PackageCategory' } }
    /**
     * Find zero or one PackageCategory that matches the filter.
     * @param {PackageCategoryFindUniqueArgs} args - Arguments to find a PackageCategory
     * @example
     * // Get one PackageCategory
     * const packageCategory = await prisma.packageCategory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PackageCategoryFindUniqueArgs>(args: SelectSubset<T, PackageCategoryFindUniqueArgs<ExtArgs>>): Prisma__PackageCategoryClient<$Result.GetResult<Prisma.$PackageCategoryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PackageCategory that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PackageCategoryFindUniqueOrThrowArgs} args - Arguments to find a PackageCategory
     * @example
     * // Get one PackageCategory
     * const packageCategory = await prisma.packageCategory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PackageCategoryFindUniqueOrThrowArgs>(args: SelectSubset<T, PackageCategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PackageCategoryClient<$Result.GetResult<Prisma.$PackageCategoryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PackageCategory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageCategoryFindFirstArgs} args - Arguments to find a PackageCategory
     * @example
     * // Get one PackageCategory
     * const packageCategory = await prisma.packageCategory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PackageCategoryFindFirstArgs>(args?: SelectSubset<T, PackageCategoryFindFirstArgs<ExtArgs>>): Prisma__PackageCategoryClient<$Result.GetResult<Prisma.$PackageCategoryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PackageCategory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageCategoryFindFirstOrThrowArgs} args - Arguments to find a PackageCategory
     * @example
     * // Get one PackageCategory
     * const packageCategory = await prisma.packageCategory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PackageCategoryFindFirstOrThrowArgs>(args?: SelectSubset<T, PackageCategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__PackageCategoryClient<$Result.GetResult<Prisma.$PackageCategoryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PackageCategories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageCategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PackageCategories
     * const packageCategories = await prisma.packageCategory.findMany()
     * 
     * // Get first 10 PackageCategories
     * const packageCategories = await prisma.packageCategory.findMany({ take: 10 })
     * 
     * // Only select the `packageId`
     * const packageCategoryWithPackageIdOnly = await prisma.packageCategory.findMany({ select: { packageId: true } })
     * 
     */
    findMany<T extends PackageCategoryFindManyArgs>(args?: SelectSubset<T, PackageCategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackageCategoryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PackageCategory.
     * @param {PackageCategoryCreateArgs} args - Arguments to create a PackageCategory.
     * @example
     * // Create one PackageCategory
     * const PackageCategory = await prisma.packageCategory.create({
     *   data: {
     *     // ... data to create a PackageCategory
     *   }
     * })
     * 
     */
    create<T extends PackageCategoryCreateArgs>(args: SelectSubset<T, PackageCategoryCreateArgs<ExtArgs>>): Prisma__PackageCategoryClient<$Result.GetResult<Prisma.$PackageCategoryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PackageCategories.
     * @param {PackageCategoryCreateManyArgs} args - Arguments to create many PackageCategories.
     * @example
     * // Create many PackageCategories
     * const packageCategory = await prisma.packageCategory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PackageCategoryCreateManyArgs>(args?: SelectSubset<T, PackageCategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PackageCategories and returns the data saved in the database.
     * @param {PackageCategoryCreateManyAndReturnArgs} args - Arguments to create many PackageCategories.
     * @example
     * // Create many PackageCategories
     * const packageCategory = await prisma.packageCategory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PackageCategories and only return the `packageId`
     * const packageCategoryWithPackageIdOnly = await prisma.packageCategory.createManyAndReturn({ 
     *   select: { packageId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PackageCategoryCreateManyAndReturnArgs>(args?: SelectSubset<T, PackageCategoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackageCategoryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PackageCategory.
     * @param {PackageCategoryDeleteArgs} args - Arguments to delete one PackageCategory.
     * @example
     * // Delete one PackageCategory
     * const PackageCategory = await prisma.packageCategory.delete({
     *   where: {
     *     // ... filter to delete one PackageCategory
     *   }
     * })
     * 
     */
    delete<T extends PackageCategoryDeleteArgs>(args: SelectSubset<T, PackageCategoryDeleteArgs<ExtArgs>>): Prisma__PackageCategoryClient<$Result.GetResult<Prisma.$PackageCategoryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PackageCategory.
     * @param {PackageCategoryUpdateArgs} args - Arguments to update one PackageCategory.
     * @example
     * // Update one PackageCategory
     * const packageCategory = await prisma.packageCategory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PackageCategoryUpdateArgs>(args: SelectSubset<T, PackageCategoryUpdateArgs<ExtArgs>>): Prisma__PackageCategoryClient<$Result.GetResult<Prisma.$PackageCategoryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PackageCategories.
     * @param {PackageCategoryDeleteManyArgs} args - Arguments to filter PackageCategories to delete.
     * @example
     * // Delete a few PackageCategories
     * const { count } = await prisma.packageCategory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PackageCategoryDeleteManyArgs>(args?: SelectSubset<T, PackageCategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PackageCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageCategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PackageCategories
     * const packageCategory = await prisma.packageCategory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PackageCategoryUpdateManyArgs>(args: SelectSubset<T, PackageCategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PackageCategory.
     * @param {PackageCategoryUpsertArgs} args - Arguments to update or create a PackageCategory.
     * @example
     * // Update or create a PackageCategory
     * const packageCategory = await prisma.packageCategory.upsert({
     *   create: {
     *     // ... data to create a PackageCategory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PackageCategory we want to update
     *   }
     * })
     */
    upsert<T extends PackageCategoryUpsertArgs>(args: SelectSubset<T, PackageCategoryUpsertArgs<ExtArgs>>): Prisma__PackageCategoryClient<$Result.GetResult<Prisma.$PackageCategoryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PackageCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageCategoryCountArgs} args - Arguments to filter PackageCategories to count.
     * @example
     * // Count the number of PackageCategories
     * const count = await prisma.packageCategory.count({
     *   where: {
     *     // ... the filter for the PackageCategories we want to count
     *   }
     * })
    **/
    count<T extends PackageCategoryCountArgs>(
      args?: Subset<T, PackageCategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PackageCategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PackageCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageCategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PackageCategoryAggregateArgs>(args: Subset<T, PackageCategoryAggregateArgs>): Prisma.PrismaPromise<GetPackageCategoryAggregateType<T>>

    /**
     * Group by PackageCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageCategoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PackageCategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PackageCategoryGroupByArgs['orderBy'] }
        : { orderBy?: PackageCategoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PackageCategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPackageCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PackageCategory model
   */
  readonly fields: PackageCategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PackageCategory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PackageCategoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    package<T extends PackageDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PackageDefaultArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    category<T extends DestinationCategoryDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DestinationCategoryDefaultArgs<ExtArgs>>): Prisma__DestinationCategoryClient<$Result.GetResult<Prisma.$DestinationCategoryPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PackageCategory model
   */ 
  interface PackageCategoryFieldRefs {
    readonly packageId: FieldRef<"PackageCategory", 'BigInt'>
    readonly categoryId: FieldRef<"PackageCategory", 'BigInt'>
    readonly sortOrder: FieldRef<"PackageCategory", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * PackageCategory findUnique
   */
  export type PackageCategoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageCategory
     */
    select?: PackageCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageCategoryInclude<ExtArgs> | null
    /**
     * Filter, which PackageCategory to fetch.
     */
    where: PackageCategoryWhereUniqueInput
  }

  /**
   * PackageCategory findUniqueOrThrow
   */
  export type PackageCategoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageCategory
     */
    select?: PackageCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageCategoryInclude<ExtArgs> | null
    /**
     * Filter, which PackageCategory to fetch.
     */
    where: PackageCategoryWhereUniqueInput
  }

  /**
   * PackageCategory findFirst
   */
  export type PackageCategoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageCategory
     */
    select?: PackageCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageCategoryInclude<ExtArgs> | null
    /**
     * Filter, which PackageCategory to fetch.
     */
    where?: PackageCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PackageCategories to fetch.
     */
    orderBy?: PackageCategoryOrderByWithRelationInput | PackageCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PackageCategories.
     */
    cursor?: PackageCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PackageCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PackageCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PackageCategories.
     */
    distinct?: PackageCategoryScalarFieldEnum | PackageCategoryScalarFieldEnum[]
  }

  /**
   * PackageCategory findFirstOrThrow
   */
  export type PackageCategoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageCategory
     */
    select?: PackageCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageCategoryInclude<ExtArgs> | null
    /**
     * Filter, which PackageCategory to fetch.
     */
    where?: PackageCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PackageCategories to fetch.
     */
    orderBy?: PackageCategoryOrderByWithRelationInput | PackageCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PackageCategories.
     */
    cursor?: PackageCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PackageCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PackageCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PackageCategories.
     */
    distinct?: PackageCategoryScalarFieldEnum | PackageCategoryScalarFieldEnum[]
  }

  /**
   * PackageCategory findMany
   */
  export type PackageCategoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageCategory
     */
    select?: PackageCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageCategoryInclude<ExtArgs> | null
    /**
     * Filter, which PackageCategories to fetch.
     */
    where?: PackageCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PackageCategories to fetch.
     */
    orderBy?: PackageCategoryOrderByWithRelationInput | PackageCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PackageCategories.
     */
    cursor?: PackageCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PackageCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PackageCategories.
     */
    skip?: number
    distinct?: PackageCategoryScalarFieldEnum | PackageCategoryScalarFieldEnum[]
  }

  /**
   * PackageCategory create
   */
  export type PackageCategoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageCategory
     */
    select?: PackageCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageCategoryInclude<ExtArgs> | null
    /**
     * The data needed to create a PackageCategory.
     */
    data: XOR<PackageCategoryCreateInput, PackageCategoryUncheckedCreateInput>
  }

  /**
   * PackageCategory createMany
   */
  export type PackageCategoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PackageCategories.
     */
    data: PackageCategoryCreateManyInput | PackageCategoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PackageCategory createManyAndReturn
   */
  export type PackageCategoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageCategory
     */
    select?: PackageCategorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PackageCategories.
     */
    data: PackageCategoryCreateManyInput | PackageCategoryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageCategoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PackageCategory update
   */
  export type PackageCategoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageCategory
     */
    select?: PackageCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageCategoryInclude<ExtArgs> | null
    /**
     * The data needed to update a PackageCategory.
     */
    data: XOR<PackageCategoryUpdateInput, PackageCategoryUncheckedUpdateInput>
    /**
     * Choose, which PackageCategory to update.
     */
    where: PackageCategoryWhereUniqueInput
  }

  /**
   * PackageCategory updateMany
   */
  export type PackageCategoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PackageCategories.
     */
    data: XOR<PackageCategoryUpdateManyMutationInput, PackageCategoryUncheckedUpdateManyInput>
    /**
     * Filter which PackageCategories to update
     */
    where?: PackageCategoryWhereInput
  }

  /**
   * PackageCategory upsert
   */
  export type PackageCategoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageCategory
     */
    select?: PackageCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageCategoryInclude<ExtArgs> | null
    /**
     * The filter to search for the PackageCategory to update in case it exists.
     */
    where: PackageCategoryWhereUniqueInput
    /**
     * In case the PackageCategory found by the `where` argument doesn't exist, create a new PackageCategory with this data.
     */
    create: XOR<PackageCategoryCreateInput, PackageCategoryUncheckedCreateInput>
    /**
     * In case the PackageCategory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PackageCategoryUpdateInput, PackageCategoryUncheckedUpdateInput>
  }

  /**
   * PackageCategory delete
   */
  export type PackageCategoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageCategory
     */
    select?: PackageCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageCategoryInclude<ExtArgs> | null
    /**
     * Filter which PackageCategory to delete.
     */
    where: PackageCategoryWhereUniqueInput
  }

  /**
   * PackageCategory deleteMany
   */
  export type PackageCategoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PackageCategories to delete
     */
    where?: PackageCategoryWhereInput
  }

  /**
   * PackageCategory without action
   */
  export type PackageCategoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageCategory
     */
    select?: PackageCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageCategoryInclude<ExtArgs> | null
  }


  /**
   * Model Guide
   */

  export type AggregateGuide = {
    _count: GuideCountAggregateOutputType | null
    _avg: GuideAvgAggregateOutputType | null
    _sum: GuideSumAggregateOutputType | null
    _min: GuideMinAggregateOutputType | null
    _max: GuideMaxAggregateOutputType | null
  }

  export type GuideAvgAggregateOutputType = {
    id: number | null
    destinationId: number | null
    readingMinutes: number | null
    sortOrder: number | null
  }

  export type GuideSumAggregateOutputType = {
    id: bigint | null
    destinationId: bigint | null
    readingMinutes: number | null
    sortOrder: number | null
  }

  export type GuideMinAggregateOutputType = {
    id: bigint | null
    destinationId: bigint | null
    title: string | null
    slug: string | null
    excerpt: string | null
    body: string | null
    readingMinutes: number | null
    heroImageUrl: string | null
    metaTitle: string | null
    metaDescription: string | null
    status: $Enums.DestinationStatus | null
    isFeatured: boolean | null
    sortOrder: number | null
    createdAt: Date | null
    updatedAt: Date | null
    publishedAt: Date | null
  }

  export type GuideMaxAggregateOutputType = {
    id: bigint | null
    destinationId: bigint | null
    title: string | null
    slug: string | null
    excerpt: string | null
    body: string | null
    readingMinutes: number | null
    heroImageUrl: string | null
    metaTitle: string | null
    metaDescription: string | null
    status: $Enums.DestinationStatus | null
    isFeatured: boolean | null
    sortOrder: number | null
    createdAt: Date | null
    updatedAt: Date | null
    publishedAt: Date | null
  }

  export type GuideCountAggregateOutputType = {
    id: number
    destinationId: number
    title: number
    slug: number
    excerpt: number
    body: number
    readingMinutes: number
    heroImageUrl: number
    metaTitle: number
    metaDescription: number
    status: number
    isFeatured: number
    sortOrder: number
    createdAt: number
    updatedAt: number
    publishedAt: number
    _all: number
  }


  export type GuideAvgAggregateInputType = {
    id?: true
    destinationId?: true
    readingMinutes?: true
    sortOrder?: true
  }

  export type GuideSumAggregateInputType = {
    id?: true
    destinationId?: true
    readingMinutes?: true
    sortOrder?: true
  }

  export type GuideMinAggregateInputType = {
    id?: true
    destinationId?: true
    title?: true
    slug?: true
    excerpt?: true
    body?: true
    readingMinutes?: true
    heroImageUrl?: true
    metaTitle?: true
    metaDescription?: true
    status?: true
    isFeatured?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
    publishedAt?: true
  }

  export type GuideMaxAggregateInputType = {
    id?: true
    destinationId?: true
    title?: true
    slug?: true
    excerpt?: true
    body?: true
    readingMinutes?: true
    heroImageUrl?: true
    metaTitle?: true
    metaDescription?: true
    status?: true
    isFeatured?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
    publishedAt?: true
  }

  export type GuideCountAggregateInputType = {
    id?: true
    destinationId?: true
    title?: true
    slug?: true
    excerpt?: true
    body?: true
    readingMinutes?: true
    heroImageUrl?: true
    metaTitle?: true
    metaDescription?: true
    status?: true
    isFeatured?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
    publishedAt?: true
    _all?: true
  }

  export type GuideAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Guide to aggregate.
     */
    where?: GuideWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Guides to fetch.
     */
    orderBy?: GuideOrderByWithRelationInput | GuideOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GuideWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Guides from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Guides.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Guides
    **/
    _count?: true | GuideCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GuideAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GuideSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GuideMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GuideMaxAggregateInputType
  }

  export type GetGuideAggregateType<T extends GuideAggregateArgs> = {
        [P in keyof T & keyof AggregateGuide]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGuide[P]>
      : GetScalarType<T[P], AggregateGuide[P]>
  }




  export type GuideGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GuideWhereInput
    orderBy?: GuideOrderByWithAggregationInput | GuideOrderByWithAggregationInput[]
    by: GuideScalarFieldEnum[] | GuideScalarFieldEnum
    having?: GuideScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GuideCountAggregateInputType | true
    _avg?: GuideAvgAggregateInputType
    _sum?: GuideSumAggregateInputType
    _min?: GuideMinAggregateInputType
    _max?: GuideMaxAggregateInputType
  }

  export type GuideGroupByOutputType = {
    id: bigint
    destinationId: bigint
    title: string
    slug: string
    excerpt: string | null
    body: string | null
    readingMinutes: number | null
    heroImageUrl: string | null
    metaTitle: string | null
    metaDescription: string | null
    status: $Enums.DestinationStatus
    isFeatured: boolean
    sortOrder: number
    createdAt: Date
    updatedAt: Date
    publishedAt: Date | null
    _count: GuideCountAggregateOutputType | null
    _avg: GuideAvgAggregateOutputType | null
    _sum: GuideSumAggregateOutputType | null
    _min: GuideMinAggregateOutputType | null
    _max: GuideMaxAggregateOutputType | null
  }

  type GetGuideGroupByPayload<T extends GuideGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GuideGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GuideGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GuideGroupByOutputType[P]>
            : GetScalarType<T[P], GuideGroupByOutputType[P]>
        }
      >
    >


  export type GuideSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    destinationId?: boolean
    title?: boolean
    slug?: boolean
    excerpt?: boolean
    body?: boolean
    readingMinutes?: boolean
    heroImageUrl?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    status?: boolean
    isFeatured?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    publishedAt?: boolean
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["guide"]>

  export type GuideSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    destinationId?: boolean
    title?: boolean
    slug?: boolean
    excerpt?: boolean
    body?: boolean
    readingMinutes?: boolean
    heroImageUrl?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    status?: boolean
    isFeatured?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    publishedAt?: boolean
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["guide"]>

  export type GuideSelectScalar = {
    id?: boolean
    destinationId?: boolean
    title?: boolean
    slug?: boolean
    excerpt?: boolean
    body?: boolean
    readingMinutes?: boolean
    heroImageUrl?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    status?: boolean
    isFeatured?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    publishedAt?: boolean
  }

  export type GuideInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }
  export type GuideIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }

  export type $GuidePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Guide"
    objects: {
      destination: Prisma.$DestinationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      destinationId: bigint
      title: string
      slug: string
      excerpt: string | null
      body: string | null
      readingMinutes: number | null
      heroImageUrl: string | null
      metaTitle: string | null
      metaDescription: string | null
      status: $Enums.DestinationStatus
      isFeatured: boolean
      sortOrder: number
      createdAt: Date
      updatedAt: Date
      publishedAt: Date | null
    }, ExtArgs["result"]["guide"]>
    composites: {}
  }

  type GuideGetPayload<S extends boolean | null | undefined | GuideDefaultArgs> = $Result.GetResult<Prisma.$GuidePayload, S>

  type GuideCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<GuideFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: GuideCountAggregateInputType | true
    }

  export interface GuideDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Guide'], meta: { name: 'Guide' } }
    /**
     * Find zero or one Guide that matches the filter.
     * @param {GuideFindUniqueArgs} args - Arguments to find a Guide
     * @example
     * // Get one Guide
     * const guide = await prisma.guide.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GuideFindUniqueArgs>(args: SelectSubset<T, GuideFindUniqueArgs<ExtArgs>>): Prisma__GuideClient<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Guide that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {GuideFindUniqueOrThrowArgs} args - Arguments to find a Guide
     * @example
     * // Get one Guide
     * const guide = await prisma.guide.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GuideFindUniqueOrThrowArgs>(args: SelectSubset<T, GuideFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GuideClient<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Guide that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuideFindFirstArgs} args - Arguments to find a Guide
     * @example
     * // Get one Guide
     * const guide = await prisma.guide.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GuideFindFirstArgs>(args?: SelectSubset<T, GuideFindFirstArgs<ExtArgs>>): Prisma__GuideClient<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Guide that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuideFindFirstOrThrowArgs} args - Arguments to find a Guide
     * @example
     * // Get one Guide
     * const guide = await prisma.guide.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GuideFindFirstOrThrowArgs>(args?: SelectSubset<T, GuideFindFirstOrThrowArgs<ExtArgs>>): Prisma__GuideClient<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Guides that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuideFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Guides
     * const guides = await prisma.guide.findMany()
     * 
     * // Get first 10 Guides
     * const guides = await prisma.guide.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const guideWithIdOnly = await prisma.guide.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GuideFindManyArgs>(args?: SelectSubset<T, GuideFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Guide.
     * @param {GuideCreateArgs} args - Arguments to create a Guide.
     * @example
     * // Create one Guide
     * const Guide = await prisma.guide.create({
     *   data: {
     *     // ... data to create a Guide
     *   }
     * })
     * 
     */
    create<T extends GuideCreateArgs>(args: SelectSubset<T, GuideCreateArgs<ExtArgs>>): Prisma__GuideClient<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Guides.
     * @param {GuideCreateManyArgs} args - Arguments to create many Guides.
     * @example
     * // Create many Guides
     * const guide = await prisma.guide.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GuideCreateManyArgs>(args?: SelectSubset<T, GuideCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Guides and returns the data saved in the database.
     * @param {GuideCreateManyAndReturnArgs} args - Arguments to create many Guides.
     * @example
     * // Create many Guides
     * const guide = await prisma.guide.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Guides and only return the `id`
     * const guideWithIdOnly = await prisma.guide.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GuideCreateManyAndReturnArgs>(args?: SelectSubset<T, GuideCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Guide.
     * @param {GuideDeleteArgs} args - Arguments to delete one Guide.
     * @example
     * // Delete one Guide
     * const Guide = await prisma.guide.delete({
     *   where: {
     *     // ... filter to delete one Guide
     *   }
     * })
     * 
     */
    delete<T extends GuideDeleteArgs>(args: SelectSubset<T, GuideDeleteArgs<ExtArgs>>): Prisma__GuideClient<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Guide.
     * @param {GuideUpdateArgs} args - Arguments to update one Guide.
     * @example
     * // Update one Guide
     * const guide = await prisma.guide.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GuideUpdateArgs>(args: SelectSubset<T, GuideUpdateArgs<ExtArgs>>): Prisma__GuideClient<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Guides.
     * @param {GuideDeleteManyArgs} args - Arguments to filter Guides to delete.
     * @example
     * // Delete a few Guides
     * const { count } = await prisma.guide.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GuideDeleteManyArgs>(args?: SelectSubset<T, GuideDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Guides.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuideUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Guides
     * const guide = await prisma.guide.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GuideUpdateManyArgs>(args: SelectSubset<T, GuideUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Guide.
     * @param {GuideUpsertArgs} args - Arguments to update or create a Guide.
     * @example
     * // Update or create a Guide
     * const guide = await prisma.guide.upsert({
     *   create: {
     *     // ... data to create a Guide
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Guide we want to update
     *   }
     * })
     */
    upsert<T extends GuideUpsertArgs>(args: SelectSubset<T, GuideUpsertArgs<ExtArgs>>): Prisma__GuideClient<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Guides.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuideCountArgs} args - Arguments to filter Guides to count.
     * @example
     * // Count the number of Guides
     * const count = await prisma.guide.count({
     *   where: {
     *     // ... the filter for the Guides we want to count
     *   }
     * })
    **/
    count<T extends GuideCountArgs>(
      args?: Subset<T, GuideCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GuideCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Guide.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuideAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GuideAggregateArgs>(args: Subset<T, GuideAggregateArgs>): Prisma.PrismaPromise<GetGuideAggregateType<T>>

    /**
     * Group by Guide.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuideGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GuideGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GuideGroupByArgs['orderBy'] }
        : { orderBy?: GuideGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GuideGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGuideGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Guide model
   */
  readonly fields: GuideFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Guide.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GuideClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    destination<T extends DestinationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DestinationDefaultArgs<ExtArgs>>): Prisma__DestinationClient<$Result.GetResult<Prisma.$DestinationPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Guide model
   */ 
  interface GuideFieldRefs {
    readonly id: FieldRef<"Guide", 'BigInt'>
    readonly destinationId: FieldRef<"Guide", 'BigInt'>
    readonly title: FieldRef<"Guide", 'String'>
    readonly slug: FieldRef<"Guide", 'String'>
    readonly excerpt: FieldRef<"Guide", 'String'>
    readonly body: FieldRef<"Guide", 'String'>
    readonly readingMinutes: FieldRef<"Guide", 'Int'>
    readonly heroImageUrl: FieldRef<"Guide", 'String'>
    readonly metaTitle: FieldRef<"Guide", 'String'>
    readonly metaDescription: FieldRef<"Guide", 'String'>
    readonly status: FieldRef<"Guide", 'DestinationStatus'>
    readonly isFeatured: FieldRef<"Guide", 'Boolean'>
    readonly sortOrder: FieldRef<"Guide", 'Int'>
    readonly createdAt: FieldRef<"Guide", 'DateTime'>
    readonly updatedAt: FieldRef<"Guide", 'DateTime'>
    readonly publishedAt: FieldRef<"Guide", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Guide findUnique
   */
  export type GuideFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideInclude<ExtArgs> | null
    /**
     * Filter, which Guide to fetch.
     */
    where: GuideWhereUniqueInput
  }

  /**
   * Guide findUniqueOrThrow
   */
  export type GuideFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideInclude<ExtArgs> | null
    /**
     * Filter, which Guide to fetch.
     */
    where: GuideWhereUniqueInput
  }

  /**
   * Guide findFirst
   */
  export type GuideFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideInclude<ExtArgs> | null
    /**
     * Filter, which Guide to fetch.
     */
    where?: GuideWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Guides to fetch.
     */
    orderBy?: GuideOrderByWithRelationInput | GuideOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Guides.
     */
    cursor?: GuideWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Guides from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Guides.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Guides.
     */
    distinct?: GuideScalarFieldEnum | GuideScalarFieldEnum[]
  }

  /**
   * Guide findFirstOrThrow
   */
  export type GuideFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideInclude<ExtArgs> | null
    /**
     * Filter, which Guide to fetch.
     */
    where?: GuideWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Guides to fetch.
     */
    orderBy?: GuideOrderByWithRelationInput | GuideOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Guides.
     */
    cursor?: GuideWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Guides from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Guides.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Guides.
     */
    distinct?: GuideScalarFieldEnum | GuideScalarFieldEnum[]
  }

  /**
   * Guide findMany
   */
  export type GuideFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideInclude<ExtArgs> | null
    /**
     * Filter, which Guides to fetch.
     */
    where?: GuideWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Guides to fetch.
     */
    orderBy?: GuideOrderByWithRelationInput | GuideOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Guides.
     */
    cursor?: GuideWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Guides from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Guides.
     */
    skip?: number
    distinct?: GuideScalarFieldEnum | GuideScalarFieldEnum[]
  }

  /**
   * Guide create
   */
  export type GuideCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideInclude<ExtArgs> | null
    /**
     * The data needed to create a Guide.
     */
    data: XOR<GuideCreateInput, GuideUncheckedCreateInput>
  }

  /**
   * Guide createMany
   */
  export type GuideCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Guides.
     */
    data: GuideCreateManyInput | GuideCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Guide createManyAndReturn
   */
  export type GuideCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Guides.
     */
    data: GuideCreateManyInput | GuideCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Guide update
   */
  export type GuideUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideInclude<ExtArgs> | null
    /**
     * The data needed to update a Guide.
     */
    data: XOR<GuideUpdateInput, GuideUncheckedUpdateInput>
    /**
     * Choose, which Guide to update.
     */
    where: GuideWhereUniqueInput
  }

  /**
   * Guide updateMany
   */
  export type GuideUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Guides.
     */
    data: XOR<GuideUpdateManyMutationInput, GuideUncheckedUpdateManyInput>
    /**
     * Filter which Guides to update
     */
    where?: GuideWhereInput
  }

  /**
   * Guide upsert
   */
  export type GuideUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideInclude<ExtArgs> | null
    /**
     * The filter to search for the Guide to update in case it exists.
     */
    where: GuideWhereUniqueInput
    /**
     * In case the Guide found by the `where` argument doesn't exist, create a new Guide with this data.
     */
    create: XOR<GuideCreateInput, GuideUncheckedCreateInput>
    /**
     * In case the Guide was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GuideUpdateInput, GuideUncheckedUpdateInput>
  }

  /**
   * Guide delete
   */
  export type GuideDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideInclude<ExtArgs> | null
    /**
     * Filter which Guide to delete.
     */
    where: GuideWhereUniqueInput
  }

  /**
   * Guide deleteMany
   */
  export type GuideDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Guides to delete
     */
    where?: GuideWhereInput
  }

  /**
   * Guide without action
   */
  export type GuideDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideInclude<ExtArgs> | null
  }


  /**
   * Model FerryRoute
   */

  export type AggregateFerryRoute = {
    _count: FerryRouteCountAggregateOutputType | null
    _avg: FerryRouteAvgAggregateOutputType | null
    _sum: FerryRouteSumAggregateOutputType | null
    _min: FerryRouteMinAggregateOutputType | null
    _max: FerryRouteMaxAggregateOutputType | null
  }

  export type FerryRouteAvgAggregateOutputType = {
    id: number | null
    destinationId: number | null
    durationMinutes: number | null
    startingPrice: number | null
    sortOrder: number | null
  }

  export type FerryRouteSumAggregateOutputType = {
    id: bigint | null
    destinationId: bigint | null
    durationMinutes: number | null
    startingPrice: number | null
    sortOrder: number | null
  }

  export type FerryRouteMinAggregateOutputType = {
    id: bigint | null
    destinationId: bigint | null
    name: string | null
    slug: string | null
    originName: string | null
    destinationName: string | null
    operatorName: string | null
    durationMinutes: number | null
    startingPrice: number | null
    currency: string | null
    metaTitle: string | null
    metaDescription: string | null
    status: $Enums.DestinationStatus | null
    isFeatured: boolean | null
    sortOrder: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FerryRouteMaxAggregateOutputType = {
    id: bigint | null
    destinationId: bigint | null
    name: string | null
    slug: string | null
    originName: string | null
    destinationName: string | null
    operatorName: string | null
    durationMinutes: number | null
    startingPrice: number | null
    currency: string | null
    metaTitle: string | null
    metaDescription: string | null
    status: $Enums.DestinationStatus | null
    isFeatured: boolean | null
    sortOrder: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FerryRouteCountAggregateOutputType = {
    id: number
    destinationId: number
    name: number
    slug: number
    originName: number
    destinationName: number
    operatorName: number
    durationMinutes: number
    startingPrice: number
    currency: number
    metaTitle: number
    metaDescription: number
    status: number
    isFeatured: number
    sortOrder: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type FerryRouteAvgAggregateInputType = {
    id?: true
    destinationId?: true
    durationMinutes?: true
    startingPrice?: true
    sortOrder?: true
  }

  export type FerryRouteSumAggregateInputType = {
    id?: true
    destinationId?: true
    durationMinutes?: true
    startingPrice?: true
    sortOrder?: true
  }

  export type FerryRouteMinAggregateInputType = {
    id?: true
    destinationId?: true
    name?: true
    slug?: true
    originName?: true
    destinationName?: true
    operatorName?: true
    durationMinutes?: true
    startingPrice?: true
    currency?: true
    metaTitle?: true
    metaDescription?: true
    status?: true
    isFeatured?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FerryRouteMaxAggregateInputType = {
    id?: true
    destinationId?: true
    name?: true
    slug?: true
    originName?: true
    destinationName?: true
    operatorName?: true
    durationMinutes?: true
    startingPrice?: true
    currency?: true
    metaTitle?: true
    metaDescription?: true
    status?: true
    isFeatured?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FerryRouteCountAggregateInputType = {
    id?: true
    destinationId?: true
    name?: true
    slug?: true
    originName?: true
    destinationName?: true
    operatorName?: true
    durationMinutes?: true
    startingPrice?: true
    currency?: true
    metaTitle?: true
    metaDescription?: true
    status?: true
    isFeatured?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type FerryRouteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FerryRoute to aggregate.
     */
    where?: FerryRouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FerryRoutes to fetch.
     */
    orderBy?: FerryRouteOrderByWithRelationInput | FerryRouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FerryRouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FerryRoutes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FerryRoutes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FerryRoutes
    **/
    _count?: true | FerryRouteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FerryRouteAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FerryRouteSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FerryRouteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FerryRouteMaxAggregateInputType
  }

  export type GetFerryRouteAggregateType<T extends FerryRouteAggregateArgs> = {
        [P in keyof T & keyof AggregateFerryRoute]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFerryRoute[P]>
      : GetScalarType<T[P], AggregateFerryRoute[P]>
  }




  export type FerryRouteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FerryRouteWhereInput
    orderBy?: FerryRouteOrderByWithAggregationInput | FerryRouteOrderByWithAggregationInput[]
    by: FerryRouteScalarFieldEnum[] | FerryRouteScalarFieldEnum
    having?: FerryRouteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FerryRouteCountAggregateInputType | true
    _avg?: FerryRouteAvgAggregateInputType
    _sum?: FerryRouteSumAggregateInputType
    _min?: FerryRouteMinAggregateInputType
    _max?: FerryRouteMaxAggregateInputType
  }

  export type FerryRouteGroupByOutputType = {
    id: bigint
    destinationId: bigint
    name: string
    slug: string
    originName: string
    destinationName: string
    operatorName: string | null
    durationMinutes: number | null
    startingPrice: number | null
    currency: string
    metaTitle: string | null
    metaDescription: string | null
    status: $Enums.DestinationStatus
    isFeatured: boolean
    sortOrder: number
    createdAt: Date
    updatedAt: Date
    _count: FerryRouteCountAggregateOutputType | null
    _avg: FerryRouteAvgAggregateOutputType | null
    _sum: FerryRouteSumAggregateOutputType | null
    _min: FerryRouteMinAggregateOutputType | null
    _max: FerryRouteMaxAggregateOutputType | null
  }

  type GetFerryRouteGroupByPayload<T extends FerryRouteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FerryRouteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FerryRouteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FerryRouteGroupByOutputType[P]>
            : GetScalarType<T[P], FerryRouteGroupByOutputType[P]>
        }
      >
    >


  export type FerryRouteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    destinationId?: boolean
    name?: boolean
    slug?: boolean
    originName?: boolean
    destinationName?: boolean
    operatorName?: boolean
    durationMinutes?: boolean
    startingPrice?: boolean
    currency?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    status?: boolean
    isFeatured?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ferryRoute"]>

  export type FerryRouteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    destinationId?: boolean
    name?: boolean
    slug?: boolean
    originName?: boolean
    destinationName?: boolean
    operatorName?: boolean
    durationMinutes?: boolean
    startingPrice?: boolean
    currency?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    status?: boolean
    isFeatured?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ferryRoute"]>

  export type FerryRouteSelectScalar = {
    id?: boolean
    destinationId?: boolean
    name?: boolean
    slug?: boolean
    originName?: boolean
    destinationName?: boolean
    operatorName?: boolean
    durationMinutes?: boolean
    startingPrice?: boolean
    currency?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    status?: boolean
    isFeatured?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type FerryRouteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }
  export type FerryRouteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }

  export type $FerryRoutePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FerryRoute"
    objects: {
      destination: Prisma.$DestinationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      destinationId: bigint
      name: string
      slug: string
      originName: string
      destinationName: string
      operatorName: string | null
      durationMinutes: number | null
      startingPrice: number | null
      currency: string
      metaTitle: string | null
      metaDescription: string | null
      status: $Enums.DestinationStatus
      isFeatured: boolean
      sortOrder: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["ferryRoute"]>
    composites: {}
  }

  type FerryRouteGetPayload<S extends boolean | null | undefined | FerryRouteDefaultArgs> = $Result.GetResult<Prisma.$FerryRoutePayload, S>

  type FerryRouteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<FerryRouteFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: FerryRouteCountAggregateInputType | true
    }

  export interface FerryRouteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FerryRoute'], meta: { name: 'FerryRoute' } }
    /**
     * Find zero or one FerryRoute that matches the filter.
     * @param {FerryRouteFindUniqueArgs} args - Arguments to find a FerryRoute
     * @example
     * // Get one FerryRoute
     * const ferryRoute = await prisma.ferryRoute.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FerryRouteFindUniqueArgs>(args: SelectSubset<T, FerryRouteFindUniqueArgs<ExtArgs>>): Prisma__FerryRouteClient<$Result.GetResult<Prisma.$FerryRoutePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one FerryRoute that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {FerryRouteFindUniqueOrThrowArgs} args - Arguments to find a FerryRoute
     * @example
     * // Get one FerryRoute
     * const ferryRoute = await prisma.ferryRoute.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FerryRouteFindUniqueOrThrowArgs>(args: SelectSubset<T, FerryRouteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FerryRouteClient<$Result.GetResult<Prisma.$FerryRoutePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first FerryRoute that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FerryRouteFindFirstArgs} args - Arguments to find a FerryRoute
     * @example
     * // Get one FerryRoute
     * const ferryRoute = await prisma.ferryRoute.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FerryRouteFindFirstArgs>(args?: SelectSubset<T, FerryRouteFindFirstArgs<ExtArgs>>): Prisma__FerryRouteClient<$Result.GetResult<Prisma.$FerryRoutePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first FerryRoute that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FerryRouteFindFirstOrThrowArgs} args - Arguments to find a FerryRoute
     * @example
     * // Get one FerryRoute
     * const ferryRoute = await prisma.ferryRoute.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FerryRouteFindFirstOrThrowArgs>(args?: SelectSubset<T, FerryRouteFindFirstOrThrowArgs<ExtArgs>>): Prisma__FerryRouteClient<$Result.GetResult<Prisma.$FerryRoutePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more FerryRoutes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FerryRouteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FerryRoutes
     * const ferryRoutes = await prisma.ferryRoute.findMany()
     * 
     * // Get first 10 FerryRoutes
     * const ferryRoutes = await prisma.ferryRoute.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ferryRouteWithIdOnly = await prisma.ferryRoute.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FerryRouteFindManyArgs>(args?: SelectSubset<T, FerryRouteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FerryRoutePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a FerryRoute.
     * @param {FerryRouteCreateArgs} args - Arguments to create a FerryRoute.
     * @example
     * // Create one FerryRoute
     * const FerryRoute = await prisma.ferryRoute.create({
     *   data: {
     *     // ... data to create a FerryRoute
     *   }
     * })
     * 
     */
    create<T extends FerryRouteCreateArgs>(args: SelectSubset<T, FerryRouteCreateArgs<ExtArgs>>): Prisma__FerryRouteClient<$Result.GetResult<Prisma.$FerryRoutePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many FerryRoutes.
     * @param {FerryRouteCreateManyArgs} args - Arguments to create many FerryRoutes.
     * @example
     * // Create many FerryRoutes
     * const ferryRoute = await prisma.ferryRoute.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FerryRouteCreateManyArgs>(args?: SelectSubset<T, FerryRouteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FerryRoutes and returns the data saved in the database.
     * @param {FerryRouteCreateManyAndReturnArgs} args - Arguments to create many FerryRoutes.
     * @example
     * // Create many FerryRoutes
     * const ferryRoute = await prisma.ferryRoute.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FerryRoutes and only return the `id`
     * const ferryRouteWithIdOnly = await prisma.ferryRoute.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FerryRouteCreateManyAndReturnArgs>(args?: SelectSubset<T, FerryRouteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FerryRoutePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a FerryRoute.
     * @param {FerryRouteDeleteArgs} args - Arguments to delete one FerryRoute.
     * @example
     * // Delete one FerryRoute
     * const FerryRoute = await prisma.ferryRoute.delete({
     *   where: {
     *     // ... filter to delete one FerryRoute
     *   }
     * })
     * 
     */
    delete<T extends FerryRouteDeleteArgs>(args: SelectSubset<T, FerryRouteDeleteArgs<ExtArgs>>): Prisma__FerryRouteClient<$Result.GetResult<Prisma.$FerryRoutePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one FerryRoute.
     * @param {FerryRouteUpdateArgs} args - Arguments to update one FerryRoute.
     * @example
     * // Update one FerryRoute
     * const ferryRoute = await prisma.ferryRoute.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FerryRouteUpdateArgs>(args: SelectSubset<T, FerryRouteUpdateArgs<ExtArgs>>): Prisma__FerryRouteClient<$Result.GetResult<Prisma.$FerryRoutePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more FerryRoutes.
     * @param {FerryRouteDeleteManyArgs} args - Arguments to filter FerryRoutes to delete.
     * @example
     * // Delete a few FerryRoutes
     * const { count } = await prisma.ferryRoute.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FerryRouteDeleteManyArgs>(args?: SelectSubset<T, FerryRouteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FerryRoutes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FerryRouteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FerryRoutes
     * const ferryRoute = await prisma.ferryRoute.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FerryRouteUpdateManyArgs>(args: SelectSubset<T, FerryRouteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one FerryRoute.
     * @param {FerryRouteUpsertArgs} args - Arguments to update or create a FerryRoute.
     * @example
     * // Update or create a FerryRoute
     * const ferryRoute = await prisma.ferryRoute.upsert({
     *   create: {
     *     // ... data to create a FerryRoute
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FerryRoute we want to update
     *   }
     * })
     */
    upsert<T extends FerryRouteUpsertArgs>(args: SelectSubset<T, FerryRouteUpsertArgs<ExtArgs>>): Prisma__FerryRouteClient<$Result.GetResult<Prisma.$FerryRoutePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of FerryRoutes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FerryRouteCountArgs} args - Arguments to filter FerryRoutes to count.
     * @example
     * // Count the number of FerryRoutes
     * const count = await prisma.ferryRoute.count({
     *   where: {
     *     // ... the filter for the FerryRoutes we want to count
     *   }
     * })
    **/
    count<T extends FerryRouteCountArgs>(
      args?: Subset<T, FerryRouteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FerryRouteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FerryRoute.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FerryRouteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FerryRouteAggregateArgs>(args: Subset<T, FerryRouteAggregateArgs>): Prisma.PrismaPromise<GetFerryRouteAggregateType<T>>

    /**
     * Group by FerryRoute.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FerryRouteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FerryRouteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FerryRouteGroupByArgs['orderBy'] }
        : { orderBy?: FerryRouteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FerryRouteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFerryRouteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FerryRoute model
   */
  readonly fields: FerryRouteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FerryRoute.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FerryRouteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    destination<T extends DestinationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DestinationDefaultArgs<ExtArgs>>): Prisma__DestinationClient<$Result.GetResult<Prisma.$DestinationPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FerryRoute model
   */ 
  interface FerryRouteFieldRefs {
    readonly id: FieldRef<"FerryRoute", 'BigInt'>
    readonly destinationId: FieldRef<"FerryRoute", 'BigInt'>
    readonly name: FieldRef<"FerryRoute", 'String'>
    readonly slug: FieldRef<"FerryRoute", 'String'>
    readonly originName: FieldRef<"FerryRoute", 'String'>
    readonly destinationName: FieldRef<"FerryRoute", 'String'>
    readonly operatorName: FieldRef<"FerryRoute", 'String'>
    readonly durationMinutes: FieldRef<"FerryRoute", 'Int'>
    readonly startingPrice: FieldRef<"FerryRoute", 'Int'>
    readonly currency: FieldRef<"FerryRoute", 'String'>
    readonly metaTitle: FieldRef<"FerryRoute", 'String'>
    readonly metaDescription: FieldRef<"FerryRoute", 'String'>
    readonly status: FieldRef<"FerryRoute", 'DestinationStatus'>
    readonly isFeatured: FieldRef<"FerryRoute", 'Boolean'>
    readonly sortOrder: FieldRef<"FerryRoute", 'Int'>
    readonly createdAt: FieldRef<"FerryRoute", 'DateTime'>
    readonly updatedAt: FieldRef<"FerryRoute", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FerryRoute findUnique
   */
  export type FerryRouteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FerryRoute
     */
    select?: FerryRouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FerryRouteInclude<ExtArgs> | null
    /**
     * Filter, which FerryRoute to fetch.
     */
    where: FerryRouteWhereUniqueInput
  }

  /**
   * FerryRoute findUniqueOrThrow
   */
  export type FerryRouteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FerryRoute
     */
    select?: FerryRouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FerryRouteInclude<ExtArgs> | null
    /**
     * Filter, which FerryRoute to fetch.
     */
    where: FerryRouteWhereUniqueInput
  }

  /**
   * FerryRoute findFirst
   */
  export type FerryRouteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FerryRoute
     */
    select?: FerryRouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FerryRouteInclude<ExtArgs> | null
    /**
     * Filter, which FerryRoute to fetch.
     */
    where?: FerryRouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FerryRoutes to fetch.
     */
    orderBy?: FerryRouteOrderByWithRelationInput | FerryRouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FerryRoutes.
     */
    cursor?: FerryRouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FerryRoutes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FerryRoutes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FerryRoutes.
     */
    distinct?: FerryRouteScalarFieldEnum | FerryRouteScalarFieldEnum[]
  }

  /**
   * FerryRoute findFirstOrThrow
   */
  export type FerryRouteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FerryRoute
     */
    select?: FerryRouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FerryRouteInclude<ExtArgs> | null
    /**
     * Filter, which FerryRoute to fetch.
     */
    where?: FerryRouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FerryRoutes to fetch.
     */
    orderBy?: FerryRouteOrderByWithRelationInput | FerryRouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FerryRoutes.
     */
    cursor?: FerryRouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FerryRoutes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FerryRoutes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FerryRoutes.
     */
    distinct?: FerryRouteScalarFieldEnum | FerryRouteScalarFieldEnum[]
  }

  /**
   * FerryRoute findMany
   */
  export type FerryRouteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FerryRoute
     */
    select?: FerryRouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FerryRouteInclude<ExtArgs> | null
    /**
     * Filter, which FerryRoutes to fetch.
     */
    where?: FerryRouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FerryRoutes to fetch.
     */
    orderBy?: FerryRouteOrderByWithRelationInput | FerryRouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FerryRoutes.
     */
    cursor?: FerryRouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FerryRoutes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FerryRoutes.
     */
    skip?: number
    distinct?: FerryRouteScalarFieldEnum | FerryRouteScalarFieldEnum[]
  }

  /**
   * FerryRoute create
   */
  export type FerryRouteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FerryRoute
     */
    select?: FerryRouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FerryRouteInclude<ExtArgs> | null
    /**
     * The data needed to create a FerryRoute.
     */
    data: XOR<FerryRouteCreateInput, FerryRouteUncheckedCreateInput>
  }

  /**
   * FerryRoute createMany
   */
  export type FerryRouteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FerryRoutes.
     */
    data: FerryRouteCreateManyInput | FerryRouteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FerryRoute createManyAndReturn
   */
  export type FerryRouteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FerryRoute
     */
    select?: FerryRouteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many FerryRoutes.
     */
    data: FerryRouteCreateManyInput | FerryRouteCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FerryRouteIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * FerryRoute update
   */
  export type FerryRouteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FerryRoute
     */
    select?: FerryRouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FerryRouteInclude<ExtArgs> | null
    /**
     * The data needed to update a FerryRoute.
     */
    data: XOR<FerryRouteUpdateInput, FerryRouteUncheckedUpdateInput>
    /**
     * Choose, which FerryRoute to update.
     */
    where: FerryRouteWhereUniqueInput
  }

  /**
   * FerryRoute updateMany
   */
  export type FerryRouteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FerryRoutes.
     */
    data: XOR<FerryRouteUpdateManyMutationInput, FerryRouteUncheckedUpdateManyInput>
    /**
     * Filter which FerryRoutes to update
     */
    where?: FerryRouteWhereInput
  }

  /**
   * FerryRoute upsert
   */
  export type FerryRouteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FerryRoute
     */
    select?: FerryRouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FerryRouteInclude<ExtArgs> | null
    /**
     * The filter to search for the FerryRoute to update in case it exists.
     */
    where: FerryRouteWhereUniqueInput
    /**
     * In case the FerryRoute found by the `where` argument doesn't exist, create a new FerryRoute with this data.
     */
    create: XOR<FerryRouteCreateInput, FerryRouteUncheckedCreateInput>
    /**
     * In case the FerryRoute was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FerryRouteUpdateInput, FerryRouteUncheckedUpdateInput>
  }

  /**
   * FerryRoute delete
   */
  export type FerryRouteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FerryRoute
     */
    select?: FerryRouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FerryRouteInclude<ExtArgs> | null
    /**
     * Filter which FerryRoute to delete.
     */
    where: FerryRouteWhereUniqueInput
  }

  /**
   * FerryRoute deleteMany
   */
  export type FerryRouteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FerryRoutes to delete
     */
    where?: FerryRouteWhereInput
  }

  /**
   * FerryRoute without action
   */
  export type FerryRouteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FerryRoute
     */
    select?: FerryRouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FerryRouteInclude<ExtArgs> | null
  }


  /**
   * Model FlightRoute
   */

  export type AggregateFlightRoute = {
    _count: FlightRouteCountAggregateOutputType | null
    _avg: FlightRouteAvgAggregateOutputType | null
    _sum: FlightRouteSumAggregateOutputType | null
    _min: FlightRouteMinAggregateOutputType | null
    _max: FlightRouteMaxAggregateOutputType | null
  }

  export type FlightRouteAvgAggregateOutputType = {
    id: number | null
    destinationId: number | null
    approxDurationMinutes: number | null
    startingPrice: number | null
    sortOrder: number | null
  }

  export type FlightRouteSumAggregateOutputType = {
    id: bigint | null
    destinationId: bigint | null
    approxDurationMinutes: number | null
    startingPrice: number | null
    sortOrder: number | null
  }

  export type FlightRouteMinAggregateOutputType = {
    id: bigint | null
    destinationId: bigint | null
    name: string | null
    slug: string | null
    originIATA: string | null
    destIATA: string | null
    originCity: string | null
    destCity: string | null
    approxDurationMinutes: number | null
    startingPrice: number | null
    currency: string | null
    metaTitle: string | null
    metaDescription: string | null
    status: $Enums.DestinationStatus | null
    isFeatured: boolean | null
    sortOrder: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FlightRouteMaxAggregateOutputType = {
    id: bigint | null
    destinationId: bigint | null
    name: string | null
    slug: string | null
    originIATA: string | null
    destIATA: string | null
    originCity: string | null
    destCity: string | null
    approxDurationMinutes: number | null
    startingPrice: number | null
    currency: string | null
    metaTitle: string | null
    metaDescription: string | null
    status: $Enums.DestinationStatus | null
    isFeatured: boolean | null
    sortOrder: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FlightRouteCountAggregateOutputType = {
    id: number
    destinationId: number
    name: number
    slug: number
    originIATA: number
    destIATA: number
    originCity: number
    destCity: number
    approxDurationMinutes: number
    startingPrice: number
    currency: number
    metaTitle: number
    metaDescription: number
    status: number
    isFeatured: number
    sortOrder: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type FlightRouteAvgAggregateInputType = {
    id?: true
    destinationId?: true
    approxDurationMinutes?: true
    startingPrice?: true
    sortOrder?: true
  }

  export type FlightRouteSumAggregateInputType = {
    id?: true
    destinationId?: true
    approxDurationMinutes?: true
    startingPrice?: true
    sortOrder?: true
  }

  export type FlightRouteMinAggregateInputType = {
    id?: true
    destinationId?: true
    name?: true
    slug?: true
    originIATA?: true
    destIATA?: true
    originCity?: true
    destCity?: true
    approxDurationMinutes?: true
    startingPrice?: true
    currency?: true
    metaTitle?: true
    metaDescription?: true
    status?: true
    isFeatured?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FlightRouteMaxAggregateInputType = {
    id?: true
    destinationId?: true
    name?: true
    slug?: true
    originIATA?: true
    destIATA?: true
    originCity?: true
    destCity?: true
    approxDurationMinutes?: true
    startingPrice?: true
    currency?: true
    metaTitle?: true
    metaDescription?: true
    status?: true
    isFeatured?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FlightRouteCountAggregateInputType = {
    id?: true
    destinationId?: true
    name?: true
    slug?: true
    originIATA?: true
    destIATA?: true
    originCity?: true
    destCity?: true
    approxDurationMinutes?: true
    startingPrice?: true
    currency?: true
    metaTitle?: true
    metaDescription?: true
    status?: true
    isFeatured?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type FlightRouteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FlightRoute to aggregate.
     */
    where?: FlightRouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FlightRoutes to fetch.
     */
    orderBy?: FlightRouteOrderByWithRelationInput | FlightRouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FlightRouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FlightRoutes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FlightRoutes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FlightRoutes
    **/
    _count?: true | FlightRouteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FlightRouteAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FlightRouteSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FlightRouteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FlightRouteMaxAggregateInputType
  }

  export type GetFlightRouteAggregateType<T extends FlightRouteAggregateArgs> = {
        [P in keyof T & keyof AggregateFlightRoute]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFlightRoute[P]>
      : GetScalarType<T[P], AggregateFlightRoute[P]>
  }




  export type FlightRouteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FlightRouteWhereInput
    orderBy?: FlightRouteOrderByWithAggregationInput | FlightRouteOrderByWithAggregationInput[]
    by: FlightRouteScalarFieldEnum[] | FlightRouteScalarFieldEnum
    having?: FlightRouteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FlightRouteCountAggregateInputType | true
    _avg?: FlightRouteAvgAggregateInputType
    _sum?: FlightRouteSumAggregateInputType
    _min?: FlightRouteMinAggregateInputType
    _max?: FlightRouteMaxAggregateInputType
  }

  export type FlightRouteGroupByOutputType = {
    id: bigint
    destinationId: bigint
    name: string
    slug: string
    originIATA: string
    destIATA: string
    originCity: string
    destCity: string
    approxDurationMinutes: number | null
    startingPrice: number | null
    currency: string
    metaTitle: string | null
    metaDescription: string | null
    status: $Enums.DestinationStatus
    isFeatured: boolean
    sortOrder: number
    createdAt: Date
    updatedAt: Date
    _count: FlightRouteCountAggregateOutputType | null
    _avg: FlightRouteAvgAggregateOutputType | null
    _sum: FlightRouteSumAggregateOutputType | null
    _min: FlightRouteMinAggregateOutputType | null
    _max: FlightRouteMaxAggregateOutputType | null
  }

  type GetFlightRouteGroupByPayload<T extends FlightRouteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FlightRouteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FlightRouteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FlightRouteGroupByOutputType[P]>
            : GetScalarType<T[P], FlightRouteGroupByOutputType[P]>
        }
      >
    >


  export type FlightRouteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    destinationId?: boolean
    name?: boolean
    slug?: boolean
    originIATA?: boolean
    destIATA?: boolean
    originCity?: boolean
    destCity?: boolean
    approxDurationMinutes?: boolean
    startingPrice?: boolean
    currency?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    status?: boolean
    isFeatured?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["flightRoute"]>

  export type FlightRouteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    destinationId?: boolean
    name?: boolean
    slug?: boolean
    originIATA?: boolean
    destIATA?: boolean
    originCity?: boolean
    destCity?: boolean
    approxDurationMinutes?: boolean
    startingPrice?: boolean
    currency?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    status?: boolean
    isFeatured?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["flightRoute"]>

  export type FlightRouteSelectScalar = {
    id?: boolean
    destinationId?: boolean
    name?: boolean
    slug?: boolean
    originIATA?: boolean
    destIATA?: boolean
    originCity?: boolean
    destCity?: boolean
    approxDurationMinutes?: boolean
    startingPrice?: boolean
    currency?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    status?: boolean
    isFeatured?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type FlightRouteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }
  export type FlightRouteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    destination?: boolean | DestinationDefaultArgs<ExtArgs>
  }

  export type $FlightRoutePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FlightRoute"
    objects: {
      destination: Prisma.$DestinationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      destinationId: bigint
      name: string
      slug: string
      originIATA: string
      destIATA: string
      originCity: string
      destCity: string
      approxDurationMinutes: number | null
      startingPrice: number | null
      currency: string
      metaTitle: string | null
      metaDescription: string | null
      status: $Enums.DestinationStatus
      isFeatured: boolean
      sortOrder: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["flightRoute"]>
    composites: {}
  }

  type FlightRouteGetPayload<S extends boolean | null | undefined | FlightRouteDefaultArgs> = $Result.GetResult<Prisma.$FlightRoutePayload, S>

  type FlightRouteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<FlightRouteFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: FlightRouteCountAggregateInputType | true
    }

  export interface FlightRouteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FlightRoute'], meta: { name: 'FlightRoute' } }
    /**
     * Find zero or one FlightRoute that matches the filter.
     * @param {FlightRouteFindUniqueArgs} args - Arguments to find a FlightRoute
     * @example
     * // Get one FlightRoute
     * const flightRoute = await prisma.flightRoute.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FlightRouteFindUniqueArgs>(args: SelectSubset<T, FlightRouteFindUniqueArgs<ExtArgs>>): Prisma__FlightRouteClient<$Result.GetResult<Prisma.$FlightRoutePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one FlightRoute that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {FlightRouteFindUniqueOrThrowArgs} args - Arguments to find a FlightRoute
     * @example
     * // Get one FlightRoute
     * const flightRoute = await prisma.flightRoute.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FlightRouteFindUniqueOrThrowArgs>(args: SelectSubset<T, FlightRouteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FlightRouteClient<$Result.GetResult<Prisma.$FlightRoutePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first FlightRoute that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlightRouteFindFirstArgs} args - Arguments to find a FlightRoute
     * @example
     * // Get one FlightRoute
     * const flightRoute = await prisma.flightRoute.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FlightRouteFindFirstArgs>(args?: SelectSubset<T, FlightRouteFindFirstArgs<ExtArgs>>): Prisma__FlightRouteClient<$Result.GetResult<Prisma.$FlightRoutePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first FlightRoute that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlightRouteFindFirstOrThrowArgs} args - Arguments to find a FlightRoute
     * @example
     * // Get one FlightRoute
     * const flightRoute = await prisma.flightRoute.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FlightRouteFindFirstOrThrowArgs>(args?: SelectSubset<T, FlightRouteFindFirstOrThrowArgs<ExtArgs>>): Prisma__FlightRouteClient<$Result.GetResult<Prisma.$FlightRoutePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more FlightRoutes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlightRouteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FlightRoutes
     * const flightRoutes = await prisma.flightRoute.findMany()
     * 
     * // Get first 10 FlightRoutes
     * const flightRoutes = await prisma.flightRoute.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const flightRouteWithIdOnly = await prisma.flightRoute.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FlightRouteFindManyArgs>(args?: SelectSubset<T, FlightRouteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FlightRoutePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a FlightRoute.
     * @param {FlightRouteCreateArgs} args - Arguments to create a FlightRoute.
     * @example
     * // Create one FlightRoute
     * const FlightRoute = await prisma.flightRoute.create({
     *   data: {
     *     // ... data to create a FlightRoute
     *   }
     * })
     * 
     */
    create<T extends FlightRouteCreateArgs>(args: SelectSubset<T, FlightRouteCreateArgs<ExtArgs>>): Prisma__FlightRouteClient<$Result.GetResult<Prisma.$FlightRoutePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many FlightRoutes.
     * @param {FlightRouteCreateManyArgs} args - Arguments to create many FlightRoutes.
     * @example
     * // Create many FlightRoutes
     * const flightRoute = await prisma.flightRoute.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FlightRouteCreateManyArgs>(args?: SelectSubset<T, FlightRouteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FlightRoutes and returns the data saved in the database.
     * @param {FlightRouteCreateManyAndReturnArgs} args - Arguments to create many FlightRoutes.
     * @example
     * // Create many FlightRoutes
     * const flightRoute = await prisma.flightRoute.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FlightRoutes and only return the `id`
     * const flightRouteWithIdOnly = await prisma.flightRoute.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FlightRouteCreateManyAndReturnArgs>(args?: SelectSubset<T, FlightRouteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FlightRoutePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a FlightRoute.
     * @param {FlightRouteDeleteArgs} args - Arguments to delete one FlightRoute.
     * @example
     * // Delete one FlightRoute
     * const FlightRoute = await prisma.flightRoute.delete({
     *   where: {
     *     // ... filter to delete one FlightRoute
     *   }
     * })
     * 
     */
    delete<T extends FlightRouteDeleteArgs>(args: SelectSubset<T, FlightRouteDeleteArgs<ExtArgs>>): Prisma__FlightRouteClient<$Result.GetResult<Prisma.$FlightRoutePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one FlightRoute.
     * @param {FlightRouteUpdateArgs} args - Arguments to update one FlightRoute.
     * @example
     * // Update one FlightRoute
     * const flightRoute = await prisma.flightRoute.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FlightRouteUpdateArgs>(args: SelectSubset<T, FlightRouteUpdateArgs<ExtArgs>>): Prisma__FlightRouteClient<$Result.GetResult<Prisma.$FlightRoutePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more FlightRoutes.
     * @param {FlightRouteDeleteManyArgs} args - Arguments to filter FlightRoutes to delete.
     * @example
     * // Delete a few FlightRoutes
     * const { count } = await prisma.flightRoute.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FlightRouteDeleteManyArgs>(args?: SelectSubset<T, FlightRouteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FlightRoutes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlightRouteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FlightRoutes
     * const flightRoute = await prisma.flightRoute.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FlightRouteUpdateManyArgs>(args: SelectSubset<T, FlightRouteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one FlightRoute.
     * @param {FlightRouteUpsertArgs} args - Arguments to update or create a FlightRoute.
     * @example
     * // Update or create a FlightRoute
     * const flightRoute = await prisma.flightRoute.upsert({
     *   create: {
     *     // ... data to create a FlightRoute
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FlightRoute we want to update
     *   }
     * })
     */
    upsert<T extends FlightRouteUpsertArgs>(args: SelectSubset<T, FlightRouteUpsertArgs<ExtArgs>>): Prisma__FlightRouteClient<$Result.GetResult<Prisma.$FlightRoutePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of FlightRoutes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlightRouteCountArgs} args - Arguments to filter FlightRoutes to count.
     * @example
     * // Count the number of FlightRoutes
     * const count = await prisma.flightRoute.count({
     *   where: {
     *     // ... the filter for the FlightRoutes we want to count
     *   }
     * })
    **/
    count<T extends FlightRouteCountArgs>(
      args?: Subset<T, FlightRouteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FlightRouteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FlightRoute.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlightRouteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FlightRouteAggregateArgs>(args: Subset<T, FlightRouteAggregateArgs>): Prisma.PrismaPromise<GetFlightRouteAggregateType<T>>

    /**
     * Group by FlightRoute.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlightRouteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FlightRouteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FlightRouteGroupByArgs['orderBy'] }
        : { orderBy?: FlightRouteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FlightRouteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFlightRouteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FlightRoute model
   */
  readonly fields: FlightRouteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FlightRoute.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FlightRouteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    destination<T extends DestinationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DestinationDefaultArgs<ExtArgs>>): Prisma__DestinationClient<$Result.GetResult<Prisma.$DestinationPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FlightRoute model
   */ 
  interface FlightRouteFieldRefs {
    readonly id: FieldRef<"FlightRoute", 'BigInt'>
    readonly destinationId: FieldRef<"FlightRoute", 'BigInt'>
    readonly name: FieldRef<"FlightRoute", 'String'>
    readonly slug: FieldRef<"FlightRoute", 'String'>
    readonly originIATA: FieldRef<"FlightRoute", 'String'>
    readonly destIATA: FieldRef<"FlightRoute", 'String'>
    readonly originCity: FieldRef<"FlightRoute", 'String'>
    readonly destCity: FieldRef<"FlightRoute", 'String'>
    readonly approxDurationMinutes: FieldRef<"FlightRoute", 'Int'>
    readonly startingPrice: FieldRef<"FlightRoute", 'Int'>
    readonly currency: FieldRef<"FlightRoute", 'String'>
    readonly metaTitle: FieldRef<"FlightRoute", 'String'>
    readonly metaDescription: FieldRef<"FlightRoute", 'String'>
    readonly status: FieldRef<"FlightRoute", 'DestinationStatus'>
    readonly isFeatured: FieldRef<"FlightRoute", 'Boolean'>
    readonly sortOrder: FieldRef<"FlightRoute", 'Int'>
    readonly createdAt: FieldRef<"FlightRoute", 'DateTime'>
    readonly updatedAt: FieldRef<"FlightRoute", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FlightRoute findUnique
   */
  export type FlightRouteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlightRoute
     */
    select?: FlightRouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlightRouteInclude<ExtArgs> | null
    /**
     * Filter, which FlightRoute to fetch.
     */
    where: FlightRouteWhereUniqueInput
  }

  /**
   * FlightRoute findUniqueOrThrow
   */
  export type FlightRouteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlightRoute
     */
    select?: FlightRouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlightRouteInclude<ExtArgs> | null
    /**
     * Filter, which FlightRoute to fetch.
     */
    where: FlightRouteWhereUniqueInput
  }

  /**
   * FlightRoute findFirst
   */
  export type FlightRouteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlightRoute
     */
    select?: FlightRouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlightRouteInclude<ExtArgs> | null
    /**
     * Filter, which FlightRoute to fetch.
     */
    where?: FlightRouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FlightRoutes to fetch.
     */
    orderBy?: FlightRouteOrderByWithRelationInput | FlightRouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FlightRoutes.
     */
    cursor?: FlightRouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FlightRoutes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FlightRoutes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FlightRoutes.
     */
    distinct?: FlightRouteScalarFieldEnum | FlightRouteScalarFieldEnum[]
  }

  /**
   * FlightRoute findFirstOrThrow
   */
  export type FlightRouteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlightRoute
     */
    select?: FlightRouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlightRouteInclude<ExtArgs> | null
    /**
     * Filter, which FlightRoute to fetch.
     */
    where?: FlightRouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FlightRoutes to fetch.
     */
    orderBy?: FlightRouteOrderByWithRelationInput | FlightRouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FlightRoutes.
     */
    cursor?: FlightRouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FlightRoutes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FlightRoutes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FlightRoutes.
     */
    distinct?: FlightRouteScalarFieldEnum | FlightRouteScalarFieldEnum[]
  }

  /**
   * FlightRoute findMany
   */
  export type FlightRouteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlightRoute
     */
    select?: FlightRouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlightRouteInclude<ExtArgs> | null
    /**
     * Filter, which FlightRoutes to fetch.
     */
    where?: FlightRouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FlightRoutes to fetch.
     */
    orderBy?: FlightRouteOrderByWithRelationInput | FlightRouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FlightRoutes.
     */
    cursor?: FlightRouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FlightRoutes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FlightRoutes.
     */
    skip?: number
    distinct?: FlightRouteScalarFieldEnum | FlightRouteScalarFieldEnum[]
  }

  /**
   * FlightRoute create
   */
  export type FlightRouteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlightRoute
     */
    select?: FlightRouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlightRouteInclude<ExtArgs> | null
    /**
     * The data needed to create a FlightRoute.
     */
    data: XOR<FlightRouteCreateInput, FlightRouteUncheckedCreateInput>
  }

  /**
   * FlightRoute createMany
   */
  export type FlightRouteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FlightRoutes.
     */
    data: FlightRouteCreateManyInput | FlightRouteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FlightRoute createManyAndReturn
   */
  export type FlightRouteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlightRoute
     */
    select?: FlightRouteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many FlightRoutes.
     */
    data: FlightRouteCreateManyInput | FlightRouteCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlightRouteIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * FlightRoute update
   */
  export type FlightRouteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlightRoute
     */
    select?: FlightRouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlightRouteInclude<ExtArgs> | null
    /**
     * The data needed to update a FlightRoute.
     */
    data: XOR<FlightRouteUpdateInput, FlightRouteUncheckedUpdateInput>
    /**
     * Choose, which FlightRoute to update.
     */
    where: FlightRouteWhereUniqueInput
  }

  /**
   * FlightRoute updateMany
   */
  export type FlightRouteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FlightRoutes.
     */
    data: XOR<FlightRouteUpdateManyMutationInput, FlightRouteUncheckedUpdateManyInput>
    /**
     * Filter which FlightRoutes to update
     */
    where?: FlightRouteWhereInput
  }

  /**
   * FlightRoute upsert
   */
  export type FlightRouteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlightRoute
     */
    select?: FlightRouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlightRouteInclude<ExtArgs> | null
    /**
     * The filter to search for the FlightRoute to update in case it exists.
     */
    where: FlightRouteWhereUniqueInput
    /**
     * In case the FlightRoute found by the `where` argument doesn't exist, create a new FlightRoute with this data.
     */
    create: XOR<FlightRouteCreateInput, FlightRouteUncheckedCreateInput>
    /**
     * In case the FlightRoute was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FlightRouteUpdateInput, FlightRouteUncheckedUpdateInput>
  }

  /**
   * FlightRoute delete
   */
  export type FlightRouteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlightRoute
     */
    select?: FlightRouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlightRouteInclude<ExtArgs> | null
    /**
     * Filter which FlightRoute to delete.
     */
    where: FlightRouteWhereUniqueInput
  }

  /**
   * FlightRoute deleteMany
   */
  export type FlightRouteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FlightRoutes to delete
     */
    where?: FlightRouteWhereInput
  }

  /**
   * FlightRoute without action
   */
  export type FlightRouteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlightRoute
     */
    select?: FlightRouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlightRouteInclude<ExtArgs> | null
  }


  /**
   * Model SlugHistory
   */

  export type AggregateSlugHistory = {
    _count: SlugHistoryCountAggregateOutputType | null
    _avg: SlugHistoryAvgAggregateOutputType | null
    _sum: SlugHistorySumAggregateOutputType | null
    _min: SlugHistoryMinAggregateOutputType | null
    _max: SlugHistoryMaxAggregateOutputType | null
  }

  export type SlugHistoryAvgAggregateOutputType = {
    id: number | null
    entityId: number | null
  }

  export type SlugHistorySumAggregateOutputType = {
    id: bigint | null
    entityId: bigint | null
  }

  export type SlugHistoryMinAggregateOutputType = {
    id: bigint | null
    entityType: $Enums.SluggableEntity | null
    entityId: bigint | null
    locale: string | null
    oldSlug: string | null
    oldFullPath: string | null
    newFullPath: string | null
    changedAt: Date | null
    changedByUser: string | null
    reason: string | null
  }

  export type SlugHistoryMaxAggregateOutputType = {
    id: bigint | null
    entityType: $Enums.SluggableEntity | null
    entityId: bigint | null
    locale: string | null
    oldSlug: string | null
    oldFullPath: string | null
    newFullPath: string | null
    changedAt: Date | null
    changedByUser: string | null
    reason: string | null
  }

  export type SlugHistoryCountAggregateOutputType = {
    id: number
    entityType: number
    entityId: number
    locale: number
    oldSlug: number
    oldFullPath: number
    newFullPath: number
    changedAt: number
    changedByUser: number
    reason: number
    _all: number
  }


  export type SlugHistoryAvgAggregateInputType = {
    id?: true
    entityId?: true
  }

  export type SlugHistorySumAggregateInputType = {
    id?: true
    entityId?: true
  }

  export type SlugHistoryMinAggregateInputType = {
    id?: true
    entityType?: true
    entityId?: true
    locale?: true
    oldSlug?: true
    oldFullPath?: true
    newFullPath?: true
    changedAt?: true
    changedByUser?: true
    reason?: true
  }

  export type SlugHistoryMaxAggregateInputType = {
    id?: true
    entityType?: true
    entityId?: true
    locale?: true
    oldSlug?: true
    oldFullPath?: true
    newFullPath?: true
    changedAt?: true
    changedByUser?: true
    reason?: true
  }

  export type SlugHistoryCountAggregateInputType = {
    id?: true
    entityType?: true
    entityId?: true
    locale?: true
    oldSlug?: true
    oldFullPath?: true
    newFullPath?: true
    changedAt?: true
    changedByUser?: true
    reason?: true
    _all?: true
  }

  export type SlugHistoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SlugHistory to aggregate.
     */
    where?: SlugHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SlugHistories to fetch.
     */
    orderBy?: SlugHistoryOrderByWithRelationInput | SlugHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SlugHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SlugHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SlugHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SlugHistories
    **/
    _count?: true | SlugHistoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SlugHistoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SlugHistorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SlugHistoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SlugHistoryMaxAggregateInputType
  }

  export type GetSlugHistoryAggregateType<T extends SlugHistoryAggregateArgs> = {
        [P in keyof T & keyof AggregateSlugHistory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSlugHistory[P]>
      : GetScalarType<T[P], AggregateSlugHistory[P]>
  }




  export type SlugHistoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SlugHistoryWhereInput
    orderBy?: SlugHistoryOrderByWithAggregationInput | SlugHistoryOrderByWithAggregationInput[]
    by: SlugHistoryScalarFieldEnum[] | SlugHistoryScalarFieldEnum
    having?: SlugHistoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SlugHistoryCountAggregateInputType | true
    _avg?: SlugHistoryAvgAggregateInputType
    _sum?: SlugHistorySumAggregateInputType
    _min?: SlugHistoryMinAggregateInputType
    _max?: SlugHistoryMaxAggregateInputType
  }

  export type SlugHistoryGroupByOutputType = {
    id: bigint
    entityType: $Enums.SluggableEntity
    entityId: bigint
    locale: string
    oldSlug: string
    oldFullPath: string
    newFullPath: string
    changedAt: Date
    changedByUser: string | null
    reason: string | null
    _count: SlugHistoryCountAggregateOutputType | null
    _avg: SlugHistoryAvgAggregateOutputType | null
    _sum: SlugHistorySumAggregateOutputType | null
    _min: SlugHistoryMinAggregateOutputType | null
    _max: SlugHistoryMaxAggregateOutputType | null
  }

  type GetSlugHistoryGroupByPayload<T extends SlugHistoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SlugHistoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SlugHistoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SlugHistoryGroupByOutputType[P]>
            : GetScalarType<T[P], SlugHistoryGroupByOutputType[P]>
        }
      >
    >


  export type SlugHistorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    entityType?: boolean
    entityId?: boolean
    locale?: boolean
    oldSlug?: boolean
    oldFullPath?: boolean
    newFullPath?: boolean
    changedAt?: boolean
    changedByUser?: boolean
    reason?: boolean
  }, ExtArgs["result"]["slugHistory"]>

  export type SlugHistorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    entityType?: boolean
    entityId?: boolean
    locale?: boolean
    oldSlug?: boolean
    oldFullPath?: boolean
    newFullPath?: boolean
    changedAt?: boolean
    changedByUser?: boolean
    reason?: boolean
  }, ExtArgs["result"]["slugHistory"]>

  export type SlugHistorySelectScalar = {
    id?: boolean
    entityType?: boolean
    entityId?: boolean
    locale?: boolean
    oldSlug?: boolean
    oldFullPath?: boolean
    newFullPath?: boolean
    changedAt?: boolean
    changedByUser?: boolean
    reason?: boolean
  }


  export type $SlugHistoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SlugHistory"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      entityType: $Enums.SluggableEntity
      entityId: bigint
      locale: string
      oldSlug: string
      oldFullPath: string
      newFullPath: string
      changedAt: Date
      changedByUser: string | null
      reason: string | null
    }, ExtArgs["result"]["slugHistory"]>
    composites: {}
  }

  type SlugHistoryGetPayload<S extends boolean | null | undefined | SlugHistoryDefaultArgs> = $Result.GetResult<Prisma.$SlugHistoryPayload, S>

  type SlugHistoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SlugHistoryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SlugHistoryCountAggregateInputType | true
    }

  export interface SlugHistoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SlugHistory'], meta: { name: 'SlugHistory' } }
    /**
     * Find zero or one SlugHistory that matches the filter.
     * @param {SlugHistoryFindUniqueArgs} args - Arguments to find a SlugHistory
     * @example
     * // Get one SlugHistory
     * const slugHistory = await prisma.slugHistory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SlugHistoryFindUniqueArgs>(args: SelectSubset<T, SlugHistoryFindUniqueArgs<ExtArgs>>): Prisma__SlugHistoryClient<$Result.GetResult<Prisma.$SlugHistoryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SlugHistory that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SlugHistoryFindUniqueOrThrowArgs} args - Arguments to find a SlugHistory
     * @example
     * // Get one SlugHistory
     * const slugHistory = await prisma.slugHistory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SlugHistoryFindUniqueOrThrowArgs>(args: SelectSubset<T, SlugHistoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SlugHistoryClient<$Result.GetResult<Prisma.$SlugHistoryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SlugHistory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SlugHistoryFindFirstArgs} args - Arguments to find a SlugHistory
     * @example
     * // Get one SlugHistory
     * const slugHistory = await prisma.slugHistory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SlugHistoryFindFirstArgs>(args?: SelectSubset<T, SlugHistoryFindFirstArgs<ExtArgs>>): Prisma__SlugHistoryClient<$Result.GetResult<Prisma.$SlugHistoryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SlugHistory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SlugHistoryFindFirstOrThrowArgs} args - Arguments to find a SlugHistory
     * @example
     * // Get one SlugHistory
     * const slugHistory = await prisma.slugHistory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SlugHistoryFindFirstOrThrowArgs>(args?: SelectSubset<T, SlugHistoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__SlugHistoryClient<$Result.GetResult<Prisma.$SlugHistoryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SlugHistories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SlugHistoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SlugHistories
     * const slugHistories = await prisma.slugHistory.findMany()
     * 
     * // Get first 10 SlugHistories
     * const slugHistories = await prisma.slugHistory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const slugHistoryWithIdOnly = await prisma.slugHistory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SlugHistoryFindManyArgs>(args?: SelectSubset<T, SlugHistoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SlugHistoryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SlugHistory.
     * @param {SlugHistoryCreateArgs} args - Arguments to create a SlugHistory.
     * @example
     * // Create one SlugHistory
     * const SlugHistory = await prisma.slugHistory.create({
     *   data: {
     *     // ... data to create a SlugHistory
     *   }
     * })
     * 
     */
    create<T extends SlugHistoryCreateArgs>(args: SelectSubset<T, SlugHistoryCreateArgs<ExtArgs>>): Prisma__SlugHistoryClient<$Result.GetResult<Prisma.$SlugHistoryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SlugHistories.
     * @param {SlugHistoryCreateManyArgs} args - Arguments to create many SlugHistories.
     * @example
     * // Create many SlugHistories
     * const slugHistory = await prisma.slugHistory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SlugHistoryCreateManyArgs>(args?: SelectSubset<T, SlugHistoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SlugHistories and returns the data saved in the database.
     * @param {SlugHistoryCreateManyAndReturnArgs} args - Arguments to create many SlugHistories.
     * @example
     * // Create many SlugHistories
     * const slugHistory = await prisma.slugHistory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SlugHistories and only return the `id`
     * const slugHistoryWithIdOnly = await prisma.slugHistory.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SlugHistoryCreateManyAndReturnArgs>(args?: SelectSubset<T, SlugHistoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SlugHistoryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a SlugHistory.
     * @param {SlugHistoryDeleteArgs} args - Arguments to delete one SlugHistory.
     * @example
     * // Delete one SlugHistory
     * const SlugHistory = await prisma.slugHistory.delete({
     *   where: {
     *     // ... filter to delete one SlugHistory
     *   }
     * })
     * 
     */
    delete<T extends SlugHistoryDeleteArgs>(args: SelectSubset<T, SlugHistoryDeleteArgs<ExtArgs>>): Prisma__SlugHistoryClient<$Result.GetResult<Prisma.$SlugHistoryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SlugHistory.
     * @param {SlugHistoryUpdateArgs} args - Arguments to update one SlugHistory.
     * @example
     * // Update one SlugHistory
     * const slugHistory = await prisma.slugHistory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SlugHistoryUpdateArgs>(args: SelectSubset<T, SlugHistoryUpdateArgs<ExtArgs>>): Prisma__SlugHistoryClient<$Result.GetResult<Prisma.$SlugHistoryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SlugHistories.
     * @param {SlugHistoryDeleteManyArgs} args - Arguments to filter SlugHistories to delete.
     * @example
     * // Delete a few SlugHistories
     * const { count } = await prisma.slugHistory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SlugHistoryDeleteManyArgs>(args?: SelectSubset<T, SlugHistoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SlugHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SlugHistoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SlugHistories
     * const slugHistory = await prisma.slugHistory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SlugHistoryUpdateManyArgs>(args: SelectSubset<T, SlugHistoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SlugHistory.
     * @param {SlugHistoryUpsertArgs} args - Arguments to update or create a SlugHistory.
     * @example
     * // Update or create a SlugHistory
     * const slugHistory = await prisma.slugHistory.upsert({
     *   create: {
     *     // ... data to create a SlugHistory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SlugHistory we want to update
     *   }
     * })
     */
    upsert<T extends SlugHistoryUpsertArgs>(args: SelectSubset<T, SlugHistoryUpsertArgs<ExtArgs>>): Prisma__SlugHistoryClient<$Result.GetResult<Prisma.$SlugHistoryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SlugHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SlugHistoryCountArgs} args - Arguments to filter SlugHistories to count.
     * @example
     * // Count the number of SlugHistories
     * const count = await prisma.slugHistory.count({
     *   where: {
     *     // ... the filter for the SlugHistories we want to count
     *   }
     * })
    **/
    count<T extends SlugHistoryCountArgs>(
      args?: Subset<T, SlugHistoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SlugHistoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SlugHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SlugHistoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SlugHistoryAggregateArgs>(args: Subset<T, SlugHistoryAggregateArgs>): Prisma.PrismaPromise<GetSlugHistoryAggregateType<T>>

    /**
     * Group by SlugHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SlugHistoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SlugHistoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SlugHistoryGroupByArgs['orderBy'] }
        : { orderBy?: SlugHistoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SlugHistoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSlugHistoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SlugHistory model
   */
  readonly fields: SlugHistoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SlugHistory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SlugHistoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SlugHistory model
   */ 
  interface SlugHistoryFieldRefs {
    readonly id: FieldRef<"SlugHistory", 'BigInt'>
    readonly entityType: FieldRef<"SlugHistory", 'SluggableEntity'>
    readonly entityId: FieldRef<"SlugHistory", 'BigInt'>
    readonly locale: FieldRef<"SlugHistory", 'String'>
    readonly oldSlug: FieldRef<"SlugHistory", 'String'>
    readonly oldFullPath: FieldRef<"SlugHistory", 'String'>
    readonly newFullPath: FieldRef<"SlugHistory", 'String'>
    readonly changedAt: FieldRef<"SlugHistory", 'DateTime'>
    readonly changedByUser: FieldRef<"SlugHistory", 'String'>
    readonly reason: FieldRef<"SlugHistory", 'String'>
  }
    

  // Custom InputTypes
  /**
   * SlugHistory findUnique
   */
  export type SlugHistoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlugHistory
     */
    select?: SlugHistorySelect<ExtArgs> | null
    /**
     * Filter, which SlugHistory to fetch.
     */
    where: SlugHistoryWhereUniqueInput
  }

  /**
   * SlugHistory findUniqueOrThrow
   */
  export type SlugHistoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlugHistory
     */
    select?: SlugHistorySelect<ExtArgs> | null
    /**
     * Filter, which SlugHistory to fetch.
     */
    where: SlugHistoryWhereUniqueInput
  }

  /**
   * SlugHistory findFirst
   */
  export type SlugHistoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlugHistory
     */
    select?: SlugHistorySelect<ExtArgs> | null
    /**
     * Filter, which SlugHistory to fetch.
     */
    where?: SlugHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SlugHistories to fetch.
     */
    orderBy?: SlugHistoryOrderByWithRelationInput | SlugHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SlugHistories.
     */
    cursor?: SlugHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SlugHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SlugHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SlugHistories.
     */
    distinct?: SlugHistoryScalarFieldEnum | SlugHistoryScalarFieldEnum[]
  }

  /**
   * SlugHistory findFirstOrThrow
   */
  export type SlugHistoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlugHistory
     */
    select?: SlugHistorySelect<ExtArgs> | null
    /**
     * Filter, which SlugHistory to fetch.
     */
    where?: SlugHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SlugHistories to fetch.
     */
    orderBy?: SlugHistoryOrderByWithRelationInput | SlugHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SlugHistories.
     */
    cursor?: SlugHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SlugHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SlugHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SlugHistories.
     */
    distinct?: SlugHistoryScalarFieldEnum | SlugHistoryScalarFieldEnum[]
  }

  /**
   * SlugHistory findMany
   */
  export type SlugHistoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlugHistory
     */
    select?: SlugHistorySelect<ExtArgs> | null
    /**
     * Filter, which SlugHistories to fetch.
     */
    where?: SlugHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SlugHistories to fetch.
     */
    orderBy?: SlugHistoryOrderByWithRelationInput | SlugHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SlugHistories.
     */
    cursor?: SlugHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SlugHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SlugHistories.
     */
    skip?: number
    distinct?: SlugHistoryScalarFieldEnum | SlugHistoryScalarFieldEnum[]
  }

  /**
   * SlugHistory create
   */
  export type SlugHistoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlugHistory
     */
    select?: SlugHistorySelect<ExtArgs> | null
    /**
     * The data needed to create a SlugHistory.
     */
    data: XOR<SlugHistoryCreateInput, SlugHistoryUncheckedCreateInput>
  }

  /**
   * SlugHistory createMany
   */
  export type SlugHistoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SlugHistories.
     */
    data: SlugHistoryCreateManyInput | SlugHistoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SlugHistory createManyAndReturn
   */
  export type SlugHistoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlugHistory
     */
    select?: SlugHistorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many SlugHistories.
     */
    data: SlugHistoryCreateManyInput | SlugHistoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SlugHistory update
   */
  export type SlugHistoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlugHistory
     */
    select?: SlugHistorySelect<ExtArgs> | null
    /**
     * The data needed to update a SlugHistory.
     */
    data: XOR<SlugHistoryUpdateInput, SlugHistoryUncheckedUpdateInput>
    /**
     * Choose, which SlugHistory to update.
     */
    where: SlugHistoryWhereUniqueInput
  }

  /**
   * SlugHistory updateMany
   */
  export type SlugHistoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SlugHistories.
     */
    data: XOR<SlugHistoryUpdateManyMutationInput, SlugHistoryUncheckedUpdateManyInput>
    /**
     * Filter which SlugHistories to update
     */
    where?: SlugHistoryWhereInput
  }

  /**
   * SlugHistory upsert
   */
  export type SlugHistoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlugHistory
     */
    select?: SlugHistorySelect<ExtArgs> | null
    /**
     * The filter to search for the SlugHistory to update in case it exists.
     */
    where: SlugHistoryWhereUniqueInput
    /**
     * In case the SlugHistory found by the `where` argument doesn't exist, create a new SlugHistory with this data.
     */
    create: XOR<SlugHistoryCreateInput, SlugHistoryUncheckedCreateInput>
    /**
     * In case the SlugHistory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SlugHistoryUpdateInput, SlugHistoryUncheckedUpdateInput>
  }

  /**
   * SlugHistory delete
   */
  export type SlugHistoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlugHistory
     */
    select?: SlugHistorySelect<ExtArgs> | null
    /**
     * Filter which SlugHistory to delete.
     */
    where: SlugHistoryWhereUniqueInput
  }

  /**
   * SlugHistory deleteMany
   */
  export type SlugHistoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SlugHistories to delete
     */
    where?: SlugHistoryWhereInput
  }

  /**
   * SlugHistory without action
   */
  export type SlugHistoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlugHistory
     */
    select?: SlugHistorySelect<ExtArgs> | null
  }


  /**
   * Model Redirect
   */

  export type AggregateRedirect = {
    _count: RedirectCountAggregateOutputType | null
    _avg: RedirectAvgAggregateOutputType | null
    _sum: RedirectSumAggregateOutputType | null
    _min: RedirectMinAggregateOutputType | null
    _max: RedirectMaxAggregateOutputType | null
  }

  export type RedirectAvgAggregateOutputType = {
    id: number | null
    statusCode: number | null
  }

  export type RedirectSumAggregateOutputType = {
    id: bigint | null
    statusCode: number | null
  }

  export type RedirectMinAggregateOutputType = {
    id: bigint | null
    fromPath: string | null
    toPath: string | null
    statusCode: number | null
    locale: string | null
    source: $Enums.RedirectSource | null
    reason: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RedirectMaxAggregateOutputType = {
    id: bigint | null
    fromPath: string | null
    toPath: string | null
    statusCode: number | null
    locale: string | null
    source: $Enums.RedirectSource | null
    reason: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RedirectCountAggregateOutputType = {
    id: number
    fromPath: number
    toPath: number
    statusCode: number
    locale: number
    source: number
    reason: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type RedirectAvgAggregateInputType = {
    id?: true
    statusCode?: true
  }

  export type RedirectSumAggregateInputType = {
    id?: true
    statusCode?: true
  }

  export type RedirectMinAggregateInputType = {
    id?: true
    fromPath?: true
    toPath?: true
    statusCode?: true
    locale?: true
    source?: true
    reason?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RedirectMaxAggregateInputType = {
    id?: true
    fromPath?: true
    toPath?: true
    statusCode?: true
    locale?: true
    source?: true
    reason?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RedirectCountAggregateInputType = {
    id?: true
    fromPath?: true
    toPath?: true
    statusCode?: true
    locale?: true
    source?: true
    reason?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type RedirectAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Redirect to aggregate.
     */
    where?: RedirectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Redirects to fetch.
     */
    orderBy?: RedirectOrderByWithRelationInput | RedirectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RedirectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Redirects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Redirects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Redirects
    **/
    _count?: true | RedirectCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RedirectAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RedirectSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RedirectMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RedirectMaxAggregateInputType
  }

  export type GetRedirectAggregateType<T extends RedirectAggregateArgs> = {
        [P in keyof T & keyof AggregateRedirect]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRedirect[P]>
      : GetScalarType<T[P], AggregateRedirect[P]>
  }




  export type RedirectGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RedirectWhereInput
    orderBy?: RedirectOrderByWithAggregationInput | RedirectOrderByWithAggregationInput[]
    by: RedirectScalarFieldEnum[] | RedirectScalarFieldEnum
    having?: RedirectScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RedirectCountAggregateInputType | true
    _avg?: RedirectAvgAggregateInputType
    _sum?: RedirectSumAggregateInputType
    _min?: RedirectMinAggregateInputType
    _max?: RedirectMaxAggregateInputType
  }

  export type RedirectGroupByOutputType = {
    id: bigint
    fromPath: string
    toPath: string
    statusCode: number
    locale: string | null
    source: $Enums.RedirectSource
    reason: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: RedirectCountAggregateOutputType | null
    _avg: RedirectAvgAggregateOutputType | null
    _sum: RedirectSumAggregateOutputType | null
    _min: RedirectMinAggregateOutputType | null
    _max: RedirectMaxAggregateOutputType | null
  }

  type GetRedirectGroupByPayload<T extends RedirectGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RedirectGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RedirectGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RedirectGroupByOutputType[P]>
            : GetScalarType<T[P], RedirectGroupByOutputType[P]>
        }
      >
    >


  export type RedirectSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fromPath?: boolean
    toPath?: boolean
    statusCode?: boolean
    locale?: boolean
    source?: boolean
    reason?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["redirect"]>

  export type RedirectSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fromPath?: boolean
    toPath?: boolean
    statusCode?: boolean
    locale?: boolean
    source?: boolean
    reason?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["redirect"]>

  export type RedirectSelectScalar = {
    id?: boolean
    fromPath?: boolean
    toPath?: boolean
    statusCode?: boolean
    locale?: boolean
    source?: boolean
    reason?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $RedirectPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Redirect"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      fromPath: string
      toPath: string
      statusCode: number
      locale: string | null
      source: $Enums.RedirectSource
      reason: string | null
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["redirect"]>
    composites: {}
  }

  type RedirectGetPayload<S extends boolean | null | undefined | RedirectDefaultArgs> = $Result.GetResult<Prisma.$RedirectPayload, S>

  type RedirectCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RedirectFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RedirectCountAggregateInputType | true
    }

  export interface RedirectDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Redirect'], meta: { name: 'Redirect' } }
    /**
     * Find zero or one Redirect that matches the filter.
     * @param {RedirectFindUniqueArgs} args - Arguments to find a Redirect
     * @example
     * // Get one Redirect
     * const redirect = await prisma.redirect.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RedirectFindUniqueArgs>(args: SelectSubset<T, RedirectFindUniqueArgs<ExtArgs>>): Prisma__RedirectClient<$Result.GetResult<Prisma.$RedirectPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Redirect that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {RedirectFindUniqueOrThrowArgs} args - Arguments to find a Redirect
     * @example
     * // Get one Redirect
     * const redirect = await prisma.redirect.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RedirectFindUniqueOrThrowArgs>(args: SelectSubset<T, RedirectFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RedirectClient<$Result.GetResult<Prisma.$RedirectPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Redirect that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectFindFirstArgs} args - Arguments to find a Redirect
     * @example
     * // Get one Redirect
     * const redirect = await prisma.redirect.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RedirectFindFirstArgs>(args?: SelectSubset<T, RedirectFindFirstArgs<ExtArgs>>): Prisma__RedirectClient<$Result.GetResult<Prisma.$RedirectPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Redirect that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectFindFirstOrThrowArgs} args - Arguments to find a Redirect
     * @example
     * // Get one Redirect
     * const redirect = await prisma.redirect.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RedirectFindFirstOrThrowArgs>(args?: SelectSubset<T, RedirectFindFirstOrThrowArgs<ExtArgs>>): Prisma__RedirectClient<$Result.GetResult<Prisma.$RedirectPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Redirects that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Redirects
     * const redirects = await prisma.redirect.findMany()
     * 
     * // Get first 10 Redirects
     * const redirects = await prisma.redirect.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const redirectWithIdOnly = await prisma.redirect.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RedirectFindManyArgs>(args?: SelectSubset<T, RedirectFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RedirectPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Redirect.
     * @param {RedirectCreateArgs} args - Arguments to create a Redirect.
     * @example
     * // Create one Redirect
     * const Redirect = await prisma.redirect.create({
     *   data: {
     *     // ... data to create a Redirect
     *   }
     * })
     * 
     */
    create<T extends RedirectCreateArgs>(args: SelectSubset<T, RedirectCreateArgs<ExtArgs>>): Prisma__RedirectClient<$Result.GetResult<Prisma.$RedirectPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Redirects.
     * @param {RedirectCreateManyArgs} args - Arguments to create many Redirects.
     * @example
     * // Create many Redirects
     * const redirect = await prisma.redirect.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RedirectCreateManyArgs>(args?: SelectSubset<T, RedirectCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Redirects and returns the data saved in the database.
     * @param {RedirectCreateManyAndReturnArgs} args - Arguments to create many Redirects.
     * @example
     * // Create many Redirects
     * const redirect = await prisma.redirect.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Redirects and only return the `id`
     * const redirectWithIdOnly = await prisma.redirect.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RedirectCreateManyAndReturnArgs>(args?: SelectSubset<T, RedirectCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RedirectPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Redirect.
     * @param {RedirectDeleteArgs} args - Arguments to delete one Redirect.
     * @example
     * // Delete one Redirect
     * const Redirect = await prisma.redirect.delete({
     *   where: {
     *     // ... filter to delete one Redirect
     *   }
     * })
     * 
     */
    delete<T extends RedirectDeleteArgs>(args: SelectSubset<T, RedirectDeleteArgs<ExtArgs>>): Prisma__RedirectClient<$Result.GetResult<Prisma.$RedirectPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Redirect.
     * @param {RedirectUpdateArgs} args - Arguments to update one Redirect.
     * @example
     * // Update one Redirect
     * const redirect = await prisma.redirect.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RedirectUpdateArgs>(args: SelectSubset<T, RedirectUpdateArgs<ExtArgs>>): Prisma__RedirectClient<$Result.GetResult<Prisma.$RedirectPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Redirects.
     * @param {RedirectDeleteManyArgs} args - Arguments to filter Redirects to delete.
     * @example
     * // Delete a few Redirects
     * const { count } = await prisma.redirect.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RedirectDeleteManyArgs>(args?: SelectSubset<T, RedirectDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Redirects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Redirects
     * const redirect = await prisma.redirect.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RedirectUpdateManyArgs>(args: SelectSubset<T, RedirectUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Redirect.
     * @param {RedirectUpsertArgs} args - Arguments to update or create a Redirect.
     * @example
     * // Update or create a Redirect
     * const redirect = await prisma.redirect.upsert({
     *   create: {
     *     // ... data to create a Redirect
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Redirect we want to update
     *   }
     * })
     */
    upsert<T extends RedirectUpsertArgs>(args: SelectSubset<T, RedirectUpsertArgs<ExtArgs>>): Prisma__RedirectClient<$Result.GetResult<Prisma.$RedirectPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Redirects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectCountArgs} args - Arguments to filter Redirects to count.
     * @example
     * // Count the number of Redirects
     * const count = await prisma.redirect.count({
     *   where: {
     *     // ... the filter for the Redirects we want to count
     *   }
     * })
    **/
    count<T extends RedirectCountArgs>(
      args?: Subset<T, RedirectCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RedirectCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Redirect.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RedirectAggregateArgs>(args: Subset<T, RedirectAggregateArgs>): Prisma.PrismaPromise<GetRedirectAggregateType<T>>

    /**
     * Group by Redirect.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RedirectGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RedirectGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RedirectGroupByArgs['orderBy'] }
        : { orderBy?: RedirectGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RedirectGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRedirectGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Redirect model
   */
  readonly fields: RedirectFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Redirect.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RedirectClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Redirect model
   */ 
  interface RedirectFieldRefs {
    readonly id: FieldRef<"Redirect", 'BigInt'>
    readonly fromPath: FieldRef<"Redirect", 'String'>
    readonly toPath: FieldRef<"Redirect", 'String'>
    readonly statusCode: FieldRef<"Redirect", 'Int'>
    readonly locale: FieldRef<"Redirect", 'String'>
    readonly source: FieldRef<"Redirect", 'RedirectSource'>
    readonly reason: FieldRef<"Redirect", 'String'>
    readonly isActive: FieldRef<"Redirect", 'Boolean'>
    readonly createdAt: FieldRef<"Redirect", 'DateTime'>
    readonly updatedAt: FieldRef<"Redirect", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Redirect findUnique
   */
  export type RedirectFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Redirect
     */
    select?: RedirectSelect<ExtArgs> | null
    /**
     * Filter, which Redirect to fetch.
     */
    where: RedirectWhereUniqueInput
  }

  /**
   * Redirect findUniqueOrThrow
   */
  export type RedirectFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Redirect
     */
    select?: RedirectSelect<ExtArgs> | null
    /**
     * Filter, which Redirect to fetch.
     */
    where: RedirectWhereUniqueInput
  }

  /**
   * Redirect findFirst
   */
  export type RedirectFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Redirect
     */
    select?: RedirectSelect<ExtArgs> | null
    /**
     * Filter, which Redirect to fetch.
     */
    where?: RedirectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Redirects to fetch.
     */
    orderBy?: RedirectOrderByWithRelationInput | RedirectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Redirects.
     */
    cursor?: RedirectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Redirects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Redirects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Redirects.
     */
    distinct?: RedirectScalarFieldEnum | RedirectScalarFieldEnum[]
  }

  /**
   * Redirect findFirstOrThrow
   */
  export type RedirectFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Redirect
     */
    select?: RedirectSelect<ExtArgs> | null
    /**
     * Filter, which Redirect to fetch.
     */
    where?: RedirectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Redirects to fetch.
     */
    orderBy?: RedirectOrderByWithRelationInput | RedirectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Redirects.
     */
    cursor?: RedirectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Redirects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Redirects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Redirects.
     */
    distinct?: RedirectScalarFieldEnum | RedirectScalarFieldEnum[]
  }

  /**
   * Redirect findMany
   */
  export type RedirectFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Redirect
     */
    select?: RedirectSelect<ExtArgs> | null
    /**
     * Filter, which Redirects to fetch.
     */
    where?: RedirectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Redirects to fetch.
     */
    orderBy?: RedirectOrderByWithRelationInput | RedirectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Redirects.
     */
    cursor?: RedirectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Redirects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Redirects.
     */
    skip?: number
    distinct?: RedirectScalarFieldEnum | RedirectScalarFieldEnum[]
  }

  /**
   * Redirect create
   */
  export type RedirectCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Redirect
     */
    select?: RedirectSelect<ExtArgs> | null
    /**
     * The data needed to create a Redirect.
     */
    data: XOR<RedirectCreateInput, RedirectUncheckedCreateInput>
  }

  /**
   * Redirect createMany
   */
  export type RedirectCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Redirects.
     */
    data: RedirectCreateManyInput | RedirectCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Redirect createManyAndReturn
   */
  export type RedirectCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Redirect
     */
    select?: RedirectSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Redirects.
     */
    data: RedirectCreateManyInput | RedirectCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Redirect update
   */
  export type RedirectUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Redirect
     */
    select?: RedirectSelect<ExtArgs> | null
    /**
     * The data needed to update a Redirect.
     */
    data: XOR<RedirectUpdateInput, RedirectUncheckedUpdateInput>
    /**
     * Choose, which Redirect to update.
     */
    where: RedirectWhereUniqueInput
  }

  /**
   * Redirect updateMany
   */
  export type RedirectUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Redirects.
     */
    data: XOR<RedirectUpdateManyMutationInput, RedirectUncheckedUpdateManyInput>
    /**
     * Filter which Redirects to update
     */
    where?: RedirectWhereInput
  }

  /**
   * Redirect upsert
   */
  export type RedirectUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Redirect
     */
    select?: RedirectSelect<ExtArgs> | null
    /**
     * The filter to search for the Redirect to update in case it exists.
     */
    where: RedirectWhereUniqueInput
    /**
     * In case the Redirect found by the `where` argument doesn't exist, create a new Redirect with this data.
     */
    create: XOR<RedirectCreateInput, RedirectUncheckedCreateInput>
    /**
     * In case the Redirect was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RedirectUpdateInput, RedirectUncheckedUpdateInput>
  }

  /**
   * Redirect delete
   */
  export type RedirectDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Redirect
     */
    select?: RedirectSelect<ExtArgs> | null
    /**
     * Filter which Redirect to delete.
     */
    where: RedirectWhereUniqueInput
  }

  /**
   * Redirect deleteMany
   */
  export type RedirectDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Redirects to delete
     */
    where?: RedirectWhereInput
  }

  /**
   * Redirect without action
   */
  export type RedirectDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Redirect
     */
    select?: RedirectSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const DestinationScalarFieldEnum: {
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

  export type DestinationScalarFieldEnum = (typeof DestinationScalarFieldEnum)[keyof typeof DestinationScalarFieldEnum]


  export const DestinationTranslationScalarFieldEnum: {
    destinationId: 'destinationId',
    locale: 'locale',
    name: 'name',
    slug: 'slug',
    metaTitle: 'metaTitle',
    metaDescription: 'metaDescription',
    seoContent: 'seoContent'
  };

  export type DestinationTranslationScalarFieldEnum = (typeof DestinationTranslationScalarFieldEnum)[keyof typeof DestinationTranslationScalarFieldEnum]


  export const DestinationCategoryScalarFieldEnum: {
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

  export type DestinationCategoryScalarFieldEnum = (typeof DestinationCategoryScalarFieldEnum)[keyof typeof DestinationCategoryScalarFieldEnum]


  export const HotelScalarFieldEnum: {
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

  export type HotelScalarFieldEnum = (typeof HotelScalarFieldEnum)[keyof typeof HotelScalarFieldEnum]


  export const PackageScalarFieldEnum: {
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

  export type PackageScalarFieldEnum = (typeof PackageScalarFieldEnum)[keyof typeof PackageScalarFieldEnum]


  export const PackageDestinationScalarFieldEnum: {
    packageId: 'packageId',
    destinationId: 'destinationId',
    isPrimary: 'isPrimary',
    sortOrder: 'sortOrder',
    nights: 'nights'
  };

  export type PackageDestinationScalarFieldEnum = (typeof PackageDestinationScalarFieldEnum)[keyof typeof PackageDestinationScalarFieldEnum]


  export const PackageHotelScalarFieldEnum: {
    packageId: 'packageId',
    hotelId: 'hotelId',
    nights: 'nights',
    sortOrder: 'sortOrder'
  };

  export type PackageHotelScalarFieldEnum = (typeof PackageHotelScalarFieldEnum)[keyof typeof PackageHotelScalarFieldEnum]


  export const PackageCategoryScalarFieldEnum: {
    packageId: 'packageId',
    categoryId: 'categoryId',
    sortOrder: 'sortOrder'
  };

  export type PackageCategoryScalarFieldEnum = (typeof PackageCategoryScalarFieldEnum)[keyof typeof PackageCategoryScalarFieldEnum]


  export const GuideScalarFieldEnum: {
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

  export type GuideScalarFieldEnum = (typeof GuideScalarFieldEnum)[keyof typeof GuideScalarFieldEnum]


  export const FerryRouteScalarFieldEnum: {
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

  export type FerryRouteScalarFieldEnum = (typeof FerryRouteScalarFieldEnum)[keyof typeof FerryRouteScalarFieldEnum]


  export const FlightRouteScalarFieldEnum: {
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

  export type FlightRouteScalarFieldEnum = (typeof FlightRouteScalarFieldEnum)[keyof typeof FlightRouteScalarFieldEnum]


  export const SlugHistoryScalarFieldEnum: {
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

  export type SlugHistoryScalarFieldEnum = (typeof SlugHistoryScalarFieldEnum)[keyof typeof SlugHistoryScalarFieldEnum]


  export const RedirectScalarFieldEnum: {
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

  export type RedirectScalarFieldEnum = (typeof RedirectScalarFieldEnum)[keyof typeof RedirectScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'BigInt[]'
   */
  export type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DestinationLevel'
   */
  export type EnumDestinationLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DestinationLevel'>
    


  /**
   * Reference to a field of type 'DestinationLevel[]'
   */
  export type ListEnumDestinationLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DestinationLevel[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DestinationStatus'
   */
  export type EnumDestinationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DestinationStatus'>
    


  /**
   * Reference to a field of type 'DestinationStatus[]'
   */
  export type ListEnumDestinationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DestinationStatus[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'SluggableEntity'
   */
  export type EnumSluggableEntityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SluggableEntity'>
    


  /**
   * Reference to a field of type 'SluggableEntity[]'
   */
  export type ListEnumSluggableEntityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SluggableEntity[]'>
    


  /**
   * Reference to a field of type 'RedirectSource'
   */
  export type EnumRedirectSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RedirectSource'>
    


  /**
   * Reference to a field of type 'RedirectSource[]'
   */
  export type ListEnumRedirectSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RedirectSource[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type DestinationWhereInput = {
    AND?: DestinationWhereInput | DestinationWhereInput[]
    OR?: DestinationWhereInput[]
    NOT?: DestinationWhereInput | DestinationWhereInput[]
    id?: BigIntFilter<"Destination"> | bigint | number
    parentId?: BigIntNullableFilter<"Destination"> | bigint | number | null
    name?: StringFilter<"Destination"> | string
    slug?: StringFilter<"Destination"> | string
    slugPath?: StringFilter<"Destination"> | string
    level?: EnumDestinationLevelFilter<"Destination"> | $Enums.DestinationLevel
    depth?: IntFilter<"Destination"> | number
    metaTitle?: StringNullableFilter<"Destination"> | string | null
    metaDescription?: StringNullableFilter<"Destination"> | string | null
    seoContent?: StringNullableFilter<"Destination"> | string | null
    imageUrl?: StringNullableFilter<"Destination"> | string | null
    heroImageUrl?: StringNullableFilter<"Destination"> | string | null
    gallery?: StringNullableListFilter<"Destination">
    sortOrder?: IntFilter<"Destination"> | number
    status?: EnumDestinationStatusFilter<"Destination"> | $Enums.DestinationStatus
    isFeatured?: BoolFilter<"Destination"> | boolean
    createdAt?: DateTimeFilter<"Destination"> | Date | string
    updatedAt?: DateTimeFilter<"Destination"> | Date | string
    publishedAt?: DateTimeNullableFilter<"Destination"> | Date | string | null
    parent?: XOR<DestinationNullableRelationFilter, DestinationWhereInput> | null
    children?: DestinationListRelationFilter
    translations?: DestinationTranslationListRelationFilter
    categories?: DestinationCategoryListRelationFilter
    hotels?: HotelListRelationFilter
    guides?: GuideListRelationFilter
    ferryRoutes?: FerryRouteListRelationFilter
    flightRoutes?: FlightRouteListRelationFilter
    packageLinks?: PackageDestinationListRelationFilter
  }

  export type DestinationOrderByWithRelationInput = {
    id?: SortOrder
    parentId?: SortOrderInput | SortOrder
    name?: SortOrder
    slug?: SortOrder
    slugPath?: SortOrder
    level?: SortOrder
    depth?: SortOrder
    metaTitle?: SortOrderInput | SortOrder
    metaDescription?: SortOrderInput | SortOrder
    seoContent?: SortOrderInput | SortOrder
    imageUrl?: SortOrderInput | SortOrder
    heroImageUrl?: SortOrderInput | SortOrder
    gallery?: SortOrder
    sortOrder?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    parent?: DestinationOrderByWithRelationInput
    children?: DestinationOrderByRelationAggregateInput
    translations?: DestinationTranslationOrderByRelationAggregateInput
    categories?: DestinationCategoryOrderByRelationAggregateInput
    hotels?: HotelOrderByRelationAggregateInput
    guides?: GuideOrderByRelationAggregateInput
    ferryRoutes?: FerryRouteOrderByRelationAggregateInput
    flightRoutes?: FlightRouteOrderByRelationAggregateInput
    packageLinks?: PackageDestinationOrderByRelationAggregateInput
  }

  export type DestinationWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    slugPath?: string
    AND?: DestinationWhereInput | DestinationWhereInput[]
    OR?: DestinationWhereInput[]
    NOT?: DestinationWhereInput | DestinationWhereInput[]
    parentId?: BigIntNullableFilter<"Destination"> | bigint | number | null
    name?: StringFilter<"Destination"> | string
    slug?: StringFilter<"Destination"> | string
    level?: EnumDestinationLevelFilter<"Destination"> | $Enums.DestinationLevel
    depth?: IntFilter<"Destination"> | number
    metaTitle?: StringNullableFilter<"Destination"> | string | null
    metaDescription?: StringNullableFilter<"Destination"> | string | null
    seoContent?: StringNullableFilter<"Destination"> | string | null
    imageUrl?: StringNullableFilter<"Destination"> | string | null
    heroImageUrl?: StringNullableFilter<"Destination"> | string | null
    gallery?: StringNullableListFilter<"Destination">
    sortOrder?: IntFilter<"Destination"> | number
    status?: EnumDestinationStatusFilter<"Destination"> | $Enums.DestinationStatus
    isFeatured?: BoolFilter<"Destination"> | boolean
    createdAt?: DateTimeFilter<"Destination"> | Date | string
    updatedAt?: DateTimeFilter<"Destination"> | Date | string
    publishedAt?: DateTimeNullableFilter<"Destination"> | Date | string | null
    parent?: XOR<DestinationNullableRelationFilter, DestinationWhereInput> | null
    children?: DestinationListRelationFilter
    translations?: DestinationTranslationListRelationFilter
    categories?: DestinationCategoryListRelationFilter
    hotels?: HotelListRelationFilter
    guides?: GuideListRelationFilter
    ferryRoutes?: FerryRouteListRelationFilter
    flightRoutes?: FlightRouteListRelationFilter
    packageLinks?: PackageDestinationListRelationFilter
  }, "id" | "slugPath">

  export type DestinationOrderByWithAggregationInput = {
    id?: SortOrder
    parentId?: SortOrderInput | SortOrder
    name?: SortOrder
    slug?: SortOrder
    slugPath?: SortOrder
    level?: SortOrder
    depth?: SortOrder
    metaTitle?: SortOrderInput | SortOrder
    metaDescription?: SortOrderInput | SortOrder
    seoContent?: SortOrderInput | SortOrder
    imageUrl?: SortOrderInput | SortOrder
    heroImageUrl?: SortOrderInput | SortOrder
    gallery?: SortOrder
    sortOrder?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    _count?: DestinationCountOrderByAggregateInput
    _avg?: DestinationAvgOrderByAggregateInput
    _max?: DestinationMaxOrderByAggregateInput
    _min?: DestinationMinOrderByAggregateInput
    _sum?: DestinationSumOrderByAggregateInput
  }

  export type DestinationScalarWhereWithAggregatesInput = {
    AND?: DestinationScalarWhereWithAggregatesInput | DestinationScalarWhereWithAggregatesInput[]
    OR?: DestinationScalarWhereWithAggregatesInput[]
    NOT?: DestinationScalarWhereWithAggregatesInput | DestinationScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"Destination"> | bigint | number
    parentId?: BigIntNullableWithAggregatesFilter<"Destination"> | bigint | number | null
    name?: StringWithAggregatesFilter<"Destination"> | string
    slug?: StringWithAggregatesFilter<"Destination"> | string
    slugPath?: StringWithAggregatesFilter<"Destination"> | string
    level?: EnumDestinationLevelWithAggregatesFilter<"Destination"> | $Enums.DestinationLevel
    depth?: IntWithAggregatesFilter<"Destination"> | number
    metaTitle?: StringNullableWithAggregatesFilter<"Destination"> | string | null
    metaDescription?: StringNullableWithAggregatesFilter<"Destination"> | string | null
    seoContent?: StringNullableWithAggregatesFilter<"Destination"> | string | null
    imageUrl?: StringNullableWithAggregatesFilter<"Destination"> | string | null
    heroImageUrl?: StringNullableWithAggregatesFilter<"Destination"> | string | null
    gallery?: StringNullableListFilter<"Destination">
    sortOrder?: IntWithAggregatesFilter<"Destination"> | number
    status?: EnumDestinationStatusWithAggregatesFilter<"Destination"> | $Enums.DestinationStatus
    isFeatured?: BoolWithAggregatesFilter<"Destination"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Destination"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Destination"> | Date | string
    publishedAt?: DateTimeNullableWithAggregatesFilter<"Destination"> | Date | string | null
  }

  export type DestinationTranslationWhereInput = {
    AND?: DestinationTranslationWhereInput | DestinationTranslationWhereInput[]
    OR?: DestinationTranslationWhereInput[]
    NOT?: DestinationTranslationWhereInput | DestinationTranslationWhereInput[]
    destinationId?: BigIntFilter<"DestinationTranslation"> | bigint | number
    locale?: StringFilter<"DestinationTranslation"> | string
    name?: StringFilter<"DestinationTranslation"> | string
    slug?: StringFilter<"DestinationTranslation"> | string
    metaTitle?: StringNullableFilter<"DestinationTranslation"> | string | null
    metaDescription?: StringNullableFilter<"DestinationTranslation"> | string | null
    seoContent?: StringNullableFilter<"DestinationTranslation"> | string | null
    destination?: XOR<DestinationRelationFilter, DestinationWhereInput>
  }

  export type DestinationTranslationOrderByWithRelationInput = {
    destinationId?: SortOrder
    locale?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    metaTitle?: SortOrderInput | SortOrder
    metaDescription?: SortOrderInput | SortOrder
    seoContent?: SortOrderInput | SortOrder
    destination?: DestinationOrderByWithRelationInput
  }

  export type DestinationTranslationWhereUniqueInput = Prisma.AtLeast<{
    locale_slug?: DestinationTranslationLocaleSlugCompoundUniqueInput
    destinationId_locale?: DestinationTranslationDestinationIdLocaleCompoundUniqueInput
    AND?: DestinationTranslationWhereInput | DestinationTranslationWhereInput[]
    OR?: DestinationTranslationWhereInput[]
    NOT?: DestinationTranslationWhereInput | DestinationTranslationWhereInput[]
    destinationId?: BigIntFilter<"DestinationTranslation"> | bigint | number
    locale?: StringFilter<"DestinationTranslation"> | string
    name?: StringFilter<"DestinationTranslation"> | string
    slug?: StringFilter<"DestinationTranslation"> | string
    metaTitle?: StringNullableFilter<"DestinationTranslation"> | string | null
    metaDescription?: StringNullableFilter<"DestinationTranslation"> | string | null
    seoContent?: StringNullableFilter<"DestinationTranslation"> | string | null
    destination?: XOR<DestinationRelationFilter, DestinationWhereInput>
  }, "destinationId_locale" | "locale_slug">

  export type DestinationTranslationOrderByWithAggregationInput = {
    destinationId?: SortOrder
    locale?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    metaTitle?: SortOrderInput | SortOrder
    metaDescription?: SortOrderInput | SortOrder
    seoContent?: SortOrderInput | SortOrder
    _count?: DestinationTranslationCountOrderByAggregateInput
    _avg?: DestinationTranslationAvgOrderByAggregateInput
    _max?: DestinationTranslationMaxOrderByAggregateInput
    _min?: DestinationTranslationMinOrderByAggregateInput
    _sum?: DestinationTranslationSumOrderByAggregateInput
  }

  export type DestinationTranslationScalarWhereWithAggregatesInput = {
    AND?: DestinationTranslationScalarWhereWithAggregatesInput | DestinationTranslationScalarWhereWithAggregatesInput[]
    OR?: DestinationTranslationScalarWhereWithAggregatesInput[]
    NOT?: DestinationTranslationScalarWhereWithAggregatesInput | DestinationTranslationScalarWhereWithAggregatesInput[]
    destinationId?: BigIntWithAggregatesFilter<"DestinationTranslation"> | bigint | number
    locale?: StringWithAggregatesFilter<"DestinationTranslation"> | string
    name?: StringWithAggregatesFilter<"DestinationTranslation"> | string
    slug?: StringWithAggregatesFilter<"DestinationTranslation"> | string
    metaTitle?: StringNullableWithAggregatesFilter<"DestinationTranslation"> | string | null
    metaDescription?: StringNullableWithAggregatesFilter<"DestinationTranslation"> | string | null
    seoContent?: StringNullableWithAggregatesFilter<"DestinationTranslation"> | string | null
  }

  export type DestinationCategoryWhereInput = {
    AND?: DestinationCategoryWhereInput | DestinationCategoryWhereInput[]
    OR?: DestinationCategoryWhereInput[]
    NOT?: DestinationCategoryWhereInput | DestinationCategoryWhereInput[]
    id?: BigIntFilter<"DestinationCategory"> | bigint | number
    destinationId?: BigIntFilter<"DestinationCategory"> | bigint | number
    name?: StringFilter<"DestinationCategory"> | string
    slug?: StringFilter<"DestinationCategory"> | string
    description?: StringNullableFilter<"DestinationCategory"> | string | null
    metaTitle?: StringNullableFilter<"DestinationCategory"> | string | null
    metaDescription?: StringNullableFilter<"DestinationCategory"> | string | null
    seoContent?: StringNullableFilter<"DestinationCategory"> | string | null
    heroImageUrl?: StringNullableFilter<"DestinationCategory"> | string | null
    sortOrder?: IntFilter<"DestinationCategory"> | number
    status?: EnumDestinationStatusFilter<"DestinationCategory"> | $Enums.DestinationStatus
    isFeatured?: BoolFilter<"DestinationCategory"> | boolean
    createdAt?: DateTimeFilter<"DestinationCategory"> | Date | string
    updatedAt?: DateTimeFilter<"DestinationCategory"> | Date | string
    publishedAt?: DateTimeNullableFilter<"DestinationCategory"> | Date | string | null
    destination?: XOR<DestinationRelationFilter, DestinationWhereInput>
    packageLinks?: PackageCategoryListRelationFilter
  }

  export type DestinationCategoryOrderByWithRelationInput = {
    id?: SortOrder
    destinationId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrderInput | SortOrder
    metaTitle?: SortOrderInput | SortOrder
    metaDescription?: SortOrderInput | SortOrder
    seoContent?: SortOrderInput | SortOrder
    heroImageUrl?: SortOrderInput | SortOrder
    sortOrder?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    destination?: DestinationOrderByWithRelationInput
    packageLinks?: PackageCategoryOrderByRelationAggregateInput
  }

  export type DestinationCategoryWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    destinationId_slug?: DestinationCategoryDestinationIdSlugCompoundUniqueInput
    AND?: DestinationCategoryWhereInput | DestinationCategoryWhereInput[]
    OR?: DestinationCategoryWhereInput[]
    NOT?: DestinationCategoryWhereInput | DestinationCategoryWhereInput[]
    destinationId?: BigIntFilter<"DestinationCategory"> | bigint | number
    name?: StringFilter<"DestinationCategory"> | string
    slug?: StringFilter<"DestinationCategory"> | string
    description?: StringNullableFilter<"DestinationCategory"> | string | null
    metaTitle?: StringNullableFilter<"DestinationCategory"> | string | null
    metaDescription?: StringNullableFilter<"DestinationCategory"> | string | null
    seoContent?: StringNullableFilter<"DestinationCategory"> | string | null
    heroImageUrl?: StringNullableFilter<"DestinationCategory"> | string | null
    sortOrder?: IntFilter<"DestinationCategory"> | number
    status?: EnumDestinationStatusFilter<"DestinationCategory"> | $Enums.DestinationStatus
    isFeatured?: BoolFilter<"DestinationCategory"> | boolean
    createdAt?: DateTimeFilter<"DestinationCategory"> | Date | string
    updatedAt?: DateTimeFilter<"DestinationCategory"> | Date | string
    publishedAt?: DateTimeNullableFilter<"DestinationCategory"> | Date | string | null
    destination?: XOR<DestinationRelationFilter, DestinationWhereInput>
    packageLinks?: PackageCategoryListRelationFilter
  }, "id" | "destinationId_slug">

  export type DestinationCategoryOrderByWithAggregationInput = {
    id?: SortOrder
    destinationId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrderInput | SortOrder
    metaTitle?: SortOrderInput | SortOrder
    metaDescription?: SortOrderInput | SortOrder
    seoContent?: SortOrderInput | SortOrder
    heroImageUrl?: SortOrderInput | SortOrder
    sortOrder?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    _count?: DestinationCategoryCountOrderByAggregateInput
    _avg?: DestinationCategoryAvgOrderByAggregateInput
    _max?: DestinationCategoryMaxOrderByAggregateInput
    _min?: DestinationCategoryMinOrderByAggregateInput
    _sum?: DestinationCategorySumOrderByAggregateInput
  }

  export type DestinationCategoryScalarWhereWithAggregatesInput = {
    AND?: DestinationCategoryScalarWhereWithAggregatesInput | DestinationCategoryScalarWhereWithAggregatesInput[]
    OR?: DestinationCategoryScalarWhereWithAggregatesInput[]
    NOT?: DestinationCategoryScalarWhereWithAggregatesInput | DestinationCategoryScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"DestinationCategory"> | bigint | number
    destinationId?: BigIntWithAggregatesFilter<"DestinationCategory"> | bigint | number
    name?: StringWithAggregatesFilter<"DestinationCategory"> | string
    slug?: StringWithAggregatesFilter<"DestinationCategory"> | string
    description?: StringNullableWithAggregatesFilter<"DestinationCategory"> | string | null
    metaTitle?: StringNullableWithAggregatesFilter<"DestinationCategory"> | string | null
    metaDescription?: StringNullableWithAggregatesFilter<"DestinationCategory"> | string | null
    seoContent?: StringNullableWithAggregatesFilter<"DestinationCategory"> | string | null
    heroImageUrl?: StringNullableWithAggregatesFilter<"DestinationCategory"> | string | null
    sortOrder?: IntWithAggregatesFilter<"DestinationCategory"> | number
    status?: EnumDestinationStatusWithAggregatesFilter<"DestinationCategory"> | $Enums.DestinationStatus
    isFeatured?: BoolWithAggregatesFilter<"DestinationCategory"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"DestinationCategory"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"DestinationCategory"> | Date | string
    publishedAt?: DateTimeNullableWithAggregatesFilter<"DestinationCategory"> | Date | string | null
  }

  export type HotelWhereInput = {
    AND?: HotelWhereInput | HotelWhereInput[]
    OR?: HotelWhereInput[]
    NOT?: HotelWhereInput | HotelWhereInput[]
    id?: BigIntFilter<"Hotel"> | bigint | number
    destinationId?: BigIntFilter<"Hotel"> | bigint | number
    name?: StringFilter<"Hotel"> | string
    slug?: StringFilter<"Hotel"> | string
    starRating?: IntNullableFilter<"Hotel"> | number | null
    shortDescription?: StringNullableFilter<"Hotel"> | string | null
    heroImageUrl?: StringNullableFilter<"Hotel"> | string | null
    gallery?: StringNullableListFilter<"Hotel">
    metaTitle?: StringNullableFilter<"Hotel"> | string | null
    metaDescription?: StringNullableFilter<"Hotel"> | string | null
    seoContent?: StringNullableFilter<"Hotel"> | string | null
    status?: EnumDestinationStatusFilter<"Hotel"> | $Enums.DestinationStatus
    isFeatured?: BoolFilter<"Hotel"> | boolean
    sortOrder?: IntFilter<"Hotel"> | number
    createdAt?: DateTimeFilter<"Hotel"> | Date | string
    updatedAt?: DateTimeFilter<"Hotel"> | Date | string
    publishedAt?: DateTimeNullableFilter<"Hotel"> | Date | string | null
    destination?: XOR<DestinationRelationFilter, DestinationWhereInput>
    packageLinks?: PackageHotelListRelationFilter
  }

  export type HotelOrderByWithRelationInput = {
    id?: SortOrder
    destinationId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    starRating?: SortOrderInput | SortOrder
    shortDescription?: SortOrderInput | SortOrder
    heroImageUrl?: SortOrderInput | SortOrder
    gallery?: SortOrder
    metaTitle?: SortOrderInput | SortOrder
    metaDescription?: SortOrderInput | SortOrder
    seoContent?: SortOrderInput | SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    destination?: DestinationOrderByWithRelationInput
    packageLinks?: PackageHotelOrderByRelationAggregateInput
  }

  export type HotelWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    slug?: string
    AND?: HotelWhereInput | HotelWhereInput[]
    OR?: HotelWhereInput[]
    NOT?: HotelWhereInput | HotelWhereInput[]
    destinationId?: BigIntFilter<"Hotel"> | bigint | number
    name?: StringFilter<"Hotel"> | string
    starRating?: IntNullableFilter<"Hotel"> | number | null
    shortDescription?: StringNullableFilter<"Hotel"> | string | null
    heroImageUrl?: StringNullableFilter<"Hotel"> | string | null
    gallery?: StringNullableListFilter<"Hotel">
    metaTitle?: StringNullableFilter<"Hotel"> | string | null
    metaDescription?: StringNullableFilter<"Hotel"> | string | null
    seoContent?: StringNullableFilter<"Hotel"> | string | null
    status?: EnumDestinationStatusFilter<"Hotel"> | $Enums.DestinationStatus
    isFeatured?: BoolFilter<"Hotel"> | boolean
    sortOrder?: IntFilter<"Hotel"> | number
    createdAt?: DateTimeFilter<"Hotel"> | Date | string
    updatedAt?: DateTimeFilter<"Hotel"> | Date | string
    publishedAt?: DateTimeNullableFilter<"Hotel"> | Date | string | null
    destination?: XOR<DestinationRelationFilter, DestinationWhereInput>
    packageLinks?: PackageHotelListRelationFilter
  }, "id" | "slug">

  export type HotelOrderByWithAggregationInput = {
    id?: SortOrder
    destinationId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    starRating?: SortOrderInput | SortOrder
    shortDescription?: SortOrderInput | SortOrder
    heroImageUrl?: SortOrderInput | SortOrder
    gallery?: SortOrder
    metaTitle?: SortOrderInput | SortOrder
    metaDescription?: SortOrderInput | SortOrder
    seoContent?: SortOrderInput | SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    _count?: HotelCountOrderByAggregateInput
    _avg?: HotelAvgOrderByAggregateInput
    _max?: HotelMaxOrderByAggregateInput
    _min?: HotelMinOrderByAggregateInput
    _sum?: HotelSumOrderByAggregateInput
  }

  export type HotelScalarWhereWithAggregatesInput = {
    AND?: HotelScalarWhereWithAggregatesInput | HotelScalarWhereWithAggregatesInput[]
    OR?: HotelScalarWhereWithAggregatesInput[]
    NOT?: HotelScalarWhereWithAggregatesInput | HotelScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"Hotel"> | bigint | number
    destinationId?: BigIntWithAggregatesFilter<"Hotel"> | bigint | number
    name?: StringWithAggregatesFilter<"Hotel"> | string
    slug?: StringWithAggregatesFilter<"Hotel"> | string
    starRating?: IntNullableWithAggregatesFilter<"Hotel"> | number | null
    shortDescription?: StringNullableWithAggregatesFilter<"Hotel"> | string | null
    heroImageUrl?: StringNullableWithAggregatesFilter<"Hotel"> | string | null
    gallery?: StringNullableListFilter<"Hotel">
    metaTitle?: StringNullableWithAggregatesFilter<"Hotel"> | string | null
    metaDescription?: StringNullableWithAggregatesFilter<"Hotel"> | string | null
    seoContent?: StringNullableWithAggregatesFilter<"Hotel"> | string | null
    status?: EnumDestinationStatusWithAggregatesFilter<"Hotel"> | $Enums.DestinationStatus
    isFeatured?: BoolWithAggregatesFilter<"Hotel"> | boolean
    sortOrder?: IntWithAggregatesFilter<"Hotel"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Hotel"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Hotel"> | Date | string
    publishedAt?: DateTimeNullableWithAggregatesFilter<"Hotel"> | Date | string | null
  }

  export type PackageWhereInput = {
    AND?: PackageWhereInput | PackageWhereInput[]
    OR?: PackageWhereInput[]
    NOT?: PackageWhereInput | PackageWhereInput[]
    id?: BigIntFilter<"Package"> | bigint | number
    title?: StringFilter<"Package"> | string
    slug?: StringFilter<"Package"> | string
    shortDescription?: StringNullableFilter<"Package"> | string | null
    durationDays?: IntNullableFilter<"Package"> | number | null
    durationNights?: IntNullableFilter<"Package"> | number | null
    startingPrice?: IntNullableFilter<"Package"> | number | null
    currency?: StringFilter<"Package"> | string
    heroImageUrl?: StringNullableFilter<"Package"> | string | null
    gallery?: StringNullableListFilter<"Package">
    metaTitle?: StringNullableFilter<"Package"> | string | null
    metaDescription?: StringNullableFilter<"Package"> | string | null
    seoContent?: StringNullableFilter<"Package"> | string | null
    status?: EnumDestinationStatusFilter<"Package"> | $Enums.DestinationStatus
    isFeatured?: BoolFilter<"Package"> | boolean
    sortOrder?: IntFilter<"Package"> | number
    createdAt?: DateTimeFilter<"Package"> | Date | string
    updatedAt?: DateTimeFilter<"Package"> | Date | string
    publishedAt?: DateTimeNullableFilter<"Package"> | Date | string | null
    destinations?: PackageDestinationListRelationFilter
    hotels?: PackageHotelListRelationFilter
    categories?: PackageCategoryListRelationFilter
  }

  export type PackageOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    shortDescription?: SortOrderInput | SortOrder
    durationDays?: SortOrderInput | SortOrder
    durationNights?: SortOrderInput | SortOrder
    startingPrice?: SortOrderInput | SortOrder
    currency?: SortOrder
    heroImageUrl?: SortOrderInput | SortOrder
    gallery?: SortOrder
    metaTitle?: SortOrderInput | SortOrder
    metaDescription?: SortOrderInput | SortOrder
    seoContent?: SortOrderInput | SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    destinations?: PackageDestinationOrderByRelationAggregateInput
    hotels?: PackageHotelOrderByRelationAggregateInput
    categories?: PackageCategoryOrderByRelationAggregateInput
  }

  export type PackageWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    slug?: string
    AND?: PackageWhereInput | PackageWhereInput[]
    OR?: PackageWhereInput[]
    NOT?: PackageWhereInput | PackageWhereInput[]
    title?: StringFilter<"Package"> | string
    shortDescription?: StringNullableFilter<"Package"> | string | null
    durationDays?: IntNullableFilter<"Package"> | number | null
    durationNights?: IntNullableFilter<"Package"> | number | null
    startingPrice?: IntNullableFilter<"Package"> | number | null
    currency?: StringFilter<"Package"> | string
    heroImageUrl?: StringNullableFilter<"Package"> | string | null
    gallery?: StringNullableListFilter<"Package">
    metaTitle?: StringNullableFilter<"Package"> | string | null
    metaDescription?: StringNullableFilter<"Package"> | string | null
    seoContent?: StringNullableFilter<"Package"> | string | null
    status?: EnumDestinationStatusFilter<"Package"> | $Enums.DestinationStatus
    isFeatured?: BoolFilter<"Package"> | boolean
    sortOrder?: IntFilter<"Package"> | number
    createdAt?: DateTimeFilter<"Package"> | Date | string
    updatedAt?: DateTimeFilter<"Package"> | Date | string
    publishedAt?: DateTimeNullableFilter<"Package"> | Date | string | null
    destinations?: PackageDestinationListRelationFilter
    hotels?: PackageHotelListRelationFilter
    categories?: PackageCategoryListRelationFilter
  }, "id" | "slug">

  export type PackageOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    shortDescription?: SortOrderInput | SortOrder
    durationDays?: SortOrderInput | SortOrder
    durationNights?: SortOrderInput | SortOrder
    startingPrice?: SortOrderInput | SortOrder
    currency?: SortOrder
    heroImageUrl?: SortOrderInput | SortOrder
    gallery?: SortOrder
    metaTitle?: SortOrderInput | SortOrder
    metaDescription?: SortOrderInput | SortOrder
    seoContent?: SortOrderInput | SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    _count?: PackageCountOrderByAggregateInput
    _avg?: PackageAvgOrderByAggregateInput
    _max?: PackageMaxOrderByAggregateInput
    _min?: PackageMinOrderByAggregateInput
    _sum?: PackageSumOrderByAggregateInput
  }

  export type PackageScalarWhereWithAggregatesInput = {
    AND?: PackageScalarWhereWithAggregatesInput | PackageScalarWhereWithAggregatesInput[]
    OR?: PackageScalarWhereWithAggregatesInput[]
    NOT?: PackageScalarWhereWithAggregatesInput | PackageScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"Package"> | bigint | number
    title?: StringWithAggregatesFilter<"Package"> | string
    slug?: StringWithAggregatesFilter<"Package"> | string
    shortDescription?: StringNullableWithAggregatesFilter<"Package"> | string | null
    durationDays?: IntNullableWithAggregatesFilter<"Package"> | number | null
    durationNights?: IntNullableWithAggregatesFilter<"Package"> | number | null
    startingPrice?: IntNullableWithAggregatesFilter<"Package"> | number | null
    currency?: StringWithAggregatesFilter<"Package"> | string
    heroImageUrl?: StringNullableWithAggregatesFilter<"Package"> | string | null
    gallery?: StringNullableListFilter<"Package">
    metaTitle?: StringNullableWithAggregatesFilter<"Package"> | string | null
    metaDescription?: StringNullableWithAggregatesFilter<"Package"> | string | null
    seoContent?: StringNullableWithAggregatesFilter<"Package"> | string | null
    status?: EnumDestinationStatusWithAggregatesFilter<"Package"> | $Enums.DestinationStatus
    isFeatured?: BoolWithAggregatesFilter<"Package"> | boolean
    sortOrder?: IntWithAggregatesFilter<"Package"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Package"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Package"> | Date | string
    publishedAt?: DateTimeNullableWithAggregatesFilter<"Package"> | Date | string | null
  }

  export type PackageDestinationWhereInput = {
    AND?: PackageDestinationWhereInput | PackageDestinationWhereInput[]
    OR?: PackageDestinationWhereInput[]
    NOT?: PackageDestinationWhereInput | PackageDestinationWhereInput[]
    packageId?: BigIntFilter<"PackageDestination"> | bigint | number
    destinationId?: BigIntFilter<"PackageDestination"> | bigint | number
    isPrimary?: BoolFilter<"PackageDestination"> | boolean
    sortOrder?: IntFilter<"PackageDestination"> | number
    nights?: IntNullableFilter<"PackageDestination"> | number | null
    package?: XOR<PackageRelationFilter, PackageWhereInput>
    destination?: XOR<DestinationRelationFilter, DestinationWhereInput>
  }

  export type PackageDestinationOrderByWithRelationInput = {
    packageId?: SortOrder
    destinationId?: SortOrder
    isPrimary?: SortOrder
    sortOrder?: SortOrder
    nights?: SortOrderInput | SortOrder
    package?: PackageOrderByWithRelationInput
    destination?: DestinationOrderByWithRelationInput
  }

  export type PackageDestinationWhereUniqueInput = Prisma.AtLeast<{
    packageId_destinationId?: PackageDestinationPackageIdDestinationIdCompoundUniqueInput
    AND?: PackageDestinationWhereInput | PackageDestinationWhereInput[]
    OR?: PackageDestinationWhereInput[]
    NOT?: PackageDestinationWhereInput | PackageDestinationWhereInput[]
    packageId?: BigIntFilter<"PackageDestination"> | bigint | number
    destinationId?: BigIntFilter<"PackageDestination"> | bigint | number
    isPrimary?: BoolFilter<"PackageDestination"> | boolean
    sortOrder?: IntFilter<"PackageDestination"> | number
    nights?: IntNullableFilter<"PackageDestination"> | number | null
    package?: XOR<PackageRelationFilter, PackageWhereInput>
    destination?: XOR<DestinationRelationFilter, DestinationWhereInput>
  }, "packageId_destinationId">

  export type PackageDestinationOrderByWithAggregationInput = {
    packageId?: SortOrder
    destinationId?: SortOrder
    isPrimary?: SortOrder
    sortOrder?: SortOrder
    nights?: SortOrderInput | SortOrder
    _count?: PackageDestinationCountOrderByAggregateInput
    _avg?: PackageDestinationAvgOrderByAggregateInput
    _max?: PackageDestinationMaxOrderByAggregateInput
    _min?: PackageDestinationMinOrderByAggregateInput
    _sum?: PackageDestinationSumOrderByAggregateInput
  }

  export type PackageDestinationScalarWhereWithAggregatesInput = {
    AND?: PackageDestinationScalarWhereWithAggregatesInput | PackageDestinationScalarWhereWithAggregatesInput[]
    OR?: PackageDestinationScalarWhereWithAggregatesInput[]
    NOT?: PackageDestinationScalarWhereWithAggregatesInput | PackageDestinationScalarWhereWithAggregatesInput[]
    packageId?: BigIntWithAggregatesFilter<"PackageDestination"> | bigint | number
    destinationId?: BigIntWithAggregatesFilter<"PackageDestination"> | bigint | number
    isPrimary?: BoolWithAggregatesFilter<"PackageDestination"> | boolean
    sortOrder?: IntWithAggregatesFilter<"PackageDestination"> | number
    nights?: IntNullableWithAggregatesFilter<"PackageDestination"> | number | null
  }

  export type PackageHotelWhereInput = {
    AND?: PackageHotelWhereInput | PackageHotelWhereInput[]
    OR?: PackageHotelWhereInput[]
    NOT?: PackageHotelWhereInput | PackageHotelWhereInput[]
    packageId?: BigIntFilter<"PackageHotel"> | bigint | number
    hotelId?: BigIntFilter<"PackageHotel"> | bigint | number
    nights?: IntNullableFilter<"PackageHotel"> | number | null
    sortOrder?: IntFilter<"PackageHotel"> | number
    package?: XOR<PackageRelationFilter, PackageWhereInput>
    hotel?: XOR<HotelRelationFilter, HotelWhereInput>
  }

  export type PackageHotelOrderByWithRelationInput = {
    packageId?: SortOrder
    hotelId?: SortOrder
    nights?: SortOrderInput | SortOrder
    sortOrder?: SortOrder
    package?: PackageOrderByWithRelationInput
    hotel?: HotelOrderByWithRelationInput
  }

  export type PackageHotelWhereUniqueInput = Prisma.AtLeast<{
    packageId_hotelId?: PackageHotelPackageIdHotelIdCompoundUniqueInput
    AND?: PackageHotelWhereInput | PackageHotelWhereInput[]
    OR?: PackageHotelWhereInput[]
    NOT?: PackageHotelWhereInput | PackageHotelWhereInput[]
    packageId?: BigIntFilter<"PackageHotel"> | bigint | number
    hotelId?: BigIntFilter<"PackageHotel"> | bigint | number
    nights?: IntNullableFilter<"PackageHotel"> | number | null
    sortOrder?: IntFilter<"PackageHotel"> | number
    package?: XOR<PackageRelationFilter, PackageWhereInput>
    hotel?: XOR<HotelRelationFilter, HotelWhereInput>
  }, "packageId_hotelId">

  export type PackageHotelOrderByWithAggregationInput = {
    packageId?: SortOrder
    hotelId?: SortOrder
    nights?: SortOrderInput | SortOrder
    sortOrder?: SortOrder
    _count?: PackageHotelCountOrderByAggregateInput
    _avg?: PackageHotelAvgOrderByAggregateInput
    _max?: PackageHotelMaxOrderByAggregateInput
    _min?: PackageHotelMinOrderByAggregateInput
    _sum?: PackageHotelSumOrderByAggregateInput
  }

  export type PackageHotelScalarWhereWithAggregatesInput = {
    AND?: PackageHotelScalarWhereWithAggregatesInput | PackageHotelScalarWhereWithAggregatesInput[]
    OR?: PackageHotelScalarWhereWithAggregatesInput[]
    NOT?: PackageHotelScalarWhereWithAggregatesInput | PackageHotelScalarWhereWithAggregatesInput[]
    packageId?: BigIntWithAggregatesFilter<"PackageHotel"> | bigint | number
    hotelId?: BigIntWithAggregatesFilter<"PackageHotel"> | bigint | number
    nights?: IntNullableWithAggregatesFilter<"PackageHotel"> | number | null
    sortOrder?: IntWithAggregatesFilter<"PackageHotel"> | number
  }

  export type PackageCategoryWhereInput = {
    AND?: PackageCategoryWhereInput | PackageCategoryWhereInput[]
    OR?: PackageCategoryWhereInput[]
    NOT?: PackageCategoryWhereInput | PackageCategoryWhereInput[]
    packageId?: BigIntFilter<"PackageCategory"> | bigint | number
    categoryId?: BigIntFilter<"PackageCategory"> | bigint | number
    sortOrder?: IntFilter<"PackageCategory"> | number
    package?: XOR<PackageRelationFilter, PackageWhereInput>
    category?: XOR<DestinationCategoryRelationFilter, DestinationCategoryWhereInput>
  }

  export type PackageCategoryOrderByWithRelationInput = {
    packageId?: SortOrder
    categoryId?: SortOrder
    sortOrder?: SortOrder
    package?: PackageOrderByWithRelationInput
    category?: DestinationCategoryOrderByWithRelationInput
  }

  export type PackageCategoryWhereUniqueInput = Prisma.AtLeast<{
    packageId_categoryId?: PackageCategoryPackageIdCategoryIdCompoundUniqueInput
    AND?: PackageCategoryWhereInput | PackageCategoryWhereInput[]
    OR?: PackageCategoryWhereInput[]
    NOT?: PackageCategoryWhereInput | PackageCategoryWhereInput[]
    packageId?: BigIntFilter<"PackageCategory"> | bigint | number
    categoryId?: BigIntFilter<"PackageCategory"> | bigint | number
    sortOrder?: IntFilter<"PackageCategory"> | number
    package?: XOR<PackageRelationFilter, PackageWhereInput>
    category?: XOR<DestinationCategoryRelationFilter, DestinationCategoryWhereInput>
  }, "packageId_categoryId">

  export type PackageCategoryOrderByWithAggregationInput = {
    packageId?: SortOrder
    categoryId?: SortOrder
    sortOrder?: SortOrder
    _count?: PackageCategoryCountOrderByAggregateInput
    _avg?: PackageCategoryAvgOrderByAggregateInput
    _max?: PackageCategoryMaxOrderByAggregateInput
    _min?: PackageCategoryMinOrderByAggregateInput
    _sum?: PackageCategorySumOrderByAggregateInput
  }

  export type PackageCategoryScalarWhereWithAggregatesInput = {
    AND?: PackageCategoryScalarWhereWithAggregatesInput | PackageCategoryScalarWhereWithAggregatesInput[]
    OR?: PackageCategoryScalarWhereWithAggregatesInput[]
    NOT?: PackageCategoryScalarWhereWithAggregatesInput | PackageCategoryScalarWhereWithAggregatesInput[]
    packageId?: BigIntWithAggregatesFilter<"PackageCategory"> | bigint | number
    categoryId?: BigIntWithAggregatesFilter<"PackageCategory"> | bigint | number
    sortOrder?: IntWithAggregatesFilter<"PackageCategory"> | number
  }

  export type GuideWhereInput = {
    AND?: GuideWhereInput | GuideWhereInput[]
    OR?: GuideWhereInput[]
    NOT?: GuideWhereInput | GuideWhereInput[]
    id?: BigIntFilter<"Guide"> | bigint | number
    destinationId?: BigIntFilter<"Guide"> | bigint | number
    title?: StringFilter<"Guide"> | string
    slug?: StringFilter<"Guide"> | string
    excerpt?: StringNullableFilter<"Guide"> | string | null
    body?: StringNullableFilter<"Guide"> | string | null
    readingMinutes?: IntNullableFilter<"Guide"> | number | null
    heroImageUrl?: StringNullableFilter<"Guide"> | string | null
    metaTitle?: StringNullableFilter<"Guide"> | string | null
    metaDescription?: StringNullableFilter<"Guide"> | string | null
    status?: EnumDestinationStatusFilter<"Guide"> | $Enums.DestinationStatus
    isFeatured?: BoolFilter<"Guide"> | boolean
    sortOrder?: IntFilter<"Guide"> | number
    createdAt?: DateTimeFilter<"Guide"> | Date | string
    updatedAt?: DateTimeFilter<"Guide"> | Date | string
    publishedAt?: DateTimeNullableFilter<"Guide"> | Date | string | null
    destination?: XOR<DestinationRelationFilter, DestinationWhereInput>
  }

  export type GuideOrderByWithRelationInput = {
    id?: SortOrder
    destinationId?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    excerpt?: SortOrderInput | SortOrder
    body?: SortOrderInput | SortOrder
    readingMinutes?: SortOrderInput | SortOrder
    heroImageUrl?: SortOrderInput | SortOrder
    metaTitle?: SortOrderInput | SortOrder
    metaDescription?: SortOrderInput | SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    destination?: DestinationOrderByWithRelationInput
  }

  export type GuideWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    slug?: string
    AND?: GuideWhereInput | GuideWhereInput[]
    OR?: GuideWhereInput[]
    NOT?: GuideWhereInput | GuideWhereInput[]
    destinationId?: BigIntFilter<"Guide"> | bigint | number
    title?: StringFilter<"Guide"> | string
    excerpt?: StringNullableFilter<"Guide"> | string | null
    body?: StringNullableFilter<"Guide"> | string | null
    readingMinutes?: IntNullableFilter<"Guide"> | number | null
    heroImageUrl?: StringNullableFilter<"Guide"> | string | null
    metaTitle?: StringNullableFilter<"Guide"> | string | null
    metaDescription?: StringNullableFilter<"Guide"> | string | null
    status?: EnumDestinationStatusFilter<"Guide"> | $Enums.DestinationStatus
    isFeatured?: BoolFilter<"Guide"> | boolean
    sortOrder?: IntFilter<"Guide"> | number
    createdAt?: DateTimeFilter<"Guide"> | Date | string
    updatedAt?: DateTimeFilter<"Guide"> | Date | string
    publishedAt?: DateTimeNullableFilter<"Guide"> | Date | string | null
    destination?: XOR<DestinationRelationFilter, DestinationWhereInput>
  }, "id" | "slug">

  export type GuideOrderByWithAggregationInput = {
    id?: SortOrder
    destinationId?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    excerpt?: SortOrderInput | SortOrder
    body?: SortOrderInput | SortOrder
    readingMinutes?: SortOrderInput | SortOrder
    heroImageUrl?: SortOrderInput | SortOrder
    metaTitle?: SortOrderInput | SortOrder
    metaDescription?: SortOrderInput | SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    _count?: GuideCountOrderByAggregateInput
    _avg?: GuideAvgOrderByAggregateInput
    _max?: GuideMaxOrderByAggregateInput
    _min?: GuideMinOrderByAggregateInput
    _sum?: GuideSumOrderByAggregateInput
  }

  export type GuideScalarWhereWithAggregatesInput = {
    AND?: GuideScalarWhereWithAggregatesInput | GuideScalarWhereWithAggregatesInput[]
    OR?: GuideScalarWhereWithAggregatesInput[]
    NOT?: GuideScalarWhereWithAggregatesInput | GuideScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"Guide"> | bigint | number
    destinationId?: BigIntWithAggregatesFilter<"Guide"> | bigint | number
    title?: StringWithAggregatesFilter<"Guide"> | string
    slug?: StringWithAggregatesFilter<"Guide"> | string
    excerpt?: StringNullableWithAggregatesFilter<"Guide"> | string | null
    body?: StringNullableWithAggregatesFilter<"Guide"> | string | null
    readingMinutes?: IntNullableWithAggregatesFilter<"Guide"> | number | null
    heroImageUrl?: StringNullableWithAggregatesFilter<"Guide"> | string | null
    metaTitle?: StringNullableWithAggregatesFilter<"Guide"> | string | null
    metaDescription?: StringNullableWithAggregatesFilter<"Guide"> | string | null
    status?: EnumDestinationStatusWithAggregatesFilter<"Guide"> | $Enums.DestinationStatus
    isFeatured?: BoolWithAggregatesFilter<"Guide"> | boolean
    sortOrder?: IntWithAggregatesFilter<"Guide"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Guide"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Guide"> | Date | string
    publishedAt?: DateTimeNullableWithAggregatesFilter<"Guide"> | Date | string | null
  }

  export type FerryRouteWhereInput = {
    AND?: FerryRouteWhereInput | FerryRouteWhereInput[]
    OR?: FerryRouteWhereInput[]
    NOT?: FerryRouteWhereInput | FerryRouteWhereInput[]
    id?: BigIntFilter<"FerryRoute"> | bigint | number
    destinationId?: BigIntFilter<"FerryRoute"> | bigint | number
    name?: StringFilter<"FerryRoute"> | string
    slug?: StringFilter<"FerryRoute"> | string
    originName?: StringFilter<"FerryRoute"> | string
    destinationName?: StringFilter<"FerryRoute"> | string
    operatorName?: StringNullableFilter<"FerryRoute"> | string | null
    durationMinutes?: IntNullableFilter<"FerryRoute"> | number | null
    startingPrice?: IntNullableFilter<"FerryRoute"> | number | null
    currency?: StringFilter<"FerryRoute"> | string
    metaTitle?: StringNullableFilter<"FerryRoute"> | string | null
    metaDescription?: StringNullableFilter<"FerryRoute"> | string | null
    status?: EnumDestinationStatusFilter<"FerryRoute"> | $Enums.DestinationStatus
    isFeatured?: BoolFilter<"FerryRoute"> | boolean
    sortOrder?: IntFilter<"FerryRoute"> | number
    createdAt?: DateTimeFilter<"FerryRoute"> | Date | string
    updatedAt?: DateTimeFilter<"FerryRoute"> | Date | string
    destination?: XOR<DestinationRelationFilter, DestinationWhereInput>
  }

  export type FerryRouteOrderByWithRelationInput = {
    id?: SortOrder
    destinationId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    originName?: SortOrder
    destinationName?: SortOrder
    operatorName?: SortOrderInput | SortOrder
    durationMinutes?: SortOrderInput | SortOrder
    startingPrice?: SortOrderInput | SortOrder
    currency?: SortOrder
    metaTitle?: SortOrderInput | SortOrder
    metaDescription?: SortOrderInput | SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    destination?: DestinationOrderByWithRelationInput
  }

  export type FerryRouteWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    slug?: string
    AND?: FerryRouteWhereInput | FerryRouteWhereInput[]
    OR?: FerryRouteWhereInput[]
    NOT?: FerryRouteWhereInput | FerryRouteWhereInput[]
    destinationId?: BigIntFilter<"FerryRoute"> | bigint | number
    name?: StringFilter<"FerryRoute"> | string
    originName?: StringFilter<"FerryRoute"> | string
    destinationName?: StringFilter<"FerryRoute"> | string
    operatorName?: StringNullableFilter<"FerryRoute"> | string | null
    durationMinutes?: IntNullableFilter<"FerryRoute"> | number | null
    startingPrice?: IntNullableFilter<"FerryRoute"> | number | null
    currency?: StringFilter<"FerryRoute"> | string
    metaTitle?: StringNullableFilter<"FerryRoute"> | string | null
    metaDescription?: StringNullableFilter<"FerryRoute"> | string | null
    status?: EnumDestinationStatusFilter<"FerryRoute"> | $Enums.DestinationStatus
    isFeatured?: BoolFilter<"FerryRoute"> | boolean
    sortOrder?: IntFilter<"FerryRoute"> | number
    createdAt?: DateTimeFilter<"FerryRoute"> | Date | string
    updatedAt?: DateTimeFilter<"FerryRoute"> | Date | string
    destination?: XOR<DestinationRelationFilter, DestinationWhereInput>
  }, "id" | "slug">

  export type FerryRouteOrderByWithAggregationInput = {
    id?: SortOrder
    destinationId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    originName?: SortOrder
    destinationName?: SortOrder
    operatorName?: SortOrderInput | SortOrder
    durationMinutes?: SortOrderInput | SortOrder
    startingPrice?: SortOrderInput | SortOrder
    currency?: SortOrder
    metaTitle?: SortOrderInput | SortOrder
    metaDescription?: SortOrderInput | SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: FerryRouteCountOrderByAggregateInput
    _avg?: FerryRouteAvgOrderByAggregateInput
    _max?: FerryRouteMaxOrderByAggregateInput
    _min?: FerryRouteMinOrderByAggregateInput
    _sum?: FerryRouteSumOrderByAggregateInput
  }

  export type FerryRouteScalarWhereWithAggregatesInput = {
    AND?: FerryRouteScalarWhereWithAggregatesInput | FerryRouteScalarWhereWithAggregatesInput[]
    OR?: FerryRouteScalarWhereWithAggregatesInput[]
    NOT?: FerryRouteScalarWhereWithAggregatesInput | FerryRouteScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"FerryRoute"> | bigint | number
    destinationId?: BigIntWithAggregatesFilter<"FerryRoute"> | bigint | number
    name?: StringWithAggregatesFilter<"FerryRoute"> | string
    slug?: StringWithAggregatesFilter<"FerryRoute"> | string
    originName?: StringWithAggregatesFilter<"FerryRoute"> | string
    destinationName?: StringWithAggregatesFilter<"FerryRoute"> | string
    operatorName?: StringNullableWithAggregatesFilter<"FerryRoute"> | string | null
    durationMinutes?: IntNullableWithAggregatesFilter<"FerryRoute"> | number | null
    startingPrice?: IntNullableWithAggregatesFilter<"FerryRoute"> | number | null
    currency?: StringWithAggregatesFilter<"FerryRoute"> | string
    metaTitle?: StringNullableWithAggregatesFilter<"FerryRoute"> | string | null
    metaDescription?: StringNullableWithAggregatesFilter<"FerryRoute"> | string | null
    status?: EnumDestinationStatusWithAggregatesFilter<"FerryRoute"> | $Enums.DestinationStatus
    isFeatured?: BoolWithAggregatesFilter<"FerryRoute"> | boolean
    sortOrder?: IntWithAggregatesFilter<"FerryRoute"> | number
    createdAt?: DateTimeWithAggregatesFilter<"FerryRoute"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"FerryRoute"> | Date | string
  }

  export type FlightRouteWhereInput = {
    AND?: FlightRouteWhereInput | FlightRouteWhereInput[]
    OR?: FlightRouteWhereInput[]
    NOT?: FlightRouteWhereInput | FlightRouteWhereInput[]
    id?: BigIntFilter<"FlightRoute"> | bigint | number
    destinationId?: BigIntFilter<"FlightRoute"> | bigint | number
    name?: StringFilter<"FlightRoute"> | string
    slug?: StringFilter<"FlightRoute"> | string
    originIATA?: StringFilter<"FlightRoute"> | string
    destIATA?: StringFilter<"FlightRoute"> | string
    originCity?: StringFilter<"FlightRoute"> | string
    destCity?: StringFilter<"FlightRoute"> | string
    approxDurationMinutes?: IntNullableFilter<"FlightRoute"> | number | null
    startingPrice?: IntNullableFilter<"FlightRoute"> | number | null
    currency?: StringFilter<"FlightRoute"> | string
    metaTitle?: StringNullableFilter<"FlightRoute"> | string | null
    metaDescription?: StringNullableFilter<"FlightRoute"> | string | null
    status?: EnumDestinationStatusFilter<"FlightRoute"> | $Enums.DestinationStatus
    isFeatured?: BoolFilter<"FlightRoute"> | boolean
    sortOrder?: IntFilter<"FlightRoute"> | number
    createdAt?: DateTimeFilter<"FlightRoute"> | Date | string
    updatedAt?: DateTimeFilter<"FlightRoute"> | Date | string
    destination?: XOR<DestinationRelationFilter, DestinationWhereInput>
  }

  export type FlightRouteOrderByWithRelationInput = {
    id?: SortOrder
    destinationId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    originIATA?: SortOrder
    destIATA?: SortOrder
    originCity?: SortOrder
    destCity?: SortOrder
    approxDurationMinutes?: SortOrderInput | SortOrder
    startingPrice?: SortOrderInput | SortOrder
    currency?: SortOrder
    metaTitle?: SortOrderInput | SortOrder
    metaDescription?: SortOrderInput | SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    destination?: DestinationOrderByWithRelationInput
  }

  export type FlightRouteWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    slug?: string
    AND?: FlightRouteWhereInput | FlightRouteWhereInput[]
    OR?: FlightRouteWhereInput[]
    NOT?: FlightRouteWhereInput | FlightRouteWhereInput[]
    destinationId?: BigIntFilter<"FlightRoute"> | bigint | number
    name?: StringFilter<"FlightRoute"> | string
    originIATA?: StringFilter<"FlightRoute"> | string
    destIATA?: StringFilter<"FlightRoute"> | string
    originCity?: StringFilter<"FlightRoute"> | string
    destCity?: StringFilter<"FlightRoute"> | string
    approxDurationMinutes?: IntNullableFilter<"FlightRoute"> | number | null
    startingPrice?: IntNullableFilter<"FlightRoute"> | number | null
    currency?: StringFilter<"FlightRoute"> | string
    metaTitle?: StringNullableFilter<"FlightRoute"> | string | null
    metaDescription?: StringNullableFilter<"FlightRoute"> | string | null
    status?: EnumDestinationStatusFilter<"FlightRoute"> | $Enums.DestinationStatus
    isFeatured?: BoolFilter<"FlightRoute"> | boolean
    sortOrder?: IntFilter<"FlightRoute"> | number
    createdAt?: DateTimeFilter<"FlightRoute"> | Date | string
    updatedAt?: DateTimeFilter<"FlightRoute"> | Date | string
    destination?: XOR<DestinationRelationFilter, DestinationWhereInput>
  }, "id" | "slug">

  export type FlightRouteOrderByWithAggregationInput = {
    id?: SortOrder
    destinationId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    originIATA?: SortOrder
    destIATA?: SortOrder
    originCity?: SortOrder
    destCity?: SortOrder
    approxDurationMinutes?: SortOrderInput | SortOrder
    startingPrice?: SortOrderInput | SortOrder
    currency?: SortOrder
    metaTitle?: SortOrderInput | SortOrder
    metaDescription?: SortOrderInput | SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: FlightRouteCountOrderByAggregateInput
    _avg?: FlightRouteAvgOrderByAggregateInput
    _max?: FlightRouteMaxOrderByAggregateInput
    _min?: FlightRouteMinOrderByAggregateInput
    _sum?: FlightRouteSumOrderByAggregateInput
  }

  export type FlightRouteScalarWhereWithAggregatesInput = {
    AND?: FlightRouteScalarWhereWithAggregatesInput | FlightRouteScalarWhereWithAggregatesInput[]
    OR?: FlightRouteScalarWhereWithAggregatesInput[]
    NOT?: FlightRouteScalarWhereWithAggregatesInput | FlightRouteScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"FlightRoute"> | bigint | number
    destinationId?: BigIntWithAggregatesFilter<"FlightRoute"> | bigint | number
    name?: StringWithAggregatesFilter<"FlightRoute"> | string
    slug?: StringWithAggregatesFilter<"FlightRoute"> | string
    originIATA?: StringWithAggregatesFilter<"FlightRoute"> | string
    destIATA?: StringWithAggregatesFilter<"FlightRoute"> | string
    originCity?: StringWithAggregatesFilter<"FlightRoute"> | string
    destCity?: StringWithAggregatesFilter<"FlightRoute"> | string
    approxDurationMinutes?: IntNullableWithAggregatesFilter<"FlightRoute"> | number | null
    startingPrice?: IntNullableWithAggregatesFilter<"FlightRoute"> | number | null
    currency?: StringWithAggregatesFilter<"FlightRoute"> | string
    metaTitle?: StringNullableWithAggregatesFilter<"FlightRoute"> | string | null
    metaDescription?: StringNullableWithAggregatesFilter<"FlightRoute"> | string | null
    status?: EnumDestinationStatusWithAggregatesFilter<"FlightRoute"> | $Enums.DestinationStatus
    isFeatured?: BoolWithAggregatesFilter<"FlightRoute"> | boolean
    sortOrder?: IntWithAggregatesFilter<"FlightRoute"> | number
    createdAt?: DateTimeWithAggregatesFilter<"FlightRoute"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"FlightRoute"> | Date | string
  }

  export type SlugHistoryWhereInput = {
    AND?: SlugHistoryWhereInput | SlugHistoryWhereInput[]
    OR?: SlugHistoryWhereInput[]
    NOT?: SlugHistoryWhereInput | SlugHistoryWhereInput[]
    id?: BigIntFilter<"SlugHistory"> | bigint | number
    entityType?: EnumSluggableEntityFilter<"SlugHistory"> | $Enums.SluggableEntity
    entityId?: BigIntFilter<"SlugHistory"> | bigint | number
    locale?: StringFilter<"SlugHistory"> | string
    oldSlug?: StringFilter<"SlugHistory"> | string
    oldFullPath?: StringFilter<"SlugHistory"> | string
    newFullPath?: StringFilter<"SlugHistory"> | string
    changedAt?: DateTimeFilter<"SlugHistory"> | Date | string
    changedByUser?: StringNullableFilter<"SlugHistory"> | string | null
    reason?: StringNullableFilter<"SlugHistory"> | string | null
  }

  export type SlugHistoryOrderByWithRelationInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    locale?: SortOrder
    oldSlug?: SortOrder
    oldFullPath?: SortOrder
    newFullPath?: SortOrder
    changedAt?: SortOrder
    changedByUser?: SortOrderInput | SortOrder
    reason?: SortOrderInput | SortOrder
  }

  export type SlugHistoryWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    AND?: SlugHistoryWhereInput | SlugHistoryWhereInput[]
    OR?: SlugHistoryWhereInput[]
    NOT?: SlugHistoryWhereInput | SlugHistoryWhereInput[]
    entityType?: EnumSluggableEntityFilter<"SlugHistory"> | $Enums.SluggableEntity
    entityId?: BigIntFilter<"SlugHistory"> | bigint | number
    locale?: StringFilter<"SlugHistory"> | string
    oldSlug?: StringFilter<"SlugHistory"> | string
    oldFullPath?: StringFilter<"SlugHistory"> | string
    newFullPath?: StringFilter<"SlugHistory"> | string
    changedAt?: DateTimeFilter<"SlugHistory"> | Date | string
    changedByUser?: StringNullableFilter<"SlugHistory"> | string | null
    reason?: StringNullableFilter<"SlugHistory"> | string | null
  }, "id">

  export type SlugHistoryOrderByWithAggregationInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    locale?: SortOrder
    oldSlug?: SortOrder
    oldFullPath?: SortOrder
    newFullPath?: SortOrder
    changedAt?: SortOrder
    changedByUser?: SortOrderInput | SortOrder
    reason?: SortOrderInput | SortOrder
    _count?: SlugHistoryCountOrderByAggregateInput
    _avg?: SlugHistoryAvgOrderByAggregateInput
    _max?: SlugHistoryMaxOrderByAggregateInput
    _min?: SlugHistoryMinOrderByAggregateInput
    _sum?: SlugHistorySumOrderByAggregateInput
  }

  export type SlugHistoryScalarWhereWithAggregatesInput = {
    AND?: SlugHistoryScalarWhereWithAggregatesInput | SlugHistoryScalarWhereWithAggregatesInput[]
    OR?: SlugHistoryScalarWhereWithAggregatesInput[]
    NOT?: SlugHistoryScalarWhereWithAggregatesInput | SlugHistoryScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"SlugHistory"> | bigint | number
    entityType?: EnumSluggableEntityWithAggregatesFilter<"SlugHistory"> | $Enums.SluggableEntity
    entityId?: BigIntWithAggregatesFilter<"SlugHistory"> | bigint | number
    locale?: StringWithAggregatesFilter<"SlugHistory"> | string
    oldSlug?: StringWithAggregatesFilter<"SlugHistory"> | string
    oldFullPath?: StringWithAggregatesFilter<"SlugHistory"> | string
    newFullPath?: StringWithAggregatesFilter<"SlugHistory"> | string
    changedAt?: DateTimeWithAggregatesFilter<"SlugHistory"> | Date | string
    changedByUser?: StringNullableWithAggregatesFilter<"SlugHistory"> | string | null
    reason?: StringNullableWithAggregatesFilter<"SlugHistory"> | string | null
  }

  export type RedirectWhereInput = {
    AND?: RedirectWhereInput | RedirectWhereInput[]
    OR?: RedirectWhereInput[]
    NOT?: RedirectWhereInput | RedirectWhereInput[]
    id?: BigIntFilter<"Redirect"> | bigint | number
    fromPath?: StringFilter<"Redirect"> | string
    toPath?: StringFilter<"Redirect"> | string
    statusCode?: IntFilter<"Redirect"> | number
    locale?: StringNullableFilter<"Redirect"> | string | null
    source?: EnumRedirectSourceFilter<"Redirect"> | $Enums.RedirectSource
    reason?: StringNullableFilter<"Redirect"> | string | null
    isActive?: BoolFilter<"Redirect"> | boolean
    createdAt?: DateTimeFilter<"Redirect"> | Date | string
    updatedAt?: DateTimeFilter<"Redirect"> | Date | string
  }

  export type RedirectOrderByWithRelationInput = {
    id?: SortOrder
    fromPath?: SortOrder
    toPath?: SortOrder
    statusCode?: SortOrder
    locale?: SortOrderInput | SortOrder
    source?: SortOrder
    reason?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RedirectWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    fromPath?: string
    AND?: RedirectWhereInput | RedirectWhereInput[]
    OR?: RedirectWhereInput[]
    NOT?: RedirectWhereInput | RedirectWhereInput[]
    toPath?: StringFilter<"Redirect"> | string
    statusCode?: IntFilter<"Redirect"> | number
    locale?: StringNullableFilter<"Redirect"> | string | null
    source?: EnumRedirectSourceFilter<"Redirect"> | $Enums.RedirectSource
    reason?: StringNullableFilter<"Redirect"> | string | null
    isActive?: BoolFilter<"Redirect"> | boolean
    createdAt?: DateTimeFilter<"Redirect"> | Date | string
    updatedAt?: DateTimeFilter<"Redirect"> | Date | string
  }, "id" | "fromPath">

  export type RedirectOrderByWithAggregationInput = {
    id?: SortOrder
    fromPath?: SortOrder
    toPath?: SortOrder
    statusCode?: SortOrder
    locale?: SortOrderInput | SortOrder
    source?: SortOrder
    reason?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: RedirectCountOrderByAggregateInput
    _avg?: RedirectAvgOrderByAggregateInput
    _max?: RedirectMaxOrderByAggregateInput
    _min?: RedirectMinOrderByAggregateInput
    _sum?: RedirectSumOrderByAggregateInput
  }

  export type RedirectScalarWhereWithAggregatesInput = {
    AND?: RedirectScalarWhereWithAggregatesInput | RedirectScalarWhereWithAggregatesInput[]
    OR?: RedirectScalarWhereWithAggregatesInput[]
    NOT?: RedirectScalarWhereWithAggregatesInput | RedirectScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"Redirect"> | bigint | number
    fromPath?: StringWithAggregatesFilter<"Redirect"> | string
    toPath?: StringWithAggregatesFilter<"Redirect"> | string
    statusCode?: IntWithAggregatesFilter<"Redirect"> | number
    locale?: StringNullableWithAggregatesFilter<"Redirect"> | string | null
    source?: EnumRedirectSourceWithAggregatesFilter<"Redirect"> | $Enums.RedirectSource
    reason?: StringNullableWithAggregatesFilter<"Redirect"> | string | null
    isActive?: BoolWithAggregatesFilter<"Redirect"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Redirect"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Redirect"> | Date | string
  }

  export type DestinationCreateInput = {
    id?: bigint | number
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    imageUrl?: string | null
    heroImageUrl?: string | null
    gallery?: DestinationCreategalleryInput | string[]
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    parent?: DestinationCreateNestedOneWithoutChildrenInput
    children?: DestinationCreateNestedManyWithoutParentInput
    translations?: DestinationTranslationCreateNestedManyWithoutDestinationInput
    categories?: DestinationCategoryCreateNestedManyWithoutDestinationInput
    hotels?: HotelCreateNestedManyWithoutDestinationInput
    guides?: GuideCreateNestedManyWithoutDestinationInput
    ferryRoutes?: FerryRouteCreateNestedManyWithoutDestinationInput
    flightRoutes?: FlightRouteCreateNestedManyWithoutDestinationInput
    packageLinks?: PackageDestinationCreateNestedManyWithoutDestinationInput
  }

  export type DestinationUncheckedCreateInput = {
    id?: bigint | number
    parentId?: bigint | number | null
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    imageUrl?: string | null
    heroImageUrl?: string | null
    gallery?: DestinationCreategalleryInput | string[]
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    children?: DestinationUncheckedCreateNestedManyWithoutParentInput
    translations?: DestinationTranslationUncheckedCreateNestedManyWithoutDestinationInput
    categories?: DestinationCategoryUncheckedCreateNestedManyWithoutDestinationInput
    hotels?: HotelUncheckedCreateNestedManyWithoutDestinationInput
    guides?: GuideUncheckedCreateNestedManyWithoutDestinationInput
    ferryRoutes?: FerryRouteUncheckedCreateNestedManyWithoutDestinationInput
    flightRoutes?: FlightRouteUncheckedCreateNestedManyWithoutDestinationInput
    packageLinks?: PackageDestinationUncheckedCreateNestedManyWithoutDestinationInput
  }

  export type DestinationUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    parent?: DestinationUpdateOneWithoutChildrenNestedInput
    children?: DestinationUpdateManyWithoutParentNestedInput
    translations?: DestinationTranslationUpdateManyWithoutDestinationNestedInput
    categories?: DestinationCategoryUpdateManyWithoutDestinationNestedInput
    hotels?: HotelUpdateManyWithoutDestinationNestedInput
    guides?: GuideUpdateManyWithoutDestinationNestedInput
    ferryRoutes?: FerryRouteUpdateManyWithoutDestinationNestedInput
    flightRoutes?: FlightRouteUpdateManyWithoutDestinationNestedInput
    packageLinks?: PackageDestinationUpdateManyWithoutDestinationNestedInput
  }

  export type DestinationUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    parentId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    children?: DestinationUncheckedUpdateManyWithoutParentNestedInput
    translations?: DestinationTranslationUncheckedUpdateManyWithoutDestinationNestedInput
    categories?: DestinationCategoryUncheckedUpdateManyWithoutDestinationNestedInput
    hotels?: HotelUncheckedUpdateManyWithoutDestinationNestedInput
    guides?: GuideUncheckedUpdateManyWithoutDestinationNestedInput
    ferryRoutes?: FerryRouteUncheckedUpdateManyWithoutDestinationNestedInput
    flightRoutes?: FlightRouteUncheckedUpdateManyWithoutDestinationNestedInput
    packageLinks?: PackageDestinationUncheckedUpdateManyWithoutDestinationNestedInput
  }

  export type DestinationCreateManyInput = {
    id?: bigint | number
    parentId?: bigint | number | null
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    imageUrl?: string | null
    heroImageUrl?: string | null
    gallery?: DestinationCreategalleryInput | string[]
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
  }

  export type DestinationUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DestinationUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    parentId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DestinationTranslationCreateInput = {
    locale: string
    name: string
    slug: string
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    destination: DestinationCreateNestedOneWithoutTranslationsInput
  }

  export type DestinationTranslationUncheckedCreateInput = {
    destinationId: bigint | number
    locale: string
    name: string
    slug: string
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
  }

  export type DestinationTranslationUpdateInput = {
    locale?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    destination?: DestinationUpdateOneRequiredWithoutTranslationsNestedInput
  }

  export type DestinationTranslationUncheckedUpdateInput = {
    destinationId?: BigIntFieldUpdateOperationsInput | bigint | number
    locale?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DestinationTranslationCreateManyInput = {
    destinationId: bigint | number
    locale: string
    name: string
    slug: string
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
  }

  export type DestinationTranslationUpdateManyMutationInput = {
    locale?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DestinationTranslationUncheckedUpdateManyInput = {
    destinationId?: BigIntFieldUpdateOperationsInput | bigint | number
    locale?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DestinationCategoryCreateInput = {
    id?: bigint | number
    name: string
    slug: string
    description?: string | null
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    heroImageUrl?: string | null
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    destination: DestinationCreateNestedOneWithoutCategoriesInput
    packageLinks?: PackageCategoryCreateNestedManyWithoutCategoryInput
  }

  export type DestinationCategoryUncheckedCreateInput = {
    id?: bigint | number
    destinationId: bigint | number
    name: string
    slug: string
    description?: string | null
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    heroImageUrl?: string | null
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    packageLinks?: PackageCategoryUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type DestinationCategoryUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    destination?: DestinationUpdateOneRequiredWithoutCategoriesNestedInput
    packageLinks?: PackageCategoryUpdateManyWithoutCategoryNestedInput
  }

  export type DestinationCategoryUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    destinationId?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    packageLinks?: PackageCategoryUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type DestinationCategoryCreateManyInput = {
    id?: bigint | number
    destinationId: bigint | number
    name: string
    slug: string
    description?: string | null
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    heroImageUrl?: string | null
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
  }

  export type DestinationCategoryUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DestinationCategoryUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    destinationId?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type HotelCreateInput = {
    id?: bigint | number
    name: string
    slug: string
    starRating?: number | null
    shortDescription?: string | null
    heroImageUrl?: string | null
    gallery?: HotelCreategalleryInput | string[]
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    destination: DestinationCreateNestedOneWithoutHotelsInput
    packageLinks?: PackageHotelCreateNestedManyWithoutHotelInput
  }

  export type HotelUncheckedCreateInput = {
    id?: bigint | number
    destinationId: bigint | number
    name: string
    slug: string
    starRating?: number | null
    shortDescription?: string | null
    heroImageUrl?: string | null
    gallery?: HotelCreategalleryInput | string[]
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    packageLinks?: PackageHotelUncheckedCreateNestedManyWithoutHotelInput
  }

  export type HotelUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    starRating?: NullableIntFieldUpdateOperationsInput | number | null
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: HotelUpdategalleryInput | string[]
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    destination?: DestinationUpdateOneRequiredWithoutHotelsNestedInput
    packageLinks?: PackageHotelUpdateManyWithoutHotelNestedInput
  }

  export type HotelUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    destinationId?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    starRating?: NullableIntFieldUpdateOperationsInput | number | null
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: HotelUpdategalleryInput | string[]
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    packageLinks?: PackageHotelUncheckedUpdateManyWithoutHotelNestedInput
  }

  export type HotelCreateManyInput = {
    id?: bigint | number
    destinationId: bigint | number
    name: string
    slug: string
    starRating?: number | null
    shortDescription?: string | null
    heroImageUrl?: string | null
    gallery?: HotelCreategalleryInput | string[]
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
  }

  export type HotelUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    starRating?: NullableIntFieldUpdateOperationsInput | number | null
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: HotelUpdategalleryInput | string[]
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type HotelUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    destinationId?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    starRating?: NullableIntFieldUpdateOperationsInput | number | null
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: HotelUpdategalleryInput | string[]
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PackageCreateInput = {
    id?: bigint | number
    title: string
    slug: string
    shortDescription?: string | null
    durationDays?: number | null
    durationNights?: number | null
    startingPrice?: number | null
    currency?: string
    heroImageUrl?: string | null
    gallery?: PackageCreategalleryInput | string[]
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    destinations?: PackageDestinationCreateNestedManyWithoutPackageInput
    hotels?: PackageHotelCreateNestedManyWithoutPackageInput
    categories?: PackageCategoryCreateNestedManyWithoutPackageInput
  }

  export type PackageUncheckedCreateInput = {
    id?: bigint | number
    title: string
    slug: string
    shortDescription?: string | null
    durationDays?: number | null
    durationNights?: number | null
    startingPrice?: number | null
    currency?: string
    heroImageUrl?: string | null
    gallery?: PackageCreategalleryInput | string[]
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    destinations?: PackageDestinationUncheckedCreateNestedManyWithoutPackageInput
    hotels?: PackageHotelUncheckedCreateNestedManyWithoutPackageInput
    categories?: PackageCategoryUncheckedCreateNestedManyWithoutPackageInput
  }

  export type PackageUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    durationDays?: NullableIntFieldUpdateOperationsInput | number | null
    durationNights?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: PackageUpdategalleryInput | string[]
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    destinations?: PackageDestinationUpdateManyWithoutPackageNestedInput
    hotels?: PackageHotelUpdateManyWithoutPackageNestedInput
    categories?: PackageCategoryUpdateManyWithoutPackageNestedInput
  }

  export type PackageUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    durationDays?: NullableIntFieldUpdateOperationsInput | number | null
    durationNights?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: PackageUpdategalleryInput | string[]
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    destinations?: PackageDestinationUncheckedUpdateManyWithoutPackageNestedInput
    hotels?: PackageHotelUncheckedUpdateManyWithoutPackageNestedInput
    categories?: PackageCategoryUncheckedUpdateManyWithoutPackageNestedInput
  }

  export type PackageCreateManyInput = {
    id?: bigint | number
    title: string
    slug: string
    shortDescription?: string | null
    durationDays?: number | null
    durationNights?: number | null
    startingPrice?: number | null
    currency?: string
    heroImageUrl?: string | null
    gallery?: PackageCreategalleryInput | string[]
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
  }

  export type PackageUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    durationDays?: NullableIntFieldUpdateOperationsInput | number | null
    durationNights?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: PackageUpdategalleryInput | string[]
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PackageUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    durationDays?: NullableIntFieldUpdateOperationsInput | number | null
    durationNights?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: PackageUpdategalleryInput | string[]
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PackageDestinationCreateInput = {
    isPrimary?: boolean
    sortOrder?: number
    nights?: number | null
    package: PackageCreateNestedOneWithoutDestinationsInput
    destination: DestinationCreateNestedOneWithoutPackageLinksInput
  }

  export type PackageDestinationUncheckedCreateInput = {
    packageId: bigint | number
    destinationId: bigint | number
    isPrimary?: boolean
    sortOrder?: number
    nights?: number | null
  }

  export type PackageDestinationUpdateInput = {
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    nights?: NullableIntFieldUpdateOperationsInput | number | null
    package?: PackageUpdateOneRequiredWithoutDestinationsNestedInput
    destination?: DestinationUpdateOneRequiredWithoutPackageLinksNestedInput
  }

  export type PackageDestinationUncheckedUpdateInput = {
    packageId?: BigIntFieldUpdateOperationsInput | bigint | number
    destinationId?: BigIntFieldUpdateOperationsInput | bigint | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    nights?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type PackageDestinationCreateManyInput = {
    packageId: bigint | number
    destinationId: bigint | number
    isPrimary?: boolean
    sortOrder?: number
    nights?: number | null
  }

  export type PackageDestinationUpdateManyMutationInput = {
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    nights?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type PackageDestinationUncheckedUpdateManyInput = {
    packageId?: BigIntFieldUpdateOperationsInput | bigint | number
    destinationId?: BigIntFieldUpdateOperationsInput | bigint | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    nights?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type PackageHotelCreateInput = {
    nights?: number | null
    sortOrder?: number
    package: PackageCreateNestedOneWithoutHotelsInput
    hotel: HotelCreateNestedOneWithoutPackageLinksInput
  }

  export type PackageHotelUncheckedCreateInput = {
    packageId: bigint | number
    hotelId: bigint | number
    nights?: number | null
    sortOrder?: number
  }

  export type PackageHotelUpdateInput = {
    nights?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    package?: PackageUpdateOneRequiredWithoutHotelsNestedInput
    hotel?: HotelUpdateOneRequiredWithoutPackageLinksNestedInput
  }

  export type PackageHotelUncheckedUpdateInput = {
    packageId?: BigIntFieldUpdateOperationsInput | bigint | number
    hotelId?: BigIntFieldUpdateOperationsInput | bigint | number
    nights?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
  }

  export type PackageHotelCreateManyInput = {
    packageId: bigint | number
    hotelId: bigint | number
    nights?: number | null
    sortOrder?: number
  }

  export type PackageHotelUpdateManyMutationInput = {
    nights?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
  }

  export type PackageHotelUncheckedUpdateManyInput = {
    packageId?: BigIntFieldUpdateOperationsInput | bigint | number
    hotelId?: BigIntFieldUpdateOperationsInput | bigint | number
    nights?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
  }

  export type PackageCategoryCreateInput = {
    sortOrder?: number
    package: PackageCreateNestedOneWithoutCategoriesInput
    category: DestinationCategoryCreateNestedOneWithoutPackageLinksInput
  }

  export type PackageCategoryUncheckedCreateInput = {
    packageId: bigint | number
    categoryId: bigint | number
    sortOrder?: number
  }

  export type PackageCategoryUpdateInput = {
    sortOrder?: IntFieldUpdateOperationsInput | number
    package?: PackageUpdateOneRequiredWithoutCategoriesNestedInput
    category?: DestinationCategoryUpdateOneRequiredWithoutPackageLinksNestedInput
  }

  export type PackageCategoryUncheckedUpdateInput = {
    packageId?: BigIntFieldUpdateOperationsInput | bigint | number
    categoryId?: BigIntFieldUpdateOperationsInput | bigint | number
    sortOrder?: IntFieldUpdateOperationsInput | number
  }

  export type PackageCategoryCreateManyInput = {
    packageId: bigint | number
    categoryId: bigint | number
    sortOrder?: number
  }

  export type PackageCategoryUpdateManyMutationInput = {
    sortOrder?: IntFieldUpdateOperationsInput | number
  }

  export type PackageCategoryUncheckedUpdateManyInput = {
    packageId?: BigIntFieldUpdateOperationsInput | bigint | number
    categoryId?: BigIntFieldUpdateOperationsInput | bigint | number
    sortOrder?: IntFieldUpdateOperationsInput | number
  }

  export type GuideCreateInput = {
    id?: bigint | number
    title: string
    slug: string
    excerpt?: string | null
    body?: string | null
    readingMinutes?: number | null
    heroImageUrl?: string | null
    metaTitle?: string | null
    metaDescription?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    destination: DestinationCreateNestedOneWithoutGuidesInput
  }

  export type GuideUncheckedCreateInput = {
    id?: bigint | number
    destinationId: bigint | number
    title: string
    slug: string
    excerpt?: string | null
    body?: string | null
    readingMinutes?: number | null
    heroImageUrl?: string | null
    metaTitle?: string | null
    metaDescription?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
  }

  export type GuideUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    excerpt?: NullableStringFieldUpdateOperationsInput | string | null
    body?: NullableStringFieldUpdateOperationsInput | string | null
    readingMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    destination?: DestinationUpdateOneRequiredWithoutGuidesNestedInput
  }

  export type GuideUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    destinationId?: BigIntFieldUpdateOperationsInput | bigint | number
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    excerpt?: NullableStringFieldUpdateOperationsInput | string | null
    body?: NullableStringFieldUpdateOperationsInput | string | null
    readingMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type GuideCreateManyInput = {
    id?: bigint | number
    destinationId: bigint | number
    title: string
    slug: string
    excerpt?: string | null
    body?: string | null
    readingMinutes?: number | null
    heroImageUrl?: string | null
    metaTitle?: string | null
    metaDescription?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
  }

  export type GuideUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    excerpt?: NullableStringFieldUpdateOperationsInput | string | null
    body?: NullableStringFieldUpdateOperationsInput | string | null
    readingMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type GuideUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    destinationId?: BigIntFieldUpdateOperationsInput | bigint | number
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    excerpt?: NullableStringFieldUpdateOperationsInput | string | null
    body?: NullableStringFieldUpdateOperationsInput | string | null
    readingMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type FerryRouteCreateInput = {
    id?: bigint | number
    name: string
    slug: string
    originName: string
    destinationName: string
    operatorName?: string | null
    durationMinutes?: number | null
    startingPrice?: number | null
    currency?: string
    metaTitle?: string | null
    metaDescription?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    destination: DestinationCreateNestedOneWithoutFerryRoutesInput
  }

  export type FerryRouteUncheckedCreateInput = {
    id?: bigint | number
    destinationId: bigint | number
    name: string
    slug: string
    originName: string
    destinationName: string
    operatorName?: string | null
    durationMinutes?: number | null
    startingPrice?: number | null
    currency?: string
    metaTitle?: string | null
    metaDescription?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FerryRouteUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    originName?: StringFieldUpdateOperationsInput | string
    destinationName?: StringFieldUpdateOperationsInput | string
    operatorName?: NullableStringFieldUpdateOperationsInput | string | null
    durationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    destination?: DestinationUpdateOneRequiredWithoutFerryRoutesNestedInput
  }

  export type FerryRouteUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    destinationId?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    originName?: StringFieldUpdateOperationsInput | string
    destinationName?: StringFieldUpdateOperationsInput | string
    operatorName?: NullableStringFieldUpdateOperationsInput | string | null
    durationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FerryRouteCreateManyInput = {
    id?: bigint | number
    destinationId: bigint | number
    name: string
    slug: string
    originName: string
    destinationName: string
    operatorName?: string | null
    durationMinutes?: number | null
    startingPrice?: number | null
    currency?: string
    metaTitle?: string | null
    metaDescription?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FerryRouteUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    originName?: StringFieldUpdateOperationsInput | string
    destinationName?: StringFieldUpdateOperationsInput | string
    operatorName?: NullableStringFieldUpdateOperationsInput | string | null
    durationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FerryRouteUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    destinationId?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    originName?: StringFieldUpdateOperationsInput | string
    destinationName?: StringFieldUpdateOperationsInput | string
    operatorName?: NullableStringFieldUpdateOperationsInput | string | null
    durationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FlightRouteCreateInput = {
    id?: bigint | number
    name: string
    slug: string
    originIATA: string
    destIATA: string
    originCity: string
    destCity: string
    approxDurationMinutes?: number | null
    startingPrice?: number | null
    currency?: string
    metaTitle?: string | null
    metaDescription?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    destination: DestinationCreateNestedOneWithoutFlightRoutesInput
  }

  export type FlightRouteUncheckedCreateInput = {
    id?: bigint | number
    destinationId: bigint | number
    name: string
    slug: string
    originIATA: string
    destIATA: string
    originCity: string
    destCity: string
    approxDurationMinutes?: number | null
    startingPrice?: number | null
    currency?: string
    metaTitle?: string | null
    metaDescription?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FlightRouteUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    originIATA?: StringFieldUpdateOperationsInput | string
    destIATA?: StringFieldUpdateOperationsInput | string
    originCity?: StringFieldUpdateOperationsInput | string
    destCity?: StringFieldUpdateOperationsInput | string
    approxDurationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    destination?: DestinationUpdateOneRequiredWithoutFlightRoutesNestedInput
  }

  export type FlightRouteUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    destinationId?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    originIATA?: StringFieldUpdateOperationsInput | string
    destIATA?: StringFieldUpdateOperationsInput | string
    originCity?: StringFieldUpdateOperationsInput | string
    destCity?: StringFieldUpdateOperationsInput | string
    approxDurationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FlightRouteCreateManyInput = {
    id?: bigint | number
    destinationId: bigint | number
    name: string
    slug: string
    originIATA: string
    destIATA: string
    originCity: string
    destCity: string
    approxDurationMinutes?: number | null
    startingPrice?: number | null
    currency?: string
    metaTitle?: string | null
    metaDescription?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FlightRouteUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    originIATA?: StringFieldUpdateOperationsInput | string
    destIATA?: StringFieldUpdateOperationsInput | string
    originCity?: StringFieldUpdateOperationsInput | string
    destCity?: StringFieldUpdateOperationsInput | string
    approxDurationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FlightRouteUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    destinationId?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    originIATA?: StringFieldUpdateOperationsInput | string
    destIATA?: StringFieldUpdateOperationsInput | string
    originCity?: StringFieldUpdateOperationsInput | string
    destCity?: StringFieldUpdateOperationsInput | string
    approxDurationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SlugHistoryCreateInput = {
    id?: bigint | number
    entityType: $Enums.SluggableEntity
    entityId: bigint | number
    locale?: string
    oldSlug: string
    oldFullPath: string
    newFullPath: string
    changedAt?: Date | string
    changedByUser?: string | null
    reason?: string | null
  }

  export type SlugHistoryUncheckedCreateInput = {
    id?: bigint | number
    entityType: $Enums.SluggableEntity
    entityId: bigint | number
    locale?: string
    oldSlug: string
    oldFullPath: string
    newFullPath: string
    changedAt?: Date | string
    changedByUser?: string | null
    reason?: string | null
  }

  export type SlugHistoryUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    entityType?: EnumSluggableEntityFieldUpdateOperationsInput | $Enums.SluggableEntity
    entityId?: BigIntFieldUpdateOperationsInput | bigint | number
    locale?: StringFieldUpdateOperationsInput | string
    oldSlug?: StringFieldUpdateOperationsInput | string
    oldFullPath?: StringFieldUpdateOperationsInput | string
    newFullPath?: StringFieldUpdateOperationsInput | string
    changedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    changedByUser?: NullableStringFieldUpdateOperationsInput | string | null
    reason?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SlugHistoryUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    entityType?: EnumSluggableEntityFieldUpdateOperationsInput | $Enums.SluggableEntity
    entityId?: BigIntFieldUpdateOperationsInput | bigint | number
    locale?: StringFieldUpdateOperationsInput | string
    oldSlug?: StringFieldUpdateOperationsInput | string
    oldFullPath?: StringFieldUpdateOperationsInput | string
    newFullPath?: StringFieldUpdateOperationsInput | string
    changedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    changedByUser?: NullableStringFieldUpdateOperationsInput | string | null
    reason?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SlugHistoryCreateManyInput = {
    id?: bigint | number
    entityType: $Enums.SluggableEntity
    entityId: bigint | number
    locale?: string
    oldSlug: string
    oldFullPath: string
    newFullPath: string
    changedAt?: Date | string
    changedByUser?: string | null
    reason?: string | null
  }

  export type SlugHistoryUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    entityType?: EnumSluggableEntityFieldUpdateOperationsInput | $Enums.SluggableEntity
    entityId?: BigIntFieldUpdateOperationsInput | bigint | number
    locale?: StringFieldUpdateOperationsInput | string
    oldSlug?: StringFieldUpdateOperationsInput | string
    oldFullPath?: StringFieldUpdateOperationsInput | string
    newFullPath?: StringFieldUpdateOperationsInput | string
    changedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    changedByUser?: NullableStringFieldUpdateOperationsInput | string | null
    reason?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SlugHistoryUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    entityType?: EnumSluggableEntityFieldUpdateOperationsInput | $Enums.SluggableEntity
    entityId?: BigIntFieldUpdateOperationsInput | bigint | number
    locale?: StringFieldUpdateOperationsInput | string
    oldSlug?: StringFieldUpdateOperationsInput | string
    oldFullPath?: StringFieldUpdateOperationsInput | string
    newFullPath?: StringFieldUpdateOperationsInput | string
    changedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    changedByUser?: NullableStringFieldUpdateOperationsInput | string | null
    reason?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RedirectCreateInput = {
    id?: bigint | number
    fromPath: string
    toPath: string
    statusCode?: number
    locale?: string | null
    source?: $Enums.RedirectSource
    reason?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RedirectUncheckedCreateInput = {
    id?: bigint | number
    fromPath: string
    toPath: string
    statusCode?: number
    locale?: string | null
    source?: $Enums.RedirectSource
    reason?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RedirectUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    fromPath?: StringFieldUpdateOperationsInput | string
    toPath?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    locale?: NullableStringFieldUpdateOperationsInput | string | null
    source?: EnumRedirectSourceFieldUpdateOperationsInput | $Enums.RedirectSource
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RedirectUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    fromPath?: StringFieldUpdateOperationsInput | string
    toPath?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    locale?: NullableStringFieldUpdateOperationsInput | string | null
    source?: EnumRedirectSourceFieldUpdateOperationsInput | $Enums.RedirectSource
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RedirectCreateManyInput = {
    id?: bigint | number
    fromPath: string
    toPath: string
    statusCode?: number
    locale?: string | null
    source?: $Enums.RedirectSource
    reason?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RedirectUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    fromPath?: StringFieldUpdateOperationsInput | string
    toPath?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    locale?: NullableStringFieldUpdateOperationsInput | string | null
    source?: EnumRedirectSourceFieldUpdateOperationsInput | $Enums.RedirectSource
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RedirectUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    fromPath?: StringFieldUpdateOperationsInput | string
    toPath?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    locale?: NullableStringFieldUpdateOperationsInput | string | null
    source?: EnumRedirectSourceFieldUpdateOperationsInput | $Enums.RedirectSource
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type BigIntNullableFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableFilter<$PrismaModel> | bigint | number | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumDestinationLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.DestinationLevel | EnumDestinationLevelFieldRefInput<$PrismaModel>
    in?: $Enums.DestinationLevel[] | ListEnumDestinationLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.DestinationLevel[] | ListEnumDestinationLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumDestinationLevelFilter<$PrismaModel> | $Enums.DestinationLevel
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type EnumDestinationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.DestinationStatus | EnumDestinationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DestinationStatus[] | ListEnumDestinationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DestinationStatus[] | ListEnumDestinationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDestinationStatusFilter<$PrismaModel> | $Enums.DestinationStatus
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type DestinationNullableRelationFilter = {
    is?: DestinationWhereInput | null
    isNot?: DestinationWhereInput | null
  }

  export type DestinationListRelationFilter = {
    every?: DestinationWhereInput
    some?: DestinationWhereInput
    none?: DestinationWhereInput
  }

  export type DestinationTranslationListRelationFilter = {
    every?: DestinationTranslationWhereInput
    some?: DestinationTranslationWhereInput
    none?: DestinationTranslationWhereInput
  }

  export type DestinationCategoryListRelationFilter = {
    every?: DestinationCategoryWhereInput
    some?: DestinationCategoryWhereInput
    none?: DestinationCategoryWhereInput
  }

  export type HotelListRelationFilter = {
    every?: HotelWhereInput
    some?: HotelWhereInput
    none?: HotelWhereInput
  }

  export type GuideListRelationFilter = {
    every?: GuideWhereInput
    some?: GuideWhereInput
    none?: GuideWhereInput
  }

  export type FerryRouteListRelationFilter = {
    every?: FerryRouteWhereInput
    some?: FerryRouteWhereInput
    none?: FerryRouteWhereInput
  }

  export type FlightRouteListRelationFilter = {
    every?: FlightRouteWhereInput
    some?: FlightRouteWhereInput
    none?: FlightRouteWhereInput
  }

  export type PackageDestinationListRelationFilter = {
    every?: PackageDestinationWhereInput
    some?: PackageDestinationWhereInput
    none?: PackageDestinationWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type DestinationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DestinationTranslationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DestinationCategoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type HotelOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GuideOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FerryRouteOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FlightRouteOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PackageDestinationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DestinationCountOrderByAggregateInput = {
    id?: SortOrder
    parentId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    slugPath?: SortOrder
    level?: SortOrder
    depth?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    seoContent?: SortOrder
    imageUrl?: SortOrder
    heroImageUrl?: SortOrder
    gallery?: SortOrder
    sortOrder?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type DestinationAvgOrderByAggregateInput = {
    id?: SortOrder
    parentId?: SortOrder
    depth?: SortOrder
    sortOrder?: SortOrder
  }

  export type DestinationMaxOrderByAggregateInput = {
    id?: SortOrder
    parentId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    slugPath?: SortOrder
    level?: SortOrder
    depth?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    seoContent?: SortOrder
    imageUrl?: SortOrder
    heroImageUrl?: SortOrder
    sortOrder?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type DestinationMinOrderByAggregateInput = {
    id?: SortOrder
    parentId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    slugPath?: SortOrder
    level?: SortOrder
    depth?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    seoContent?: SortOrder
    imageUrl?: SortOrder
    heroImageUrl?: SortOrder
    sortOrder?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type DestinationSumOrderByAggregateInput = {
    id?: SortOrder
    parentId?: SortOrder
    depth?: SortOrder
    sortOrder?: SortOrder
  }

  export type BigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type BigIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableWithAggregatesFilter<$PrismaModel> | bigint | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedBigIntNullableFilter<$PrismaModel>
    _min?: NestedBigIntNullableFilter<$PrismaModel>
    _max?: NestedBigIntNullableFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumDestinationLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DestinationLevel | EnumDestinationLevelFieldRefInput<$PrismaModel>
    in?: $Enums.DestinationLevel[] | ListEnumDestinationLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.DestinationLevel[] | ListEnumDestinationLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumDestinationLevelWithAggregatesFilter<$PrismaModel> | $Enums.DestinationLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDestinationLevelFilter<$PrismaModel>
    _max?: NestedEnumDestinationLevelFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumDestinationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DestinationStatus | EnumDestinationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DestinationStatus[] | ListEnumDestinationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DestinationStatus[] | ListEnumDestinationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDestinationStatusWithAggregatesFilter<$PrismaModel> | $Enums.DestinationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDestinationStatusFilter<$PrismaModel>
    _max?: NestedEnumDestinationStatusFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type DestinationRelationFilter = {
    is?: DestinationWhereInput
    isNot?: DestinationWhereInput
  }

  export type DestinationTranslationLocaleSlugCompoundUniqueInput = {
    locale: string
    slug: string
  }

  export type DestinationTranslationDestinationIdLocaleCompoundUniqueInput = {
    destinationId: bigint | number
    locale: string
  }

  export type DestinationTranslationCountOrderByAggregateInput = {
    destinationId?: SortOrder
    locale?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    seoContent?: SortOrder
  }

  export type DestinationTranslationAvgOrderByAggregateInput = {
    destinationId?: SortOrder
  }

  export type DestinationTranslationMaxOrderByAggregateInput = {
    destinationId?: SortOrder
    locale?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    seoContent?: SortOrder
  }

  export type DestinationTranslationMinOrderByAggregateInput = {
    destinationId?: SortOrder
    locale?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    seoContent?: SortOrder
  }

  export type DestinationTranslationSumOrderByAggregateInput = {
    destinationId?: SortOrder
  }

  export type PackageCategoryListRelationFilter = {
    every?: PackageCategoryWhereInput
    some?: PackageCategoryWhereInput
    none?: PackageCategoryWhereInput
  }

  export type PackageCategoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DestinationCategoryDestinationIdSlugCompoundUniqueInput = {
    destinationId: bigint | number
    slug: string
  }

  export type DestinationCategoryCountOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    seoContent?: SortOrder
    heroImageUrl?: SortOrder
    sortOrder?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type DestinationCategoryAvgOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    sortOrder?: SortOrder
  }

  export type DestinationCategoryMaxOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    seoContent?: SortOrder
    heroImageUrl?: SortOrder
    sortOrder?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type DestinationCategoryMinOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    seoContent?: SortOrder
    heroImageUrl?: SortOrder
    sortOrder?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type DestinationCategorySumOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    sortOrder?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type PackageHotelListRelationFilter = {
    every?: PackageHotelWhereInput
    some?: PackageHotelWhereInput
    none?: PackageHotelWhereInput
  }

  export type PackageHotelOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type HotelCountOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    starRating?: SortOrder
    shortDescription?: SortOrder
    heroImageUrl?: SortOrder
    gallery?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    seoContent?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type HotelAvgOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    starRating?: SortOrder
    sortOrder?: SortOrder
  }

  export type HotelMaxOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    starRating?: SortOrder
    shortDescription?: SortOrder
    heroImageUrl?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    seoContent?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type HotelMinOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    starRating?: SortOrder
    shortDescription?: SortOrder
    heroImageUrl?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    seoContent?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type HotelSumOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    starRating?: SortOrder
    sortOrder?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type PackageCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    shortDescription?: SortOrder
    durationDays?: SortOrder
    durationNights?: SortOrder
    startingPrice?: SortOrder
    currency?: SortOrder
    heroImageUrl?: SortOrder
    gallery?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    seoContent?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type PackageAvgOrderByAggregateInput = {
    id?: SortOrder
    durationDays?: SortOrder
    durationNights?: SortOrder
    startingPrice?: SortOrder
    sortOrder?: SortOrder
  }

  export type PackageMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    shortDescription?: SortOrder
    durationDays?: SortOrder
    durationNights?: SortOrder
    startingPrice?: SortOrder
    currency?: SortOrder
    heroImageUrl?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    seoContent?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type PackageMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    shortDescription?: SortOrder
    durationDays?: SortOrder
    durationNights?: SortOrder
    startingPrice?: SortOrder
    currency?: SortOrder
    heroImageUrl?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    seoContent?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type PackageSumOrderByAggregateInput = {
    id?: SortOrder
    durationDays?: SortOrder
    durationNights?: SortOrder
    startingPrice?: SortOrder
    sortOrder?: SortOrder
  }

  export type PackageRelationFilter = {
    is?: PackageWhereInput
    isNot?: PackageWhereInput
  }

  export type PackageDestinationPackageIdDestinationIdCompoundUniqueInput = {
    packageId: bigint | number
    destinationId: bigint | number
  }

  export type PackageDestinationCountOrderByAggregateInput = {
    packageId?: SortOrder
    destinationId?: SortOrder
    isPrimary?: SortOrder
    sortOrder?: SortOrder
    nights?: SortOrder
  }

  export type PackageDestinationAvgOrderByAggregateInput = {
    packageId?: SortOrder
    destinationId?: SortOrder
    sortOrder?: SortOrder
    nights?: SortOrder
  }

  export type PackageDestinationMaxOrderByAggregateInput = {
    packageId?: SortOrder
    destinationId?: SortOrder
    isPrimary?: SortOrder
    sortOrder?: SortOrder
    nights?: SortOrder
  }

  export type PackageDestinationMinOrderByAggregateInput = {
    packageId?: SortOrder
    destinationId?: SortOrder
    isPrimary?: SortOrder
    sortOrder?: SortOrder
    nights?: SortOrder
  }

  export type PackageDestinationSumOrderByAggregateInput = {
    packageId?: SortOrder
    destinationId?: SortOrder
    sortOrder?: SortOrder
    nights?: SortOrder
  }

  export type HotelRelationFilter = {
    is?: HotelWhereInput
    isNot?: HotelWhereInput
  }

  export type PackageHotelPackageIdHotelIdCompoundUniqueInput = {
    packageId: bigint | number
    hotelId: bigint | number
  }

  export type PackageHotelCountOrderByAggregateInput = {
    packageId?: SortOrder
    hotelId?: SortOrder
    nights?: SortOrder
    sortOrder?: SortOrder
  }

  export type PackageHotelAvgOrderByAggregateInput = {
    packageId?: SortOrder
    hotelId?: SortOrder
    nights?: SortOrder
    sortOrder?: SortOrder
  }

  export type PackageHotelMaxOrderByAggregateInput = {
    packageId?: SortOrder
    hotelId?: SortOrder
    nights?: SortOrder
    sortOrder?: SortOrder
  }

  export type PackageHotelMinOrderByAggregateInput = {
    packageId?: SortOrder
    hotelId?: SortOrder
    nights?: SortOrder
    sortOrder?: SortOrder
  }

  export type PackageHotelSumOrderByAggregateInput = {
    packageId?: SortOrder
    hotelId?: SortOrder
    nights?: SortOrder
    sortOrder?: SortOrder
  }

  export type DestinationCategoryRelationFilter = {
    is?: DestinationCategoryWhereInput
    isNot?: DestinationCategoryWhereInput
  }

  export type PackageCategoryPackageIdCategoryIdCompoundUniqueInput = {
    packageId: bigint | number
    categoryId: bigint | number
  }

  export type PackageCategoryCountOrderByAggregateInput = {
    packageId?: SortOrder
    categoryId?: SortOrder
    sortOrder?: SortOrder
  }

  export type PackageCategoryAvgOrderByAggregateInput = {
    packageId?: SortOrder
    categoryId?: SortOrder
    sortOrder?: SortOrder
  }

  export type PackageCategoryMaxOrderByAggregateInput = {
    packageId?: SortOrder
    categoryId?: SortOrder
    sortOrder?: SortOrder
  }

  export type PackageCategoryMinOrderByAggregateInput = {
    packageId?: SortOrder
    categoryId?: SortOrder
    sortOrder?: SortOrder
  }

  export type PackageCategorySumOrderByAggregateInput = {
    packageId?: SortOrder
    categoryId?: SortOrder
    sortOrder?: SortOrder
  }

  export type GuideCountOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    excerpt?: SortOrder
    body?: SortOrder
    readingMinutes?: SortOrder
    heroImageUrl?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type GuideAvgOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    readingMinutes?: SortOrder
    sortOrder?: SortOrder
  }

  export type GuideMaxOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    excerpt?: SortOrder
    body?: SortOrder
    readingMinutes?: SortOrder
    heroImageUrl?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type GuideMinOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    excerpt?: SortOrder
    body?: SortOrder
    readingMinutes?: SortOrder
    heroImageUrl?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type GuideSumOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    readingMinutes?: SortOrder
    sortOrder?: SortOrder
  }

  export type FerryRouteCountOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    originName?: SortOrder
    destinationName?: SortOrder
    operatorName?: SortOrder
    durationMinutes?: SortOrder
    startingPrice?: SortOrder
    currency?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FerryRouteAvgOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    durationMinutes?: SortOrder
    startingPrice?: SortOrder
    sortOrder?: SortOrder
  }

  export type FerryRouteMaxOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    originName?: SortOrder
    destinationName?: SortOrder
    operatorName?: SortOrder
    durationMinutes?: SortOrder
    startingPrice?: SortOrder
    currency?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FerryRouteMinOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    originName?: SortOrder
    destinationName?: SortOrder
    operatorName?: SortOrder
    durationMinutes?: SortOrder
    startingPrice?: SortOrder
    currency?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FerryRouteSumOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    durationMinutes?: SortOrder
    startingPrice?: SortOrder
    sortOrder?: SortOrder
  }

  export type FlightRouteCountOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    originIATA?: SortOrder
    destIATA?: SortOrder
    originCity?: SortOrder
    destCity?: SortOrder
    approxDurationMinutes?: SortOrder
    startingPrice?: SortOrder
    currency?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FlightRouteAvgOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    approxDurationMinutes?: SortOrder
    startingPrice?: SortOrder
    sortOrder?: SortOrder
  }

  export type FlightRouteMaxOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    originIATA?: SortOrder
    destIATA?: SortOrder
    originCity?: SortOrder
    destCity?: SortOrder
    approxDurationMinutes?: SortOrder
    startingPrice?: SortOrder
    currency?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FlightRouteMinOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    originIATA?: SortOrder
    destIATA?: SortOrder
    originCity?: SortOrder
    destCity?: SortOrder
    approxDurationMinutes?: SortOrder
    startingPrice?: SortOrder
    currency?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    status?: SortOrder
    isFeatured?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FlightRouteSumOrderByAggregateInput = {
    id?: SortOrder
    destinationId?: SortOrder
    approxDurationMinutes?: SortOrder
    startingPrice?: SortOrder
    sortOrder?: SortOrder
  }

  export type EnumSluggableEntityFilter<$PrismaModel = never> = {
    equals?: $Enums.SluggableEntity | EnumSluggableEntityFieldRefInput<$PrismaModel>
    in?: $Enums.SluggableEntity[] | ListEnumSluggableEntityFieldRefInput<$PrismaModel>
    notIn?: $Enums.SluggableEntity[] | ListEnumSluggableEntityFieldRefInput<$PrismaModel>
    not?: NestedEnumSluggableEntityFilter<$PrismaModel> | $Enums.SluggableEntity
  }

  export type SlugHistoryCountOrderByAggregateInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    locale?: SortOrder
    oldSlug?: SortOrder
    oldFullPath?: SortOrder
    newFullPath?: SortOrder
    changedAt?: SortOrder
    changedByUser?: SortOrder
    reason?: SortOrder
  }

  export type SlugHistoryAvgOrderByAggregateInput = {
    id?: SortOrder
    entityId?: SortOrder
  }

  export type SlugHistoryMaxOrderByAggregateInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    locale?: SortOrder
    oldSlug?: SortOrder
    oldFullPath?: SortOrder
    newFullPath?: SortOrder
    changedAt?: SortOrder
    changedByUser?: SortOrder
    reason?: SortOrder
  }

  export type SlugHistoryMinOrderByAggregateInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    locale?: SortOrder
    oldSlug?: SortOrder
    oldFullPath?: SortOrder
    newFullPath?: SortOrder
    changedAt?: SortOrder
    changedByUser?: SortOrder
    reason?: SortOrder
  }

  export type SlugHistorySumOrderByAggregateInput = {
    id?: SortOrder
    entityId?: SortOrder
  }

  export type EnumSluggableEntityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SluggableEntity | EnumSluggableEntityFieldRefInput<$PrismaModel>
    in?: $Enums.SluggableEntity[] | ListEnumSluggableEntityFieldRefInput<$PrismaModel>
    notIn?: $Enums.SluggableEntity[] | ListEnumSluggableEntityFieldRefInput<$PrismaModel>
    not?: NestedEnumSluggableEntityWithAggregatesFilter<$PrismaModel> | $Enums.SluggableEntity
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSluggableEntityFilter<$PrismaModel>
    _max?: NestedEnumSluggableEntityFilter<$PrismaModel>
  }

  export type EnumRedirectSourceFilter<$PrismaModel = never> = {
    equals?: $Enums.RedirectSource | EnumRedirectSourceFieldRefInput<$PrismaModel>
    in?: $Enums.RedirectSource[] | ListEnumRedirectSourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.RedirectSource[] | ListEnumRedirectSourceFieldRefInput<$PrismaModel>
    not?: NestedEnumRedirectSourceFilter<$PrismaModel> | $Enums.RedirectSource
  }

  export type RedirectCountOrderByAggregateInput = {
    id?: SortOrder
    fromPath?: SortOrder
    toPath?: SortOrder
    statusCode?: SortOrder
    locale?: SortOrder
    source?: SortOrder
    reason?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RedirectAvgOrderByAggregateInput = {
    id?: SortOrder
    statusCode?: SortOrder
  }

  export type RedirectMaxOrderByAggregateInput = {
    id?: SortOrder
    fromPath?: SortOrder
    toPath?: SortOrder
    statusCode?: SortOrder
    locale?: SortOrder
    source?: SortOrder
    reason?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RedirectMinOrderByAggregateInput = {
    id?: SortOrder
    fromPath?: SortOrder
    toPath?: SortOrder
    statusCode?: SortOrder
    locale?: SortOrder
    source?: SortOrder
    reason?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RedirectSumOrderByAggregateInput = {
    id?: SortOrder
    statusCode?: SortOrder
  }

  export type EnumRedirectSourceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RedirectSource | EnumRedirectSourceFieldRefInput<$PrismaModel>
    in?: $Enums.RedirectSource[] | ListEnumRedirectSourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.RedirectSource[] | ListEnumRedirectSourceFieldRefInput<$PrismaModel>
    not?: NestedEnumRedirectSourceWithAggregatesFilter<$PrismaModel> | $Enums.RedirectSource
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRedirectSourceFilter<$PrismaModel>
    _max?: NestedEnumRedirectSourceFilter<$PrismaModel>
  }

  export type DestinationCreategalleryInput = {
    set: string[]
  }

  export type DestinationCreateNestedOneWithoutChildrenInput = {
    create?: XOR<DestinationCreateWithoutChildrenInput, DestinationUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: DestinationCreateOrConnectWithoutChildrenInput
    connect?: DestinationWhereUniqueInput
  }

  export type DestinationCreateNestedManyWithoutParentInput = {
    create?: XOR<DestinationCreateWithoutParentInput, DestinationUncheckedCreateWithoutParentInput> | DestinationCreateWithoutParentInput[] | DestinationUncheckedCreateWithoutParentInput[]
    connectOrCreate?: DestinationCreateOrConnectWithoutParentInput | DestinationCreateOrConnectWithoutParentInput[]
    createMany?: DestinationCreateManyParentInputEnvelope
    connect?: DestinationWhereUniqueInput | DestinationWhereUniqueInput[]
  }

  export type DestinationTranslationCreateNestedManyWithoutDestinationInput = {
    create?: XOR<DestinationTranslationCreateWithoutDestinationInput, DestinationTranslationUncheckedCreateWithoutDestinationInput> | DestinationTranslationCreateWithoutDestinationInput[] | DestinationTranslationUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: DestinationTranslationCreateOrConnectWithoutDestinationInput | DestinationTranslationCreateOrConnectWithoutDestinationInput[]
    createMany?: DestinationTranslationCreateManyDestinationInputEnvelope
    connect?: DestinationTranslationWhereUniqueInput | DestinationTranslationWhereUniqueInput[]
  }

  export type DestinationCategoryCreateNestedManyWithoutDestinationInput = {
    create?: XOR<DestinationCategoryCreateWithoutDestinationInput, DestinationCategoryUncheckedCreateWithoutDestinationInput> | DestinationCategoryCreateWithoutDestinationInput[] | DestinationCategoryUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: DestinationCategoryCreateOrConnectWithoutDestinationInput | DestinationCategoryCreateOrConnectWithoutDestinationInput[]
    createMany?: DestinationCategoryCreateManyDestinationInputEnvelope
    connect?: DestinationCategoryWhereUniqueInput | DestinationCategoryWhereUniqueInput[]
  }

  export type HotelCreateNestedManyWithoutDestinationInput = {
    create?: XOR<HotelCreateWithoutDestinationInput, HotelUncheckedCreateWithoutDestinationInput> | HotelCreateWithoutDestinationInput[] | HotelUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: HotelCreateOrConnectWithoutDestinationInput | HotelCreateOrConnectWithoutDestinationInput[]
    createMany?: HotelCreateManyDestinationInputEnvelope
    connect?: HotelWhereUniqueInput | HotelWhereUniqueInput[]
  }

  export type GuideCreateNestedManyWithoutDestinationInput = {
    create?: XOR<GuideCreateWithoutDestinationInput, GuideUncheckedCreateWithoutDestinationInput> | GuideCreateWithoutDestinationInput[] | GuideUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: GuideCreateOrConnectWithoutDestinationInput | GuideCreateOrConnectWithoutDestinationInput[]
    createMany?: GuideCreateManyDestinationInputEnvelope
    connect?: GuideWhereUniqueInput | GuideWhereUniqueInput[]
  }

  export type FerryRouteCreateNestedManyWithoutDestinationInput = {
    create?: XOR<FerryRouteCreateWithoutDestinationInput, FerryRouteUncheckedCreateWithoutDestinationInput> | FerryRouteCreateWithoutDestinationInput[] | FerryRouteUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: FerryRouteCreateOrConnectWithoutDestinationInput | FerryRouteCreateOrConnectWithoutDestinationInput[]
    createMany?: FerryRouteCreateManyDestinationInputEnvelope
    connect?: FerryRouteWhereUniqueInput | FerryRouteWhereUniqueInput[]
  }

  export type FlightRouteCreateNestedManyWithoutDestinationInput = {
    create?: XOR<FlightRouteCreateWithoutDestinationInput, FlightRouteUncheckedCreateWithoutDestinationInput> | FlightRouteCreateWithoutDestinationInput[] | FlightRouteUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: FlightRouteCreateOrConnectWithoutDestinationInput | FlightRouteCreateOrConnectWithoutDestinationInput[]
    createMany?: FlightRouteCreateManyDestinationInputEnvelope
    connect?: FlightRouteWhereUniqueInput | FlightRouteWhereUniqueInput[]
  }

  export type PackageDestinationCreateNestedManyWithoutDestinationInput = {
    create?: XOR<PackageDestinationCreateWithoutDestinationInput, PackageDestinationUncheckedCreateWithoutDestinationInput> | PackageDestinationCreateWithoutDestinationInput[] | PackageDestinationUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: PackageDestinationCreateOrConnectWithoutDestinationInput | PackageDestinationCreateOrConnectWithoutDestinationInput[]
    createMany?: PackageDestinationCreateManyDestinationInputEnvelope
    connect?: PackageDestinationWhereUniqueInput | PackageDestinationWhereUniqueInput[]
  }

  export type DestinationUncheckedCreateNestedManyWithoutParentInput = {
    create?: XOR<DestinationCreateWithoutParentInput, DestinationUncheckedCreateWithoutParentInput> | DestinationCreateWithoutParentInput[] | DestinationUncheckedCreateWithoutParentInput[]
    connectOrCreate?: DestinationCreateOrConnectWithoutParentInput | DestinationCreateOrConnectWithoutParentInput[]
    createMany?: DestinationCreateManyParentInputEnvelope
    connect?: DestinationWhereUniqueInput | DestinationWhereUniqueInput[]
  }

  export type DestinationTranslationUncheckedCreateNestedManyWithoutDestinationInput = {
    create?: XOR<DestinationTranslationCreateWithoutDestinationInput, DestinationTranslationUncheckedCreateWithoutDestinationInput> | DestinationTranslationCreateWithoutDestinationInput[] | DestinationTranslationUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: DestinationTranslationCreateOrConnectWithoutDestinationInput | DestinationTranslationCreateOrConnectWithoutDestinationInput[]
    createMany?: DestinationTranslationCreateManyDestinationInputEnvelope
    connect?: DestinationTranslationWhereUniqueInput | DestinationTranslationWhereUniqueInput[]
  }

  export type DestinationCategoryUncheckedCreateNestedManyWithoutDestinationInput = {
    create?: XOR<DestinationCategoryCreateWithoutDestinationInput, DestinationCategoryUncheckedCreateWithoutDestinationInput> | DestinationCategoryCreateWithoutDestinationInput[] | DestinationCategoryUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: DestinationCategoryCreateOrConnectWithoutDestinationInput | DestinationCategoryCreateOrConnectWithoutDestinationInput[]
    createMany?: DestinationCategoryCreateManyDestinationInputEnvelope
    connect?: DestinationCategoryWhereUniqueInput | DestinationCategoryWhereUniqueInput[]
  }

  export type HotelUncheckedCreateNestedManyWithoutDestinationInput = {
    create?: XOR<HotelCreateWithoutDestinationInput, HotelUncheckedCreateWithoutDestinationInput> | HotelCreateWithoutDestinationInput[] | HotelUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: HotelCreateOrConnectWithoutDestinationInput | HotelCreateOrConnectWithoutDestinationInput[]
    createMany?: HotelCreateManyDestinationInputEnvelope
    connect?: HotelWhereUniqueInput | HotelWhereUniqueInput[]
  }

  export type GuideUncheckedCreateNestedManyWithoutDestinationInput = {
    create?: XOR<GuideCreateWithoutDestinationInput, GuideUncheckedCreateWithoutDestinationInput> | GuideCreateWithoutDestinationInput[] | GuideUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: GuideCreateOrConnectWithoutDestinationInput | GuideCreateOrConnectWithoutDestinationInput[]
    createMany?: GuideCreateManyDestinationInputEnvelope
    connect?: GuideWhereUniqueInput | GuideWhereUniqueInput[]
  }

  export type FerryRouteUncheckedCreateNestedManyWithoutDestinationInput = {
    create?: XOR<FerryRouteCreateWithoutDestinationInput, FerryRouteUncheckedCreateWithoutDestinationInput> | FerryRouteCreateWithoutDestinationInput[] | FerryRouteUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: FerryRouteCreateOrConnectWithoutDestinationInput | FerryRouteCreateOrConnectWithoutDestinationInput[]
    createMany?: FerryRouteCreateManyDestinationInputEnvelope
    connect?: FerryRouteWhereUniqueInput | FerryRouteWhereUniqueInput[]
  }

  export type FlightRouteUncheckedCreateNestedManyWithoutDestinationInput = {
    create?: XOR<FlightRouteCreateWithoutDestinationInput, FlightRouteUncheckedCreateWithoutDestinationInput> | FlightRouteCreateWithoutDestinationInput[] | FlightRouteUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: FlightRouteCreateOrConnectWithoutDestinationInput | FlightRouteCreateOrConnectWithoutDestinationInput[]
    createMany?: FlightRouteCreateManyDestinationInputEnvelope
    connect?: FlightRouteWhereUniqueInput | FlightRouteWhereUniqueInput[]
  }

  export type PackageDestinationUncheckedCreateNestedManyWithoutDestinationInput = {
    create?: XOR<PackageDestinationCreateWithoutDestinationInput, PackageDestinationUncheckedCreateWithoutDestinationInput> | PackageDestinationCreateWithoutDestinationInput[] | PackageDestinationUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: PackageDestinationCreateOrConnectWithoutDestinationInput | PackageDestinationCreateOrConnectWithoutDestinationInput[]
    createMany?: PackageDestinationCreateManyDestinationInputEnvelope
    connect?: PackageDestinationWhereUniqueInput | PackageDestinationWhereUniqueInput[]
  }

  export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumDestinationLevelFieldUpdateOperationsInput = {
    set?: $Enums.DestinationLevel
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DestinationUpdategalleryInput = {
    set?: string[]
    push?: string | string[]
  }

  export type EnumDestinationStatusFieldUpdateOperationsInput = {
    set?: $Enums.DestinationStatus
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DestinationUpdateOneWithoutChildrenNestedInput = {
    create?: XOR<DestinationCreateWithoutChildrenInput, DestinationUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: DestinationCreateOrConnectWithoutChildrenInput
    upsert?: DestinationUpsertWithoutChildrenInput
    disconnect?: DestinationWhereInput | boolean
    delete?: DestinationWhereInput | boolean
    connect?: DestinationWhereUniqueInput
    update?: XOR<XOR<DestinationUpdateToOneWithWhereWithoutChildrenInput, DestinationUpdateWithoutChildrenInput>, DestinationUncheckedUpdateWithoutChildrenInput>
  }

  export type DestinationUpdateManyWithoutParentNestedInput = {
    create?: XOR<DestinationCreateWithoutParentInput, DestinationUncheckedCreateWithoutParentInput> | DestinationCreateWithoutParentInput[] | DestinationUncheckedCreateWithoutParentInput[]
    connectOrCreate?: DestinationCreateOrConnectWithoutParentInput | DestinationCreateOrConnectWithoutParentInput[]
    upsert?: DestinationUpsertWithWhereUniqueWithoutParentInput | DestinationUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: DestinationCreateManyParentInputEnvelope
    set?: DestinationWhereUniqueInput | DestinationWhereUniqueInput[]
    disconnect?: DestinationWhereUniqueInput | DestinationWhereUniqueInput[]
    delete?: DestinationWhereUniqueInput | DestinationWhereUniqueInput[]
    connect?: DestinationWhereUniqueInput | DestinationWhereUniqueInput[]
    update?: DestinationUpdateWithWhereUniqueWithoutParentInput | DestinationUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: DestinationUpdateManyWithWhereWithoutParentInput | DestinationUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: DestinationScalarWhereInput | DestinationScalarWhereInput[]
  }

  export type DestinationTranslationUpdateManyWithoutDestinationNestedInput = {
    create?: XOR<DestinationTranslationCreateWithoutDestinationInput, DestinationTranslationUncheckedCreateWithoutDestinationInput> | DestinationTranslationCreateWithoutDestinationInput[] | DestinationTranslationUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: DestinationTranslationCreateOrConnectWithoutDestinationInput | DestinationTranslationCreateOrConnectWithoutDestinationInput[]
    upsert?: DestinationTranslationUpsertWithWhereUniqueWithoutDestinationInput | DestinationTranslationUpsertWithWhereUniqueWithoutDestinationInput[]
    createMany?: DestinationTranslationCreateManyDestinationInputEnvelope
    set?: DestinationTranslationWhereUniqueInput | DestinationTranslationWhereUniqueInput[]
    disconnect?: DestinationTranslationWhereUniqueInput | DestinationTranslationWhereUniqueInput[]
    delete?: DestinationTranslationWhereUniqueInput | DestinationTranslationWhereUniqueInput[]
    connect?: DestinationTranslationWhereUniqueInput | DestinationTranslationWhereUniqueInput[]
    update?: DestinationTranslationUpdateWithWhereUniqueWithoutDestinationInput | DestinationTranslationUpdateWithWhereUniqueWithoutDestinationInput[]
    updateMany?: DestinationTranslationUpdateManyWithWhereWithoutDestinationInput | DestinationTranslationUpdateManyWithWhereWithoutDestinationInput[]
    deleteMany?: DestinationTranslationScalarWhereInput | DestinationTranslationScalarWhereInput[]
  }

  export type DestinationCategoryUpdateManyWithoutDestinationNestedInput = {
    create?: XOR<DestinationCategoryCreateWithoutDestinationInput, DestinationCategoryUncheckedCreateWithoutDestinationInput> | DestinationCategoryCreateWithoutDestinationInput[] | DestinationCategoryUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: DestinationCategoryCreateOrConnectWithoutDestinationInput | DestinationCategoryCreateOrConnectWithoutDestinationInput[]
    upsert?: DestinationCategoryUpsertWithWhereUniqueWithoutDestinationInput | DestinationCategoryUpsertWithWhereUniqueWithoutDestinationInput[]
    createMany?: DestinationCategoryCreateManyDestinationInputEnvelope
    set?: DestinationCategoryWhereUniqueInput | DestinationCategoryWhereUniqueInput[]
    disconnect?: DestinationCategoryWhereUniqueInput | DestinationCategoryWhereUniqueInput[]
    delete?: DestinationCategoryWhereUniqueInput | DestinationCategoryWhereUniqueInput[]
    connect?: DestinationCategoryWhereUniqueInput | DestinationCategoryWhereUniqueInput[]
    update?: DestinationCategoryUpdateWithWhereUniqueWithoutDestinationInput | DestinationCategoryUpdateWithWhereUniqueWithoutDestinationInput[]
    updateMany?: DestinationCategoryUpdateManyWithWhereWithoutDestinationInput | DestinationCategoryUpdateManyWithWhereWithoutDestinationInput[]
    deleteMany?: DestinationCategoryScalarWhereInput | DestinationCategoryScalarWhereInput[]
  }

  export type HotelUpdateManyWithoutDestinationNestedInput = {
    create?: XOR<HotelCreateWithoutDestinationInput, HotelUncheckedCreateWithoutDestinationInput> | HotelCreateWithoutDestinationInput[] | HotelUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: HotelCreateOrConnectWithoutDestinationInput | HotelCreateOrConnectWithoutDestinationInput[]
    upsert?: HotelUpsertWithWhereUniqueWithoutDestinationInput | HotelUpsertWithWhereUniqueWithoutDestinationInput[]
    createMany?: HotelCreateManyDestinationInputEnvelope
    set?: HotelWhereUniqueInput | HotelWhereUniqueInput[]
    disconnect?: HotelWhereUniqueInput | HotelWhereUniqueInput[]
    delete?: HotelWhereUniqueInput | HotelWhereUniqueInput[]
    connect?: HotelWhereUniqueInput | HotelWhereUniqueInput[]
    update?: HotelUpdateWithWhereUniqueWithoutDestinationInput | HotelUpdateWithWhereUniqueWithoutDestinationInput[]
    updateMany?: HotelUpdateManyWithWhereWithoutDestinationInput | HotelUpdateManyWithWhereWithoutDestinationInput[]
    deleteMany?: HotelScalarWhereInput | HotelScalarWhereInput[]
  }

  export type GuideUpdateManyWithoutDestinationNestedInput = {
    create?: XOR<GuideCreateWithoutDestinationInput, GuideUncheckedCreateWithoutDestinationInput> | GuideCreateWithoutDestinationInput[] | GuideUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: GuideCreateOrConnectWithoutDestinationInput | GuideCreateOrConnectWithoutDestinationInput[]
    upsert?: GuideUpsertWithWhereUniqueWithoutDestinationInput | GuideUpsertWithWhereUniqueWithoutDestinationInput[]
    createMany?: GuideCreateManyDestinationInputEnvelope
    set?: GuideWhereUniqueInput | GuideWhereUniqueInput[]
    disconnect?: GuideWhereUniqueInput | GuideWhereUniqueInput[]
    delete?: GuideWhereUniqueInput | GuideWhereUniqueInput[]
    connect?: GuideWhereUniqueInput | GuideWhereUniqueInput[]
    update?: GuideUpdateWithWhereUniqueWithoutDestinationInput | GuideUpdateWithWhereUniqueWithoutDestinationInput[]
    updateMany?: GuideUpdateManyWithWhereWithoutDestinationInput | GuideUpdateManyWithWhereWithoutDestinationInput[]
    deleteMany?: GuideScalarWhereInput | GuideScalarWhereInput[]
  }

  export type FerryRouteUpdateManyWithoutDestinationNestedInput = {
    create?: XOR<FerryRouteCreateWithoutDestinationInput, FerryRouteUncheckedCreateWithoutDestinationInput> | FerryRouteCreateWithoutDestinationInput[] | FerryRouteUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: FerryRouteCreateOrConnectWithoutDestinationInput | FerryRouteCreateOrConnectWithoutDestinationInput[]
    upsert?: FerryRouteUpsertWithWhereUniqueWithoutDestinationInput | FerryRouteUpsertWithWhereUniqueWithoutDestinationInput[]
    createMany?: FerryRouteCreateManyDestinationInputEnvelope
    set?: FerryRouteWhereUniqueInput | FerryRouteWhereUniqueInput[]
    disconnect?: FerryRouteWhereUniqueInput | FerryRouteWhereUniqueInput[]
    delete?: FerryRouteWhereUniqueInput | FerryRouteWhereUniqueInput[]
    connect?: FerryRouteWhereUniqueInput | FerryRouteWhereUniqueInput[]
    update?: FerryRouteUpdateWithWhereUniqueWithoutDestinationInput | FerryRouteUpdateWithWhereUniqueWithoutDestinationInput[]
    updateMany?: FerryRouteUpdateManyWithWhereWithoutDestinationInput | FerryRouteUpdateManyWithWhereWithoutDestinationInput[]
    deleteMany?: FerryRouteScalarWhereInput | FerryRouteScalarWhereInput[]
  }

  export type FlightRouteUpdateManyWithoutDestinationNestedInput = {
    create?: XOR<FlightRouteCreateWithoutDestinationInput, FlightRouteUncheckedCreateWithoutDestinationInput> | FlightRouteCreateWithoutDestinationInput[] | FlightRouteUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: FlightRouteCreateOrConnectWithoutDestinationInput | FlightRouteCreateOrConnectWithoutDestinationInput[]
    upsert?: FlightRouteUpsertWithWhereUniqueWithoutDestinationInput | FlightRouteUpsertWithWhereUniqueWithoutDestinationInput[]
    createMany?: FlightRouteCreateManyDestinationInputEnvelope
    set?: FlightRouteWhereUniqueInput | FlightRouteWhereUniqueInput[]
    disconnect?: FlightRouteWhereUniqueInput | FlightRouteWhereUniqueInput[]
    delete?: FlightRouteWhereUniqueInput | FlightRouteWhereUniqueInput[]
    connect?: FlightRouteWhereUniqueInput | FlightRouteWhereUniqueInput[]
    update?: FlightRouteUpdateWithWhereUniqueWithoutDestinationInput | FlightRouteUpdateWithWhereUniqueWithoutDestinationInput[]
    updateMany?: FlightRouteUpdateManyWithWhereWithoutDestinationInput | FlightRouteUpdateManyWithWhereWithoutDestinationInput[]
    deleteMany?: FlightRouteScalarWhereInput | FlightRouteScalarWhereInput[]
  }

  export type PackageDestinationUpdateManyWithoutDestinationNestedInput = {
    create?: XOR<PackageDestinationCreateWithoutDestinationInput, PackageDestinationUncheckedCreateWithoutDestinationInput> | PackageDestinationCreateWithoutDestinationInput[] | PackageDestinationUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: PackageDestinationCreateOrConnectWithoutDestinationInput | PackageDestinationCreateOrConnectWithoutDestinationInput[]
    upsert?: PackageDestinationUpsertWithWhereUniqueWithoutDestinationInput | PackageDestinationUpsertWithWhereUniqueWithoutDestinationInput[]
    createMany?: PackageDestinationCreateManyDestinationInputEnvelope
    set?: PackageDestinationWhereUniqueInput | PackageDestinationWhereUniqueInput[]
    disconnect?: PackageDestinationWhereUniqueInput | PackageDestinationWhereUniqueInput[]
    delete?: PackageDestinationWhereUniqueInput | PackageDestinationWhereUniqueInput[]
    connect?: PackageDestinationWhereUniqueInput | PackageDestinationWhereUniqueInput[]
    update?: PackageDestinationUpdateWithWhereUniqueWithoutDestinationInput | PackageDestinationUpdateWithWhereUniqueWithoutDestinationInput[]
    updateMany?: PackageDestinationUpdateManyWithWhereWithoutDestinationInput | PackageDestinationUpdateManyWithWhereWithoutDestinationInput[]
    deleteMany?: PackageDestinationScalarWhereInput | PackageDestinationScalarWhereInput[]
  }

  export type NullableBigIntFieldUpdateOperationsInput = {
    set?: bigint | number | null
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type DestinationUncheckedUpdateManyWithoutParentNestedInput = {
    create?: XOR<DestinationCreateWithoutParentInput, DestinationUncheckedCreateWithoutParentInput> | DestinationCreateWithoutParentInput[] | DestinationUncheckedCreateWithoutParentInput[]
    connectOrCreate?: DestinationCreateOrConnectWithoutParentInput | DestinationCreateOrConnectWithoutParentInput[]
    upsert?: DestinationUpsertWithWhereUniqueWithoutParentInput | DestinationUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: DestinationCreateManyParentInputEnvelope
    set?: DestinationWhereUniqueInput | DestinationWhereUniqueInput[]
    disconnect?: DestinationWhereUniqueInput | DestinationWhereUniqueInput[]
    delete?: DestinationWhereUniqueInput | DestinationWhereUniqueInput[]
    connect?: DestinationWhereUniqueInput | DestinationWhereUniqueInput[]
    update?: DestinationUpdateWithWhereUniqueWithoutParentInput | DestinationUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: DestinationUpdateManyWithWhereWithoutParentInput | DestinationUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: DestinationScalarWhereInput | DestinationScalarWhereInput[]
  }

  export type DestinationTranslationUncheckedUpdateManyWithoutDestinationNestedInput = {
    create?: XOR<DestinationTranslationCreateWithoutDestinationInput, DestinationTranslationUncheckedCreateWithoutDestinationInput> | DestinationTranslationCreateWithoutDestinationInput[] | DestinationTranslationUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: DestinationTranslationCreateOrConnectWithoutDestinationInput | DestinationTranslationCreateOrConnectWithoutDestinationInput[]
    upsert?: DestinationTranslationUpsertWithWhereUniqueWithoutDestinationInput | DestinationTranslationUpsertWithWhereUniqueWithoutDestinationInput[]
    createMany?: DestinationTranslationCreateManyDestinationInputEnvelope
    set?: DestinationTranslationWhereUniqueInput | DestinationTranslationWhereUniqueInput[]
    disconnect?: DestinationTranslationWhereUniqueInput | DestinationTranslationWhereUniqueInput[]
    delete?: DestinationTranslationWhereUniqueInput | DestinationTranslationWhereUniqueInput[]
    connect?: DestinationTranslationWhereUniqueInput | DestinationTranslationWhereUniqueInput[]
    update?: DestinationTranslationUpdateWithWhereUniqueWithoutDestinationInput | DestinationTranslationUpdateWithWhereUniqueWithoutDestinationInput[]
    updateMany?: DestinationTranslationUpdateManyWithWhereWithoutDestinationInput | DestinationTranslationUpdateManyWithWhereWithoutDestinationInput[]
    deleteMany?: DestinationTranslationScalarWhereInput | DestinationTranslationScalarWhereInput[]
  }

  export type DestinationCategoryUncheckedUpdateManyWithoutDestinationNestedInput = {
    create?: XOR<DestinationCategoryCreateWithoutDestinationInput, DestinationCategoryUncheckedCreateWithoutDestinationInput> | DestinationCategoryCreateWithoutDestinationInput[] | DestinationCategoryUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: DestinationCategoryCreateOrConnectWithoutDestinationInput | DestinationCategoryCreateOrConnectWithoutDestinationInput[]
    upsert?: DestinationCategoryUpsertWithWhereUniqueWithoutDestinationInput | DestinationCategoryUpsertWithWhereUniqueWithoutDestinationInput[]
    createMany?: DestinationCategoryCreateManyDestinationInputEnvelope
    set?: DestinationCategoryWhereUniqueInput | DestinationCategoryWhereUniqueInput[]
    disconnect?: DestinationCategoryWhereUniqueInput | DestinationCategoryWhereUniqueInput[]
    delete?: DestinationCategoryWhereUniqueInput | DestinationCategoryWhereUniqueInput[]
    connect?: DestinationCategoryWhereUniqueInput | DestinationCategoryWhereUniqueInput[]
    update?: DestinationCategoryUpdateWithWhereUniqueWithoutDestinationInput | DestinationCategoryUpdateWithWhereUniqueWithoutDestinationInput[]
    updateMany?: DestinationCategoryUpdateManyWithWhereWithoutDestinationInput | DestinationCategoryUpdateManyWithWhereWithoutDestinationInput[]
    deleteMany?: DestinationCategoryScalarWhereInput | DestinationCategoryScalarWhereInput[]
  }

  export type HotelUncheckedUpdateManyWithoutDestinationNestedInput = {
    create?: XOR<HotelCreateWithoutDestinationInput, HotelUncheckedCreateWithoutDestinationInput> | HotelCreateWithoutDestinationInput[] | HotelUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: HotelCreateOrConnectWithoutDestinationInput | HotelCreateOrConnectWithoutDestinationInput[]
    upsert?: HotelUpsertWithWhereUniqueWithoutDestinationInput | HotelUpsertWithWhereUniqueWithoutDestinationInput[]
    createMany?: HotelCreateManyDestinationInputEnvelope
    set?: HotelWhereUniqueInput | HotelWhereUniqueInput[]
    disconnect?: HotelWhereUniqueInput | HotelWhereUniqueInput[]
    delete?: HotelWhereUniqueInput | HotelWhereUniqueInput[]
    connect?: HotelWhereUniqueInput | HotelWhereUniqueInput[]
    update?: HotelUpdateWithWhereUniqueWithoutDestinationInput | HotelUpdateWithWhereUniqueWithoutDestinationInput[]
    updateMany?: HotelUpdateManyWithWhereWithoutDestinationInput | HotelUpdateManyWithWhereWithoutDestinationInput[]
    deleteMany?: HotelScalarWhereInput | HotelScalarWhereInput[]
  }

  export type GuideUncheckedUpdateManyWithoutDestinationNestedInput = {
    create?: XOR<GuideCreateWithoutDestinationInput, GuideUncheckedCreateWithoutDestinationInput> | GuideCreateWithoutDestinationInput[] | GuideUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: GuideCreateOrConnectWithoutDestinationInput | GuideCreateOrConnectWithoutDestinationInput[]
    upsert?: GuideUpsertWithWhereUniqueWithoutDestinationInput | GuideUpsertWithWhereUniqueWithoutDestinationInput[]
    createMany?: GuideCreateManyDestinationInputEnvelope
    set?: GuideWhereUniqueInput | GuideWhereUniqueInput[]
    disconnect?: GuideWhereUniqueInput | GuideWhereUniqueInput[]
    delete?: GuideWhereUniqueInput | GuideWhereUniqueInput[]
    connect?: GuideWhereUniqueInput | GuideWhereUniqueInput[]
    update?: GuideUpdateWithWhereUniqueWithoutDestinationInput | GuideUpdateWithWhereUniqueWithoutDestinationInput[]
    updateMany?: GuideUpdateManyWithWhereWithoutDestinationInput | GuideUpdateManyWithWhereWithoutDestinationInput[]
    deleteMany?: GuideScalarWhereInput | GuideScalarWhereInput[]
  }

  export type FerryRouteUncheckedUpdateManyWithoutDestinationNestedInput = {
    create?: XOR<FerryRouteCreateWithoutDestinationInput, FerryRouteUncheckedCreateWithoutDestinationInput> | FerryRouteCreateWithoutDestinationInput[] | FerryRouteUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: FerryRouteCreateOrConnectWithoutDestinationInput | FerryRouteCreateOrConnectWithoutDestinationInput[]
    upsert?: FerryRouteUpsertWithWhereUniqueWithoutDestinationInput | FerryRouteUpsertWithWhereUniqueWithoutDestinationInput[]
    createMany?: FerryRouteCreateManyDestinationInputEnvelope
    set?: FerryRouteWhereUniqueInput | FerryRouteWhereUniqueInput[]
    disconnect?: FerryRouteWhereUniqueInput | FerryRouteWhereUniqueInput[]
    delete?: FerryRouteWhereUniqueInput | FerryRouteWhereUniqueInput[]
    connect?: FerryRouteWhereUniqueInput | FerryRouteWhereUniqueInput[]
    update?: FerryRouteUpdateWithWhereUniqueWithoutDestinationInput | FerryRouteUpdateWithWhereUniqueWithoutDestinationInput[]
    updateMany?: FerryRouteUpdateManyWithWhereWithoutDestinationInput | FerryRouteUpdateManyWithWhereWithoutDestinationInput[]
    deleteMany?: FerryRouteScalarWhereInput | FerryRouteScalarWhereInput[]
  }

  export type FlightRouteUncheckedUpdateManyWithoutDestinationNestedInput = {
    create?: XOR<FlightRouteCreateWithoutDestinationInput, FlightRouteUncheckedCreateWithoutDestinationInput> | FlightRouteCreateWithoutDestinationInput[] | FlightRouteUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: FlightRouteCreateOrConnectWithoutDestinationInput | FlightRouteCreateOrConnectWithoutDestinationInput[]
    upsert?: FlightRouteUpsertWithWhereUniqueWithoutDestinationInput | FlightRouteUpsertWithWhereUniqueWithoutDestinationInput[]
    createMany?: FlightRouteCreateManyDestinationInputEnvelope
    set?: FlightRouteWhereUniqueInput | FlightRouteWhereUniqueInput[]
    disconnect?: FlightRouteWhereUniqueInput | FlightRouteWhereUniqueInput[]
    delete?: FlightRouteWhereUniqueInput | FlightRouteWhereUniqueInput[]
    connect?: FlightRouteWhereUniqueInput | FlightRouteWhereUniqueInput[]
    update?: FlightRouteUpdateWithWhereUniqueWithoutDestinationInput | FlightRouteUpdateWithWhereUniqueWithoutDestinationInput[]
    updateMany?: FlightRouteUpdateManyWithWhereWithoutDestinationInput | FlightRouteUpdateManyWithWhereWithoutDestinationInput[]
    deleteMany?: FlightRouteScalarWhereInput | FlightRouteScalarWhereInput[]
  }

  export type PackageDestinationUncheckedUpdateManyWithoutDestinationNestedInput = {
    create?: XOR<PackageDestinationCreateWithoutDestinationInput, PackageDestinationUncheckedCreateWithoutDestinationInput> | PackageDestinationCreateWithoutDestinationInput[] | PackageDestinationUncheckedCreateWithoutDestinationInput[]
    connectOrCreate?: PackageDestinationCreateOrConnectWithoutDestinationInput | PackageDestinationCreateOrConnectWithoutDestinationInput[]
    upsert?: PackageDestinationUpsertWithWhereUniqueWithoutDestinationInput | PackageDestinationUpsertWithWhereUniqueWithoutDestinationInput[]
    createMany?: PackageDestinationCreateManyDestinationInputEnvelope
    set?: PackageDestinationWhereUniqueInput | PackageDestinationWhereUniqueInput[]
    disconnect?: PackageDestinationWhereUniqueInput | PackageDestinationWhereUniqueInput[]
    delete?: PackageDestinationWhereUniqueInput | PackageDestinationWhereUniqueInput[]
    connect?: PackageDestinationWhereUniqueInput | PackageDestinationWhereUniqueInput[]
    update?: PackageDestinationUpdateWithWhereUniqueWithoutDestinationInput | PackageDestinationUpdateWithWhereUniqueWithoutDestinationInput[]
    updateMany?: PackageDestinationUpdateManyWithWhereWithoutDestinationInput | PackageDestinationUpdateManyWithWhereWithoutDestinationInput[]
    deleteMany?: PackageDestinationScalarWhereInput | PackageDestinationScalarWhereInput[]
  }

  export type DestinationCreateNestedOneWithoutTranslationsInput = {
    create?: XOR<DestinationCreateWithoutTranslationsInput, DestinationUncheckedCreateWithoutTranslationsInput>
    connectOrCreate?: DestinationCreateOrConnectWithoutTranslationsInput
    connect?: DestinationWhereUniqueInput
  }

  export type DestinationUpdateOneRequiredWithoutTranslationsNestedInput = {
    create?: XOR<DestinationCreateWithoutTranslationsInput, DestinationUncheckedCreateWithoutTranslationsInput>
    connectOrCreate?: DestinationCreateOrConnectWithoutTranslationsInput
    upsert?: DestinationUpsertWithoutTranslationsInput
    connect?: DestinationWhereUniqueInput
    update?: XOR<XOR<DestinationUpdateToOneWithWhereWithoutTranslationsInput, DestinationUpdateWithoutTranslationsInput>, DestinationUncheckedUpdateWithoutTranslationsInput>
  }

  export type DestinationCreateNestedOneWithoutCategoriesInput = {
    create?: XOR<DestinationCreateWithoutCategoriesInput, DestinationUncheckedCreateWithoutCategoriesInput>
    connectOrCreate?: DestinationCreateOrConnectWithoutCategoriesInput
    connect?: DestinationWhereUniqueInput
  }

  export type PackageCategoryCreateNestedManyWithoutCategoryInput = {
    create?: XOR<PackageCategoryCreateWithoutCategoryInput, PackageCategoryUncheckedCreateWithoutCategoryInput> | PackageCategoryCreateWithoutCategoryInput[] | PackageCategoryUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: PackageCategoryCreateOrConnectWithoutCategoryInput | PackageCategoryCreateOrConnectWithoutCategoryInput[]
    createMany?: PackageCategoryCreateManyCategoryInputEnvelope
    connect?: PackageCategoryWhereUniqueInput | PackageCategoryWhereUniqueInput[]
  }

  export type PackageCategoryUncheckedCreateNestedManyWithoutCategoryInput = {
    create?: XOR<PackageCategoryCreateWithoutCategoryInput, PackageCategoryUncheckedCreateWithoutCategoryInput> | PackageCategoryCreateWithoutCategoryInput[] | PackageCategoryUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: PackageCategoryCreateOrConnectWithoutCategoryInput | PackageCategoryCreateOrConnectWithoutCategoryInput[]
    createMany?: PackageCategoryCreateManyCategoryInputEnvelope
    connect?: PackageCategoryWhereUniqueInput | PackageCategoryWhereUniqueInput[]
  }

  export type DestinationUpdateOneRequiredWithoutCategoriesNestedInput = {
    create?: XOR<DestinationCreateWithoutCategoriesInput, DestinationUncheckedCreateWithoutCategoriesInput>
    connectOrCreate?: DestinationCreateOrConnectWithoutCategoriesInput
    upsert?: DestinationUpsertWithoutCategoriesInput
    connect?: DestinationWhereUniqueInput
    update?: XOR<XOR<DestinationUpdateToOneWithWhereWithoutCategoriesInput, DestinationUpdateWithoutCategoriesInput>, DestinationUncheckedUpdateWithoutCategoriesInput>
  }

  export type PackageCategoryUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<PackageCategoryCreateWithoutCategoryInput, PackageCategoryUncheckedCreateWithoutCategoryInput> | PackageCategoryCreateWithoutCategoryInput[] | PackageCategoryUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: PackageCategoryCreateOrConnectWithoutCategoryInput | PackageCategoryCreateOrConnectWithoutCategoryInput[]
    upsert?: PackageCategoryUpsertWithWhereUniqueWithoutCategoryInput | PackageCategoryUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: PackageCategoryCreateManyCategoryInputEnvelope
    set?: PackageCategoryWhereUniqueInput | PackageCategoryWhereUniqueInput[]
    disconnect?: PackageCategoryWhereUniqueInput | PackageCategoryWhereUniqueInput[]
    delete?: PackageCategoryWhereUniqueInput | PackageCategoryWhereUniqueInput[]
    connect?: PackageCategoryWhereUniqueInput | PackageCategoryWhereUniqueInput[]
    update?: PackageCategoryUpdateWithWhereUniqueWithoutCategoryInput | PackageCategoryUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: PackageCategoryUpdateManyWithWhereWithoutCategoryInput | PackageCategoryUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: PackageCategoryScalarWhereInput | PackageCategoryScalarWhereInput[]
  }

  export type PackageCategoryUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<PackageCategoryCreateWithoutCategoryInput, PackageCategoryUncheckedCreateWithoutCategoryInput> | PackageCategoryCreateWithoutCategoryInput[] | PackageCategoryUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: PackageCategoryCreateOrConnectWithoutCategoryInput | PackageCategoryCreateOrConnectWithoutCategoryInput[]
    upsert?: PackageCategoryUpsertWithWhereUniqueWithoutCategoryInput | PackageCategoryUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: PackageCategoryCreateManyCategoryInputEnvelope
    set?: PackageCategoryWhereUniqueInput | PackageCategoryWhereUniqueInput[]
    disconnect?: PackageCategoryWhereUniqueInput | PackageCategoryWhereUniqueInput[]
    delete?: PackageCategoryWhereUniqueInput | PackageCategoryWhereUniqueInput[]
    connect?: PackageCategoryWhereUniqueInput | PackageCategoryWhereUniqueInput[]
    update?: PackageCategoryUpdateWithWhereUniqueWithoutCategoryInput | PackageCategoryUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: PackageCategoryUpdateManyWithWhereWithoutCategoryInput | PackageCategoryUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: PackageCategoryScalarWhereInput | PackageCategoryScalarWhereInput[]
  }

  export type HotelCreategalleryInput = {
    set: string[]
  }

  export type DestinationCreateNestedOneWithoutHotelsInput = {
    create?: XOR<DestinationCreateWithoutHotelsInput, DestinationUncheckedCreateWithoutHotelsInput>
    connectOrCreate?: DestinationCreateOrConnectWithoutHotelsInput
    connect?: DestinationWhereUniqueInput
  }

  export type PackageHotelCreateNestedManyWithoutHotelInput = {
    create?: XOR<PackageHotelCreateWithoutHotelInput, PackageHotelUncheckedCreateWithoutHotelInput> | PackageHotelCreateWithoutHotelInput[] | PackageHotelUncheckedCreateWithoutHotelInput[]
    connectOrCreate?: PackageHotelCreateOrConnectWithoutHotelInput | PackageHotelCreateOrConnectWithoutHotelInput[]
    createMany?: PackageHotelCreateManyHotelInputEnvelope
    connect?: PackageHotelWhereUniqueInput | PackageHotelWhereUniqueInput[]
  }

  export type PackageHotelUncheckedCreateNestedManyWithoutHotelInput = {
    create?: XOR<PackageHotelCreateWithoutHotelInput, PackageHotelUncheckedCreateWithoutHotelInput> | PackageHotelCreateWithoutHotelInput[] | PackageHotelUncheckedCreateWithoutHotelInput[]
    connectOrCreate?: PackageHotelCreateOrConnectWithoutHotelInput | PackageHotelCreateOrConnectWithoutHotelInput[]
    createMany?: PackageHotelCreateManyHotelInputEnvelope
    connect?: PackageHotelWhereUniqueInput | PackageHotelWhereUniqueInput[]
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type HotelUpdategalleryInput = {
    set?: string[]
    push?: string | string[]
  }

  export type DestinationUpdateOneRequiredWithoutHotelsNestedInput = {
    create?: XOR<DestinationCreateWithoutHotelsInput, DestinationUncheckedCreateWithoutHotelsInput>
    connectOrCreate?: DestinationCreateOrConnectWithoutHotelsInput
    upsert?: DestinationUpsertWithoutHotelsInput
    connect?: DestinationWhereUniqueInput
    update?: XOR<XOR<DestinationUpdateToOneWithWhereWithoutHotelsInput, DestinationUpdateWithoutHotelsInput>, DestinationUncheckedUpdateWithoutHotelsInput>
  }

  export type PackageHotelUpdateManyWithoutHotelNestedInput = {
    create?: XOR<PackageHotelCreateWithoutHotelInput, PackageHotelUncheckedCreateWithoutHotelInput> | PackageHotelCreateWithoutHotelInput[] | PackageHotelUncheckedCreateWithoutHotelInput[]
    connectOrCreate?: PackageHotelCreateOrConnectWithoutHotelInput | PackageHotelCreateOrConnectWithoutHotelInput[]
    upsert?: PackageHotelUpsertWithWhereUniqueWithoutHotelInput | PackageHotelUpsertWithWhereUniqueWithoutHotelInput[]
    createMany?: PackageHotelCreateManyHotelInputEnvelope
    set?: PackageHotelWhereUniqueInput | PackageHotelWhereUniqueInput[]
    disconnect?: PackageHotelWhereUniqueInput | PackageHotelWhereUniqueInput[]
    delete?: PackageHotelWhereUniqueInput | PackageHotelWhereUniqueInput[]
    connect?: PackageHotelWhereUniqueInput | PackageHotelWhereUniqueInput[]
    update?: PackageHotelUpdateWithWhereUniqueWithoutHotelInput | PackageHotelUpdateWithWhereUniqueWithoutHotelInput[]
    updateMany?: PackageHotelUpdateManyWithWhereWithoutHotelInput | PackageHotelUpdateManyWithWhereWithoutHotelInput[]
    deleteMany?: PackageHotelScalarWhereInput | PackageHotelScalarWhereInput[]
  }

  export type PackageHotelUncheckedUpdateManyWithoutHotelNestedInput = {
    create?: XOR<PackageHotelCreateWithoutHotelInput, PackageHotelUncheckedCreateWithoutHotelInput> | PackageHotelCreateWithoutHotelInput[] | PackageHotelUncheckedCreateWithoutHotelInput[]
    connectOrCreate?: PackageHotelCreateOrConnectWithoutHotelInput | PackageHotelCreateOrConnectWithoutHotelInput[]
    upsert?: PackageHotelUpsertWithWhereUniqueWithoutHotelInput | PackageHotelUpsertWithWhereUniqueWithoutHotelInput[]
    createMany?: PackageHotelCreateManyHotelInputEnvelope
    set?: PackageHotelWhereUniqueInput | PackageHotelWhereUniqueInput[]
    disconnect?: PackageHotelWhereUniqueInput | PackageHotelWhereUniqueInput[]
    delete?: PackageHotelWhereUniqueInput | PackageHotelWhereUniqueInput[]
    connect?: PackageHotelWhereUniqueInput | PackageHotelWhereUniqueInput[]
    update?: PackageHotelUpdateWithWhereUniqueWithoutHotelInput | PackageHotelUpdateWithWhereUniqueWithoutHotelInput[]
    updateMany?: PackageHotelUpdateManyWithWhereWithoutHotelInput | PackageHotelUpdateManyWithWhereWithoutHotelInput[]
    deleteMany?: PackageHotelScalarWhereInput | PackageHotelScalarWhereInput[]
  }

  export type PackageCreategalleryInput = {
    set: string[]
  }

  export type PackageDestinationCreateNestedManyWithoutPackageInput = {
    create?: XOR<PackageDestinationCreateWithoutPackageInput, PackageDestinationUncheckedCreateWithoutPackageInput> | PackageDestinationCreateWithoutPackageInput[] | PackageDestinationUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: PackageDestinationCreateOrConnectWithoutPackageInput | PackageDestinationCreateOrConnectWithoutPackageInput[]
    createMany?: PackageDestinationCreateManyPackageInputEnvelope
    connect?: PackageDestinationWhereUniqueInput | PackageDestinationWhereUniqueInput[]
  }

  export type PackageHotelCreateNestedManyWithoutPackageInput = {
    create?: XOR<PackageHotelCreateWithoutPackageInput, PackageHotelUncheckedCreateWithoutPackageInput> | PackageHotelCreateWithoutPackageInput[] | PackageHotelUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: PackageHotelCreateOrConnectWithoutPackageInput | PackageHotelCreateOrConnectWithoutPackageInput[]
    createMany?: PackageHotelCreateManyPackageInputEnvelope
    connect?: PackageHotelWhereUniqueInput | PackageHotelWhereUniqueInput[]
  }

  export type PackageCategoryCreateNestedManyWithoutPackageInput = {
    create?: XOR<PackageCategoryCreateWithoutPackageInput, PackageCategoryUncheckedCreateWithoutPackageInput> | PackageCategoryCreateWithoutPackageInput[] | PackageCategoryUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: PackageCategoryCreateOrConnectWithoutPackageInput | PackageCategoryCreateOrConnectWithoutPackageInput[]
    createMany?: PackageCategoryCreateManyPackageInputEnvelope
    connect?: PackageCategoryWhereUniqueInput | PackageCategoryWhereUniqueInput[]
  }

  export type PackageDestinationUncheckedCreateNestedManyWithoutPackageInput = {
    create?: XOR<PackageDestinationCreateWithoutPackageInput, PackageDestinationUncheckedCreateWithoutPackageInput> | PackageDestinationCreateWithoutPackageInput[] | PackageDestinationUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: PackageDestinationCreateOrConnectWithoutPackageInput | PackageDestinationCreateOrConnectWithoutPackageInput[]
    createMany?: PackageDestinationCreateManyPackageInputEnvelope
    connect?: PackageDestinationWhereUniqueInput | PackageDestinationWhereUniqueInput[]
  }

  export type PackageHotelUncheckedCreateNestedManyWithoutPackageInput = {
    create?: XOR<PackageHotelCreateWithoutPackageInput, PackageHotelUncheckedCreateWithoutPackageInput> | PackageHotelCreateWithoutPackageInput[] | PackageHotelUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: PackageHotelCreateOrConnectWithoutPackageInput | PackageHotelCreateOrConnectWithoutPackageInput[]
    createMany?: PackageHotelCreateManyPackageInputEnvelope
    connect?: PackageHotelWhereUniqueInput | PackageHotelWhereUniqueInput[]
  }

  export type PackageCategoryUncheckedCreateNestedManyWithoutPackageInput = {
    create?: XOR<PackageCategoryCreateWithoutPackageInput, PackageCategoryUncheckedCreateWithoutPackageInput> | PackageCategoryCreateWithoutPackageInput[] | PackageCategoryUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: PackageCategoryCreateOrConnectWithoutPackageInput | PackageCategoryCreateOrConnectWithoutPackageInput[]
    createMany?: PackageCategoryCreateManyPackageInputEnvelope
    connect?: PackageCategoryWhereUniqueInput | PackageCategoryWhereUniqueInput[]
  }

  export type PackageUpdategalleryInput = {
    set?: string[]
    push?: string | string[]
  }

  export type PackageDestinationUpdateManyWithoutPackageNestedInput = {
    create?: XOR<PackageDestinationCreateWithoutPackageInput, PackageDestinationUncheckedCreateWithoutPackageInput> | PackageDestinationCreateWithoutPackageInput[] | PackageDestinationUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: PackageDestinationCreateOrConnectWithoutPackageInput | PackageDestinationCreateOrConnectWithoutPackageInput[]
    upsert?: PackageDestinationUpsertWithWhereUniqueWithoutPackageInput | PackageDestinationUpsertWithWhereUniqueWithoutPackageInput[]
    createMany?: PackageDestinationCreateManyPackageInputEnvelope
    set?: PackageDestinationWhereUniqueInput | PackageDestinationWhereUniqueInput[]
    disconnect?: PackageDestinationWhereUniqueInput | PackageDestinationWhereUniqueInput[]
    delete?: PackageDestinationWhereUniqueInput | PackageDestinationWhereUniqueInput[]
    connect?: PackageDestinationWhereUniqueInput | PackageDestinationWhereUniqueInput[]
    update?: PackageDestinationUpdateWithWhereUniqueWithoutPackageInput | PackageDestinationUpdateWithWhereUniqueWithoutPackageInput[]
    updateMany?: PackageDestinationUpdateManyWithWhereWithoutPackageInput | PackageDestinationUpdateManyWithWhereWithoutPackageInput[]
    deleteMany?: PackageDestinationScalarWhereInput | PackageDestinationScalarWhereInput[]
  }

  export type PackageHotelUpdateManyWithoutPackageNestedInput = {
    create?: XOR<PackageHotelCreateWithoutPackageInput, PackageHotelUncheckedCreateWithoutPackageInput> | PackageHotelCreateWithoutPackageInput[] | PackageHotelUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: PackageHotelCreateOrConnectWithoutPackageInput | PackageHotelCreateOrConnectWithoutPackageInput[]
    upsert?: PackageHotelUpsertWithWhereUniqueWithoutPackageInput | PackageHotelUpsertWithWhereUniqueWithoutPackageInput[]
    createMany?: PackageHotelCreateManyPackageInputEnvelope
    set?: PackageHotelWhereUniqueInput | PackageHotelWhereUniqueInput[]
    disconnect?: PackageHotelWhereUniqueInput | PackageHotelWhereUniqueInput[]
    delete?: PackageHotelWhereUniqueInput | PackageHotelWhereUniqueInput[]
    connect?: PackageHotelWhereUniqueInput | PackageHotelWhereUniqueInput[]
    update?: PackageHotelUpdateWithWhereUniqueWithoutPackageInput | PackageHotelUpdateWithWhereUniqueWithoutPackageInput[]
    updateMany?: PackageHotelUpdateManyWithWhereWithoutPackageInput | PackageHotelUpdateManyWithWhereWithoutPackageInput[]
    deleteMany?: PackageHotelScalarWhereInput | PackageHotelScalarWhereInput[]
  }

  export type PackageCategoryUpdateManyWithoutPackageNestedInput = {
    create?: XOR<PackageCategoryCreateWithoutPackageInput, PackageCategoryUncheckedCreateWithoutPackageInput> | PackageCategoryCreateWithoutPackageInput[] | PackageCategoryUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: PackageCategoryCreateOrConnectWithoutPackageInput | PackageCategoryCreateOrConnectWithoutPackageInput[]
    upsert?: PackageCategoryUpsertWithWhereUniqueWithoutPackageInput | PackageCategoryUpsertWithWhereUniqueWithoutPackageInput[]
    createMany?: PackageCategoryCreateManyPackageInputEnvelope
    set?: PackageCategoryWhereUniqueInput | PackageCategoryWhereUniqueInput[]
    disconnect?: PackageCategoryWhereUniqueInput | PackageCategoryWhereUniqueInput[]
    delete?: PackageCategoryWhereUniqueInput | PackageCategoryWhereUniqueInput[]
    connect?: PackageCategoryWhereUniqueInput | PackageCategoryWhereUniqueInput[]
    update?: PackageCategoryUpdateWithWhereUniqueWithoutPackageInput | PackageCategoryUpdateWithWhereUniqueWithoutPackageInput[]
    updateMany?: PackageCategoryUpdateManyWithWhereWithoutPackageInput | PackageCategoryUpdateManyWithWhereWithoutPackageInput[]
    deleteMany?: PackageCategoryScalarWhereInput | PackageCategoryScalarWhereInput[]
  }

  export type PackageDestinationUncheckedUpdateManyWithoutPackageNestedInput = {
    create?: XOR<PackageDestinationCreateWithoutPackageInput, PackageDestinationUncheckedCreateWithoutPackageInput> | PackageDestinationCreateWithoutPackageInput[] | PackageDestinationUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: PackageDestinationCreateOrConnectWithoutPackageInput | PackageDestinationCreateOrConnectWithoutPackageInput[]
    upsert?: PackageDestinationUpsertWithWhereUniqueWithoutPackageInput | PackageDestinationUpsertWithWhereUniqueWithoutPackageInput[]
    createMany?: PackageDestinationCreateManyPackageInputEnvelope
    set?: PackageDestinationWhereUniqueInput | PackageDestinationWhereUniqueInput[]
    disconnect?: PackageDestinationWhereUniqueInput | PackageDestinationWhereUniqueInput[]
    delete?: PackageDestinationWhereUniqueInput | PackageDestinationWhereUniqueInput[]
    connect?: PackageDestinationWhereUniqueInput | PackageDestinationWhereUniqueInput[]
    update?: PackageDestinationUpdateWithWhereUniqueWithoutPackageInput | PackageDestinationUpdateWithWhereUniqueWithoutPackageInput[]
    updateMany?: PackageDestinationUpdateManyWithWhereWithoutPackageInput | PackageDestinationUpdateManyWithWhereWithoutPackageInput[]
    deleteMany?: PackageDestinationScalarWhereInput | PackageDestinationScalarWhereInput[]
  }

  export type PackageHotelUncheckedUpdateManyWithoutPackageNestedInput = {
    create?: XOR<PackageHotelCreateWithoutPackageInput, PackageHotelUncheckedCreateWithoutPackageInput> | PackageHotelCreateWithoutPackageInput[] | PackageHotelUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: PackageHotelCreateOrConnectWithoutPackageInput | PackageHotelCreateOrConnectWithoutPackageInput[]
    upsert?: PackageHotelUpsertWithWhereUniqueWithoutPackageInput | PackageHotelUpsertWithWhereUniqueWithoutPackageInput[]
    createMany?: PackageHotelCreateManyPackageInputEnvelope
    set?: PackageHotelWhereUniqueInput | PackageHotelWhereUniqueInput[]
    disconnect?: PackageHotelWhereUniqueInput | PackageHotelWhereUniqueInput[]
    delete?: PackageHotelWhereUniqueInput | PackageHotelWhereUniqueInput[]
    connect?: PackageHotelWhereUniqueInput | PackageHotelWhereUniqueInput[]
    update?: PackageHotelUpdateWithWhereUniqueWithoutPackageInput | PackageHotelUpdateWithWhereUniqueWithoutPackageInput[]
    updateMany?: PackageHotelUpdateManyWithWhereWithoutPackageInput | PackageHotelUpdateManyWithWhereWithoutPackageInput[]
    deleteMany?: PackageHotelScalarWhereInput | PackageHotelScalarWhereInput[]
  }

  export type PackageCategoryUncheckedUpdateManyWithoutPackageNestedInput = {
    create?: XOR<PackageCategoryCreateWithoutPackageInput, PackageCategoryUncheckedCreateWithoutPackageInput> | PackageCategoryCreateWithoutPackageInput[] | PackageCategoryUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: PackageCategoryCreateOrConnectWithoutPackageInput | PackageCategoryCreateOrConnectWithoutPackageInput[]
    upsert?: PackageCategoryUpsertWithWhereUniqueWithoutPackageInput | PackageCategoryUpsertWithWhereUniqueWithoutPackageInput[]
    createMany?: PackageCategoryCreateManyPackageInputEnvelope
    set?: PackageCategoryWhereUniqueInput | PackageCategoryWhereUniqueInput[]
    disconnect?: PackageCategoryWhereUniqueInput | PackageCategoryWhereUniqueInput[]
    delete?: PackageCategoryWhereUniqueInput | PackageCategoryWhereUniqueInput[]
    connect?: PackageCategoryWhereUniqueInput | PackageCategoryWhereUniqueInput[]
    update?: PackageCategoryUpdateWithWhereUniqueWithoutPackageInput | PackageCategoryUpdateWithWhereUniqueWithoutPackageInput[]
    updateMany?: PackageCategoryUpdateManyWithWhereWithoutPackageInput | PackageCategoryUpdateManyWithWhereWithoutPackageInput[]
    deleteMany?: PackageCategoryScalarWhereInput | PackageCategoryScalarWhereInput[]
  }

  export type PackageCreateNestedOneWithoutDestinationsInput = {
    create?: XOR<PackageCreateWithoutDestinationsInput, PackageUncheckedCreateWithoutDestinationsInput>
    connectOrCreate?: PackageCreateOrConnectWithoutDestinationsInput
    connect?: PackageWhereUniqueInput
  }

  export type DestinationCreateNestedOneWithoutPackageLinksInput = {
    create?: XOR<DestinationCreateWithoutPackageLinksInput, DestinationUncheckedCreateWithoutPackageLinksInput>
    connectOrCreate?: DestinationCreateOrConnectWithoutPackageLinksInput
    connect?: DestinationWhereUniqueInput
  }

  export type PackageUpdateOneRequiredWithoutDestinationsNestedInput = {
    create?: XOR<PackageCreateWithoutDestinationsInput, PackageUncheckedCreateWithoutDestinationsInput>
    connectOrCreate?: PackageCreateOrConnectWithoutDestinationsInput
    upsert?: PackageUpsertWithoutDestinationsInput
    connect?: PackageWhereUniqueInput
    update?: XOR<XOR<PackageUpdateToOneWithWhereWithoutDestinationsInput, PackageUpdateWithoutDestinationsInput>, PackageUncheckedUpdateWithoutDestinationsInput>
  }

  export type DestinationUpdateOneRequiredWithoutPackageLinksNestedInput = {
    create?: XOR<DestinationCreateWithoutPackageLinksInput, DestinationUncheckedCreateWithoutPackageLinksInput>
    connectOrCreate?: DestinationCreateOrConnectWithoutPackageLinksInput
    upsert?: DestinationUpsertWithoutPackageLinksInput
    connect?: DestinationWhereUniqueInput
    update?: XOR<XOR<DestinationUpdateToOneWithWhereWithoutPackageLinksInput, DestinationUpdateWithoutPackageLinksInput>, DestinationUncheckedUpdateWithoutPackageLinksInput>
  }

  export type PackageCreateNestedOneWithoutHotelsInput = {
    create?: XOR<PackageCreateWithoutHotelsInput, PackageUncheckedCreateWithoutHotelsInput>
    connectOrCreate?: PackageCreateOrConnectWithoutHotelsInput
    connect?: PackageWhereUniqueInput
  }

  export type HotelCreateNestedOneWithoutPackageLinksInput = {
    create?: XOR<HotelCreateWithoutPackageLinksInput, HotelUncheckedCreateWithoutPackageLinksInput>
    connectOrCreate?: HotelCreateOrConnectWithoutPackageLinksInput
    connect?: HotelWhereUniqueInput
  }

  export type PackageUpdateOneRequiredWithoutHotelsNestedInput = {
    create?: XOR<PackageCreateWithoutHotelsInput, PackageUncheckedCreateWithoutHotelsInput>
    connectOrCreate?: PackageCreateOrConnectWithoutHotelsInput
    upsert?: PackageUpsertWithoutHotelsInput
    connect?: PackageWhereUniqueInput
    update?: XOR<XOR<PackageUpdateToOneWithWhereWithoutHotelsInput, PackageUpdateWithoutHotelsInput>, PackageUncheckedUpdateWithoutHotelsInput>
  }

  export type HotelUpdateOneRequiredWithoutPackageLinksNestedInput = {
    create?: XOR<HotelCreateWithoutPackageLinksInput, HotelUncheckedCreateWithoutPackageLinksInput>
    connectOrCreate?: HotelCreateOrConnectWithoutPackageLinksInput
    upsert?: HotelUpsertWithoutPackageLinksInput
    connect?: HotelWhereUniqueInput
    update?: XOR<XOR<HotelUpdateToOneWithWhereWithoutPackageLinksInput, HotelUpdateWithoutPackageLinksInput>, HotelUncheckedUpdateWithoutPackageLinksInput>
  }

  export type PackageCreateNestedOneWithoutCategoriesInput = {
    create?: XOR<PackageCreateWithoutCategoriesInput, PackageUncheckedCreateWithoutCategoriesInput>
    connectOrCreate?: PackageCreateOrConnectWithoutCategoriesInput
    connect?: PackageWhereUniqueInput
  }

  export type DestinationCategoryCreateNestedOneWithoutPackageLinksInput = {
    create?: XOR<DestinationCategoryCreateWithoutPackageLinksInput, DestinationCategoryUncheckedCreateWithoutPackageLinksInput>
    connectOrCreate?: DestinationCategoryCreateOrConnectWithoutPackageLinksInput
    connect?: DestinationCategoryWhereUniqueInput
  }

  export type PackageUpdateOneRequiredWithoutCategoriesNestedInput = {
    create?: XOR<PackageCreateWithoutCategoriesInput, PackageUncheckedCreateWithoutCategoriesInput>
    connectOrCreate?: PackageCreateOrConnectWithoutCategoriesInput
    upsert?: PackageUpsertWithoutCategoriesInput
    connect?: PackageWhereUniqueInput
    update?: XOR<XOR<PackageUpdateToOneWithWhereWithoutCategoriesInput, PackageUpdateWithoutCategoriesInput>, PackageUncheckedUpdateWithoutCategoriesInput>
  }

  export type DestinationCategoryUpdateOneRequiredWithoutPackageLinksNestedInput = {
    create?: XOR<DestinationCategoryCreateWithoutPackageLinksInput, DestinationCategoryUncheckedCreateWithoutPackageLinksInput>
    connectOrCreate?: DestinationCategoryCreateOrConnectWithoutPackageLinksInput
    upsert?: DestinationCategoryUpsertWithoutPackageLinksInput
    connect?: DestinationCategoryWhereUniqueInput
    update?: XOR<XOR<DestinationCategoryUpdateToOneWithWhereWithoutPackageLinksInput, DestinationCategoryUpdateWithoutPackageLinksInput>, DestinationCategoryUncheckedUpdateWithoutPackageLinksInput>
  }

  export type DestinationCreateNestedOneWithoutGuidesInput = {
    create?: XOR<DestinationCreateWithoutGuidesInput, DestinationUncheckedCreateWithoutGuidesInput>
    connectOrCreate?: DestinationCreateOrConnectWithoutGuidesInput
    connect?: DestinationWhereUniqueInput
  }

  export type DestinationUpdateOneRequiredWithoutGuidesNestedInput = {
    create?: XOR<DestinationCreateWithoutGuidesInput, DestinationUncheckedCreateWithoutGuidesInput>
    connectOrCreate?: DestinationCreateOrConnectWithoutGuidesInput
    upsert?: DestinationUpsertWithoutGuidesInput
    connect?: DestinationWhereUniqueInput
    update?: XOR<XOR<DestinationUpdateToOneWithWhereWithoutGuidesInput, DestinationUpdateWithoutGuidesInput>, DestinationUncheckedUpdateWithoutGuidesInput>
  }

  export type DestinationCreateNestedOneWithoutFerryRoutesInput = {
    create?: XOR<DestinationCreateWithoutFerryRoutesInput, DestinationUncheckedCreateWithoutFerryRoutesInput>
    connectOrCreate?: DestinationCreateOrConnectWithoutFerryRoutesInput
    connect?: DestinationWhereUniqueInput
  }

  export type DestinationUpdateOneRequiredWithoutFerryRoutesNestedInput = {
    create?: XOR<DestinationCreateWithoutFerryRoutesInput, DestinationUncheckedCreateWithoutFerryRoutesInput>
    connectOrCreate?: DestinationCreateOrConnectWithoutFerryRoutesInput
    upsert?: DestinationUpsertWithoutFerryRoutesInput
    connect?: DestinationWhereUniqueInput
    update?: XOR<XOR<DestinationUpdateToOneWithWhereWithoutFerryRoutesInput, DestinationUpdateWithoutFerryRoutesInput>, DestinationUncheckedUpdateWithoutFerryRoutesInput>
  }

  export type DestinationCreateNestedOneWithoutFlightRoutesInput = {
    create?: XOR<DestinationCreateWithoutFlightRoutesInput, DestinationUncheckedCreateWithoutFlightRoutesInput>
    connectOrCreate?: DestinationCreateOrConnectWithoutFlightRoutesInput
    connect?: DestinationWhereUniqueInput
  }

  export type DestinationUpdateOneRequiredWithoutFlightRoutesNestedInput = {
    create?: XOR<DestinationCreateWithoutFlightRoutesInput, DestinationUncheckedCreateWithoutFlightRoutesInput>
    connectOrCreate?: DestinationCreateOrConnectWithoutFlightRoutesInput
    upsert?: DestinationUpsertWithoutFlightRoutesInput
    connect?: DestinationWhereUniqueInput
    update?: XOR<XOR<DestinationUpdateToOneWithWhereWithoutFlightRoutesInput, DestinationUpdateWithoutFlightRoutesInput>, DestinationUncheckedUpdateWithoutFlightRoutesInput>
  }

  export type EnumSluggableEntityFieldUpdateOperationsInput = {
    set?: $Enums.SluggableEntity
  }

  export type EnumRedirectSourceFieldUpdateOperationsInput = {
    set?: $Enums.RedirectSource
  }

  export type NestedBigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type NestedBigIntNullableFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableFilter<$PrismaModel> | bigint | number | null
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumDestinationLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.DestinationLevel | EnumDestinationLevelFieldRefInput<$PrismaModel>
    in?: $Enums.DestinationLevel[] | ListEnumDestinationLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.DestinationLevel[] | ListEnumDestinationLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumDestinationLevelFilter<$PrismaModel> | $Enums.DestinationLevel
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumDestinationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.DestinationStatus | EnumDestinationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DestinationStatus[] | ListEnumDestinationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DestinationStatus[] | ListEnumDestinationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDestinationStatusFilter<$PrismaModel> | $Enums.DestinationStatus
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedBigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBigIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableWithAggregatesFilter<$PrismaModel> | bigint | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedBigIntNullableFilter<$PrismaModel>
    _min?: NestedBigIntNullableFilter<$PrismaModel>
    _max?: NestedBigIntNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedEnumDestinationLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DestinationLevel | EnumDestinationLevelFieldRefInput<$PrismaModel>
    in?: $Enums.DestinationLevel[] | ListEnumDestinationLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.DestinationLevel[] | ListEnumDestinationLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumDestinationLevelWithAggregatesFilter<$PrismaModel> | $Enums.DestinationLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDestinationLevelFilter<$PrismaModel>
    _max?: NestedEnumDestinationLevelFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedEnumDestinationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DestinationStatus | EnumDestinationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DestinationStatus[] | ListEnumDestinationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DestinationStatus[] | ListEnumDestinationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDestinationStatusWithAggregatesFilter<$PrismaModel> | $Enums.DestinationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDestinationStatusFilter<$PrismaModel>
    _max?: NestedEnumDestinationStatusFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedEnumSluggableEntityFilter<$PrismaModel = never> = {
    equals?: $Enums.SluggableEntity | EnumSluggableEntityFieldRefInput<$PrismaModel>
    in?: $Enums.SluggableEntity[] | ListEnumSluggableEntityFieldRefInput<$PrismaModel>
    notIn?: $Enums.SluggableEntity[] | ListEnumSluggableEntityFieldRefInput<$PrismaModel>
    not?: NestedEnumSluggableEntityFilter<$PrismaModel> | $Enums.SluggableEntity
  }

  export type NestedEnumSluggableEntityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SluggableEntity | EnumSluggableEntityFieldRefInput<$PrismaModel>
    in?: $Enums.SluggableEntity[] | ListEnumSluggableEntityFieldRefInput<$PrismaModel>
    notIn?: $Enums.SluggableEntity[] | ListEnumSluggableEntityFieldRefInput<$PrismaModel>
    not?: NestedEnumSluggableEntityWithAggregatesFilter<$PrismaModel> | $Enums.SluggableEntity
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSluggableEntityFilter<$PrismaModel>
    _max?: NestedEnumSluggableEntityFilter<$PrismaModel>
  }

  export type NestedEnumRedirectSourceFilter<$PrismaModel = never> = {
    equals?: $Enums.RedirectSource | EnumRedirectSourceFieldRefInput<$PrismaModel>
    in?: $Enums.RedirectSource[] | ListEnumRedirectSourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.RedirectSource[] | ListEnumRedirectSourceFieldRefInput<$PrismaModel>
    not?: NestedEnumRedirectSourceFilter<$PrismaModel> | $Enums.RedirectSource
  }

  export type NestedEnumRedirectSourceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RedirectSource | EnumRedirectSourceFieldRefInput<$PrismaModel>
    in?: $Enums.RedirectSource[] | ListEnumRedirectSourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.RedirectSource[] | ListEnumRedirectSourceFieldRefInput<$PrismaModel>
    not?: NestedEnumRedirectSourceWithAggregatesFilter<$PrismaModel> | $Enums.RedirectSource
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRedirectSourceFilter<$PrismaModel>
    _max?: NestedEnumRedirectSourceFilter<$PrismaModel>
  }

  export type DestinationCreateWithoutChildrenInput = {
    id?: bigint | number
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    imageUrl?: string | null
    heroImageUrl?: string | null
    gallery?: DestinationCreategalleryInput | string[]
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    parent?: DestinationCreateNestedOneWithoutChildrenInput
    translations?: DestinationTranslationCreateNestedManyWithoutDestinationInput
    categories?: DestinationCategoryCreateNestedManyWithoutDestinationInput
    hotels?: HotelCreateNestedManyWithoutDestinationInput
    guides?: GuideCreateNestedManyWithoutDestinationInput
    ferryRoutes?: FerryRouteCreateNestedManyWithoutDestinationInput
    flightRoutes?: FlightRouteCreateNestedManyWithoutDestinationInput
    packageLinks?: PackageDestinationCreateNestedManyWithoutDestinationInput
  }

  export type DestinationUncheckedCreateWithoutChildrenInput = {
    id?: bigint | number
    parentId?: bigint | number | null
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    imageUrl?: string | null
    heroImageUrl?: string | null
    gallery?: DestinationCreategalleryInput | string[]
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    translations?: DestinationTranslationUncheckedCreateNestedManyWithoutDestinationInput
    categories?: DestinationCategoryUncheckedCreateNestedManyWithoutDestinationInput
    hotels?: HotelUncheckedCreateNestedManyWithoutDestinationInput
    guides?: GuideUncheckedCreateNestedManyWithoutDestinationInput
    ferryRoutes?: FerryRouteUncheckedCreateNestedManyWithoutDestinationInput
    flightRoutes?: FlightRouteUncheckedCreateNestedManyWithoutDestinationInput
    packageLinks?: PackageDestinationUncheckedCreateNestedManyWithoutDestinationInput
  }

  export type DestinationCreateOrConnectWithoutChildrenInput = {
    where: DestinationWhereUniqueInput
    create: XOR<DestinationCreateWithoutChildrenInput, DestinationUncheckedCreateWithoutChildrenInput>
  }

  export type DestinationCreateWithoutParentInput = {
    id?: bigint | number
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    imageUrl?: string | null
    heroImageUrl?: string | null
    gallery?: DestinationCreategalleryInput | string[]
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    children?: DestinationCreateNestedManyWithoutParentInput
    translations?: DestinationTranslationCreateNestedManyWithoutDestinationInput
    categories?: DestinationCategoryCreateNestedManyWithoutDestinationInput
    hotels?: HotelCreateNestedManyWithoutDestinationInput
    guides?: GuideCreateNestedManyWithoutDestinationInput
    ferryRoutes?: FerryRouteCreateNestedManyWithoutDestinationInput
    flightRoutes?: FlightRouteCreateNestedManyWithoutDestinationInput
    packageLinks?: PackageDestinationCreateNestedManyWithoutDestinationInput
  }

  export type DestinationUncheckedCreateWithoutParentInput = {
    id?: bigint | number
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    imageUrl?: string | null
    heroImageUrl?: string | null
    gallery?: DestinationCreategalleryInput | string[]
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    children?: DestinationUncheckedCreateNestedManyWithoutParentInput
    translations?: DestinationTranslationUncheckedCreateNestedManyWithoutDestinationInput
    categories?: DestinationCategoryUncheckedCreateNestedManyWithoutDestinationInput
    hotels?: HotelUncheckedCreateNestedManyWithoutDestinationInput
    guides?: GuideUncheckedCreateNestedManyWithoutDestinationInput
    ferryRoutes?: FerryRouteUncheckedCreateNestedManyWithoutDestinationInput
    flightRoutes?: FlightRouteUncheckedCreateNestedManyWithoutDestinationInput
    packageLinks?: PackageDestinationUncheckedCreateNestedManyWithoutDestinationInput
  }

  export type DestinationCreateOrConnectWithoutParentInput = {
    where: DestinationWhereUniqueInput
    create: XOR<DestinationCreateWithoutParentInput, DestinationUncheckedCreateWithoutParentInput>
  }

  export type DestinationCreateManyParentInputEnvelope = {
    data: DestinationCreateManyParentInput | DestinationCreateManyParentInput[]
    skipDuplicates?: boolean
  }

  export type DestinationTranslationCreateWithoutDestinationInput = {
    locale: string
    name: string
    slug: string
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
  }

  export type DestinationTranslationUncheckedCreateWithoutDestinationInput = {
    locale: string
    name: string
    slug: string
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
  }

  export type DestinationTranslationCreateOrConnectWithoutDestinationInput = {
    where: DestinationTranslationWhereUniqueInput
    create: XOR<DestinationTranslationCreateWithoutDestinationInput, DestinationTranslationUncheckedCreateWithoutDestinationInput>
  }

  export type DestinationTranslationCreateManyDestinationInputEnvelope = {
    data: DestinationTranslationCreateManyDestinationInput | DestinationTranslationCreateManyDestinationInput[]
    skipDuplicates?: boolean
  }

  export type DestinationCategoryCreateWithoutDestinationInput = {
    id?: bigint | number
    name: string
    slug: string
    description?: string | null
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    heroImageUrl?: string | null
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    packageLinks?: PackageCategoryCreateNestedManyWithoutCategoryInput
  }

  export type DestinationCategoryUncheckedCreateWithoutDestinationInput = {
    id?: bigint | number
    name: string
    slug: string
    description?: string | null
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    heroImageUrl?: string | null
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    packageLinks?: PackageCategoryUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type DestinationCategoryCreateOrConnectWithoutDestinationInput = {
    where: DestinationCategoryWhereUniqueInput
    create: XOR<DestinationCategoryCreateWithoutDestinationInput, DestinationCategoryUncheckedCreateWithoutDestinationInput>
  }

  export type DestinationCategoryCreateManyDestinationInputEnvelope = {
    data: DestinationCategoryCreateManyDestinationInput | DestinationCategoryCreateManyDestinationInput[]
    skipDuplicates?: boolean
  }

  export type HotelCreateWithoutDestinationInput = {
    id?: bigint | number
    name: string
    slug: string
    starRating?: number | null
    shortDescription?: string | null
    heroImageUrl?: string | null
    gallery?: HotelCreategalleryInput | string[]
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    packageLinks?: PackageHotelCreateNestedManyWithoutHotelInput
  }

  export type HotelUncheckedCreateWithoutDestinationInput = {
    id?: bigint | number
    name: string
    slug: string
    starRating?: number | null
    shortDescription?: string | null
    heroImageUrl?: string | null
    gallery?: HotelCreategalleryInput | string[]
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    packageLinks?: PackageHotelUncheckedCreateNestedManyWithoutHotelInput
  }

  export type HotelCreateOrConnectWithoutDestinationInput = {
    where: HotelWhereUniqueInput
    create: XOR<HotelCreateWithoutDestinationInput, HotelUncheckedCreateWithoutDestinationInput>
  }

  export type HotelCreateManyDestinationInputEnvelope = {
    data: HotelCreateManyDestinationInput | HotelCreateManyDestinationInput[]
    skipDuplicates?: boolean
  }

  export type GuideCreateWithoutDestinationInput = {
    id?: bigint | number
    title: string
    slug: string
    excerpt?: string | null
    body?: string | null
    readingMinutes?: number | null
    heroImageUrl?: string | null
    metaTitle?: string | null
    metaDescription?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
  }

  export type GuideUncheckedCreateWithoutDestinationInput = {
    id?: bigint | number
    title: string
    slug: string
    excerpt?: string | null
    body?: string | null
    readingMinutes?: number | null
    heroImageUrl?: string | null
    metaTitle?: string | null
    metaDescription?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
  }

  export type GuideCreateOrConnectWithoutDestinationInput = {
    where: GuideWhereUniqueInput
    create: XOR<GuideCreateWithoutDestinationInput, GuideUncheckedCreateWithoutDestinationInput>
  }

  export type GuideCreateManyDestinationInputEnvelope = {
    data: GuideCreateManyDestinationInput | GuideCreateManyDestinationInput[]
    skipDuplicates?: boolean
  }

  export type FerryRouteCreateWithoutDestinationInput = {
    id?: bigint | number
    name: string
    slug: string
    originName: string
    destinationName: string
    operatorName?: string | null
    durationMinutes?: number | null
    startingPrice?: number | null
    currency?: string
    metaTitle?: string | null
    metaDescription?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FerryRouteUncheckedCreateWithoutDestinationInput = {
    id?: bigint | number
    name: string
    slug: string
    originName: string
    destinationName: string
    operatorName?: string | null
    durationMinutes?: number | null
    startingPrice?: number | null
    currency?: string
    metaTitle?: string | null
    metaDescription?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FerryRouteCreateOrConnectWithoutDestinationInput = {
    where: FerryRouteWhereUniqueInput
    create: XOR<FerryRouteCreateWithoutDestinationInput, FerryRouteUncheckedCreateWithoutDestinationInput>
  }

  export type FerryRouteCreateManyDestinationInputEnvelope = {
    data: FerryRouteCreateManyDestinationInput | FerryRouteCreateManyDestinationInput[]
    skipDuplicates?: boolean
  }

  export type FlightRouteCreateWithoutDestinationInput = {
    id?: bigint | number
    name: string
    slug: string
    originIATA: string
    destIATA: string
    originCity: string
    destCity: string
    approxDurationMinutes?: number | null
    startingPrice?: number | null
    currency?: string
    metaTitle?: string | null
    metaDescription?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FlightRouteUncheckedCreateWithoutDestinationInput = {
    id?: bigint | number
    name: string
    slug: string
    originIATA: string
    destIATA: string
    originCity: string
    destCity: string
    approxDurationMinutes?: number | null
    startingPrice?: number | null
    currency?: string
    metaTitle?: string | null
    metaDescription?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FlightRouteCreateOrConnectWithoutDestinationInput = {
    where: FlightRouteWhereUniqueInput
    create: XOR<FlightRouteCreateWithoutDestinationInput, FlightRouteUncheckedCreateWithoutDestinationInput>
  }

  export type FlightRouteCreateManyDestinationInputEnvelope = {
    data: FlightRouteCreateManyDestinationInput | FlightRouteCreateManyDestinationInput[]
    skipDuplicates?: boolean
  }

  export type PackageDestinationCreateWithoutDestinationInput = {
    isPrimary?: boolean
    sortOrder?: number
    nights?: number | null
    package: PackageCreateNestedOneWithoutDestinationsInput
  }

  export type PackageDestinationUncheckedCreateWithoutDestinationInput = {
    packageId: bigint | number
    isPrimary?: boolean
    sortOrder?: number
    nights?: number | null
  }

  export type PackageDestinationCreateOrConnectWithoutDestinationInput = {
    where: PackageDestinationWhereUniqueInput
    create: XOR<PackageDestinationCreateWithoutDestinationInput, PackageDestinationUncheckedCreateWithoutDestinationInput>
  }

  export type PackageDestinationCreateManyDestinationInputEnvelope = {
    data: PackageDestinationCreateManyDestinationInput | PackageDestinationCreateManyDestinationInput[]
    skipDuplicates?: boolean
  }

  export type DestinationUpsertWithoutChildrenInput = {
    update: XOR<DestinationUpdateWithoutChildrenInput, DestinationUncheckedUpdateWithoutChildrenInput>
    create: XOR<DestinationCreateWithoutChildrenInput, DestinationUncheckedCreateWithoutChildrenInput>
    where?: DestinationWhereInput
  }

  export type DestinationUpdateToOneWithWhereWithoutChildrenInput = {
    where?: DestinationWhereInput
    data: XOR<DestinationUpdateWithoutChildrenInput, DestinationUncheckedUpdateWithoutChildrenInput>
  }

  export type DestinationUpdateWithoutChildrenInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    parent?: DestinationUpdateOneWithoutChildrenNestedInput
    translations?: DestinationTranslationUpdateManyWithoutDestinationNestedInput
    categories?: DestinationCategoryUpdateManyWithoutDestinationNestedInput
    hotels?: HotelUpdateManyWithoutDestinationNestedInput
    guides?: GuideUpdateManyWithoutDestinationNestedInput
    ferryRoutes?: FerryRouteUpdateManyWithoutDestinationNestedInput
    flightRoutes?: FlightRouteUpdateManyWithoutDestinationNestedInput
    packageLinks?: PackageDestinationUpdateManyWithoutDestinationNestedInput
  }

  export type DestinationUncheckedUpdateWithoutChildrenInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    parentId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    translations?: DestinationTranslationUncheckedUpdateManyWithoutDestinationNestedInput
    categories?: DestinationCategoryUncheckedUpdateManyWithoutDestinationNestedInput
    hotels?: HotelUncheckedUpdateManyWithoutDestinationNestedInput
    guides?: GuideUncheckedUpdateManyWithoutDestinationNestedInput
    ferryRoutes?: FerryRouteUncheckedUpdateManyWithoutDestinationNestedInput
    flightRoutes?: FlightRouteUncheckedUpdateManyWithoutDestinationNestedInput
    packageLinks?: PackageDestinationUncheckedUpdateManyWithoutDestinationNestedInput
  }

  export type DestinationUpsertWithWhereUniqueWithoutParentInput = {
    where: DestinationWhereUniqueInput
    update: XOR<DestinationUpdateWithoutParentInput, DestinationUncheckedUpdateWithoutParentInput>
    create: XOR<DestinationCreateWithoutParentInput, DestinationUncheckedCreateWithoutParentInput>
  }

  export type DestinationUpdateWithWhereUniqueWithoutParentInput = {
    where: DestinationWhereUniqueInput
    data: XOR<DestinationUpdateWithoutParentInput, DestinationUncheckedUpdateWithoutParentInput>
  }

  export type DestinationUpdateManyWithWhereWithoutParentInput = {
    where: DestinationScalarWhereInput
    data: XOR<DestinationUpdateManyMutationInput, DestinationUncheckedUpdateManyWithoutParentInput>
  }

  export type DestinationScalarWhereInput = {
    AND?: DestinationScalarWhereInput | DestinationScalarWhereInput[]
    OR?: DestinationScalarWhereInput[]
    NOT?: DestinationScalarWhereInput | DestinationScalarWhereInput[]
    id?: BigIntFilter<"Destination"> | bigint | number
    parentId?: BigIntNullableFilter<"Destination"> | bigint | number | null
    name?: StringFilter<"Destination"> | string
    slug?: StringFilter<"Destination"> | string
    slugPath?: StringFilter<"Destination"> | string
    level?: EnumDestinationLevelFilter<"Destination"> | $Enums.DestinationLevel
    depth?: IntFilter<"Destination"> | number
    metaTitle?: StringNullableFilter<"Destination"> | string | null
    metaDescription?: StringNullableFilter<"Destination"> | string | null
    seoContent?: StringNullableFilter<"Destination"> | string | null
    imageUrl?: StringNullableFilter<"Destination"> | string | null
    heroImageUrl?: StringNullableFilter<"Destination"> | string | null
    gallery?: StringNullableListFilter<"Destination">
    sortOrder?: IntFilter<"Destination"> | number
    status?: EnumDestinationStatusFilter<"Destination"> | $Enums.DestinationStatus
    isFeatured?: BoolFilter<"Destination"> | boolean
    createdAt?: DateTimeFilter<"Destination"> | Date | string
    updatedAt?: DateTimeFilter<"Destination"> | Date | string
    publishedAt?: DateTimeNullableFilter<"Destination"> | Date | string | null
  }

  export type DestinationTranslationUpsertWithWhereUniqueWithoutDestinationInput = {
    where: DestinationTranslationWhereUniqueInput
    update: XOR<DestinationTranslationUpdateWithoutDestinationInput, DestinationTranslationUncheckedUpdateWithoutDestinationInput>
    create: XOR<DestinationTranslationCreateWithoutDestinationInput, DestinationTranslationUncheckedCreateWithoutDestinationInput>
  }

  export type DestinationTranslationUpdateWithWhereUniqueWithoutDestinationInput = {
    where: DestinationTranslationWhereUniqueInput
    data: XOR<DestinationTranslationUpdateWithoutDestinationInput, DestinationTranslationUncheckedUpdateWithoutDestinationInput>
  }

  export type DestinationTranslationUpdateManyWithWhereWithoutDestinationInput = {
    where: DestinationTranslationScalarWhereInput
    data: XOR<DestinationTranslationUpdateManyMutationInput, DestinationTranslationUncheckedUpdateManyWithoutDestinationInput>
  }

  export type DestinationTranslationScalarWhereInput = {
    AND?: DestinationTranslationScalarWhereInput | DestinationTranslationScalarWhereInput[]
    OR?: DestinationTranslationScalarWhereInput[]
    NOT?: DestinationTranslationScalarWhereInput | DestinationTranslationScalarWhereInput[]
    destinationId?: BigIntFilter<"DestinationTranslation"> | bigint | number
    locale?: StringFilter<"DestinationTranslation"> | string
    name?: StringFilter<"DestinationTranslation"> | string
    slug?: StringFilter<"DestinationTranslation"> | string
    metaTitle?: StringNullableFilter<"DestinationTranslation"> | string | null
    metaDescription?: StringNullableFilter<"DestinationTranslation"> | string | null
    seoContent?: StringNullableFilter<"DestinationTranslation"> | string | null
  }

  export type DestinationCategoryUpsertWithWhereUniqueWithoutDestinationInput = {
    where: DestinationCategoryWhereUniqueInput
    update: XOR<DestinationCategoryUpdateWithoutDestinationInput, DestinationCategoryUncheckedUpdateWithoutDestinationInput>
    create: XOR<DestinationCategoryCreateWithoutDestinationInput, DestinationCategoryUncheckedCreateWithoutDestinationInput>
  }

  export type DestinationCategoryUpdateWithWhereUniqueWithoutDestinationInput = {
    where: DestinationCategoryWhereUniqueInput
    data: XOR<DestinationCategoryUpdateWithoutDestinationInput, DestinationCategoryUncheckedUpdateWithoutDestinationInput>
  }

  export type DestinationCategoryUpdateManyWithWhereWithoutDestinationInput = {
    where: DestinationCategoryScalarWhereInput
    data: XOR<DestinationCategoryUpdateManyMutationInput, DestinationCategoryUncheckedUpdateManyWithoutDestinationInput>
  }

  export type DestinationCategoryScalarWhereInput = {
    AND?: DestinationCategoryScalarWhereInput | DestinationCategoryScalarWhereInput[]
    OR?: DestinationCategoryScalarWhereInput[]
    NOT?: DestinationCategoryScalarWhereInput | DestinationCategoryScalarWhereInput[]
    id?: BigIntFilter<"DestinationCategory"> | bigint | number
    destinationId?: BigIntFilter<"DestinationCategory"> | bigint | number
    name?: StringFilter<"DestinationCategory"> | string
    slug?: StringFilter<"DestinationCategory"> | string
    description?: StringNullableFilter<"DestinationCategory"> | string | null
    metaTitle?: StringNullableFilter<"DestinationCategory"> | string | null
    metaDescription?: StringNullableFilter<"DestinationCategory"> | string | null
    seoContent?: StringNullableFilter<"DestinationCategory"> | string | null
    heroImageUrl?: StringNullableFilter<"DestinationCategory"> | string | null
    sortOrder?: IntFilter<"DestinationCategory"> | number
    status?: EnumDestinationStatusFilter<"DestinationCategory"> | $Enums.DestinationStatus
    isFeatured?: BoolFilter<"DestinationCategory"> | boolean
    createdAt?: DateTimeFilter<"DestinationCategory"> | Date | string
    updatedAt?: DateTimeFilter<"DestinationCategory"> | Date | string
    publishedAt?: DateTimeNullableFilter<"DestinationCategory"> | Date | string | null
  }

  export type HotelUpsertWithWhereUniqueWithoutDestinationInput = {
    where: HotelWhereUniqueInput
    update: XOR<HotelUpdateWithoutDestinationInput, HotelUncheckedUpdateWithoutDestinationInput>
    create: XOR<HotelCreateWithoutDestinationInput, HotelUncheckedCreateWithoutDestinationInput>
  }

  export type HotelUpdateWithWhereUniqueWithoutDestinationInput = {
    where: HotelWhereUniqueInput
    data: XOR<HotelUpdateWithoutDestinationInput, HotelUncheckedUpdateWithoutDestinationInput>
  }

  export type HotelUpdateManyWithWhereWithoutDestinationInput = {
    where: HotelScalarWhereInput
    data: XOR<HotelUpdateManyMutationInput, HotelUncheckedUpdateManyWithoutDestinationInput>
  }

  export type HotelScalarWhereInput = {
    AND?: HotelScalarWhereInput | HotelScalarWhereInput[]
    OR?: HotelScalarWhereInput[]
    NOT?: HotelScalarWhereInput | HotelScalarWhereInput[]
    id?: BigIntFilter<"Hotel"> | bigint | number
    destinationId?: BigIntFilter<"Hotel"> | bigint | number
    name?: StringFilter<"Hotel"> | string
    slug?: StringFilter<"Hotel"> | string
    starRating?: IntNullableFilter<"Hotel"> | number | null
    shortDescription?: StringNullableFilter<"Hotel"> | string | null
    heroImageUrl?: StringNullableFilter<"Hotel"> | string | null
    gallery?: StringNullableListFilter<"Hotel">
    metaTitle?: StringNullableFilter<"Hotel"> | string | null
    metaDescription?: StringNullableFilter<"Hotel"> | string | null
    seoContent?: StringNullableFilter<"Hotel"> | string | null
    status?: EnumDestinationStatusFilter<"Hotel"> | $Enums.DestinationStatus
    isFeatured?: BoolFilter<"Hotel"> | boolean
    sortOrder?: IntFilter<"Hotel"> | number
    createdAt?: DateTimeFilter<"Hotel"> | Date | string
    updatedAt?: DateTimeFilter<"Hotel"> | Date | string
    publishedAt?: DateTimeNullableFilter<"Hotel"> | Date | string | null
  }

  export type GuideUpsertWithWhereUniqueWithoutDestinationInput = {
    where: GuideWhereUniqueInput
    update: XOR<GuideUpdateWithoutDestinationInput, GuideUncheckedUpdateWithoutDestinationInput>
    create: XOR<GuideCreateWithoutDestinationInput, GuideUncheckedCreateWithoutDestinationInput>
  }

  export type GuideUpdateWithWhereUniqueWithoutDestinationInput = {
    where: GuideWhereUniqueInput
    data: XOR<GuideUpdateWithoutDestinationInput, GuideUncheckedUpdateWithoutDestinationInput>
  }

  export type GuideUpdateManyWithWhereWithoutDestinationInput = {
    where: GuideScalarWhereInput
    data: XOR<GuideUpdateManyMutationInput, GuideUncheckedUpdateManyWithoutDestinationInput>
  }

  export type GuideScalarWhereInput = {
    AND?: GuideScalarWhereInput | GuideScalarWhereInput[]
    OR?: GuideScalarWhereInput[]
    NOT?: GuideScalarWhereInput | GuideScalarWhereInput[]
    id?: BigIntFilter<"Guide"> | bigint | number
    destinationId?: BigIntFilter<"Guide"> | bigint | number
    title?: StringFilter<"Guide"> | string
    slug?: StringFilter<"Guide"> | string
    excerpt?: StringNullableFilter<"Guide"> | string | null
    body?: StringNullableFilter<"Guide"> | string | null
    readingMinutes?: IntNullableFilter<"Guide"> | number | null
    heroImageUrl?: StringNullableFilter<"Guide"> | string | null
    metaTitle?: StringNullableFilter<"Guide"> | string | null
    metaDescription?: StringNullableFilter<"Guide"> | string | null
    status?: EnumDestinationStatusFilter<"Guide"> | $Enums.DestinationStatus
    isFeatured?: BoolFilter<"Guide"> | boolean
    sortOrder?: IntFilter<"Guide"> | number
    createdAt?: DateTimeFilter<"Guide"> | Date | string
    updatedAt?: DateTimeFilter<"Guide"> | Date | string
    publishedAt?: DateTimeNullableFilter<"Guide"> | Date | string | null
  }

  export type FerryRouteUpsertWithWhereUniqueWithoutDestinationInput = {
    where: FerryRouteWhereUniqueInput
    update: XOR<FerryRouteUpdateWithoutDestinationInput, FerryRouteUncheckedUpdateWithoutDestinationInput>
    create: XOR<FerryRouteCreateWithoutDestinationInput, FerryRouteUncheckedCreateWithoutDestinationInput>
  }

  export type FerryRouteUpdateWithWhereUniqueWithoutDestinationInput = {
    where: FerryRouteWhereUniqueInput
    data: XOR<FerryRouteUpdateWithoutDestinationInput, FerryRouteUncheckedUpdateWithoutDestinationInput>
  }

  export type FerryRouteUpdateManyWithWhereWithoutDestinationInput = {
    where: FerryRouteScalarWhereInput
    data: XOR<FerryRouteUpdateManyMutationInput, FerryRouteUncheckedUpdateManyWithoutDestinationInput>
  }

  export type FerryRouteScalarWhereInput = {
    AND?: FerryRouteScalarWhereInput | FerryRouteScalarWhereInput[]
    OR?: FerryRouteScalarWhereInput[]
    NOT?: FerryRouteScalarWhereInput | FerryRouteScalarWhereInput[]
    id?: BigIntFilter<"FerryRoute"> | bigint | number
    destinationId?: BigIntFilter<"FerryRoute"> | bigint | number
    name?: StringFilter<"FerryRoute"> | string
    slug?: StringFilter<"FerryRoute"> | string
    originName?: StringFilter<"FerryRoute"> | string
    destinationName?: StringFilter<"FerryRoute"> | string
    operatorName?: StringNullableFilter<"FerryRoute"> | string | null
    durationMinutes?: IntNullableFilter<"FerryRoute"> | number | null
    startingPrice?: IntNullableFilter<"FerryRoute"> | number | null
    currency?: StringFilter<"FerryRoute"> | string
    metaTitle?: StringNullableFilter<"FerryRoute"> | string | null
    metaDescription?: StringNullableFilter<"FerryRoute"> | string | null
    status?: EnumDestinationStatusFilter<"FerryRoute"> | $Enums.DestinationStatus
    isFeatured?: BoolFilter<"FerryRoute"> | boolean
    sortOrder?: IntFilter<"FerryRoute"> | number
    createdAt?: DateTimeFilter<"FerryRoute"> | Date | string
    updatedAt?: DateTimeFilter<"FerryRoute"> | Date | string
  }

  export type FlightRouteUpsertWithWhereUniqueWithoutDestinationInput = {
    where: FlightRouteWhereUniqueInput
    update: XOR<FlightRouteUpdateWithoutDestinationInput, FlightRouteUncheckedUpdateWithoutDestinationInput>
    create: XOR<FlightRouteCreateWithoutDestinationInput, FlightRouteUncheckedCreateWithoutDestinationInput>
  }

  export type FlightRouteUpdateWithWhereUniqueWithoutDestinationInput = {
    where: FlightRouteWhereUniqueInput
    data: XOR<FlightRouteUpdateWithoutDestinationInput, FlightRouteUncheckedUpdateWithoutDestinationInput>
  }

  export type FlightRouteUpdateManyWithWhereWithoutDestinationInput = {
    where: FlightRouteScalarWhereInput
    data: XOR<FlightRouteUpdateManyMutationInput, FlightRouteUncheckedUpdateManyWithoutDestinationInput>
  }

  export type FlightRouteScalarWhereInput = {
    AND?: FlightRouteScalarWhereInput | FlightRouteScalarWhereInput[]
    OR?: FlightRouteScalarWhereInput[]
    NOT?: FlightRouteScalarWhereInput | FlightRouteScalarWhereInput[]
    id?: BigIntFilter<"FlightRoute"> | bigint | number
    destinationId?: BigIntFilter<"FlightRoute"> | bigint | number
    name?: StringFilter<"FlightRoute"> | string
    slug?: StringFilter<"FlightRoute"> | string
    originIATA?: StringFilter<"FlightRoute"> | string
    destIATA?: StringFilter<"FlightRoute"> | string
    originCity?: StringFilter<"FlightRoute"> | string
    destCity?: StringFilter<"FlightRoute"> | string
    approxDurationMinutes?: IntNullableFilter<"FlightRoute"> | number | null
    startingPrice?: IntNullableFilter<"FlightRoute"> | number | null
    currency?: StringFilter<"FlightRoute"> | string
    metaTitle?: StringNullableFilter<"FlightRoute"> | string | null
    metaDescription?: StringNullableFilter<"FlightRoute"> | string | null
    status?: EnumDestinationStatusFilter<"FlightRoute"> | $Enums.DestinationStatus
    isFeatured?: BoolFilter<"FlightRoute"> | boolean
    sortOrder?: IntFilter<"FlightRoute"> | number
    createdAt?: DateTimeFilter<"FlightRoute"> | Date | string
    updatedAt?: DateTimeFilter<"FlightRoute"> | Date | string
  }

  export type PackageDestinationUpsertWithWhereUniqueWithoutDestinationInput = {
    where: PackageDestinationWhereUniqueInput
    update: XOR<PackageDestinationUpdateWithoutDestinationInput, PackageDestinationUncheckedUpdateWithoutDestinationInput>
    create: XOR<PackageDestinationCreateWithoutDestinationInput, PackageDestinationUncheckedCreateWithoutDestinationInput>
  }

  export type PackageDestinationUpdateWithWhereUniqueWithoutDestinationInput = {
    where: PackageDestinationWhereUniqueInput
    data: XOR<PackageDestinationUpdateWithoutDestinationInput, PackageDestinationUncheckedUpdateWithoutDestinationInput>
  }

  export type PackageDestinationUpdateManyWithWhereWithoutDestinationInput = {
    where: PackageDestinationScalarWhereInput
    data: XOR<PackageDestinationUpdateManyMutationInput, PackageDestinationUncheckedUpdateManyWithoutDestinationInput>
  }

  export type PackageDestinationScalarWhereInput = {
    AND?: PackageDestinationScalarWhereInput | PackageDestinationScalarWhereInput[]
    OR?: PackageDestinationScalarWhereInput[]
    NOT?: PackageDestinationScalarWhereInput | PackageDestinationScalarWhereInput[]
    packageId?: BigIntFilter<"PackageDestination"> | bigint | number
    destinationId?: BigIntFilter<"PackageDestination"> | bigint | number
    isPrimary?: BoolFilter<"PackageDestination"> | boolean
    sortOrder?: IntFilter<"PackageDestination"> | number
    nights?: IntNullableFilter<"PackageDestination"> | number | null
  }

  export type DestinationCreateWithoutTranslationsInput = {
    id?: bigint | number
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    imageUrl?: string | null
    heroImageUrl?: string | null
    gallery?: DestinationCreategalleryInput | string[]
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    parent?: DestinationCreateNestedOneWithoutChildrenInput
    children?: DestinationCreateNestedManyWithoutParentInput
    categories?: DestinationCategoryCreateNestedManyWithoutDestinationInput
    hotels?: HotelCreateNestedManyWithoutDestinationInput
    guides?: GuideCreateNestedManyWithoutDestinationInput
    ferryRoutes?: FerryRouteCreateNestedManyWithoutDestinationInput
    flightRoutes?: FlightRouteCreateNestedManyWithoutDestinationInput
    packageLinks?: PackageDestinationCreateNestedManyWithoutDestinationInput
  }

  export type DestinationUncheckedCreateWithoutTranslationsInput = {
    id?: bigint | number
    parentId?: bigint | number | null
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    imageUrl?: string | null
    heroImageUrl?: string | null
    gallery?: DestinationCreategalleryInput | string[]
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    children?: DestinationUncheckedCreateNestedManyWithoutParentInput
    categories?: DestinationCategoryUncheckedCreateNestedManyWithoutDestinationInput
    hotels?: HotelUncheckedCreateNestedManyWithoutDestinationInput
    guides?: GuideUncheckedCreateNestedManyWithoutDestinationInput
    ferryRoutes?: FerryRouteUncheckedCreateNestedManyWithoutDestinationInput
    flightRoutes?: FlightRouteUncheckedCreateNestedManyWithoutDestinationInput
    packageLinks?: PackageDestinationUncheckedCreateNestedManyWithoutDestinationInput
  }

  export type DestinationCreateOrConnectWithoutTranslationsInput = {
    where: DestinationWhereUniqueInput
    create: XOR<DestinationCreateWithoutTranslationsInput, DestinationUncheckedCreateWithoutTranslationsInput>
  }

  export type DestinationUpsertWithoutTranslationsInput = {
    update: XOR<DestinationUpdateWithoutTranslationsInput, DestinationUncheckedUpdateWithoutTranslationsInput>
    create: XOR<DestinationCreateWithoutTranslationsInput, DestinationUncheckedCreateWithoutTranslationsInput>
    where?: DestinationWhereInput
  }

  export type DestinationUpdateToOneWithWhereWithoutTranslationsInput = {
    where?: DestinationWhereInput
    data: XOR<DestinationUpdateWithoutTranslationsInput, DestinationUncheckedUpdateWithoutTranslationsInput>
  }

  export type DestinationUpdateWithoutTranslationsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    parent?: DestinationUpdateOneWithoutChildrenNestedInput
    children?: DestinationUpdateManyWithoutParentNestedInput
    categories?: DestinationCategoryUpdateManyWithoutDestinationNestedInput
    hotels?: HotelUpdateManyWithoutDestinationNestedInput
    guides?: GuideUpdateManyWithoutDestinationNestedInput
    ferryRoutes?: FerryRouteUpdateManyWithoutDestinationNestedInput
    flightRoutes?: FlightRouteUpdateManyWithoutDestinationNestedInput
    packageLinks?: PackageDestinationUpdateManyWithoutDestinationNestedInput
  }

  export type DestinationUncheckedUpdateWithoutTranslationsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    parentId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    children?: DestinationUncheckedUpdateManyWithoutParentNestedInput
    categories?: DestinationCategoryUncheckedUpdateManyWithoutDestinationNestedInput
    hotels?: HotelUncheckedUpdateManyWithoutDestinationNestedInput
    guides?: GuideUncheckedUpdateManyWithoutDestinationNestedInput
    ferryRoutes?: FerryRouteUncheckedUpdateManyWithoutDestinationNestedInput
    flightRoutes?: FlightRouteUncheckedUpdateManyWithoutDestinationNestedInput
    packageLinks?: PackageDestinationUncheckedUpdateManyWithoutDestinationNestedInput
  }

  export type DestinationCreateWithoutCategoriesInput = {
    id?: bigint | number
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    imageUrl?: string | null
    heroImageUrl?: string | null
    gallery?: DestinationCreategalleryInput | string[]
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    parent?: DestinationCreateNestedOneWithoutChildrenInput
    children?: DestinationCreateNestedManyWithoutParentInput
    translations?: DestinationTranslationCreateNestedManyWithoutDestinationInput
    hotels?: HotelCreateNestedManyWithoutDestinationInput
    guides?: GuideCreateNestedManyWithoutDestinationInput
    ferryRoutes?: FerryRouteCreateNestedManyWithoutDestinationInput
    flightRoutes?: FlightRouteCreateNestedManyWithoutDestinationInput
    packageLinks?: PackageDestinationCreateNestedManyWithoutDestinationInput
  }

  export type DestinationUncheckedCreateWithoutCategoriesInput = {
    id?: bigint | number
    parentId?: bigint | number | null
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    imageUrl?: string | null
    heroImageUrl?: string | null
    gallery?: DestinationCreategalleryInput | string[]
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    children?: DestinationUncheckedCreateNestedManyWithoutParentInput
    translations?: DestinationTranslationUncheckedCreateNestedManyWithoutDestinationInput
    hotels?: HotelUncheckedCreateNestedManyWithoutDestinationInput
    guides?: GuideUncheckedCreateNestedManyWithoutDestinationInput
    ferryRoutes?: FerryRouteUncheckedCreateNestedManyWithoutDestinationInput
    flightRoutes?: FlightRouteUncheckedCreateNestedManyWithoutDestinationInput
    packageLinks?: PackageDestinationUncheckedCreateNestedManyWithoutDestinationInput
  }

  export type DestinationCreateOrConnectWithoutCategoriesInput = {
    where: DestinationWhereUniqueInput
    create: XOR<DestinationCreateWithoutCategoriesInput, DestinationUncheckedCreateWithoutCategoriesInput>
  }

  export type PackageCategoryCreateWithoutCategoryInput = {
    sortOrder?: number
    package: PackageCreateNestedOneWithoutCategoriesInput
  }

  export type PackageCategoryUncheckedCreateWithoutCategoryInput = {
    packageId: bigint | number
    sortOrder?: number
  }

  export type PackageCategoryCreateOrConnectWithoutCategoryInput = {
    where: PackageCategoryWhereUniqueInput
    create: XOR<PackageCategoryCreateWithoutCategoryInput, PackageCategoryUncheckedCreateWithoutCategoryInput>
  }

  export type PackageCategoryCreateManyCategoryInputEnvelope = {
    data: PackageCategoryCreateManyCategoryInput | PackageCategoryCreateManyCategoryInput[]
    skipDuplicates?: boolean
  }

  export type DestinationUpsertWithoutCategoriesInput = {
    update: XOR<DestinationUpdateWithoutCategoriesInput, DestinationUncheckedUpdateWithoutCategoriesInput>
    create: XOR<DestinationCreateWithoutCategoriesInput, DestinationUncheckedCreateWithoutCategoriesInput>
    where?: DestinationWhereInput
  }

  export type DestinationUpdateToOneWithWhereWithoutCategoriesInput = {
    where?: DestinationWhereInput
    data: XOR<DestinationUpdateWithoutCategoriesInput, DestinationUncheckedUpdateWithoutCategoriesInput>
  }

  export type DestinationUpdateWithoutCategoriesInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    parent?: DestinationUpdateOneWithoutChildrenNestedInput
    children?: DestinationUpdateManyWithoutParentNestedInput
    translations?: DestinationTranslationUpdateManyWithoutDestinationNestedInput
    hotels?: HotelUpdateManyWithoutDestinationNestedInput
    guides?: GuideUpdateManyWithoutDestinationNestedInput
    ferryRoutes?: FerryRouteUpdateManyWithoutDestinationNestedInput
    flightRoutes?: FlightRouteUpdateManyWithoutDestinationNestedInput
    packageLinks?: PackageDestinationUpdateManyWithoutDestinationNestedInput
  }

  export type DestinationUncheckedUpdateWithoutCategoriesInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    parentId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    children?: DestinationUncheckedUpdateManyWithoutParentNestedInput
    translations?: DestinationTranslationUncheckedUpdateManyWithoutDestinationNestedInput
    hotels?: HotelUncheckedUpdateManyWithoutDestinationNestedInput
    guides?: GuideUncheckedUpdateManyWithoutDestinationNestedInput
    ferryRoutes?: FerryRouteUncheckedUpdateManyWithoutDestinationNestedInput
    flightRoutes?: FlightRouteUncheckedUpdateManyWithoutDestinationNestedInput
    packageLinks?: PackageDestinationUncheckedUpdateManyWithoutDestinationNestedInput
  }

  export type PackageCategoryUpsertWithWhereUniqueWithoutCategoryInput = {
    where: PackageCategoryWhereUniqueInput
    update: XOR<PackageCategoryUpdateWithoutCategoryInput, PackageCategoryUncheckedUpdateWithoutCategoryInput>
    create: XOR<PackageCategoryCreateWithoutCategoryInput, PackageCategoryUncheckedCreateWithoutCategoryInput>
  }

  export type PackageCategoryUpdateWithWhereUniqueWithoutCategoryInput = {
    where: PackageCategoryWhereUniqueInput
    data: XOR<PackageCategoryUpdateWithoutCategoryInput, PackageCategoryUncheckedUpdateWithoutCategoryInput>
  }

  export type PackageCategoryUpdateManyWithWhereWithoutCategoryInput = {
    where: PackageCategoryScalarWhereInput
    data: XOR<PackageCategoryUpdateManyMutationInput, PackageCategoryUncheckedUpdateManyWithoutCategoryInput>
  }

  export type PackageCategoryScalarWhereInput = {
    AND?: PackageCategoryScalarWhereInput | PackageCategoryScalarWhereInput[]
    OR?: PackageCategoryScalarWhereInput[]
    NOT?: PackageCategoryScalarWhereInput | PackageCategoryScalarWhereInput[]
    packageId?: BigIntFilter<"PackageCategory"> | bigint | number
    categoryId?: BigIntFilter<"PackageCategory"> | bigint | number
    sortOrder?: IntFilter<"PackageCategory"> | number
  }

  export type DestinationCreateWithoutHotelsInput = {
    id?: bigint | number
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    imageUrl?: string | null
    heroImageUrl?: string | null
    gallery?: DestinationCreategalleryInput | string[]
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    parent?: DestinationCreateNestedOneWithoutChildrenInput
    children?: DestinationCreateNestedManyWithoutParentInput
    translations?: DestinationTranslationCreateNestedManyWithoutDestinationInput
    categories?: DestinationCategoryCreateNestedManyWithoutDestinationInput
    guides?: GuideCreateNestedManyWithoutDestinationInput
    ferryRoutes?: FerryRouteCreateNestedManyWithoutDestinationInput
    flightRoutes?: FlightRouteCreateNestedManyWithoutDestinationInput
    packageLinks?: PackageDestinationCreateNestedManyWithoutDestinationInput
  }

  export type DestinationUncheckedCreateWithoutHotelsInput = {
    id?: bigint | number
    parentId?: bigint | number | null
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    imageUrl?: string | null
    heroImageUrl?: string | null
    gallery?: DestinationCreategalleryInput | string[]
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    children?: DestinationUncheckedCreateNestedManyWithoutParentInput
    translations?: DestinationTranslationUncheckedCreateNestedManyWithoutDestinationInput
    categories?: DestinationCategoryUncheckedCreateNestedManyWithoutDestinationInput
    guides?: GuideUncheckedCreateNestedManyWithoutDestinationInput
    ferryRoutes?: FerryRouteUncheckedCreateNestedManyWithoutDestinationInput
    flightRoutes?: FlightRouteUncheckedCreateNestedManyWithoutDestinationInput
    packageLinks?: PackageDestinationUncheckedCreateNestedManyWithoutDestinationInput
  }

  export type DestinationCreateOrConnectWithoutHotelsInput = {
    where: DestinationWhereUniqueInput
    create: XOR<DestinationCreateWithoutHotelsInput, DestinationUncheckedCreateWithoutHotelsInput>
  }

  export type PackageHotelCreateWithoutHotelInput = {
    nights?: number | null
    sortOrder?: number
    package: PackageCreateNestedOneWithoutHotelsInput
  }

  export type PackageHotelUncheckedCreateWithoutHotelInput = {
    packageId: bigint | number
    nights?: number | null
    sortOrder?: number
  }

  export type PackageHotelCreateOrConnectWithoutHotelInput = {
    where: PackageHotelWhereUniqueInput
    create: XOR<PackageHotelCreateWithoutHotelInput, PackageHotelUncheckedCreateWithoutHotelInput>
  }

  export type PackageHotelCreateManyHotelInputEnvelope = {
    data: PackageHotelCreateManyHotelInput | PackageHotelCreateManyHotelInput[]
    skipDuplicates?: boolean
  }

  export type DestinationUpsertWithoutHotelsInput = {
    update: XOR<DestinationUpdateWithoutHotelsInput, DestinationUncheckedUpdateWithoutHotelsInput>
    create: XOR<DestinationCreateWithoutHotelsInput, DestinationUncheckedCreateWithoutHotelsInput>
    where?: DestinationWhereInput
  }

  export type DestinationUpdateToOneWithWhereWithoutHotelsInput = {
    where?: DestinationWhereInput
    data: XOR<DestinationUpdateWithoutHotelsInput, DestinationUncheckedUpdateWithoutHotelsInput>
  }

  export type DestinationUpdateWithoutHotelsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    parent?: DestinationUpdateOneWithoutChildrenNestedInput
    children?: DestinationUpdateManyWithoutParentNestedInput
    translations?: DestinationTranslationUpdateManyWithoutDestinationNestedInput
    categories?: DestinationCategoryUpdateManyWithoutDestinationNestedInput
    guides?: GuideUpdateManyWithoutDestinationNestedInput
    ferryRoutes?: FerryRouteUpdateManyWithoutDestinationNestedInput
    flightRoutes?: FlightRouteUpdateManyWithoutDestinationNestedInput
    packageLinks?: PackageDestinationUpdateManyWithoutDestinationNestedInput
  }

  export type DestinationUncheckedUpdateWithoutHotelsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    parentId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    children?: DestinationUncheckedUpdateManyWithoutParentNestedInput
    translations?: DestinationTranslationUncheckedUpdateManyWithoutDestinationNestedInput
    categories?: DestinationCategoryUncheckedUpdateManyWithoutDestinationNestedInput
    guides?: GuideUncheckedUpdateManyWithoutDestinationNestedInput
    ferryRoutes?: FerryRouteUncheckedUpdateManyWithoutDestinationNestedInput
    flightRoutes?: FlightRouteUncheckedUpdateManyWithoutDestinationNestedInput
    packageLinks?: PackageDestinationUncheckedUpdateManyWithoutDestinationNestedInput
  }

  export type PackageHotelUpsertWithWhereUniqueWithoutHotelInput = {
    where: PackageHotelWhereUniqueInput
    update: XOR<PackageHotelUpdateWithoutHotelInput, PackageHotelUncheckedUpdateWithoutHotelInput>
    create: XOR<PackageHotelCreateWithoutHotelInput, PackageHotelUncheckedCreateWithoutHotelInput>
  }

  export type PackageHotelUpdateWithWhereUniqueWithoutHotelInput = {
    where: PackageHotelWhereUniqueInput
    data: XOR<PackageHotelUpdateWithoutHotelInput, PackageHotelUncheckedUpdateWithoutHotelInput>
  }

  export type PackageHotelUpdateManyWithWhereWithoutHotelInput = {
    where: PackageHotelScalarWhereInput
    data: XOR<PackageHotelUpdateManyMutationInput, PackageHotelUncheckedUpdateManyWithoutHotelInput>
  }

  export type PackageHotelScalarWhereInput = {
    AND?: PackageHotelScalarWhereInput | PackageHotelScalarWhereInput[]
    OR?: PackageHotelScalarWhereInput[]
    NOT?: PackageHotelScalarWhereInput | PackageHotelScalarWhereInput[]
    packageId?: BigIntFilter<"PackageHotel"> | bigint | number
    hotelId?: BigIntFilter<"PackageHotel"> | bigint | number
    nights?: IntNullableFilter<"PackageHotel"> | number | null
    sortOrder?: IntFilter<"PackageHotel"> | number
  }

  export type PackageDestinationCreateWithoutPackageInput = {
    isPrimary?: boolean
    sortOrder?: number
    nights?: number | null
    destination: DestinationCreateNestedOneWithoutPackageLinksInput
  }

  export type PackageDestinationUncheckedCreateWithoutPackageInput = {
    destinationId: bigint | number
    isPrimary?: boolean
    sortOrder?: number
    nights?: number | null
  }

  export type PackageDestinationCreateOrConnectWithoutPackageInput = {
    where: PackageDestinationWhereUniqueInput
    create: XOR<PackageDestinationCreateWithoutPackageInput, PackageDestinationUncheckedCreateWithoutPackageInput>
  }

  export type PackageDestinationCreateManyPackageInputEnvelope = {
    data: PackageDestinationCreateManyPackageInput | PackageDestinationCreateManyPackageInput[]
    skipDuplicates?: boolean
  }

  export type PackageHotelCreateWithoutPackageInput = {
    nights?: number | null
    sortOrder?: number
    hotel: HotelCreateNestedOneWithoutPackageLinksInput
  }

  export type PackageHotelUncheckedCreateWithoutPackageInput = {
    hotelId: bigint | number
    nights?: number | null
    sortOrder?: number
  }

  export type PackageHotelCreateOrConnectWithoutPackageInput = {
    where: PackageHotelWhereUniqueInput
    create: XOR<PackageHotelCreateWithoutPackageInput, PackageHotelUncheckedCreateWithoutPackageInput>
  }

  export type PackageHotelCreateManyPackageInputEnvelope = {
    data: PackageHotelCreateManyPackageInput | PackageHotelCreateManyPackageInput[]
    skipDuplicates?: boolean
  }

  export type PackageCategoryCreateWithoutPackageInput = {
    sortOrder?: number
    category: DestinationCategoryCreateNestedOneWithoutPackageLinksInput
  }

  export type PackageCategoryUncheckedCreateWithoutPackageInput = {
    categoryId: bigint | number
    sortOrder?: number
  }

  export type PackageCategoryCreateOrConnectWithoutPackageInput = {
    where: PackageCategoryWhereUniqueInput
    create: XOR<PackageCategoryCreateWithoutPackageInput, PackageCategoryUncheckedCreateWithoutPackageInput>
  }

  export type PackageCategoryCreateManyPackageInputEnvelope = {
    data: PackageCategoryCreateManyPackageInput | PackageCategoryCreateManyPackageInput[]
    skipDuplicates?: boolean
  }

  export type PackageDestinationUpsertWithWhereUniqueWithoutPackageInput = {
    where: PackageDestinationWhereUniqueInput
    update: XOR<PackageDestinationUpdateWithoutPackageInput, PackageDestinationUncheckedUpdateWithoutPackageInput>
    create: XOR<PackageDestinationCreateWithoutPackageInput, PackageDestinationUncheckedCreateWithoutPackageInput>
  }

  export type PackageDestinationUpdateWithWhereUniqueWithoutPackageInput = {
    where: PackageDestinationWhereUniqueInput
    data: XOR<PackageDestinationUpdateWithoutPackageInput, PackageDestinationUncheckedUpdateWithoutPackageInput>
  }

  export type PackageDestinationUpdateManyWithWhereWithoutPackageInput = {
    where: PackageDestinationScalarWhereInput
    data: XOR<PackageDestinationUpdateManyMutationInput, PackageDestinationUncheckedUpdateManyWithoutPackageInput>
  }

  export type PackageHotelUpsertWithWhereUniqueWithoutPackageInput = {
    where: PackageHotelWhereUniqueInput
    update: XOR<PackageHotelUpdateWithoutPackageInput, PackageHotelUncheckedUpdateWithoutPackageInput>
    create: XOR<PackageHotelCreateWithoutPackageInput, PackageHotelUncheckedCreateWithoutPackageInput>
  }

  export type PackageHotelUpdateWithWhereUniqueWithoutPackageInput = {
    where: PackageHotelWhereUniqueInput
    data: XOR<PackageHotelUpdateWithoutPackageInput, PackageHotelUncheckedUpdateWithoutPackageInput>
  }

  export type PackageHotelUpdateManyWithWhereWithoutPackageInput = {
    where: PackageHotelScalarWhereInput
    data: XOR<PackageHotelUpdateManyMutationInput, PackageHotelUncheckedUpdateManyWithoutPackageInput>
  }

  export type PackageCategoryUpsertWithWhereUniqueWithoutPackageInput = {
    where: PackageCategoryWhereUniqueInput
    update: XOR<PackageCategoryUpdateWithoutPackageInput, PackageCategoryUncheckedUpdateWithoutPackageInput>
    create: XOR<PackageCategoryCreateWithoutPackageInput, PackageCategoryUncheckedCreateWithoutPackageInput>
  }

  export type PackageCategoryUpdateWithWhereUniqueWithoutPackageInput = {
    where: PackageCategoryWhereUniqueInput
    data: XOR<PackageCategoryUpdateWithoutPackageInput, PackageCategoryUncheckedUpdateWithoutPackageInput>
  }

  export type PackageCategoryUpdateManyWithWhereWithoutPackageInput = {
    where: PackageCategoryScalarWhereInput
    data: XOR<PackageCategoryUpdateManyMutationInput, PackageCategoryUncheckedUpdateManyWithoutPackageInput>
  }

  export type PackageCreateWithoutDestinationsInput = {
    id?: bigint | number
    title: string
    slug: string
    shortDescription?: string | null
    durationDays?: number | null
    durationNights?: number | null
    startingPrice?: number | null
    currency?: string
    heroImageUrl?: string | null
    gallery?: PackageCreategalleryInput | string[]
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    hotels?: PackageHotelCreateNestedManyWithoutPackageInput
    categories?: PackageCategoryCreateNestedManyWithoutPackageInput
  }

  export type PackageUncheckedCreateWithoutDestinationsInput = {
    id?: bigint | number
    title: string
    slug: string
    shortDescription?: string | null
    durationDays?: number | null
    durationNights?: number | null
    startingPrice?: number | null
    currency?: string
    heroImageUrl?: string | null
    gallery?: PackageCreategalleryInput | string[]
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    hotels?: PackageHotelUncheckedCreateNestedManyWithoutPackageInput
    categories?: PackageCategoryUncheckedCreateNestedManyWithoutPackageInput
  }

  export type PackageCreateOrConnectWithoutDestinationsInput = {
    where: PackageWhereUniqueInput
    create: XOR<PackageCreateWithoutDestinationsInput, PackageUncheckedCreateWithoutDestinationsInput>
  }

  export type DestinationCreateWithoutPackageLinksInput = {
    id?: bigint | number
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    imageUrl?: string | null
    heroImageUrl?: string | null
    gallery?: DestinationCreategalleryInput | string[]
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    parent?: DestinationCreateNestedOneWithoutChildrenInput
    children?: DestinationCreateNestedManyWithoutParentInput
    translations?: DestinationTranslationCreateNestedManyWithoutDestinationInput
    categories?: DestinationCategoryCreateNestedManyWithoutDestinationInput
    hotels?: HotelCreateNestedManyWithoutDestinationInput
    guides?: GuideCreateNestedManyWithoutDestinationInput
    ferryRoutes?: FerryRouteCreateNestedManyWithoutDestinationInput
    flightRoutes?: FlightRouteCreateNestedManyWithoutDestinationInput
  }

  export type DestinationUncheckedCreateWithoutPackageLinksInput = {
    id?: bigint | number
    parentId?: bigint | number | null
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    imageUrl?: string | null
    heroImageUrl?: string | null
    gallery?: DestinationCreategalleryInput | string[]
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    children?: DestinationUncheckedCreateNestedManyWithoutParentInput
    translations?: DestinationTranslationUncheckedCreateNestedManyWithoutDestinationInput
    categories?: DestinationCategoryUncheckedCreateNestedManyWithoutDestinationInput
    hotels?: HotelUncheckedCreateNestedManyWithoutDestinationInput
    guides?: GuideUncheckedCreateNestedManyWithoutDestinationInput
    ferryRoutes?: FerryRouteUncheckedCreateNestedManyWithoutDestinationInput
    flightRoutes?: FlightRouteUncheckedCreateNestedManyWithoutDestinationInput
  }

  export type DestinationCreateOrConnectWithoutPackageLinksInput = {
    where: DestinationWhereUniqueInput
    create: XOR<DestinationCreateWithoutPackageLinksInput, DestinationUncheckedCreateWithoutPackageLinksInput>
  }

  export type PackageUpsertWithoutDestinationsInput = {
    update: XOR<PackageUpdateWithoutDestinationsInput, PackageUncheckedUpdateWithoutDestinationsInput>
    create: XOR<PackageCreateWithoutDestinationsInput, PackageUncheckedCreateWithoutDestinationsInput>
    where?: PackageWhereInput
  }

  export type PackageUpdateToOneWithWhereWithoutDestinationsInput = {
    where?: PackageWhereInput
    data: XOR<PackageUpdateWithoutDestinationsInput, PackageUncheckedUpdateWithoutDestinationsInput>
  }

  export type PackageUpdateWithoutDestinationsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    durationDays?: NullableIntFieldUpdateOperationsInput | number | null
    durationNights?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: PackageUpdategalleryInput | string[]
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    hotels?: PackageHotelUpdateManyWithoutPackageNestedInput
    categories?: PackageCategoryUpdateManyWithoutPackageNestedInput
  }

  export type PackageUncheckedUpdateWithoutDestinationsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    durationDays?: NullableIntFieldUpdateOperationsInput | number | null
    durationNights?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: PackageUpdategalleryInput | string[]
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    hotels?: PackageHotelUncheckedUpdateManyWithoutPackageNestedInput
    categories?: PackageCategoryUncheckedUpdateManyWithoutPackageNestedInput
  }

  export type DestinationUpsertWithoutPackageLinksInput = {
    update: XOR<DestinationUpdateWithoutPackageLinksInput, DestinationUncheckedUpdateWithoutPackageLinksInput>
    create: XOR<DestinationCreateWithoutPackageLinksInput, DestinationUncheckedCreateWithoutPackageLinksInput>
    where?: DestinationWhereInput
  }

  export type DestinationUpdateToOneWithWhereWithoutPackageLinksInput = {
    where?: DestinationWhereInput
    data: XOR<DestinationUpdateWithoutPackageLinksInput, DestinationUncheckedUpdateWithoutPackageLinksInput>
  }

  export type DestinationUpdateWithoutPackageLinksInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    parent?: DestinationUpdateOneWithoutChildrenNestedInput
    children?: DestinationUpdateManyWithoutParentNestedInput
    translations?: DestinationTranslationUpdateManyWithoutDestinationNestedInput
    categories?: DestinationCategoryUpdateManyWithoutDestinationNestedInput
    hotels?: HotelUpdateManyWithoutDestinationNestedInput
    guides?: GuideUpdateManyWithoutDestinationNestedInput
    ferryRoutes?: FerryRouteUpdateManyWithoutDestinationNestedInput
    flightRoutes?: FlightRouteUpdateManyWithoutDestinationNestedInput
  }

  export type DestinationUncheckedUpdateWithoutPackageLinksInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    parentId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    children?: DestinationUncheckedUpdateManyWithoutParentNestedInput
    translations?: DestinationTranslationUncheckedUpdateManyWithoutDestinationNestedInput
    categories?: DestinationCategoryUncheckedUpdateManyWithoutDestinationNestedInput
    hotels?: HotelUncheckedUpdateManyWithoutDestinationNestedInput
    guides?: GuideUncheckedUpdateManyWithoutDestinationNestedInput
    ferryRoutes?: FerryRouteUncheckedUpdateManyWithoutDestinationNestedInput
    flightRoutes?: FlightRouteUncheckedUpdateManyWithoutDestinationNestedInput
  }

  export type PackageCreateWithoutHotelsInput = {
    id?: bigint | number
    title: string
    slug: string
    shortDescription?: string | null
    durationDays?: number | null
    durationNights?: number | null
    startingPrice?: number | null
    currency?: string
    heroImageUrl?: string | null
    gallery?: PackageCreategalleryInput | string[]
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    destinations?: PackageDestinationCreateNestedManyWithoutPackageInput
    categories?: PackageCategoryCreateNestedManyWithoutPackageInput
  }

  export type PackageUncheckedCreateWithoutHotelsInput = {
    id?: bigint | number
    title: string
    slug: string
    shortDescription?: string | null
    durationDays?: number | null
    durationNights?: number | null
    startingPrice?: number | null
    currency?: string
    heroImageUrl?: string | null
    gallery?: PackageCreategalleryInput | string[]
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    destinations?: PackageDestinationUncheckedCreateNestedManyWithoutPackageInput
    categories?: PackageCategoryUncheckedCreateNestedManyWithoutPackageInput
  }

  export type PackageCreateOrConnectWithoutHotelsInput = {
    where: PackageWhereUniqueInput
    create: XOR<PackageCreateWithoutHotelsInput, PackageUncheckedCreateWithoutHotelsInput>
  }

  export type HotelCreateWithoutPackageLinksInput = {
    id?: bigint | number
    name: string
    slug: string
    starRating?: number | null
    shortDescription?: string | null
    heroImageUrl?: string | null
    gallery?: HotelCreategalleryInput | string[]
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    destination: DestinationCreateNestedOneWithoutHotelsInput
  }

  export type HotelUncheckedCreateWithoutPackageLinksInput = {
    id?: bigint | number
    destinationId: bigint | number
    name: string
    slug: string
    starRating?: number | null
    shortDescription?: string | null
    heroImageUrl?: string | null
    gallery?: HotelCreategalleryInput | string[]
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
  }

  export type HotelCreateOrConnectWithoutPackageLinksInput = {
    where: HotelWhereUniqueInput
    create: XOR<HotelCreateWithoutPackageLinksInput, HotelUncheckedCreateWithoutPackageLinksInput>
  }

  export type PackageUpsertWithoutHotelsInput = {
    update: XOR<PackageUpdateWithoutHotelsInput, PackageUncheckedUpdateWithoutHotelsInput>
    create: XOR<PackageCreateWithoutHotelsInput, PackageUncheckedCreateWithoutHotelsInput>
    where?: PackageWhereInput
  }

  export type PackageUpdateToOneWithWhereWithoutHotelsInput = {
    where?: PackageWhereInput
    data: XOR<PackageUpdateWithoutHotelsInput, PackageUncheckedUpdateWithoutHotelsInput>
  }

  export type PackageUpdateWithoutHotelsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    durationDays?: NullableIntFieldUpdateOperationsInput | number | null
    durationNights?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: PackageUpdategalleryInput | string[]
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    destinations?: PackageDestinationUpdateManyWithoutPackageNestedInput
    categories?: PackageCategoryUpdateManyWithoutPackageNestedInput
  }

  export type PackageUncheckedUpdateWithoutHotelsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    durationDays?: NullableIntFieldUpdateOperationsInput | number | null
    durationNights?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: PackageUpdategalleryInput | string[]
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    destinations?: PackageDestinationUncheckedUpdateManyWithoutPackageNestedInput
    categories?: PackageCategoryUncheckedUpdateManyWithoutPackageNestedInput
  }

  export type HotelUpsertWithoutPackageLinksInput = {
    update: XOR<HotelUpdateWithoutPackageLinksInput, HotelUncheckedUpdateWithoutPackageLinksInput>
    create: XOR<HotelCreateWithoutPackageLinksInput, HotelUncheckedCreateWithoutPackageLinksInput>
    where?: HotelWhereInput
  }

  export type HotelUpdateToOneWithWhereWithoutPackageLinksInput = {
    where?: HotelWhereInput
    data: XOR<HotelUpdateWithoutPackageLinksInput, HotelUncheckedUpdateWithoutPackageLinksInput>
  }

  export type HotelUpdateWithoutPackageLinksInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    starRating?: NullableIntFieldUpdateOperationsInput | number | null
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: HotelUpdategalleryInput | string[]
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    destination?: DestinationUpdateOneRequiredWithoutHotelsNestedInput
  }

  export type HotelUncheckedUpdateWithoutPackageLinksInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    destinationId?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    starRating?: NullableIntFieldUpdateOperationsInput | number | null
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: HotelUpdategalleryInput | string[]
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PackageCreateWithoutCategoriesInput = {
    id?: bigint | number
    title: string
    slug: string
    shortDescription?: string | null
    durationDays?: number | null
    durationNights?: number | null
    startingPrice?: number | null
    currency?: string
    heroImageUrl?: string | null
    gallery?: PackageCreategalleryInput | string[]
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    destinations?: PackageDestinationCreateNestedManyWithoutPackageInput
    hotels?: PackageHotelCreateNestedManyWithoutPackageInput
  }

  export type PackageUncheckedCreateWithoutCategoriesInput = {
    id?: bigint | number
    title: string
    slug: string
    shortDescription?: string | null
    durationDays?: number | null
    durationNights?: number | null
    startingPrice?: number | null
    currency?: string
    heroImageUrl?: string | null
    gallery?: PackageCreategalleryInput | string[]
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    destinations?: PackageDestinationUncheckedCreateNestedManyWithoutPackageInput
    hotels?: PackageHotelUncheckedCreateNestedManyWithoutPackageInput
  }

  export type PackageCreateOrConnectWithoutCategoriesInput = {
    where: PackageWhereUniqueInput
    create: XOR<PackageCreateWithoutCategoriesInput, PackageUncheckedCreateWithoutCategoriesInput>
  }

  export type DestinationCategoryCreateWithoutPackageLinksInput = {
    id?: bigint | number
    name: string
    slug: string
    description?: string | null
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    heroImageUrl?: string | null
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    destination: DestinationCreateNestedOneWithoutCategoriesInput
  }

  export type DestinationCategoryUncheckedCreateWithoutPackageLinksInput = {
    id?: bigint | number
    destinationId: bigint | number
    name: string
    slug: string
    description?: string | null
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    heroImageUrl?: string | null
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
  }

  export type DestinationCategoryCreateOrConnectWithoutPackageLinksInput = {
    where: DestinationCategoryWhereUniqueInput
    create: XOR<DestinationCategoryCreateWithoutPackageLinksInput, DestinationCategoryUncheckedCreateWithoutPackageLinksInput>
  }

  export type PackageUpsertWithoutCategoriesInput = {
    update: XOR<PackageUpdateWithoutCategoriesInput, PackageUncheckedUpdateWithoutCategoriesInput>
    create: XOR<PackageCreateWithoutCategoriesInput, PackageUncheckedCreateWithoutCategoriesInput>
    where?: PackageWhereInput
  }

  export type PackageUpdateToOneWithWhereWithoutCategoriesInput = {
    where?: PackageWhereInput
    data: XOR<PackageUpdateWithoutCategoriesInput, PackageUncheckedUpdateWithoutCategoriesInput>
  }

  export type PackageUpdateWithoutCategoriesInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    durationDays?: NullableIntFieldUpdateOperationsInput | number | null
    durationNights?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: PackageUpdategalleryInput | string[]
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    destinations?: PackageDestinationUpdateManyWithoutPackageNestedInput
    hotels?: PackageHotelUpdateManyWithoutPackageNestedInput
  }

  export type PackageUncheckedUpdateWithoutCategoriesInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    durationDays?: NullableIntFieldUpdateOperationsInput | number | null
    durationNights?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: PackageUpdategalleryInput | string[]
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    destinations?: PackageDestinationUncheckedUpdateManyWithoutPackageNestedInput
    hotels?: PackageHotelUncheckedUpdateManyWithoutPackageNestedInput
  }

  export type DestinationCategoryUpsertWithoutPackageLinksInput = {
    update: XOR<DestinationCategoryUpdateWithoutPackageLinksInput, DestinationCategoryUncheckedUpdateWithoutPackageLinksInput>
    create: XOR<DestinationCategoryCreateWithoutPackageLinksInput, DestinationCategoryUncheckedCreateWithoutPackageLinksInput>
    where?: DestinationCategoryWhereInput
  }

  export type DestinationCategoryUpdateToOneWithWhereWithoutPackageLinksInput = {
    where?: DestinationCategoryWhereInput
    data: XOR<DestinationCategoryUpdateWithoutPackageLinksInput, DestinationCategoryUncheckedUpdateWithoutPackageLinksInput>
  }

  export type DestinationCategoryUpdateWithoutPackageLinksInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    destination?: DestinationUpdateOneRequiredWithoutCategoriesNestedInput
  }

  export type DestinationCategoryUncheckedUpdateWithoutPackageLinksInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    destinationId?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DestinationCreateWithoutGuidesInput = {
    id?: bigint | number
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    imageUrl?: string | null
    heroImageUrl?: string | null
    gallery?: DestinationCreategalleryInput | string[]
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    parent?: DestinationCreateNestedOneWithoutChildrenInput
    children?: DestinationCreateNestedManyWithoutParentInput
    translations?: DestinationTranslationCreateNestedManyWithoutDestinationInput
    categories?: DestinationCategoryCreateNestedManyWithoutDestinationInput
    hotels?: HotelCreateNestedManyWithoutDestinationInput
    ferryRoutes?: FerryRouteCreateNestedManyWithoutDestinationInput
    flightRoutes?: FlightRouteCreateNestedManyWithoutDestinationInput
    packageLinks?: PackageDestinationCreateNestedManyWithoutDestinationInput
  }

  export type DestinationUncheckedCreateWithoutGuidesInput = {
    id?: bigint | number
    parentId?: bigint | number | null
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    imageUrl?: string | null
    heroImageUrl?: string | null
    gallery?: DestinationCreategalleryInput | string[]
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    children?: DestinationUncheckedCreateNestedManyWithoutParentInput
    translations?: DestinationTranslationUncheckedCreateNestedManyWithoutDestinationInput
    categories?: DestinationCategoryUncheckedCreateNestedManyWithoutDestinationInput
    hotels?: HotelUncheckedCreateNestedManyWithoutDestinationInput
    ferryRoutes?: FerryRouteUncheckedCreateNestedManyWithoutDestinationInput
    flightRoutes?: FlightRouteUncheckedCreateNestedManyWithoutDestinationInput
    packageLinks?: PackageDestinationUncheckedCreateNestedManyWithoutDestinationInput
  }

  export type DestinationCreateOrConnectWithoutGuidesInput = {
    where: DestinationWhereUniqueInput
    create: XOR<DestinationCreateWithoutGuidesInput, DestinationUncheckedCreateWithoutGuidesInput>
  }

  export type DestinationUpsertWithoutGuidesInput = {
    update: XOR<DestinationUpdateWithoutGuidesInput, DestinationUncheckedUpdateWithoutGuidesInput>
    create: XOR<DestinationCreateWithoutGuidesInput, DestinationUncheckedCreateWithoutGuidesInput>
    where?: DestinationWhereInput
  }

  export type DestinationUpdateToOneWithWhereWithoutGuidesInput = {
    where?: DestinationWhereInput
    data: XOR<DestinationUpdateWithoutGuidesInput, DestinationUncheckedUpdateWithoutGuidesInput>
  }

  export type DestinationUpdateWithoutGuidesInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    parent?: DestinationUpdateOneWithoutChildrenNestedInput
    children?: DestinationUpdateManyWithoutParentNestedInput
    translations?: DestinationTranslationUpdateManyWithoutDestinationNestedInput
    categories?: DestinationCategoryUpdateManyWithoutDestinationNestedInput
    hotels?: HotelUpdateManyWithoutDestinationNestedInput
    ferryRoutes?: FerryRouteUpdateManyWithoutDestinationNestedInput
    flightRoutes?: FlightRouteUpdateManyWithoutDestinationNestedInput
    packageLinks?: PackageDestinationUpdateManyWithoutDestinationNestedInput
  }

  export type DestinationUncheckedUpdateWithoutGuidesInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    parentId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    children?: DestinationUncheckedUpdateManyWithoutParentNestedInput
    translations?: DestinationTranslationUncheckedUpdateManyWithoutDestinationNestedInput
    categories?: DestinationCategoryUncheckedUpdateManyWithoutDestinationNestedInput
    hotels?: HotelUncheckedUpdateManyWithoutDestinationNestedInput
    ferryRoutes?: FerryRouteUncheckedUpdateManyWithoutDestinationNestedInput
    flightRoutes?: FlightRouteUncheckedUpdateManyWithoutDestinationNestedInput
    packageLinks?: PackageDestinationUncheckedUpdateManyWithoutDestinationNestedInput
  }

  export type DestinationCreateWithoutFerryRoutesInput = {
    id?: bigint | number
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    imageUrl?: string | null
    heroImageUrl?: string | null
    gallery?: DestinationCreategalleryInput | string[]
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    parent?: DestinationCreateNestedOneWithoutChildrenInput
    children?: DestinationCreateNestedManyWithoutParentInput
    translations?: DestinationTranslationCreateNestedManyWithoutDestinationInput
    categories?: DestinationCategoryCreateNestedManyWithoutDestinationInput
    hotels?: HotelCreateNestedManyWithoutDestinationInput
    guides?: GuideCreateNestedManyWithoutDestinationInput
    flightRoutes?: FlightRouteCreateNestedManyWithoutDestinationInput
    packageLinks?: PackageDestinationCreateNestedManyWithoutDestinationInput
  }

  export type DestinationUncheckedCreateWithoutFerryRoutesInput = {
    id?: bigint | number
    parentId?: bigint | number | null
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    imageUrl?: string | null
    heroImageUrl?: string | null
    gallery?: DestinationCreategalleryInput | string[]
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    children?: DestinationUncheckedCreateNestedManyWithoutParentInput
    translations?: DestinationTranslationUncheckedCreateNestedManyWithoutDestinationInput
    categories?: DestinationCategoryUncheckedCreateNestedManyWithoutDestinationInput
    hotels?: HotelUncheckedCreateNestedManyWithoutDestinationInput
    guides?: GuideUncheckedCreateNestedManyWithoutDestinationInput
    flightRoutes?: FlightRouteUncheckedCreateNestedManyWithoutDestinationInput
    packageLinks?: PackageDestinationUncheckedCreateNestedManyWithoutDestinationInput
  }

  export type DestinationCreateOrConnectWithoutFerryRoutesInput = {
    where: DestinationWhereUniqueInput
    create: XOR<DestinationCreateWithoutFerryRoutesInput, DestinationUncheckedCreateWithoutFerryRoutesInput>
  }

  export type DestinationUpsertWithoutFerryRoutesInput = {
    update: XOR<DestinationUpdateWithoutFerryRoutesInput, DestinationUncheckedUpdateWithoutFerryRoutesInput>
    create: XOR<DestinationCreateWithoutFerryRoutesInput, DestinationUncheckedCreateWithoutFerryRoutesInput>
    where?: DestinationWhereInput
  }

  export type DestinationUpdateToOneWithWhereWithoutFerryRoutesInput = {
    where?: DestinationWhereInput
    data: XOR<DestinationUpdateWithoutFerryRoutesInput, DestinationUncheckedUpdateWithoutFerryRoutesInput>
  }

  export type DestinationUpdateWithoutFerryRoutesInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    parent?: DestinationUpdateOneWithoutChildrenNestedInput
    children?: DestinationUpdateManyWithoutParentNestedInput
    translations?: DestinationTranslationUpdateManyWithoutDestinationNestedInput
    categories?: DestinationCategoryUpdateManyWithoutDestinationNestedInput
    hotels?: HotelUpdateManyWithoutDestinationNestedInput
    guides?: GuideUpdateManyWithoutDestinationNestedInput
    flightRoutes?: FlightRouteUpdateManyWithoutDestinationNestedInput
    packageLinks?: PackageDestinationUpdateManyWithoutDestinationNestedInput
  }

  export type DestinationUncheckedUpdateWithoutFerryRoutesInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    parentId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    children?: DestinationUncheckedUpdateManyWithoutParentNestedInput
    translations?: DestinationTranslationUncheckedUpdateManyWithoutDestinationNestedInput
    categories?: DestinationCategoryUncheckedUpdateManyWithoutDestinationNestedInput
    hotels?: HotelUncheckedUpdateManyWithoutDestinationNestedInput
    guides?: GuideUncheckedUpdateManyWithoutDestinationNestedInput
    flightRoutes?: FlightRouteUncheckedUpdateManyWithoutDestinationNestedInput
    packageLinks?: PackageDestinationUncheckedUpdateManyWithoutDestinationNestedInput
  }

  export type DestinationCreateWithoutFlightRoutesInput = {
    id?: bigint | number
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    imageUrl?: string | null
    heroImageUrl?: string | null
    gallery?: DestinationCreategalleryInput | string[]
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    parent?: DestinationCreateNestedOneWithoutChildrenInput
    children?: DestinationCreateNestedManyWithoutParentInput
    translations?: DestinationTranslationCreateNestedManyWithoutDestinationInput
    categories?: DestinationCategoryCreateNestedManyWithoutDestinationInput
    hotels?: HotelCreateNestedManyWithoutDestinationInput
    guides?: GuideCreateNestedManyWithoutDestinationInput
    ferryRoutes?: FerryRouteCreateNestedManyWithoutDestinationInput
    packageLinks?: PackageDestinationCreateNestedManyWithoutDestinationInput
  }

  export type DestinationUncheckedCreateWithoutFlightRoutesInput = {
    id?: bigint | number
    parentId?: bigint | number | null
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    imageUrl?: string | null
    heroImageUrl?: string | null
    gallery?: DestinationCreategalleryInput | string[]
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    children?: DestinationUncheckedCreateNestedManyWithoutParentInput
    translations?: DestinationTranslationUncheckedCreateNestedManyWithoutDestinationInput
    categories?: DestinationCategoryUncheckedCreateNestedManyWithoutDestinationInput
    hotels?: HotelUncheckedCreateNestedManyWithoutDestinationInput
    guides?: GuideUncheckedCreateNestedManyWithoutDestinationInput
    ferryRoutes?: FerryRouteUncheckedCreateNestedManyWithoutDestinationInput
    packageLinks?: PackageDestinationUncheckedCreateNestedManyWithoutDestinationInput
  }

  export type DestinationCreateOrConnectWithoutFlightRoutesInput = {
    where: DestinationWhereUniqueInput
    create: XOR<DestinationCreateWithoutFlightRoutesInput, DestinationUncheckedCreateWithoutFlightRoutesInput>
  }

  export type DestinationUpsertWithoutFlightRoutesInput = {
    update: XOR<DestinationUpdateWithoutFlightRoutesInput, DestinationUncheckedUpdateWithoutFlightRoutesInput>
    create: XOR<DestinationCreateWithoutFlightRoutesInput, DestinationUncheckedCreateWithoutFlightRoutesInput>
    where?: DestinationWhereInput
  }

  export type DestinationUpdateToOneWithWhereWithoutFlightRoutesInput = {
    where?: DestinationWhereInput
    data: XOR<DestinationUpdateWithoutFlightRoutesInput, DestinationUncheckedUpdateWithoutFlightRoutesInput>
  }

  export type DestinationUpdateWithoutFlightRoutesInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    parent?: DestinationUpdateOneWithoutChildrenNestedInput
    children?: DestinationUpdateManyWithoutParentNestedInput
    translations?: DestinationTranslationUpdateManyWithoutDestinationNestedInput
    categories?: DestinationCategoryUpdateManyWithoutDestinationNestedInput
    hotels?: HotelUpdateManyWithoutDestinationNestedInput
    guides?: GuideUpdateManyWithoutDestinationNestedInput
    ferryRoutes?: FerryRouteUpdateManyWithoutDestinationNestedInput
    packageLinks?: PackageDestinationUpdateManyWithoutDestinationNestedInput
  }

  export type DestinationUncheckedUpdateWithoutFlightRoutesInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    parentId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    children?: DestinationUncheckedUpdateManyWithoutParentNestedInput
    translations?: DestinationTranslationUncheckedUpdateManyWithoutDestinationNestedInput
    categories?: DestinationCategoryUncheckedUpdateManyWithoutDestinationNestedInput
    hotels?: HotelUncheckedUpdateManyWithoutDestinationNestedInput
    guides?: GuideUncheckedUpdateManyWithoutDestinationNestedInput
    ferryRoutes?: FerryRouteUncheckedUpdateManyWithoutDestinationNestedInput
    packageLinks?: PackageDestinationUncheckedUpdateManyWithoutDestinationNestedInput
  }

  export type DestinationCreateManyParentInput = {
    id?: bigint | number
    name: string
    slug: string
    slugPath: string
    level: $Enums.DestinationLevel
    depth: number
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    imageUrl?: string | null
    heroImageUrl?: string | null
    gallery?: DestinationCreategalleryInput | string[]
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
  }

  export type DestinationTranslationCreateManyDestinationInput = {
    locale: string
    name: string
    slug: string
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
  }

  export type DestinationCategoryCreateManyDestinationInput = {
    id?: bigint | number
    name: string
    slug: string
    description?: string | null
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    heroImageUrl?: string | null
    sortOrder?: number
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
  }

  export type HotelCreateManyDestinationInput = {
    id?: bigint | number
    name: string
    slug: string
    starRating?: number | null
    shortDescription?: string | null
    heroImageUrl?: string | null
    gallery?: HotelCreategalleryInput | string[]
    metaTitle?: string | null
    metaDescription?: string | null
    seoContent?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
  }

  export type GuideCreateManyDestinationInput = {
    id?: bigint | number
    title: string
    slug: string
    excerpt?: string | null
    body?: string | null
    readingMinutes?: number | null
    heroImageUrl?: string | null
    metaTitle?: string | null
    metaDescription?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
  }

  export type FerryRouteCreateManyDestinationInput = {
    id?: bigint | number
    name: string
    slug: string
    originName: string
    destinationName: string
    operatorName?: string | null
    durationMinutes?: number | null
    startingPrice?: number | null
    currency?: string
    metaTitle?: string | null
    metaDescription?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FlightRouteCreateManyDestinationInput = {
    id?: bigint | number
    name: string
    slug: string
    originIATA: string
    destIATA: string
    originCity: string
    destCity: string
    approxDurationMinutes?: number | null
    startingPrice?: number | null
    currency?: string
    metaTitle?: string | null
    metaDescription?: string | null
    status?: $Enums.DestinationStatus
    isFeatured?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PackageDestinationCreateManyDestinationInput = {
    packageId: bigint | number
    isPrimary?: boolean
    sortOrder?: number
    nights?: number | null
  }

  export type DestinationUpdateWithoutParentInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    children?: DestinationUpdateManyWithoutParentNestedInput
    translations?: DestinationTranslationUpdateManyWithoutDestinationNestedInput
    categories?: DestinationCategoryUpdateManyWithoutDestinationNestedInput
    hotels?: HotelUpdateManyWithoutDestinationNestedInput
    guides?: GuideUpdateManyWithoutDestinationNestedInput
    ferryRoutes?: FerryRouteUpdateManyWithoutDestinationNestedInput
    flightRoutes?: FlightRouteUpdateManyWithoutDestinationNestedInput
    packageLinks?: PackageDestinationUpdateManyWithoutDestinationNestedInput
  }

  export type DestinationUncheckedUpdateWithoutParentInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    children?: DestinationUncheckedUpdateManyWithoutParentNestedInput
    translations?: DestinationTranslationUncheckedUpdateManyWithoutDestinationNestedInput
    categories?: DestinationCategoryUncheckedUpdateManyWithoutDestinationNestedInput
    hotels?: HotelUncheckedUpdateManyWithoutDestinationNestedInput
    guides?: GuideUncheckedUpdateManyWithoutDestinationNestedInput
    ferryRoutes?: FerryRouteUncheckedUpdateManyWithoutDestinationNestedInput
    flightRoutes?: FlightRouteUncheckedUpdateManyWithoutDestinationNestedInput
    packageLinks?: PackageDestinationUncheckedUpdateManyWithoutDestinationNestedInput
  }

  export type DestinationUncheckedUpdateManyWithoutParentInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    slugPath?: StringFieldUpdateOperationsInput | string
    level?: EnumDestinationLevelFieldUpdateOperationsInput | $Enums.DestinationLevel
    depth?: IntFieldUpdateOperationsInput | number
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: DestinationUpdategalleryInput | string[]
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DestinationTranslationUpdateWithoutDestinationInput = {
    locale?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DestinationTranslationUncheckedUpdateWithoutDestinationInput = {
    locale?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DestinationTranslationUncheckedUpdateManyWithoutDestinationInput = {
    locale?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DestinationCategoryUpdateWithoutDestinationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    packageLinks?: PackageCategoryUpdateManyWithoutCategoryNestedInput
  }

  export type DestinationCategoryUncheckedUpdateWithoutDestinationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    packageLinks?: PackageCategoryUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type DestinationCategoryUncheckedUpdateManyWithoutDestinationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type HotelUpdateWithoutDestinationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    starRating?: NullableIntFieldUpdateOperationsInput | number | null
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: HotelUpdategalleryInput | string[]
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    packageLinks?: PackageHotelUpdateManyWithoutHotelNestedInput
  }

  export type HotelUncheckedUpdateWithoutDestinationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    starRating?: NullableIntFieldUpdateOperationsInput | number | null
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: HotelUpdategalleryInput | string[]
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    packageLinks?: PackageHotelUncheckedUpdateManyWithoutHotelNestedInput
  }

  export type HotelUncheckedUpdateManyWithoutDestinationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    starRating?: NullableIntFieldUpdateOperationsInput | number | null
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    gallery?: HotelUpdategalleryInput | string[]
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    seoContent?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type GuideUpdateWithoutDestinationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    excerpt?: NullableStringFieldUpdateOperationsInput | string | null
    body?: NullableStringFieldUpdateOperationsInput | string | null
    readingMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type GuideUncheckedUpdateWithoutDestinationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    excerpt?: NullableStringFieldUpdateOperationsInput | string | null
    body?: NullableStringFieldUpdateOperationsInput | string | null
    readingMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type GuideUncheckedUpdateManyWithoutDestinationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    excerpt?: NullableStringFieldUpdateOperationsInput | string | null
    body?: NullableStringFieldUpdateOperationsInput | string | null
    readingMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type FerryRouteUpdateWithoutDestinationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    originName?: StringFieldUpdateOperationsInput | string
    destinationName?: StringFieldUpdateOperationsInput | string
    operatorName?: NullableStringFieldUpdateOperationsInput | string | null
    durationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FerryRouteUncheckedUpdateWithoutDestinationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    originName?: StringFieldUpdateOperationsInput | string
    destinationName?: StringFieldUpdateOperationsInput | string
    operatorName?: NullableStringFieldUpdateOperationsInput | string | null
    durationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FerryRouteUncheckedUpdateManyWithoutDestinationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    originName?: StringFieldUpdateOperationsInput | string
    destinationName?: StringFieldUpdateOperationsInput | string
    operatorName?: NullableStringFieldUpdateOperationsInput | string | null
    durationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FlightRouteUpdateWithoutDestinationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    originIATA?: StringFieldUpdateOperationsInput | string
    destIATA?: StringFieldUpdateOperationsInput | string
    originCity?: StringFieldUpdateOperationsInput | string
    destCity?: StringFieldUpdateOperationsInput | string
    approxDurationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FlightRouteUncheckedUpdateWithoutDestinationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    originIATA?: StringFieldUpdateOperationsInput | string
    destIATA?: StringFieldUpdateOperationsInput | string
    originCity?: StringFieldUpdateOperationsInput | string
    destCity?: StringFieldUpdateOperationsInput | string
    approxDurationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FlightRouteUncheckedUpdateManyWithoutDestinationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    originIATA?: StringFieldUpdateOperationsInput | string
    destIATA?: StringFieldUpdateOperationsInput | string
    originCity?: StringFieldUpdateOperationsInput | string
    destCity?: StringFieldUpdateOperationsInput | string
    approxDurationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    startingPrice?: NullableIntFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumDestinationStatusFieldUpdateOperationsInput | $Enums.DestinationStatus
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PackageDestinationUpdateWithoutDestinationInput = {
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    nights?: NullableIntFieldUpdateOperationsInput | number | null
    package?: PackageUpdateOneRequiredWithoutDestinationsNestedInput
  }

  export type PackageDestinationUncheckedUpdateWithoutDestinationInput = {
    packageId?: BigIntFieldUpdateOperationsInput | bigint | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    nights?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type PackageDestinationUncheckedUpdateManyWithoutDestinationInput = {
    packageId?: BigIntFieldUpdateOperationsInput | bigint | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    nights?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type PackageCategoryCreateManyCategoryInput = {
    packageId: bigint | number
    sortOrder?: number
  }

  export type PackageCategoryUpdateWithoutCategoryInput = {
    sortOrder?: IntFieldUpdateOperationsInput | number
    package?: PackageUpdateOneRequiredWithoutCategoriesNestedInput
  }

  export type PackageCategoryUncheckedUpdateWithoutCategoryInput = {
    packageId?: BigIntFieldUpdateOperationsInput | bigint | number
    sortOrder?: IntFieldUpdateOperationsInput | number
  }

  export type PackageCategoryUncheckedUpdateManyWithoutCategoryInput = {
    packageId?: BigIntFieldUpdateOperationsInput | bigint | number
    sortOrder?: IntFieldUpdateOperationsInput | number
  }

  export type PackageHotelCreateManyHotelInput = {
    packageId: bigint | number
    nights?: number | null
    sortOrder?: number
  }

  export type PackageHotelUpdateWithoutHotelInput = {
    nights?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    package?: PackageUpdateOneRequiredWithoutHotelsNestedInput
  }

  export type PackageHotelUncheckedUpdateWithoutHotelInput = {
    packageId?: BigIntFieldUpdateOperationsInput | bigint | number
    nights?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
  }

  export type PackageHotelUncheckedUpdateManyWithoutHotelInput = {
    packageId?: BigIntFieldUpdateOperationsInput | bigint | number
    nights?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
  }

  export type PackageDestinationCreateManyPackageInput = {
    destinationId: bigint | number
    isPrimary?: boolean
    sortOrder?: number
    nights?: number | null
  }

  export type PackageHotelCreateManyPackageInput = {
    hotelId: bigint | number
    nights?: number | null
    sortOrder?: number
  }

  export type PackageCategoryCreateManyPackageInput = {
    categoryId: bigint | number
    sortOrder?: number
  }

  export type PackageDestinationUpdateWithoutPackageInput = {
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    nights?: NullableIntFieldUpdateOperationsInput | number | null
    destination?: DestinationUpdateOneRequiredWithoutPackageLinksNestedInput
  }

  export type PackageDestinationUncheckedUpdateWithoutPackageInput = {
    destinationId?: BigIntFieldUpdateOperationsInput | bigint | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    nights?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type PackageDestinationUncheckedUpdateManyWithoutPackageInput = {
    destinationId?: BigIntFieldUpdateOperationsInput | bigint | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    nights?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type PackageHotelUpdateWithoutPackageInput = {
    nights?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    hotel?: HotelUpdateOneRequiredWithoutPackageLinksNestedInput
  }

  export type PackageHotelUncheckedUpdateWithoutPackageInput = {
    hotelId?: BigIntFieldUpdateOperationsInput | bigint | number
    nights?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
  }

  export type PackageHotelUncheckedUpdateManyWithoutPackageInput = {
    hotelId?: BigIntFieldUpdateOperationsInput | bigint | number
    nights?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
  }

  export type PackageCategoryUpdateWithoutPackageInput = {
    sortOrder?: IntFieldUpdateOperationsInput | number
    category?: DestinationCategoryUpdateOneRequiredWithoutPackageLinksNestedInput
  }

  export type PackageCategoryUncheckedUpdateWithoutPackageInput = {
    categoryId?: BigIntFieldUpdateOperationsInput | bigint | number
    sortOrder?: IntFieldUpdateOperationsInput | number
  }

  export type PackageCategoryUncheckedUpdateManyWithoutPackageInput = {
    categoryId?: BigIntFieldUpdateOperationsInput | bigint | number
    sortOrder?: IntFieldUpdateOperationsInput | number
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use DestinationCountOutputTypeDefaultArgs instead
     */
    export type DestinationCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DestinationCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DestinationCategoryCountOutputTypeDefaultArgs instead
     */
    export type DestinationCategoryCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DestinationCategoryCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use HotelCountOutputTypeDefaultArgs instead
     */
    export type HotelCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = HotelCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PackageCountOutputTypeDefaultArgs instead
     */
    export type PackageCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PackageCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DestinationDefaultArgs instead
     */
    export type DestinationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DestinationDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DestinationTranslationDefaultArgs instead
     */
    export type DestinationTranslationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DestinationTranslationDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DestinationCategoryDefaultArgs instead
     */
    export type DestinationCategoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DestinationCategoryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use HotelDefaultArgs instead
     */
    export type HotelArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = HotelDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PackageDefaultArgs instead
     */
    export type PackageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PackageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PackageDestinationDefaultArgs instead
     */
    export type PackageDestinationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PackageDestinationDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PackageHotelDefaultArgs instead
     */
    export type PackageHotelArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PackageHotelDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PackageCategoryDefaultArgs instead
     */
    export type PackageCategoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PackageCategoryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GuideDefaultArgs instead
     */
    export type GuideArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GuideDefaultArgs<ExtArgs>
    /**
     * @deprecated Use FerryRouteDefaultArgs instead
     */
    export type FerryRouteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FerryRouteDefaultArgs<ExtArgs>
    /**
     * @deprecated Use FlightRouteDefaultArgs instead
     */
    export type FlightRouteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FlightRouteDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SlugHistoryDefaultArgs instead
     */
    export type SlugHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SlugHistoryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RedirectDefaultArgs instead
     */
    export type RedirectArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RedirectDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}