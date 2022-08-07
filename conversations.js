let [,, quote, phoneNumbers] = process.argv;

// retrieve twilio client (need secrets)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// retrieve phone number array
phoneNumbers = JSON.parse(phoneNumbers).records.map(record => record.fields.number);

// retrieve quote
quote = JSON.parse(quote).records[0].fields.quote;

// send quote
sendMessage();

async function sendMessage() {

    // create empty conversation
    let conversation = await client.conversations.v1.conversations.create({friendlyName: 'Quote Recipients'});

    // add phone numbers to conversation
    await phoneNumbers.forEach(number => addPhoneNumber(conversation.sid, number));

    // create message in conversation
    await client.conversations.v1.conversations(conversation.sid).messages.create({author: 'Quote', body: quote});

    // attach Studio Flow to conversation
    await client.conversations.v1.conversations(conversation.sid).webhooks.create({
      'configuration.flowSid': 'FW738979ea1b5270b6bb2aa62ce1413323',
      'configuration.replayAfter': 0,
      target: 'studio'
   });

}

async function addPhoneNumber(conversationSID, number) {
      await client.conversations.v1.conversations(conversationSID).participants.create({
            'messagingBinding.address': number,
            'messagingBinding.proxyAddress': '+19787889426'
      });
}