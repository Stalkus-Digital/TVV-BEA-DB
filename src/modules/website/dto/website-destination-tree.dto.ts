export interface WebsiteDestinationTreeNodeDTO {
  id: string;
  slug: string;
  name: string;
  children: WebsiteDestinationTreeNodeDTO[];
}
