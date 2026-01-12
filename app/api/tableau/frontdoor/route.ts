import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

/**
 * API Route: /api/tableau/frontdoor
 *
 * Generates a Salesforce Frontdoor URL using the user's existing OAuth session.
 * This URL is used to authenticate the Tableau Analytics SDK without client credentials.
 *
 * SECURITY: This route can work in two modes:
 * 1. Session-based (recommended): Uses Iron Session to get access token
 * 2. Token-based (for client components): Accepts token in request body
 */
export async function POST(request: NextRequest) {
  try {
    let accessToken: string | undefined;
    let instanceUrl: string | undefined;

    // Try to get credentials from session first (most secure)
    const session = await getSession();
    if (session.isLoggedIn && session.accessToken && session.instanceUrl) {
      accessToken = session.accessToken;
      instanceUrl = session.instanceUrl;
    } else {
      // Fallback: Get from request body (for client components)
      const body = await request.json();
      accessToken = body.accessToken;
      instanceUrl = body.instanceUrl;
    }

    // Validate required parameters
    if (!accessToken || !instanceUrl) {
      return NextResponse.json(
        {
          error: 'Not authenticated',
          details: 'Please log in to Salesforce first'
        },
        { status: 401 }
      );
    }

    // Call Salesforce Single Access API to generate frontdoor URL
    const singleAccessUrl = `${instanceUrl}/services/oauth2/singleaccess`;
    
    const response = await fetch(singleAccessUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle Salesforce API errors
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: await response.text() };
      }

      console.error('Salesforce API Error:', errorData);

      // Provide helpful error messages based on the error type
      let errorMessage = 'Failed to generate frontdoor URL';
      let helpfulHint = '';

      const errorCode = errorData.error || errorData.errorCode || '';

      if (errorCode.toLowerCase().includes('invalid_scope') || errorCode.toLowerCase().includes('scope')) {
        errorMessage = '❌ Missing Wave API Scope';
        helpfulHint = `
Your Salesforce Connected App is missing the "wave_api" OAuth scope.

To fix this:
1. Go to Salesforce Setup
2. Navigate to: App Manager
3. Find your "Decision Lag" Connected App
4. Click "Edit"
5. Scroll to "Selected OAuth Scopes"
6. Add "Access Wave API (wave_api)" to the selected scopes
7. Save
8. Log out and log back in to get a new token with the correct scope

Current scopes in your token may not include wave_api.
        `.trim();
      } else if (response.status === 401) {
        errorMessage = '❌ Authentication Failed';
        helpfulHint = 'Your access token may have expired. Please log out and log back in.';
      } else if (response.status === 403) {
        errorMessage = '❌ Access Denied';
        helpfulHint = 'Your user may not have permission to access CRM Analytics. Check your Salesforce user permissions and ensure CRM Analytics is enabled for your user.';
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorData.error_description || errorData.error || errorData.message || 'Unknown error',
          hint: helpfulHint,
          status: response.status,
          rawError: errorData
        },
        { status: response.status }
      );
    }

    // Parse the response
    const data = await response.json();
    
    // The response contains the frontdoor URL
    const frontdoorUrl = data.frontdoorUrl || data.url;

    if (!frontdoorUrl) {
      return NextResponse.json(
        { 
          error: 'Invalid response from Salesforce',
          details: 'No frontdoor URL in response'
        },
        { status: 500 }
      );
    }

    // Return the frontdoor URL
    return NextResponse.json({
      frontdoorUrl,
      expiresIn: data.expiresIn || 300, // Usually 5 minutes
    });

  } catch (error) {
    console.error('Error generating frontdoor URL:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

