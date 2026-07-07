export type {
  HierarchyResolution,
  DestinationDetail,
  DestinationCategoryDetail,
  BreadcrumbItem,
  NavigationCountryNode,
  PackageNode,
  HotelNode,
  GuideNode,
  FerryRouteNode,
  FlightRouteNode,
  DestinationTreeNode,
} from "@/lib/hierarchy";

export interface DestinationChildCard {
  id: string;
  name: string;
  href: string;
  image: string | null;
  eyebrow: string;
}
