import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import { getHomepageService } from "../module";
import type { HomepageResponseDTO } from "../dto/website-homepage.dto";

export async function getHomepageHandler(): Promise<Result<HomepageResponseDTO, AppError>> {
  return getHomepageService().getHomepage();
}
