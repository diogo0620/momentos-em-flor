
import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'node:crypto';

@Injectable()
export class MoloniEncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 12;
  private readonly authTagLength = 16;

  constructor(
    private readonly configService: ConfigService,
  ) {}

  /**
   * Encrypts a string using AES-256-GCM.
   */
  encrypt(value: string): string {
    if (typeof value !== 'string') {
      throw new InternalServerErrorException(
        'O valor a cifrar tem de ser uma string.',
      );
    }

    const key = this.getEncryptionKey();
    const iv = randomBytes(this.ivLength);

    const cipher = createCipheriv(
      this.algorithm,
      key,
      iv,
      {
        authTagLength: this.authTagLength,
      },
    );

    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
      'v1',
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted.toString('base64'),
    ].join(':');
  }

  /**
   * Decrypts a value previously encrypted with encrypt().
   */
  decrypt(encryptedValue: string): string {

    if (
      typeof encryptedValue !== 'string' ||
      !encryptedValue
    ) {
      throw new InternalServerErrorException(
        'O valor cifrado é inválido.',
      );
    }

    const parts = encryptedValue.split(':');

    if (
      parts.length !== 4 ||
      parts[0] !== 'v1'
    ) {
      throw new InternalServerErrorException(
        'O formato do valor cifrado é inválido.',
      );
    }

    const [
      ,
      ivBase64,
      authTagBase64,
      ciphertextBase64,
    ] = parts;

    try {
      const key = this.getEncryptionKey();

      const iv = Buffer.from(ivBase64, 'base64');
      const authTag = Buffer.from(authTagBase64, 'base64');
      const ciphertext = Buffer.from(ciphertextBase64, 'base64');

      if (
        iv.length !== this.ivLength ||
        authTag.length !== this.authTagLength
      ) {
        throw new Error('Invalid encrypted data.');
      }

      const decipher = createDecipheriv(
        this.algorithm,
        key,
        iv,
        {
          authTagLength: this.authTagLength,
        },
      );

      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch {
      throw new InternalServerErrorException(
        'Não foi possível decifrar o valor. Verifica a chave de cifra e a integridade dos dados.',
      );
    }
  }

  /**
   * Retrieves the encryption key from environment variables.
   */
  private getEncryptionKey(): Buffer {
    const encodedKey = this.configService.get<string>(
      'MOLONI_ENCRYPTION_KEY',
    );

    if (!encodedKey) {
      throw new InternalServerErrorException(
        'A variável MOLONI_ENCRYPTION_KEY não está configurada.',
      );
    }

    const key = Buffer.from(encodedKey, 'base64');

    if (key.length !== 32) {
      throw new InternalServerErrorException(
        'MOLONI_ENCRYPTION_KEY tem de conter uma chave de 32 bytes em Base64.',
      );
    }

    return key;
  }
}
