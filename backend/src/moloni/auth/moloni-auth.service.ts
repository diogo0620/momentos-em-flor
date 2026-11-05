
import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { MoloniEncryptionService } from '../encryption/moloni-encryption.service';

interface MoloniTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in?: number | string;
  token_type?: string;
}

interface MoloniTokenError {
  error?: string;
  error_description?: string;
}

@Injectable()
export class MoloniAuthService {
  private readonly grantUrl = 'https://api.moloni.pt/v1/grant/';

  private readonly refreshSafetyWindowMs = 60_000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: MoloniEncryptionService,
  ) {}

  /**
   * Returns a valid access token.
   *
   * If the current token is expired or close to expiration,
   * attempts to refresh it.
   *
   * If the refresh token is rejected, authenticates again
   * using the stored credentials.
   */
  async getValidAccessToken(): Promise<string> {
    const settings = await this.getSettings();

    if (!settings) {
      throw new InternalServerErrorException(
        'A integração com a Moloni não está configurada.',
      );
    }

    if (
      settings.accessToken &&
      settings.accessTokenExpiresAt &&
      settings.accessTokenExpiresAt.getTime() >
        Date.now() + this.refreshSafetyWindowMs
    ) {
      return this.encryption.decrypt(settings.accessToken);
    }

    if (settings.refreshToken) {
      try {
        return await this.refreshAccessToken();
      } catch (error) {
        if (!(error instanceof MoloniRefreshTokenException)) {
          throw error;
        }
      }
    }

    return this.authenticate();
  }

  /**
   * Authenticates using the stored Moloni credentials.
   */
  async authenticate(): Promise<string> {
    const settings = await this.getSettings();

    if (!settings) {
      throw new InternalServerErrorException(
        'A integração com a Moloni não está configurada.',
      );
    }

    const clientId = settings.clientId;
    const clientSecret = this.encryption.decrypt(settings.clientSecret);
    const username = settings.username;
    const password = this.encryption.decrypt(settings.password);

    const tokens = await this.requestTokens({
      grant_type: 'password',
      client_id: clientId,
      client_secret: clientSecret,
      username,
      password,
    });

    await this.saveTokens(settings.id, tokens);

    return tokens.access_token;
  }

  /**
   * Refreshes the access token.
   *
   * Moloni rotates the refresh token, so both tokens
   * must be persisted after a successful refresh.
   */
  async refreshAccessToken(): Promise<string> {
    const settings = await this.getSettings();

    if (!settings?.refreshToken) {
      throw new MoloniRefreshTokenException();
    }

    const clientId = settings.clientId;
    const clientSecret = this.encryption.decrypt(settings.clientSecret);
    const refreshToken = this.encryption.decrypt(settings.refreshToken);

    const tokens = await this.requestTokens({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    });

    await this.saveTokens(settings.id, tokens);

    return tokens.access_token;
  }

  /**
   * Sends an authentication request to Moloni.
   */
  private async requestTokens(
    params: Record<string, string>,
  ): Promise<MoloniTokenResponse> {
    const query = new URLSearchParams(params);

    let response: Response;

    try {
      response = await fetch(
        `${this.grantUrl}?${query.toString()}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(15_000),
        },
      );
    } catch {
      throw new ServiceUnavailableException(
        'Não foi possível estabelecer ligação com a Moloni.',
      );
    }

    let payload: unknown;

    try {
      payload = await response.json();
    } catch {
      throw new ServiceUnavailableException(
        'A Moloni devolveu uma resposta de autenticação inválida.',
      );
    }

    if (!response.ok) {
      const error = payload as MoloniTokenError;

      if (
        params.grant_type === 'refresh_token' &&
        (response.status === 400 || response.status === 401)
      ) {
        throw new MoloniRefreshTokenException();
      }

      throw new ServiceUnavailableException(
        error.error_description ||
          'A autenticação com a Moloni falhou. Verifica as credenciais e a configuração da aplicação.',
      );
    }

    const tokens = payload as MoloniTokenResponse;

    if (
      !tokens.access_token ||
      !tokens.refresh_token
    ) {
      throw new ServiceUnavailableException(
        'A Moloni não devolveu os tokens de autenticação esperados.',
      );
    }

    return tokens;
  }

  /**
   * Persists encrypted tokens and their expiration date.
   */
  private async saveTokens(
    settingsId: number,
    tokens: MoloniTokenResponse,
  ): Promise<void> {
    const expiresIn = Number(tokens.expires_in ?? 3600);

    if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
      throw new ServiceUnavailableException(
        'A Moloni devolveu um prazo de validade de token inválido.',
      );
    }

    const accessTokenExpiresAt = new Date(
      Date.now() + expiresIn * 1000,
    );

    await this.prisma.moloniSettings.update({
      where: {
        id: settingsId,
      },
      data: {
        accessToken: this.encryption.encrypt(tokens.access_token),
        refreshToken: this.encryption.encrypt(tokens.refresh_token),
        accessTokenExpiresAt,
      },
    });
  }

  /**
   * Retrieves the stored Moloni configuration.
   */
  private async getSettings() {
    return this.prisma.moloniSettings.findUnique({
      where: {
        id: 1,
      },
    });
  }
}

/**
 * Internal exception used to distinguish an invalid refresh token
 * from connectivity or server errors.
 */
class MoloniRefreshTokenException extends Error {
  constructor() {
    super('O refresh token da Moloni deixou de ser válido.');
    this.name = 'MoloniRefreshTokenException';
  }
}
