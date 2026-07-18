import type { WebsiteDestinationSummaryDTO } from "./website-destination.dto";
import type { QuickLinkDTO } from "./website-homepage.dto";

export interface MenuItemDTO {
  label: string;
  url: string;
  children?: MenuItemDTO[];
}

export interface FooterColumnDTO {
  title: string;
  links: MenuItemDTO[];
}

export interface NavigationResponseDTO {
  menu: MenuItemDTO[];
  footer: { columns: FooterColumnDTO[] };
  quickLinks: QuickLinkDTO[];
  popularDestinations: WebsiteDestinationSummaryDTO[];
  /** Links from CMS Pages → Add to nav */
  customNavLinks?: MenuItemDTO[];
}
