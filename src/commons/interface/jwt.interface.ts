export interface IJwt {
  isAdmin: boolean;
  sub: string;
  permission_ids: string;
  role: string;
}
