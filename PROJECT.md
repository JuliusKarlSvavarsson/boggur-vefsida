# Boggur 2.0 — Project Overview

## Project Purpose
This is a complete modern rebuild of the Boggur construction/real estate website.  
Goal: fast, scalable, fully responsive, and highly user-friendly for 2026.  
Supports small projects (few apartments) and large projects (80+ apartments).  
Layout and style should follow the **general look and flow of boggur.is**, but modernized, clean, and component-based.

---

## Tech Stack
- **Frontend & Backend:** Next.js 14 (App Router) + TypeScript  
- **Styling:** Tailwind CSS  
- **Database:** Neon (Postgres, serverless)  
- **Hosting:** Vercel (frontend + serverless API routes)  
- **Admin panel:** CRUD for projects, buildings, floors, apartments, parking  
- **Future Features:** 2D/3D apartment selector, floor selector, filters, parking visualization, analytics  

---

## Pages
- `/` → Home  
- `/about` → About Us  
- `/services` → Services  
- `/projects` → All Projects  
- `/projects/[slug]` → Single Project (placeholder for interactive SVG apartment selector)  
- `/team` → Team  
- `/contact` → Contact Form  
- `/admin` → Admin Dashboard (placeholder)

---

## Components
- **Header + Navbar:** Shared across all pages, sticky, responsive, logo and menu links  
- **Footer:** Shared across all pages  
- **ProjectCard:** Displays project info: name, location, description, status  
- **ApartmentCard:** Placeholder for apartment details  
- **Button:** Reusable for all CTAs  
- **FloorSelector:** Placeholder for multi-floor buildings  
- **SVG Apartment Selector:** Interactive apartment map placeholder  
- **ParkingVisualizer:** Shows parking spots visually linked to apartments  

---

## Data Structure (for future integration)
- **Projects:** `id, name, slug, description, location`  
- **Buildings:** `id, project_id, name`  
- **Floors:** `id, building_id, number, label (nullable for small projects)`  
- **Apartments:** `id, floor_id, name/number, size_m2, rooms, price, status (available/sold/reserved), floorplan_image_url`  
- **ParkingSpots:** `id, apartment_id, spot_number, image_url`  

---

## Admin Panel
The admin panel will provide full control of the data:
- Manage projects, buildings, floors, apartments  
- Update apartment status (available, reserved, sold)  
- Upload floorplans and project images  
- Assign and visualize parking spots  
- Dashboard overview: quick stats for sales, availability, and occupancy  
- Mobile-friendly and easy-to-use interface  

---

## Future Features
- 2D/3D apartment selector  
- Floor selector for multi-floor buildings  
- Dynamic coloring for apartments (red/green/yellow) based on availability  
- Clickable apartments to view details: size, rooms, floorplan, parking  
- Advanced filtering (price, size, rooms)  
- Analytics and notifications for admin  

---

## Design Guidelines
- Clean, modern, and professional UI  
- Fully responsive and mobile-first  
- Smooth animations and hover effects  
- Reusable Tailwind components  
- Easy to maintain and extend  
- Layout hierarchy inspired by boggur.is  
- Performance optimized  

---

## Folder Structure
/app
  /components
    Header.tsx
    Footer.tsx
    Navbar.tsx
    ProjectCard.tsx
    ApartmentCard.tsx
    Button.tsx
    FloorSelector.tsx
    SvgApartmentSelector.tsx
    ParkingVisualizer.tsx
  /pages
    index.tsx
    about.tsx
    services.tsx
    /projects
      page.tsx
      [slug].tsx
    team.tsx
    contact.tsx
    /admin
      page.tsx
/styles
  globals.css
PROJECT.md
README.md

---

## Stepwise Implementation Plan
1. Initialize Next.js + Tailwind + TypeScript project  
2. Build shared layout (Header, Navbar, Footer)  
3. Add placeholder pages and ProjectCard components  
4. Add dynamic Project listing page (`/projects`)  
5. Add placeholder Single Project page (`/projects/[slug]`)  
6. Implement interactive SVG apartment selector  
7. Build Apartment detail section  
8. Build Admin panel (CRUD for projects, apartments, parking)  
9. Integrate Neon database  
10. Finalize design, polish UI, deploy to Vercel
