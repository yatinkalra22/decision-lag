import { NextResponse } from 'next/server';

export async function POST() {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!slackWebhookUrl) {
    console.error('Slack Webhook URL is not configured.');
    return new Response(JSON.stringify({ success: false, message: 'Slack Webhook URL is not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await fetch(slackWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "⚠️ DecisionLag Alert\nHigh-risk insight viewed but not acted upon.\nDecision Debt threshold exceeded."
      })
    });

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error('Error sending Slack alert:', error);
    return new Response(JSON.stringify({ success: false, message: 'Error sending Slack alert.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
