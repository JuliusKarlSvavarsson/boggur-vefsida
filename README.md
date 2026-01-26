# Boggur 2.0 — README

## Overview
Boggur 2.0 is a full modern rebuild of the Boggur construction/real estate website.  
This README provides a **master guide** for developers and Windsurf AI to follow for layout, components, and workflow.

---

## Project Structure
- **/app/components:** Reusable components (Header, Footer, Navbar, ProjectCard, ApartmentCard, Button, FloorSelector, SVG selector, ParkingVisualizer)  
- **/app/pages:** All pages (Home, About, Services, Projects, Team, Contact, Admin)  
- **/styles:** Tailwind CSS globals  
- **PROJECT.md:** Project overview and stepwise plan  

---

## Layout Guidelines
- Header, Navbar, and Footer must be **shared across all pages**  
- Layout hierarchy inspired by **boggur.is**  
- Header sticky on scroll, responsive, logo and menu included  
- Footer consistent, responsive, professional styling  

---

## Components Organization
- **Header.tsx / Navbar.tsx / Footer.tsx:** Global layout  
- **ProjectCard.tsx:** Project summary card  
- **ApartmentCard.tsx:** Apartment detail placeholder  
- **Button.tsx:** Reusable CTA buttons  
- **FloorSelector.tsx:** Placeholder for multi-floor buildings  
- **SvgApartmentSelector.tsx:** Placeholder for interactive apartment map  
- **ParkingVisualizer.tsx:** Placeholder for parking spot visualization  

---

## Admin Panel
- CRUD for projects, buildings, floors, apartments, parking  
- Manage apartment status (available, reserved, sold)  
- Upload floorplans and images  
- Dashboard overview with statistics  
- Mobile-friendly and intuitive UI  

---

## Future Features
- Interactive 2D/3D apartment selector  
- Floor selector for multi-floor buildings  
- Dynamic coloring based on apartment availability  
- Clickable apartments to view full details (size, rooms, floorplan, parking)  
- Advanced filtering (price, rooms, size)  
- Analytics, notifications, and reporting  

---

## Best Practices
- Use **Tailwind classes** for styling; avoid hardcoded CSS  
- Keep components **reusable and modular**  
- Ensure **responsiveness** on all devices  
- Follow **Stepwise Implementation Plan** from PROJECT.md  
- Commit often and test each step in Vercel before moving forward  

---

## Stepwise Implementation Summary
1. Base project: Next.js + Tailwind + TypeScript  
2. Shared layout: Header, Navbar, Footer  
3. Placeholder pages + ProjectCard component  
4. Dynamic Project listing  
5. Single Project page with apartment selector placeholder  
6. Apartment detail section  
7. Admin panel  
8. Neon database integration  
9. Finalize design + deploy to Vercel
