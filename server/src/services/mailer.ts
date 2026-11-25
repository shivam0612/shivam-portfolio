import nodemailer, { type Transporter } from 'nodemailer';
import type { EmailConfig } from '../config/env.js';
import { headerSafe } from '../lib/text.js';
import type { StoredContactMessage } from '../repositories/types.js';
import { buildOwnerNotification, buildVisitorAcknowledgement } from './emailTemplates.js';

export interface Mailer {
  /** False when SMTP is not configured; notifications then stay PENDING instead of being lost. */
  readonly configured: boolean;
  sendOwnerNotification(msg: StoredContactMessage): Promise<void>;
  sendVisitorAcknowledgement(msg: StoredContactMessage): Promise<void>;
}

export class UnconfiguredMailer implements Mailer {
  readonly configured = false;
  async sendOwnerNotification(): Promise<void> {
    throw new Error('SMTP is not configured');
  }
  async sendVisitorAcknowledgement(): Promise<void> {
    throw new Error('SMTP is not configured');
  }
}

export class SmtpMailer implements Mailer {
  readonly configured = true;
  private readonly transport: Transporter;

  constructor(
    private readonly config: EmailConfig,
    private readonly siteName: string,
  ) {
    this.transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      // Never send credentials over an unencrypted connection.
      requireTLS: !config.secure && Boolean(config.user),
      auth: config.user && config.pass ? { user: config.user, pass: config.pass } : undefined,
      connectionTimeout: config.timeoutMs,
      greetingTimeout: config.timeoutMs,
      socketTimeout: config.timeoutMs,
    });
  }

  async sendOwnerNotification(msg: StoredContactMessage): Promise<void> {
    const content = buildOwnerNotification(msg, this.siteName);
    const info = await this.transport.sendMail({
      from: this.config.from,
      to: this.config.notifyTo,
      replyTo: { name: headerSafe(msg.name, 100), address: msg.email },
      ...content,
    });
    // SMTP "accepted" means the relay took responsibility, not that the inbox received it.
    if (info.rejected && info.rejected.length > 0)
      throw new Error('Recipient rejected by SMTP server');
  }

  async sendVisitorAcknowledgement(msg: StoredContactMessage): Promise<void> {
    const content = buildVisitorAcknowledgement(msg, this.siteName.replace(/ Portfolio$/, ''));
    const info = await this.transport.sendMail({
      from: this.config.from,
      to: { name: headerSafe(msg.name, 100), address: msg.email },
      ...content,
    });
    if (info.rejected && info.rejected.length > 0)
      throw new Error('Recipient rejected by SMTP server');
  }
}

export function createMailer(email: EmailConfig | null, siteName: string): Mailer {
  return email ? new SmtpMailer(email, siteName) : new UnconfiguredMailer();
}
