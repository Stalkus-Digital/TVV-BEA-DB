import { loadAppConfig, type AppConfig } from "./env";

/**
 * Loads and validates configuration once per process, then serves cached,
 * typed reads. Future modules should read config through this service (or
 * their own module-scoped equivalent built the same way) rather than
 * reading process.env directly.
 */
export class ConfigService {
  private static instance: ConfigService | undefined;
  private readonly config: AppConfig;

  private constructor(config: AppConfig) {
    this.config = config;
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService(loadAppConfig());
    }
    return ConfigService.instance;
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  getAll(): Readonly<AppConfig> {
    return this.config;
  }
}
