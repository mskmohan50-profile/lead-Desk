# LeadDesk – Lead Management Platform

LeadDesk is a full-stack Lead Management application designed for small sales teams. It enables users to capture, manage, assign, and track leads through a secure role-based dashboard with a RESTful JSON API.

## Features

- Public lead capture form
- Secure authentication
- Role-Based Access Control (Admin & Member)
- Lead assignment and management
- Lead status pipeline
- Notes with timestamps
- Activity history
- Search, filtering, and pagination
- Responsive user interface

## User Roles

### Admin
- View all leads
- Assign leads
- Update lead status
- Add notes
- View activity logs
- Manage users

### Member
- View assigned leads
- Update lead status
- Add notes
- View activity history

Permissions are enforced on both the client and server.

## Lead Lifecycle

```
New → Contacted → Qualified → Proposal Sent → Won/Lost
```

Every status update is recorded in the activity log.

## Tech Stack

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS

**Backend**
- Supabase
- PostgreSQL
- Edge Functions

**Authentication**
- Supabase Auth

**Deployment**
- Bolt Hosting (Frontend)
- Supabase (Backend)

## API

Base URL

```
/api/leads
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/leads` | Create a lead |
| GET | `/api/leads` | Get all leads |
| GET | `/api/leads?page=1&limit=10` | Pagination |
| GET | `/api/leads?status=New` | Filter leads |
| GET | `/api/leads?search=john` | Search leads |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead (Admin only) |

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## Testing

Automated tests include:
- Authentication and role permissions
- Lead creation flow
- Lead assignment and status updates

Run tests:

```bash
npm test
```

## Installation

Clone the repository:

```bash
git clone https://github.com/mskmohan50-profile/LeadDesk.git
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note:** Never commit secrets or API keys to Git.

## Future Enhancements

- Email notifications
- AI-powered lead scoring
- Analytics dashboard
- CSV export
- Mobile application

## Author

**Mohanraj G**

GitHub: https://github.com/mskmohan50-profile
