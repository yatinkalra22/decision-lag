# Decision Debt Studio

This is a Next.js application that integrates with Salesforce to help manage "decision debt". It allows users to create Decision Insights and log View Events for those insights.

## Features

- **Salesforce OAuth 2.0 Integration**: Securely connect to your Salesforce org.
- **Create Decision Insights**: A form to create new `Decision_Insight__c` records.
- **Log View Events**: A form to create `Decision_View_Event__c` records and update the related insight.
- **View Insights**: A page to list all decision insights with relevant details.

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Salesforce REST API](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_what_is_rest_api.htm)
- [Iron Session](https://github.com/vvo/iron-session) for session management
- [React Hot Toast](https://react-hot-toast.com/) for notifications

## Salesforce Setup

Before running the application, you need to set up a Connected App in your Salesforce org.

1.  **Create a Connected App**:
    *   In your Salesforce org, go to **Setup** -> **App Manager** -> **New Connected App**.
    *   Fill in the basic information:
        *   **Connected App Name**: Decision Debt Studio
        *   **API Name**: Decision_Debt_Studio
        *   **Contact Email**: your email
    *   Enable OAuth Settings:
        *   Check **Enable OAuth Settings**.
        *   **Callback URL**: `http://localhost:3000/api/auth/callback/salesforce`
        *   **Selected OAuth Scopes**:
            *   `api` (Access and manage your data)
            *   `refresh_token, offline_access` (Perform requests on your behalf at any time)
    *   Save the Connected App.

2.  **Get Consumer Key and Secret**:
    *   After saving, you will be taken to the app's page. Click **Manage Consumer Details** to get your **Consumer Key** (Client ID) and **Consumer Secret** (Client Secret).

3.  **Create Custom Objects & Check Permissions**:
    You need to create the following two custom objects in your Salesforce org.

    **IMPORTANT**: The API names of the objects and fields must match exactly. When you create a custom object or field, Salesforce automatically appends `__c`.
    
    **a) Decision Insight (`Decision_Insight__c`)**
    *   Go to **Setup** -> **Object Manager** -> **Create** -> **Custom Object**.
    *   **Label**: `Decision Insight`
    *   **Plural Label**: `Decision Insights`
    *   **Object Name**: `Decision_Insight`
    *   After saving, you will be taken to the object's page. The **API Name** should be `Decision_Insight__c`.
    *   **Fields**: Create the following custom fields on the `Decision_Insight__c` object:
        *   `Title__c` (Text, 255)
        *   `Domain__c` (Picklist: Security, Finance, Sales, HR, Other)
        *   `Description__c` (Long Text Area)
        *   `Impact__c` (Number, 1, 0)
        *   `Risk__c` (Number, 1, 0)
        *   `Confidence__c` (Number, 3, 0)
        *   `Status__c` (Picklist: New, Actioned)
        *   `Debt_Score__c` (Number, 18, 2)
        *   `Last_Viewed_At__c` (Date/Time)
        *   `View_Count__c` (Number, 18, 0, Default: 0)

    **b) Decision View Event (`Decision_View_Event__c`)**
    *   Go to **Setup** -> **Object Manager** -> **Create** -> **Custom Object**.
    *   **Label**: `Decision View Event`
    *   **Plural Label**: `Decision View Events`
    *   **Object Name**: `Decision_View_Event`
    *   The **API Name** should be `Decision_View_Event__c`.
    *   **Fields**: Create the following custom fields on the `Decision_View_Event__c` object:
        *   `Insight__c` (Lookup Relationship to `Decision Insight`)
        *   `Viewer_Name__c` (Text, 255)
        *   `Viewed_At__c` (Date/Time)
        *   `Source__c` (Picklist: WebApp, Tableau)
    
    **c) Check Permissions**
    *   Ensure that the user profile associated with the user you are logging in with has the necessary permissions to **Read, Create, and Edit** these custom objects and all their fields.
    *   You can check this under **Setup** -> **Profiles** -> [Your User's Profile] -> **Object Settings**.

## Troubleshooting

*   **`sObject type '...' is not supported`**: This error means the custom object or a field does not exist in your Salesforce org, or you don't have permission to access it.
    1.  Double-check that the custom objects and all their fields are created with the exact **API Names** specified above.
    2.  Verify that the user you are authenticating with has **Read, Create, and Edit** permissions for these objects.
    3.  If you have multiple Salesforce orgs, ensure you are connecting to the correct one.



## Local Development

1.  **Clone the repository**:
    ```bash
    git clone <repository_url>
    cd decision-debt-studio
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    *   Create a `.env.local` file in the root of the project.
    *   Add the following variables:
        ```
        SF_LOGIN_URL=https://<your_salesforce_instance>.my.salesforce.com
        SF_CLIENT_ID=<your_consumer_key>
        SF_CLIENT_SECRET=<your_consumer_secret>
        SF_REDIRECT_URI=http://localhost:3000/api/auth/callback/salesforce
        
        # This password is used to encrypt the session cookie.
        # It MUST be at least 32 characters long.
        # You can generate a secure password here: https://1password.com/password-generator/
        SESSION_PASSWORD=p0Gz_2-t6K!4n@8sL9#fVbHjYu7wE$rQ
        ```
        *Replace `<your_salesforce_instance>`, `<your_consumer_key>`, and `<your_consumer_secret>` with your actual Salesforce details. Use your org's custom domain for the login URL (e.g., `https://yourdomain.my.salesforce.com`).*

        **IMPORTANT**: The `SESSION_PASSWORD` is a secret and should be treated as such. The provided password is just an example. Please generate your own secure password.

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── callback/salesforce/route.ts
│   │   └── salesforce/
│   │       ├── insights/
│   │       │   ├── create/route.ts
│   │       │   ├── list/route.ts
│   │       │   └── updateView/route.ts
│   │       └── view-events/create/route.ts
│   ├── components/
│   │   ├── CreateInsightForm.tsx
│   │   └── CreateViewEventForm.tsx
│   ├── insights/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   └── session.ts
├── public/
├── .env.local.example
├── next.config.mjs
├── package.json
└── README.md
```