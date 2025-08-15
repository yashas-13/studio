# ConstructWise: AI-Powered Construction Management

Welcome to **ConstructWise**, a comprehensive, web-based platform designed to streamline and enhance construction project management. It serves multiple roles within a construction company—from high-level owners to on-the-ground site personnel and sales teams—providing each with a tailored set of tools to manage their responsibilities efficiently.

---

### Technology Stack

*   **Framework**: Next.js (with App Router)
*   **Database**: Google Firebase (Firestore)
*   **UI**: React, Tailwind CSS, ShadCN/UI
*   **Generative AI**: Google Gemini via Genkit

---

### Key Features & User Roles

The application is built around a role-based access control system. A user logs in by selecting their role and name, which then directs them to a dashboard customized for their tasks.

#### 1. Owner

The Owner has a global view of all operations, focusing on high-level business metrics and management.
- **Global Dashboard**: A high-level summary of all projects, including overall progress, budget vs. spending, and a real-time activity feed from all sites.
- **Project Management**: Create, manage, and monitor all construction projects. Define project structures, including towers and units, which automatically populate the sales inventory.
- **Material Approvals**: Review and approve or reject material requests submitted by Site Managers.
- **Sales & CRM Analytics**: Access a sales analytics dashboard with key metrics like total revenue, closed deals, sales funnel status, and individual sales rep performance.
- **User Management**: Add, view, and manage all users and their roles in the system.
- **RERA Verification**: An AI-powered tool to verify RERA registration numbers against the official government website.

#### 2. Site Manager

The Site Manager is responsible for the day-to-day operations of a specific construction site.
- **Operational Dashboard**: A focused view on operational metrics like materials with low stock and overdue tasks.
- **Inventory & Usage**: View current material stock, log daily material consumption (which updates the inventory automatically), and request new materials.
- **Progress Reporting**: Upload photos and captions to document construction progress.
- **AI Tools Hub**: Access a suite of AI-powered assistants for:
  - Material Forecasting
  - Waste Reduction Analysis
  - Voice-Activated Reporting
  - AI-Driven Defect Detection
  - Automated Compliance Checks

#### 3. Sales Representative

The Sales Representative focuses on managing customer leads and selling properties.
- **Personal Sales Dashboard**: A personalized dashboard showing their performance snapshot (leads, deals, revenue), upcoming follow-ups, and recent lead activity.
- **CRM / Lead Management**: Manage leads through a Kanban board or list view, with detailed profiles for each lead.
- **AI Sales Assistant**:
  - **Lead Insights**: Generate summaries, talking points, and next actions for a lead.
  - **Property Recommendations**: Get AI-powered suggestions for the best-matching properties for a client.
- **Real-Time Inventory**: View the full catalog of available properties with robust filtering and sorting.

#### 4. Entry Guard

The Entry Guard has a single, focused responsibility: logging material deliveries.
- **Material Entry Page**: A simple form to log new material deliveries, which automatically updates the central inventory and notifies relevant stakeholders.

---

### Getting Started

1.  **Seed the Database**: On the main Site Manager dashboard, click the "Seed Sample Data" button to populate your Firestore database with sample projects, users, and materials.
2.  **Log In**: Navigate to the `/login` page.
3.  **Select a Role**: Choose a role from the first dropdown (e.g., "Owner").
4.  **Select a User**: Choose a name from the second dropdown.
5.  **Explore**: You will be redirected to the appropriate dashboard for the selected role.
