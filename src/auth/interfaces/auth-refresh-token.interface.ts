export interface IAuthRefreshToken {
  id: string;
  refresh_token_expires_at: number;
  client_id: string;
  user_id: string;
  last_used_at: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}
