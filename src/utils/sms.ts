// SMS Utility - Placeholder for SMS integration (e.g., Termii, Africa's Talking)
export interface SMSPayload {
  to: string;
  message: string;
}

export async function sendSMS(payload: SMSPayload): Promise<{ success: boolean; message: string }> {
  const API_KEY = import.meta.env.VITE_SMS_API_KEY;

  if (!API_KEY) {
    console.warn("SMS API key not configured. Message logged to console instead.");
    console.log(`[SMS] To: ${payload.to} | Message: ${payload.message}`);
    return { success: true, message: "SMS logged to console (no API key configured)." };
  }

  // Example integration with Termii API
  try {
    const response = await fetch("https://api.ng.termii.com/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: API_KEY,
        to: payload.to,
        from: "ScoreDesk",
        sms: payload.message,
        type: "plain",
        channel: "generic",
      }),
    });

    if (!response.ok) throw new Error("SMS sending failed");

    return { success: true, message: "SMS sent successfully." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
