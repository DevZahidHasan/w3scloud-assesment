# W3scloud Technical Assessment - Zoho CRM Integration

This project is a complete integration between a Next.js (App Router) application and Zoho CRM API. It demonstrates proper OAuth 2.0 implementation, data reading, data insertion, and robust error handling as per the assessment requirements.

## 🚀 Features Implemented
- **OAuth 2.0 Flow:** Secure token generation and storage via `HttpOnly` cookies.
- **Read Records:** Fetches Leads from Zoho CRM and displays Record ID, Name, Company, and Email.
- **Insert Records:** Form to create a new Lead.
- **Auto-Retrieve:** Automatically fetches the newly inserted record using its returned `Record ID` to immediately display it in the UI.
- **Error Handling:** Graceful UI responses for missing fields, missing authentication, and API errors.
- **Modern UI:** Tailwind CSS powered SaaS-style dashboard.

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd w3scloud-zoho-task
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory with the following credentials obtained from the Zoho Developer Console (Server-based Application):

```env
ZOHO_CLIENT_ID=your_client_id_here
ZOHO_CLIENT_SECRET=your_client_secret_here
NEXT_BASE_URL=http://localhost:3000
ZOHO_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

### 3. Run the Development Server
```bash
npm run dev
```
Visit `http://localhost:3000`.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/auth/login` | Redirects the user to Zoho's OAuth consent screen. |
| `GET` | `/api/auth/callback` | Handles the OAuth code, fetches Access/Refresh tokens, and sets secure cookies. |
| `GET` | `/api/auth/logout` | Clears local cookies to sign out. |
| `GET` | `/api/leads` | Fetches all leads from Zoho CRM. |
| `POST` | `/api/leads` | Inserts a new lead into Zoho CRM and retrieves the created record. |
| `GET` | `/api/contacts` | Fetches all contacts from Zoho CRM. |
| `GET` | `/api/accounts` | Fetches all accounts from Zoho CRM. |

### Example POST Request (`/api/leads`)
```json
// Request Body
{
  "First_Name": "John",
  "Last_Name": "Doe",
  "Email": "john@example.com",
  "Company": "W3scloud",
  "Phone": "+8801XXXXXXX"
}

// Successful Response (200 OK)
{
  "success": true,
  "data": {
    "id": "7628824000000526798",
    "name": "John Doe",
    "email": "john@example.com",
    "company": "W3scloud",
    "phone": "+8801XXXXXXX"
  }
}
```

---

## 🤖 AI Usage Policy Declaration
In compliance with Part 4 of the assessment guidelines, I utilized **Google Gemini** during this project. 
- **What it helped with:** Initial Next.js boilerplate generation, structuring this README file, and providing best-practice snippets for secure HttpOnly cookie management.
- **What I controlled:** The core integration logic, API routing architecture, Zoho OAuth flow sequence, React state management, and error handling decisions were independently implemented and fully understood by me.

---

## 📝 Technical Answers
Please refer to the `TECHNICAL_ANSWERS.md` file in the root directory for the written answers to the 10 Technical Questions.
