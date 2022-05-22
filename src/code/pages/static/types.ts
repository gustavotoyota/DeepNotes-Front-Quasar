export interface IRole {
  id: string;
  name: string;
  description: string;
  rank: number;
  permissions: IRolePermissions;
}
export interface IRolePermissions {
  manageOwnRank: boolean;
  manageLowerRanks: boolean;

  editPages: boolean;
}
