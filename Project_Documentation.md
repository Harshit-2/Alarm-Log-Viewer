# Alarm Log Viewer — Complete Project Documentation
### A Beginner-Friendly Guide from A to Z for Freshers

---

## Table of Contents
1. What Is This Project?
2. Technologies Used & Why (Detailed Explanations)
3. Project Architecture — The Big Picture (Microservices)
4. How All Services Connect (Port Map)
5. User Roles & What They Can Do (Technician, Supervisor, Admin)
6. Database Design — All Tables Explained
7. Backend Services & Custom Controllers
8. Role-Based Security & Authorization (How Admin is Secured)
9. The API Gateway — The Traffic Controller (Ocelot)
10. Authentication & JWT Tokens — How Login Works
11. Frontend — How the UI Works (React + Dashboards)
12. Complete Request Flow — Step by Step
13. Logging Systems — ILogger & Database Activity Logs
14. Alert Lifecycle — From Trigger to Resolution
15. Validation, Safety, & Error Handling
16. Key Files Reference & Directory Map
17. How to Run the Complete Project

---

## 1. What Is This Project?

The **Alarm Log Viewer** is a complete, real-time temperature monitoring and alerting system designed using a modern microservice-based architecture.

Imagine a hospital storing vaccines, a large tech data centre hosting servers, or a cold-chain storage warehouse. In all of these environments, temperature control is critical. If a room gets too hot or too cold, the items inside could be ruined.

This system resolves this challenge by providing:
- **Technicians** who can monitor and record room temperatures.
- **Automated Alerts** that trigger if temperature ranges are violated.
- **Supervisors** who track alerts and manage resolution workflows.
- **Admins** who exclusively handle system user accounts.
- **Audit Trails** where every single action is safely logged to the database for compliance.

---

## 2. Technologies Used & Why

For someone new to .NET and modern web development, here is a simple breakdown of every technology used in this project and why we selected it.

### 2.1 ASP.NET Core (C#) — The Backend Web API Framework
*   **What it is:** A fast, lightweight, and cross-platform framework created by Microsoft to build web applications and APIs.
*   **Why we use it:** It's built for speed and security. It listens for requests from the frontend, communicates with the databases, and sends back structured responses in JSON format.
*   **Where it is used:** Every backend microservice (User, Room, Temperature, Alert, and Authentication) is built as an independent ASP.NET Core Web API.

### 2.2 Entity Framework Core (EF Core) — The Database Connector
*   **What it is:** An Object-Relational Mapper (ORM) that lets developers write database code using C# classes instead of raw SQL queries.
*   **Why we use it:** Instead of writing complex SQL commands like `INSERT INTO Alerts (RoomId, Temperature) VALUES ('R101', 45)`, you write `await context.Alerts.AddAsync(newAlert)`. EF Core automatically generates and executes the database SQL for you.
*   **Code-First Approach:** We write C# classes representing our tables (called "Models") and EF Core automatically builds the SQL databases and tables for us using:
    *   `Add-Migration <Name>`: Creates the schema scripts.
    *   `Update-Database`: Applies the changes to the physical SQL database.
*   **Where it is used:** Configured inside the individual Class Libraries: `UserLibrary`, `RoomsLibrary`, `TemperatureLibrary`, and `AlertsLibrary`.

### 2.3 SQL Server Express — The Database Engine
*   **What it is:** A reliable, free, and lightweight edition of Microsoft's flagship SQL Server relational database.
*   **Why we use it:** It integrates natively with .NET core and Entity Framework, offering high performance, transactions, and robust data storage.
*   **Microservice Database Separation:** To follow best practices, each microservice has its **own separate database** to prevent cross-database locks or shared failures:
    *   `PrjUsersDB` (User accounts)
    *   `PrjRoomsDB` (Room boundaries)
    *   `PrjTemperatureDB` (History of temperature logs)
    *   `PrjAlertsLogDB` (Alerts and audit activity records)

### 2.4 JSON Web Tokens (JWT) — The Secure Digital Passport
*   **What it is:** A secure, compact, and URL-safe string containing verified user claims (like user ID, username, and role).
*   **Why we use it:** Once a user logs in, the backend signs a JWT with a secret key and gives it to the browser. The frontend attaches this token to every subsequent request in the `Authorization: Bearer <Token>` header. The server verifies this token mathematically, instantly knowing who is calling the API and whether they are authorized.
*   **Where it is used:** Generated in `AuthenticationWebApi` and verified in all other API controllers using `[Authorize]`.

### 2.5 Ocelot — The API Gateway (Entry Point)
*   **What it is:** A powerful .NET library that acts as a single, unified entry point (Gateway) for all backend APIs.
*   **Why we use it:** In a microservices system, each API runs on a different port. Without a gateway, the frontend would have to constantly call different ports. With Ocelot, the frontend makes **all** requests to port `5065`, and Ocelot routes the requests internally.
*   **Where it is used:** Configured inside the `AlarmLogViewerApiGateway` microservice.

### 2.6 React.js (JavaScript) — The Frontend Dashboard
*   **What it is:** A popular JavaScript library developed by Meta (Facebook) for building fast, component-based user interfaces.
*   **Why we use it:** It utilizes a virtual DOM, meaning it only updates the specific parts of the page that change. For example, if a room triggers an alert, React updates that room card dynamically without reloading the whole browser.
*   **Where it is used:** Located entirely inside the `Frontend` folder.

### 2.7 Vite — The Speed-Driven Development Tool
*   **What it is:** A modern, incredibly fast build tool and dev server designed for frontend web apps.
*   **Why we use it:** It bundle-compiles React pages instantly and provides hot-module-reloading (changes are reflected in the browser the moment you save the file).

### 2.8 Tailwind CSS & Custom Layouts — Premium Styling
*   **What it is:** Fully responsive, modern Cascading Style Sheets (CSS) styled custom files.
*   **Why we use it:** We styled the UI with polished glassmorphism layouts, live pulse animations (blinking red status badges), cohesive dark themes, and dynamic buttons to make it feel premium.
*   **Where it is used:** Rendered via `Frontend/src/components/Dashboards.css`.

---

## 3. Project Architecture — The Big Picture

This system is built using a **Microservices Architecture**. Instead of one monolithic code file, the backend is split into 5 small, lightweight microservices. Each microservice has its own isolated responsibility and its own dedicated database.

```
                  ┌───────────────────────────────┐
                  │   React Browser UI (Port 5173)│
                  └───────────────┬───────────────┘
                                  │
                       (HTTP Port 5065 Requests)
                                  ▼
                  ┌───────────────────────────────┐
                  │    Ocelot Gateway (Port 5065) │
                  └───────────────┬───────────────┘
                                  │
      ┌───────────────────────────┼───────────────────────────┐
      ▼                           ▼                           ▼
┌──────────────┐            ┌──────────────┐            ┌──────────────┐
│Authentication│            │  User API    │            │  Room API    │
│  (Port 5228) │            │ (Port 5025)  │            │ (Port 5286)  │
└──────────────┘            └──────┬───────┘            └──────┬───────┘
                                   ▼                           ▼
                            ┌──────────────┐            ┌──────────────┐
                            │  PrjUsersDB  │            │  PrjRoomsDB  │
                            └──────────────┘            └──────────────┘

      ┌───────────────────────────┼───────────────────────────┐
      ▼                                                       ▼
┌──────────────┐                                        ┌──────────────┐
│  Temp API    │                                        │  Alert API   │
│ (Port 5155)  │                                        │ (Port 5179)  │
└──────┬───────┘                                        └──────┬───────┘
       ▼                                                       ▼
┌──────────────┐                                        ┌──────────────┐
│PrjTemperature│                                        │ PrjAlertsLog │
└──────────────┘                                        └──────────────┘
```

---

## 4. How All Services Connect — Port Map

When running the project locally, the services communicate using local ports:

| Service Name | Port | Description / Responsibility |
|:---|:---|:---|
| **React Frontend** | `5173` | The web user interface rendered in the browser. |
| **API Gateway (Ocelot)** | `5065` | The master gateway through which all frontend API calls flow. |
| **AuthenticationWebApi** | `5228` | Generates secure JWT security passports upon credentials match. |
| **UserViewerAPI** | `5025` | Handles user registration, credentials retrieval, and account listings. |
| **RoomViewerAPI** | `5286` | Manages creation, retrieval, updates, and deletion of rooms. |
| **TemperatureViewerAPI**| `5155` | Records new temperature logs and retrieves histories. |
| **AlarmLogViewerAPI** | `5179` | Manages alerts, resolution notes, and the audit ActivityLog table. |

---

## 5. User Roles & What They Can Do

To protect the system, users are segregated into three distinct roles:

### 5.1 Technician
*   **Create Rooms:** Can register rooms and set their safe temperature margins (`MinTemp` and `MaxTemp`).
*   **Record Temperatures:** Can log the current temperature of any room in the facility.
*   **File Reasons:** If a room triggers an alert, the technician can select a reason from a dropdown (e.g., "Equipment Malfunction", "Door Left Open") to explain why the anomaly happened.
*   **Delete/Edit Rooms:** Can modify or delete rooms **only if they created them** (technicians cannot tamper with rooms created by other technicians).

### 5.2 Supervisor
*   **Live Monitoring Dashboard:** Can view a real-time table of all rooms, current temperatures, and active alert statuses (auto-refreshes every 5 seconds).
*   **Resolution Workflow:** Can select a blinking active alert, click **Mark Resolved**, and document the fix in an optional text field (e.g., "Reset the thermostat, unit normal").
*   **Delete Alerts:** Can permanently delete resolved or stale alerts to clean up dashboard listings.
*   **Read-Only User View:** Can navigate to the "Users" tab to see all active user accounts, but has **no deletion or administrative rights** over those accounts.

### 5.3 Admin
*   **Exclusive User Administration:** The Admin has a highly-restricted interface focused purely on user auditing and safety.
*   **Delete Users:** The Admin is the **only role** that can delete user accounts (Supervisors and Technicians cannot access this).
*   **No Access to Operations:** To enforce separation of duties, the Admin cannot register rooms, set temperatures, file reasons, or resolve alerts.

---

## 6. Database Design — All Tables Explained

We use Microsoft SQL Server to store our records. Below is an easy-to-read schema guide:

### 6.1 `PrjUsersDB` → Table: `Users`
Stores account profiles.
*   `UserId` (VARCHAR, 6): Unique identifier (e.g., `U12345`). Primary Key.
*   `Username` (VARCHAR, 100): Email address of the user.
*   `Password` (VARCHAR, 100): User's password.
*   `Role` (VARCHAR, 30): The user's role ("Technician", "Supervisor", "Admin").
*   `CreatedAt` (VARCHAR, 30): Timestamp of registration.

### 6.2 `PrjRoomsDB` → Table: `Rooms`
Defines monitored areas and safe temperature thresholds.
*   `RoomId` (VARCHAR, 6): Unique room code (e.g., `R54321`). Primary Key.
*   `RoomName` (VARCHAR, 100): Clear name of the room (e.g., "Vaccine Cold Storage").
*   `MinTemp` (DECIMAL): Lowest safe temperature boundary.
*   `MaxTemp` (DECIMAL): Highest safe temperature boundary.
*   `CreatedByUserId` (VARCHAR, 6): The ID of the technician who created the room.
*   `CreatedAt` (VARCHAR, 30): Timestamp of room registration.

### 6.3 `PrjTemperatureDB` → Table: `Temperatures`
Tracks a historical audit trail of every temperature log.
*   `ReadingId` (VARCHAR, 6): Unique reading code. Primary Key.
*   `RoomId` (VARCHAR, 6): The room being measured.
*   `TemperatureValue` (DECIMAL): Recorded temperature value.
*   `RecordedAt` (DateTime): The exact date and time the reading was taken.

### 6.4 `PrjAlertsLogDB` → Table: `Alerts`
Logs safety violations and documentation on how they were handled.
*   `AlertId` (VARCHAR, 6): Unique alert code. Primary Key.
*   `RoomId` (VARCHAR, 6): The room violating safe limits.
*   `Temperature` (DECIMAL): The out-of-range temperature that triggered the alert.
*   `Status` (VARCHAR, 30): Anomaly state ("Too Hot", "Too Cold", or "Resolved").
*   `AlertTime` (VARCHAR, 30): When the violation happened.
*   `Reason` (VARCHAR, 200): Technician's reason documentation (nullable).
*   `ResolutionNote` (VARCHAR, 500): Supervisor's optional resolution notes (nullable).

### 6.5 `PrjAlertsLogDB` → Table: `ActivityLogs`
Provides an tamper-proof system audit log.
*   `LogId` (INT): Auto-incrementing record ID. Primary Key.
*   `Action` (VARCHAR, 100): The system action name (e.g., "Alert Created").
*   `Details` (VARCHAR, 500): Details of the action (e.g., "Alert A98765 marked Resolved by Supervisor S12345 with note...").
*   `Timestamp` (DateTime): Date and time of the logging event.

---

## 7. Backend Services & Custom Controllers

Each backend service is isolated, but let's focus on the most important controllers to see how they handle inputs and control flow.

### 7.1 `UserController`
Manages user listings, registration, credentials verification, and account deletions.
```csharp
[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IUserRepository userRepo;
    public UserController(IUserRepository userRepository) { userRepo = userRepository; }

    [HttpGet]
    public async Task<ActionResult> GetAll() { ... }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")] // Restricts execution purely to logged-in Admins
    public async Task<ActionResult> Delete(string id)
    {
        try
        {
            await userRepo.DeleteAsync(id);
            return Ok("User deleted successfully");
        }
        catch (UserException ex) { return NotFound(ex.Message); }
    }
}
```

### 7.2 `RoomController`
Handles room registration and updates. When a room is successfully registered, the RoomController communicates synchronously via `HttpClient` to the Temperature and Alert microservices to create "stub" records, ensuring database sync.

### 7.3 `AlertController`
Responsible for alert orchestration, reason submissions, supervisor resolutions, and saving audit trail logs to `ActivityLogs`.

---

## 8. Role-Based Security & Authorization (Admin Protection)

### 8.1 How JWT Roles are Transmitted
During login inside `AuthenticationWebApi`, the role of the user (e.g., `"Admin"`, `"Supervisor"`, or `"Technician"`) is embedded into the JWT token as a claim:
```csharp
Claim[] claims = new[] {
    new Claim(ClaimTypes.Name, userName),
    new Claim(ClaimTypes.Role, role) // Encodes the user's role
};
```
When this signed token is evaluated by the other microservices, the security framework parses the role claim.

### 8.2 Securing the User Deletion Endpoint
To ensure a Supervisor or Technician cannot manually bypass the frontend and call `DELETE /api/User/U12345` using tools like Postman, the backend enforces a role constraint at the controller level:
```csharp
[HttpDelete("{id}")]
[Authorize(Roles = "Admin")]
```
If a request comes in containing a JWT with `role: "Supervisor"`, the .NET backend immediately cancels the request and sends back a `403 Forbidden` response.

---

## 9. The API Gateway — Ocelot Configuration

The API gateway acts as the single gateway for your application. It utilizes `Ocelot.json` to map frontend routes to internal downstream services:

```json
{
  "Routes": [
    {
      "DownstreamPathTemplate": "/api/User/{everything}",
      "DownstreamScheme": "http",
      "DownstreamHostAndPorts": [
        { "Host": "localhost", "Port": 5025 }
      ],
      "UpstreamPathTemplate": "/userSvc/{everything}",
      "UpstreamMethods": [ "Get", "Post", "Put", "Delete" ]
    },
    {
      "DownstreamPathTemplate": "/api/Room/{everything}",
      "DownstreamScheme": "http",
      "DownstreamHostAndPorts": [
        { "Host": "localhost", "Port": 5286 }
      ],
      "UpstreamPathTemplate": "/roomSvc/{everything}",
      "UpstreamMethods": [ "Get", "Post", "Put", "Delete" ]
    }
  ]
}
```

---

## 10. Authentication & JWT Tokens — How Login Works

Here is a step-by-step trace of the login flow:

```
┌──────┐               ┌───────────┐            ┌──────────┐            ┌───────────┐
│ User │               │  Browser  │            │ User API │            │  Auth API │
└──┬───┘               └─────┬─────┘            └────┬─────┘            └─────┬─────┘
   │                         │                       │                        │
   │  Enters email/pwd       │                       │                        │
   ├────────────────────────>│                       │                        │
   │  Clicks Login           │                       │                        │
   │                         │  POST /userSvc/cred   │                        │
   │                         ├──────────────────────>│                        │
   │                         │                       │  Validates record      │
   │                         │                       ├──────────────┐         │
   │                         │                       │ in DB        │         │
   │                         │                       │              │         │
   │                         │  Returns User profile │◄─────────────┘         │
   │                         │◄──────────────────────┤                        │
   │                         │                       │                        │
   │                         │  GET /authSvc/{role}                           │
   │                         ├───────────────────────────────────────────────>│
   │                         │                                                │  Signs JWT
   │                         │                                                │  with Key
   │                         │                                                ├────────┐
   │                         │                                                │        │
   │                         │  Returns JWT token string                      │◄───────┘
   │                         │◄───────────────────────────────────────────────┤
   │                         │
   │                         │ Saves to localStorage
   │                         ├──────────────┐
   │                         │              │
   │                         │              │
   │                         │◄─────────────┘
   │                         │
   │  Redirects to Dashboard │
   │◄────────────────────────┤
```

---

## 11. Frontend — How the UI Works

The frontend React application coordinates state management and UI styling.

### 11.1 Route Guards
We use a `<ProtectedRoute />` component that checks if a JWT token exists in `localStorage`. If there's no valid token, it immediately redirects the visitor back to `/login`.

### 11.2 Dashboard Redirection
Inside `Dashboard.jsx`, the system inspects the logged-in user's role to determine the user experience:
```javascript
const role = user?.role;

return (
    <main className="dashboard-content">
        {role === 'Admin' ? (
            <AdminDashboard />
        ) : role === 'Supervisor' ? (
            <SupervisorDashboard />
        ) : (
            <TechnicianDashboard userId={user?.userId} />
        )}
    </main>
);
```

### 11.3 Polling (Real-time auto-refresh)
Dashboards utilize a React `useEffect` hook to regularly request updated state info:
```javascript
useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => {
        fetchAllData();
    }, 5000); // Triggers updates every 5 seconds
    return () => clearInterval(interval);
}, []);
```

---

## 12. Complete Request Flow — Step by Step

Let's trace what happens when a **Technician logs a high temperature**:

1.  **Technician Action:** The technician clicks "Record Temp" on the **"Vaccine Freezer" Room Card** (safe limits: `-20°C` to `-10°C`), enters `-5°C`, and saves.
2.  **Frontend Range Validation:** The frontend compares `-5` to the maximum limit of `-10`. Since `-5 > -10`, it registers a `"Too Hot"` alert situation.
3.  **Log Temperature:** The frontend triggers `apiService.setTemperature()` which routes to `http://localhost:5065/temperatureSvc` (routed to the Temperature microservice).
4.  **Create Alert:** The frontend immediately triggers `apiService.createAlert({ status: "Too Hot", temperature: -5 })` which routes to the Alert microservice (Port 5179).
5.  **Database Logging:** The Alert microservice writes the alert record to the database and calls `LogActivityAsync` which creates an audit trail entry in the `ActivityLogs` table.
6.  **Supervisor Interface Update:** The Supervisor's web browser fetches the active alerts 5 seconds later. The "Vaccine Freezer" Room Card instantly flashes **red**, showing a blinking **ALERT** banner with the active warning.

---

## 13. Logging Systems

We use two distinct types of logging systems:

### 13.1 Developer Logs (Console Logging via `ILogger`)
Standard .NET output logging.
```csharp
_logger.LogInformation("Creating alert for Room {RoomId} with Temp {Temp}", alert.RoomId, alert.Temperature);
```
*Purpose:* Helps programmers trace application events in real time inside the Visual Studio console or terminal logs.

### 13.2 Compliance Audit Logs (Persistent Database Logging)
Permanent log records saved to the database. Whenever a critical alert state changes (creation, technician explanation, supervisor resolution, or alert deletion), a custom method is called:
```csharp
public async Task LogActivityAsync(string action, string details)
{
    var log = new ActivityLog {
        Action = action,
        Details = details,
        Timestamp = DateTime.Now
    };
    await _context.ActivityLogs.AddAsync(log);
    await _context.SaveChangesAsync();
}
```
*Purpose:* Provides a durable, chronological history of operations for safety, audit compliance, and record-keeping.

---

## 14. Alert Lifecycle — From Trigger to Resolution

Here is a visual representation of an alert's lifecycle:

```
   [Technician records unsafe Temperature]
                     │
                     ▼
             ┌───────────────┐
             │ ALERT CREATED │ (Status: "Too Hot" / "Too Cold")
             └───────┬───────┘
                     │
                     ▼
           (Supervisor sees Alert)
                     │
                     ├─────────────────────────────────────────┐
                     ▼                                         ▼
         (Technician Files Reason)                  (Supervisor acts directly)
                     │                                         │
                     ▼                                         ▼
         ┌───────────────────────┐                    ┌──────────────────┐
         │ REASON ADDED TO ALERT │                    │  MARK RESOLVED   │
         └───────────┬───────────┘                    └────────┬─────────┘
                     │                                         │
                     └───────────────────┬─────────────────────┘
                                         │
                                         ▼
                            (Resolution Modal opens)
                                         │
                                         ▼
                          [Supervisor writes optional note]
                                         │
                                         ▼
                             ┌──────────────────────┐
                             │    ALERT RESOLVED    │ (Status: "Resolved")
                             └──────────┬───────────┘
                                         │
                                         ▼
                            (Room Card returns green)
                            (Audit Log entry saved)
```

---

## 15. Validation, Safety, & Error Handling

To make the system robust, we built validation guardrails:

1.  **Thermostat Safety Check:** When creating a room, the React frontend runs a comparison:
    ```javascript
    if (parseFloat(maxTemp) <= parseFloat(minTemp)) {
        setError("Maximum temperature must be strictly greater than the minimum temperature.");
        return;
    }
    ```
    This prevents impossible safe zones (like `Min: 20°C, Max: 10°C`).
2.  **Graceful Database Degradation:** If a newly created room has no recorded temperatures or active alerts, retrieving its state could crash standard database queries. We solved this by using `try-catch` structures inside the controllers to gracefully return empty arrays (`[]`) instead of throwing an error:
    ```csharp
    [HttpGet("room/{roomId}")]
    public async Task<ActionResult> GetByRoom(string roomId)
    {
        try { return Ok(await alertRepo.GetByRoomAsync(roomId)); }
        catch (AlertException) { return Ok(new List<Alert>()); } // Gracefully returns empty list
    }
    ```

---

## 16. Key Files Reference & Directory Map

Here is your map to locate core operations:

### 16.1 Backend C# Files
*   `Alert.cs` ([path](file:///c:/Users/HARSH/Downloads/AlarmLogViewerUsingMicroservices/AlertsLibrary/Models/Alert.cs)): Database model representing alerts.
*   `AlertController.cs` ([path](file:///c:/Users/HARSH/Downloads/AlarmLogViewerUsingMicroservices/AlarmLogViewerAPI/Controllers/AlertController.cs)): Alert endpoints, ILogger tracing, and database activity logs.
*   `UsersController.cs` ([path](file:///c:/Users/HARSH/Downloads/AlarmLogViewerUsingMicroservices/UserViewerAPI/Controllers/UsersController.cs)): User listings, registrations, and secure `[Authorize(Roles = "Admin")]` user deletion.
*   `Ocelot.json` ([path](file:///c:/Users/HARSH/Downloads/AlarmLogViewerUsingMicroservices/AlarmLogViewerApiGateway/Ocelot.json)): Upstream/Downstream port and route forwarding maps.

### 16.2 Frontend React Files
*   `AdminDashboard.jsx` ([path](file:///c:/Users/HARSH/Downloads/AlarmLogViewerUsingMicroservices/Frontend/src/components/AdminDashboard.jsx)): The Admin's User Management dashboard.
*   `SupervisorDashboard.jsx` ([path](file:///c:/Users/HARSH/Downloads/AlarmLogViewerUsingMicroservices/Frontend/src/components/SupervisorDashboard.jsx)): The Supervisor's live room monitoring dashboard.
*   `TechnicianDashboard.jsx` ([path](file:///c:/Users/HARSH/Downloads/AlarmLogViewerUsingMicroservices/Frontend/src/components/TechnicianDashboard.jsx)): The Technician's room creator and temperature logger.
*   `apiService.js` ([path](file:///c:/Users/HARSH/Downloads/AlarmLogViewerUsingMicroservices/Frontend/src/services/apiService.js)): The centralized API call center that automatically signs requests with the JWT security token.

---

## 17. How to Run the Complete Project

Follow these steps to run the complete microservices project locally:

1.  **Start SQL Server:** Make sure your SQL Server Express instance is running.
2.  **Start Backend Services:** Open the solution in Visual Studio or use the terminal to run each project using `dotnet run`:
    *   `AuthenticationWebApi` (Port 5228)
    *   `UserViewerAPI` (Port 5025)
    *   `RoomViewerAPI` (Port 5286)
    *   `TemperatureViewerAPI` (Port 5155)
    *   `AlarmLogViewerAPI` (Port 5179)
    *   `AlarmLogViewerApiGateway` (Port 5065)
3.  **Start React Client:** Open a terminal inside the `/Frontend` directory and start Vite:
    ```bash
    npm run dev
    ```
4.  **Log In:** Navigate to `http://localhost:5173`, register accounts with the roles you want to test, and explore!

---

*Documentation compiled with 💖 for Alarm Log Viewer — May 2026*
