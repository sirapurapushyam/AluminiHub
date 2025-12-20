const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class GoogleAuthService {
  async verifyGoogleToken(idToken) {
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      return {
        googleId: payload['sub'],
        email: payload['email'],
        firstName: payload['given_name'],
        lastName: payload['family_name'],
        picture: payload['picture'],
        emailVerified: payload['email_verified']
      };
    } catch (error) {
      throw new Error('Invalid Google token');
    }
  }
}

module.exports = new GoogleAuthService();