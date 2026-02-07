// config/email.js
const SibApiV3Sdk = require("sib-api-v3-sdk");

const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Set your API key from .env
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Export transactional email API instance
const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

module.exports = emailApi;
