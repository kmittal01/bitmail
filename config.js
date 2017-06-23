const urljoin = require('url-join');

const BASE_URL = 'http://127.0.0.1:8887';
module.exports = {
  BASE_URL: BASE_URL,
  GOOGLE: {
    CLIENT_ID: '754340727995-696o4ge4a147eqfdcgj1p3jakm3tceip.apps.googleusercontent.com',
    CLIENT_SECRET: 'ozNc3RNb_u1bTojXOOiC25j7',
    OAUTH2_SCOPES : [
      'https://www.googleapis.com/auth/userinfo#email',
      'https://mail.google.com/'
    ],
    OAUTH2_REDIRECT_URL: urljoin(BASE_URL, 'auth/google/callback/'),
    PROJECT_ID: 'bitemailer-171607',
    GMAIL_PUBSUB_TOPIC: 'projects/bitemailer-171607/topics/gmail_events'
  }
};
