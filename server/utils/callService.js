const twilio = require('twilio');

// Initialize Twilio client
const accountSid = 'YOUR_TWILIO_ACCOUNT_SID'; // Replace with your Twilio SID
const authToken = 'YOUR_TWILIO_AUTH_TOKEN'; // Replace with your Twilio token
const twilioPhoneNumber = 'YOUR_TWILIO_PHONE_NUMBER'; // Replace with your Twilio phone number

const client = twilio(accountSid, authToken);

// Function to make an outbound call
async function makeCall(to, url, from = twilioPhoneNumber) {
  try {
    const call = await client.calls.create({
      to: to,
      from: from,
      url: url // A URL to TwiML instructions for the call
    });
    
    return {
      success: true,
      callSid: call.sid
    };
  } catch (error) {
    console.error('Error making call:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to generate TwiML for a call
function generateCallTwiML(options) {
  const { message, voiceName = 'alice', record = false, timeout = 20 } = options;
  
  let twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voiceName}">${message}</Say>`;
  
  if (record) {
    twiml += `
  <Record maxLength="120" timeout="${timeout}" />`;
  }
  
  twiml += `
</Response>`;
  
  return twiml;
}

// Function to retrieve call details
async function getCallDetails(callSid) {
  try {
    const call = await client.calls(callSid).fetch();
    return {
      success: true,
      callDetails: call
    };
  } catch (error) {
    console.error('Error retrieving call details:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  makeCall,
  generateCallTwiML,
  getCallDetails
};