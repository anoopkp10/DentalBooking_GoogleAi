# DigeGain Dental Project Guide

Technical, usage, build, and deployment documentation for the DigeGain Dental booking application.

## 1. Project Overview

DigeGain Dental is a responsive dental clinic website with:

- A public clinic website
- Service and pricing presentation
- Online appointment booking
- Appointment availability calculation
- Supabase database integration
- Local browser-storage fallback for demos and development
- Protected admin/staff dashboard
- Clinic settings and social media links
- SEO metadata, Dentist structured data, robots rules, and sitemap

The application is a client-rendered React single-page application. Public and admin views are selected from the browser pathname rather than a full routing framework.

## 2. Technology Stack

### Application

- React 19
- React DOM
- TypeScript
- Vite 6
- Tailwind CSS 4
- `@vitejs/plugin-react`
- `@tailwindcss/vite`

### Data and authentication

- Supabase JavaScript client
- Supabase Auth for configured production authentication
- Supabase Edge Functions for server-side notifications
- Resend for appointment confirmation email
- WhatsApp Cloud API for appointment confirmation messages
- Browser `localStorage` fallback when Supabase is not configured or unavailable
- PostgreSQL through Supabase

### UI and utilities

- Lucide React icons
- Motion for animation support
- Canvas Confetti for booking confirmation effects
- Google GenAI SDK dependency is present for future or supporting AI functionality

### Tooling and supporting dependencies

- TypeScript compiler
- esbuild
- tsx
- Express dependency for supporting server-side utilities if needed
- PostCSS and Autoprefixer
- dotenv

Next.js is not used. This is a Vite + React application.

## 3. Important Project Files

```text
index.html                 HTML shell and SEO metadata
vite.config.ts             Vite and Tailwind configuration
package.json               Scripts and dependencies
src/main.tsx               React entry point
src/App.tsx                Application state, pathname handling, and view composition
src/lib/supabase.ts        Supabase client, data access, auth checks, and SQL schema
src/types/database.ts      TypeScript data contracts
src/utils/availability.ts  Appointment availability calculation
src/data/imagery.ts        Default clinic data, service seed data, and image URLs
src/components/public/     Public website sections
src/components/admin/      Admin dashboard and management tabs
public/.htaccess            Apache fallback for Hostinger SPA routes
public/robots.txt           Crawler rules
public/sitemap.xml          Public URL sitemap
```

## 4. Public User Features

### Website sections

- Clinic hero section with booking call-to-action
- Services and pricing cards
- About and care philosophy section
- Doctors/team section
- Testimonials and FAQ content
- Contact details, clinic hours, social links, and WhatsApp link
- Responsive navigation for desktop and mobile

### Appointment booking

A visitor can:

1. Select an active dental service.
2. Choose an appointment date.
3. View available time slots.
4. Enter name, email, phone, and optional notes.
5. Submit the appointment request.
6. Receive an on-screen confirmation and calendar information.

Availability considers:

- Business hours for the selected weekday
- Blocked dates and clinic holidays
- Existing appointments
- Appointment duration
- Configured slot interval
- Minimum booking notice hours
- Overlapping appointments, excluding cancelled appointments

Appointments start as `pending` and can be managed by staff.

## 5. Admin Features

The admin area is available at `/admin` after authentication.

### Overview

- Total appointment count
- Pending and confirmed appointment summaries
- Service and schedule overview
- Shortcuts to management sections

### Appointments

- Search and filter appointments
- View appointment details
- Create manual appointments
- Change appointment status to pending, confirmed, cancelled, or completed

### Services and pricing

- Add services
- Edit service name, description, duration, price, category, and image
- Activate or deactivate services
- Only active services appear in the public booking flow

### Business hours

- Configure open or closed status for each weekday
- Set opening and closing times
- Control the schedule used by availability calculations

### Blocked dates

- Add holidays, maintenance days, staff training days, or other closures
- Add a reason for each blocked date
- Remove blocked dates

### Clinic settings

- Clinic name
- Email
- Phone
- Address
- Facebook, Instagram, and X/Twitter URLs
- Booking slot interval
- Minimum booking notice period

### Database setup

The admin dashboard includes a Supabase SQL setup modal. It displays the schema, security policies, and seed data for copying into the Supabase SQL Editor.

## 6. Current Feature Boundaries

- Doctor profiles are currently hardcoded in `src/components/public/DoctorsTeam.tsx`.
- There is no admin CRUD screen for doctors.
- Public service and clinic data are loaded at runtime from Supabase or local storage.
- The app uses pathname-based routing instead of React Router.
- The `/admin` area is protected in the UI and by Supabase admin authorization checks, but production access should also be reviewed through Supabase RLS policies.
- The default clinic name, address, phone, and email are demo values and must be replaced before production use.

## 7. Environment Configuration

Create a local `.env` file in the project root when using Supabase:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Only use the Supabase public anonymous key in the frontend. Never expose a Supabase service-role key, database password, or other private secret in client code or GitHub.

If these variables are absent, the application enters interactive sandbox mode and persists demo data in browser `localStorage`.

## 8.1 Appointment Email and WhatsApp Notifications

After a public appointment is saved, `src/App.tsx` invokes the Supabase Edge Function `send-appointment-notifications`. The function sends:

- A confirmation email through Resend
- A WhatsApp template message through the WhatsApp Cloud API

The notification call is best-effort. A provider failure is logged and does not undo the saved appointment.

Deploy the function with the Supabase CLI:

```powershell
supabase functions deploy send-appointment-notifications
```

Set these secrets in the Supabase project. Do not put them in Vite environment variables or frontend code:

```text
RESEND_API_KEY
RESEND_FROM_EMAIL
WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_TEMPLATE_NAME
WHATSAPP_TEMPLATE_LANGUAGE   # optional; defaults to en_US
```

`RESEND_FROM_EMAIL` must use a verified sender/domain in Resend. The WhatsApp template must be approved in Meta Business Manager. Its body must contain six text placeholders in this order:

```text
1. Patient name
2. Clinic name
3. Appointment date
4. Appointment time
5. Service name
6. Clinic address
```

The recipient phone number is normalized to digits from the booking form. For international WhatsApp delivery, patients should enter a country code.

The Edge Function source is:

```text
supabase/functions/send-appointment-notifications/index.ts
```

## 8. Supabase Setup

1. Create a Supabase project.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the deployment environment.
3. Open the application admin area.
4. Open **Supabase SQL Setup**.
5. Copy the displayed SQL schema.
6. Open the Supabase Dashboard SQL Editor.
7. Run the schema.
8. Confirm the six tables exist:

```text
services
appointments
business_hours
blocked_dates
clinic_settings
admin_users
```

The schema also enables Row Level Security and creates policies for public booking reads/inserts and admin management operations.

### Creating an admin user

Supabase Auth must contain the staff user. The user ID must also be inserted into `public.admin_users`:

```sql
INSERT INTO public.admin_users (user_id)
VALUES ('SUPABASE_AUTH_USER_UUID');
```

Use the actual UUID from Supabase Authentication. Do not grant admin access to untrusted users.

## 9. Local Development

Install dependencies:

```powershell
npm install
```

Start the Vite development server:

```powershell
npm run dev
```

The configured port starts at `3000`. If that port is already in use, Vite selects the next available port, such as `3001` or `3002`.

Available scripts:

```text
npm run dev       Start the Vite development server
npm run lint      Run TypeScript validation with tsc --noEmit
npm run build     Build the production files into dist
npm run preview   Preview the production build locally
npm run clean     Remove dist and server.js on Unix-like shells
```

Recommended local verification:

```powershell
npm run lint
npm run build
npm run preview
```

## 10. Production Build

Build the deployable site:

```powershell
npm run lint
npm run build
```

Vite writes the production output to `dist/`:

```text
dist/
  index.html
  .htaccess
  robots.txt
  sitemap.xml
  assets/
```

The generated JavaScript bundle currently produces a Vite chunk-size warning. The build still succeeds. Code-splitting and image optimization can be considered later if performance requires it.

## 11. Hostinger Deployment

This project is deployed as a static Vite site and does not require a Node.js server for the frontend.

1. Run `npm run build` locally.
2. Open the generated `dist` folder.
3. Upload the contents of `dist`, including hidden files, to the Hostinger document root for the domain or subdomain.
4. Confirm `index.html` is directly inside the document root.
5. Confirm `.htaccess` is also uploaded.
6. Configure the production Supabase environment values through the hosting/build process.
7. Visit the public domain and `/admin`.

For the current subdomain, the target is:

```text
https://dentalbooking.digegain.com/
https://dentalbooking.digegain.com/admin
```

### Why `.htaccess` is required

`/admin` is a client-side React route. Without the Apache rewrite rule, Hostinger searches for a physical `/admin` directory and returns 404. `public/.htaccess` keeps real files and directories available, then rewrites unknown routes to `index.html` so React can render the correct view.

If `/admin` still returns 404:

- Confirm `.htaccess` was uploaded; file managers may hide dot files.
- Confirm the subdomain points to the folder containing `index.html`.
- Clear Hostinger/CDN/browser cache.
- Verify Apache `mod_rewrite` is enabled.
- Confirm the deployed `dist` folder is from the latest build.

## 12. SEO and Local SEO

Current low-change SEO features include:

- Page title and meta description
- Robots index/follow directive
- Open Graph title and description
- Twitter card metadata
- Dynamic `Dentist` JSON-LD schema from clinic settings
- `robots.txt`
- `sitemap.xml`
- `/admin` excluded from crawler access

Before production launch:

- Replace demo clinic details with the real name, address, phone, and email.
- Update `public/sitemap.xml` with the real canonical domain.
- Add the real website URL and location details to structured data.
- Create and verify a Google Business Profile.
- Keep name, address, phone, hours, and website consistent across listings.
- Submit the sitemap in Google Search Console.

## 13. Security and Operations Notes

- Do not commit `.env` files or private credentials.
- Use the Supabase anon key only in browser code.
- Review Supabase RLS policies before production use.
- Restrict rows in `admin_users` to approved staff accounts.
- Replace demo appointment and clinic data before launch.
- Use HTTPS for the production domain.
- Back up Supabase data and review appointment access policies regularly.
- Treat browser local storage as a development/demo fallback, not as the primary production database.

## 14. Common Maintenance Tasks

### Change clinic branding

Use the admin **Clinic Settings** tab for database-backed clinic name, contact details, address, and social links. The static HTML title and social metadata are maintained in `index.html`.

### Change doctors

Edit the `doctors` array in `src/components/public/DoctorsTeam.tsx`. Doctor profiles are not currently stored in Supabase or editable from the admin dashboard.

### Change default services

Update `DEFAULT_SERVICES` in `src/data/imagery.ts`. Existing Supabase records are not automatically overwritten by changing defaults.

### Change booking rules

Use **Clinic Settings** to change slot interval and minimum booking notice. The calculation itself is implemented in `src/utils/availability.ts`.

## 15. Release Checklist

- [ ] Replace demo clinic details.
- [ ] Configure Supabase environment variables.
- [ ] Run the Supabase schema.
- [ ] Create an Auth user and authorize it in `admin_users`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Upload all `dist` contents, including `.htaccess`.
- [ ] Test the homepage and `/admin` directly.
- [ ] Test booking availability and appointment creation.
- [ ] Test admin status updates and settings changes.
- [ ] Confirm `robots.txt` and `sitemap.xml` load from the domain.
- [ ] Configure Google Business Profile and Search Console.
- [ ] Commit and push the release to GitHub.
