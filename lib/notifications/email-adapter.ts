export type EmailMessage = {
  to: string;
  subject: string;
  body: string;
};

export type EmailSendResult = {
  providerMessageId: string;
};

export interface EmailAdapter {
  send(message: EmailMessage): Promise<EmailSendResult>;
}

export class ConsoleEmailAdapter implements EmailAdapter {
  async send(message: EmailMessage) {
    console.log("[email]", message);
    return {
      providerMessageId: `console-${Date.now()}`
    };
  }
}

export class NoopEmailAdapter implements EmailAdapter {
  async send() {
    return {
      providerMessageId: `noop-${Date.now()}`
    };
  }
}

