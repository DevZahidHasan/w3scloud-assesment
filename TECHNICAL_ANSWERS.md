# Technical Assessment Answers

**Q1. OAuth — Explain Client ID, Client Secret, Access Token and Refresh Token, and how they are used in an API integration.**
--Think of the Client ID and Client Secret as my application's username and password for Zoho. When someone authorizes my app, Zoho gives me an Access Token. I use this token like a temporary VIP pass—I have to attach it to the header of every API request I make. But since this pass usually expires in an hour for security reasons, Zoho also gives me a Refresh Token. I keep this Refresh Token safely stored in my backend so that when the Access Token dies, I can automatically ask Zoho for a new one without forcing the user to log in all over again.

**Q2. Token Expiration — Your application works today but tomorrow returns an authentication error. What could cause this? How would you avoid asking the user to authorize every time?**
--If it works today but fails tomorrow with a 401 error, it almost certainly means the Access Token has expired. To fix this so the user doesn't get annoyed, I would set up a silent refresh flow on my Node.js server. Whenever my API call gets a 401 Unauthorized response, my backend would automatically catch that error, send the stored Refresh Token to Zoho's `/oauth/v2/token` endpoint, get a fresh Access Token, save it, and then instantly retry the original request. The user wouldn't even notice it happened.

**Q3. API Field Names — A CRM field is displayed as “Customer Type” but the API expects “Customer_Type”. Why does this matter? How would you find the correct API field name?**
--It matters because APIs are very strict—they parse JSON payloads based on exact character matches. If I send "Customer Type", the API won't know what to do with it and will either ignore the data or throw an error, because its database column is strictly mapped to "Customer_Type". Whenever I'm in doubt about a field name, I just log into the Zoho CRM dashboard, go to **Setup > Developer Space > APIs > API Names**. That page gives me the exact strict naming convention for every single field in every module.

**Q4. Insert Record — Explain how you would insert a Lead using an HTTP API. Cover HTTP method, URL structure, authorization, request body, required fields, and expected response.**
--To insert a lead, I'd make a `POST` request to `https://www.zohoapis.com/crm/v2/Leads`. 
In the headers, I'd pass `Authorization: Zoho-oauthtoken {my_access_token}` and set the content type to application/json. 
For the body, Zoho expects the data to be wrapped in a specific array format, like this: `{"data": [{"Last_Name": "Smith", "Company": "W3scloud"}]}`. 
In Zoho, `Last_Name` is strictly required by default for Leads, so I have to make sure my frontend validates that before sending. 
If everything goes well, Zoho will send back an HTTP 201 Created response, and inside the JSON body, it will give me a success message along with the newly generated `id` (Record ID) of that lead.

**Q5. GET vs Search — What is the difference between retrieving records and searching records? Give an example of when you would use each.**
Retrieving (using a standard GET request) is just pulling data directly. For example, if I want to show a list of all leads on a dashboard, or if I already know a lead's ID and just want to fetch its details, I'd use `GET /Leads`.
--Searching is totally different—it's conditional. It uses the `/search` endpoint to filter data based on specific criteria. For example, if someone fills out my signup form, I'd use `GET /Leads/search?email=test@test.com` to check if a lead with that email already exists in the CRM before I blindly create a new one.

**Q6. Duplicate Handling — Your application receives the same customer twice. How would you prevent duplicate CRM records?**
--There are two ways I usually handle this. The easiest way is to use Zoho's "Upsert" API endpoint feature, where I pass `duplicate_check_fields` (like their Email or Phone number) in my request. Zoho will figure out if they exist and update them, or create them if they don't. The manual way would be to run a Search API call using their email first. If I get a record back, I run a `PUT` request to update it. If I get nothing, I run a `POST` request to create a new one.

**Q7. Error Handling — The API returns HTTP 401 / OAUTH_SCOPE_MISMATCH. What does it mean? How would you investigate and fix it?**
--This error means my Access Token is completely valid, but it doesn't have the permission (scope) to do what I'm asking it to do. For example, I might be trying to read "Contacts", but when I initially generated the token, I only asked for the "Leads" scope. To fix this, I'd have to go into my authentication code, update the `scope` parameter in my Zoho Auth URL (for example, change it to `ZohoCRM.modules.ALL`), and then have the user re-authenticate so Zoho can grant me the upgraded permissions.

**Q8. Production Architecture — A Node.js application connects to multiple clients' CRM accounts. How would you store OAuth credentials securely and keep each customer's data isolated?**
--For a multi-tenant system, I would never store tokens in cookies or `.env` files. I'd use a secure database like PostgreSQL. I'd create a table where every `client_id` or `tenant_id` is mapped to their specific encrypted `access_token` and `refresh_token`. I'd use a KMS (Key Management Service) to encrypt these tokens at rest. Then, I'd write a middleware in my Node.js app that identifies which client is making the request, fetches only their specific decrypted token from the database, and attaches it to the API call. This guarantees strict data isolation.

**Q9. Large Data — A client needs 200,000 CRM records synchronized with an external system. Explain pagination, batching, rate limits, retries, failed records, logging, and resume/retry design.**
--To handle 200k records, I definitely wouldn't do it in one go. I'd fetch them in batches (like 200 at a time) using pagination parameters (`page` and `per_page`), or better yet, use Zoho's Bulk API. 
Since hitting the API too fast will trigger a 429 Rate Limit error, I'd implement an exponential backoff function that pauses the script for a few seconds if I get rate-limited. 
For architecture, I'd use a message queue like RabbitMQ or AWS SQS. Every time a batch finishes successfully, I'd log the "cursor" or page number in my database. If a specific record fails, it gets tossed into a Dead Letter Queue (DLQ) so I can review it later without stopping the whole process. If my server crashes halfway through, the script will just check the database on reboot, find the last saved cursor, and resume exactly where it left off.

**Q10. W3SCLOUD Scenario — Design External Website → Node.js API → Zoho CRM for this payload: { name: 'John Smith', email: 'john@example.com', company: 'ABC Ltd', phone: '+8801XXXXXXXXX' }.**
--First, my Node.js API would receive the payload and validate it using a library like Zod to ensure the email is valid and required fields aren't missing. 
Then, my server retrieves its securely stored Zoho Access Token. Since Zoho expects First Name and Last Name separately, I'd write a quick split function to break 'John Smith' into `First_Name: 'John'` and `Last_Name: 'Smith'`. 
I'd then use the Upsert API method (checking against the email) to send the data to Zoho so we don't create duplicates. 
If Zoho's servers are temporarily down and return a 500 error, I'd wrap my logic in a try/catch block, log the failure to something like Sentry, and push the payload into a Redis queue to automatically try again in 5 minutes. Finally, I'd send a standard JSON success response back to the website so the user knows their form was submitted.
