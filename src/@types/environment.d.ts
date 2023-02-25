declare namespace NodeJS {
  interface ProcessEnv {
    /* General */

    NODE_ENV: 'development' | 'test' | 'production';

    /* Defined in .env */

    // Telegram
    TELEGRAM_BOT_TOKEN: string;
  }
}
