export class CreateAuthAccessTokenDto {
  id?: string;
  access_token_expires_at: number;
  client_id: string;
  user_id: string;
  refresh_token_id: string;
}

export class UpdateAuthClientDto implements Partial<CreateAuthAccessTokenDto> {}
