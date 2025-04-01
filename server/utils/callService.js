// server/utils/callService.js
// MOCK VERSION - No real Twilio functionality

// Function to make an outbound call (mocked)
async function makeCall(to, url, from = '+18106418555') {
  console.log(`[MOCK] Would call ${to} from ${from} with URL: ${url}`);
  
  // Return a successful mock response
  return {
    success: true,
    callSid: 'MOCK_CALL_' + Math.random().toString(36).substring(2, 10),
    message: 'This is a mock call. No actual call was made.'
  };
}

// Function to generate TwiML for a call
function generateCallTwiML(options) {
  const { message, voiceName = 'alice', record = false, timeout = 20 } = options;
  
  console.log(`[MOCK] Generated TwiML with message: ${message}`);
  
  // Just return the TwiML without actually using it
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

// Function to retrieve call details (mocked)
async function getCallDetails(callSid) {
  console.log(`[MOCK] Would get details for call: ${callSid}`);
  
  // Return mock call details
  return {
    success: true,
    callDetails: {
      status: 'completed',
      duration: '120',
      from: '+18106418555',
      to: 'DESTINATION_NUMBER',
      direction: 'outbound-api',
      sid: callSid
    }
  };
}

module.exports = {
  makeCall,
  generateCallTwiML,
  getCallDetails
};