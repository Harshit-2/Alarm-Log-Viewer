# Alarm Log Viewer — Complete Project Documentation
### A Beginner-Friendly Guide from A to Z

---

## Table of Contents
1. What Is This Project?
2. Technologies Used & Why
3. Project Architecture — The Big Picture
4. How All Services Connect (Port Map)
5. User Roles & What They Can Do
6. Database Design — All Tables Explained
7. Backend Services — Explained One by One
8. The API Gateway — The Traffic Controller
9. Authentication — How Login Works
10. Frontend — How the UI Works
11. Complete Request Flow — Step by Step
12. ILogger & Activity Logs
13. Alert Lifecycle — From Trigger to Resolution
14. Validation & Error Handling
15. Key Files Reference

---

## 1. What Is This Project?

The **Alarm Log Viewer** is a web application that monitors the temperature of multiple rooms in real time.

Imagine a hospital, a data centre, or a cold storage warehouse. All of these places have rooms that must stay within a specific temperature range. If the temperature goes too high or too low, someone needs to be notified immediately.

This system does exactly that:
- A **Technician** records the temperature of a room.
- If the temperature is outside the safe range, an **Alert** is automatically raised.
- A **Supervisor** monitors all rooms and alerts on a live dashboard.
- The Technician can **explain why** the temperature went out of range (File a Reason).
- The Supervisor can **resolve or delete** the alert once the problem is fixed.
- Every action is **logged to the database** so there is a full audit trail.

---

## 2. Technologies Used & Why

### 2.1 ASP.NET Core (C#) — The Backend Framework
**What it is:** A free, open-source framework made by Microsoft for building web APIs (Application Programming Interfaces).

**Why it is used:** It is fast, reliable, and very popular in enterprise applications. It handles HTTP requests from the browser and returns data in JSON format. It also has built-in support for authentication, logging, and database access.

**Where it is used:** In all 5 backend services — UserViewerAPI, RoomViewerAPI, TemperatureViewerAPI, AlarmLogViewerAPI, and AuthenticationWebApi.

---

### 2.2 Entity Framework Core (EF Core) — The Database Tool
**What it is:** A tool that lets you work with databases using C# code instead of writing raw SQL queries.

**Why it is used:** Instead of writing `INSERT INTO Alerts VALUES (...)`, you simply write `context.Alerts.AddAsync(alert)`. EF Core translates this into SQL automatically. This is called the **Code First** approach — you write C# classes (called "models") and EF Core creates the database tables for you.

**Where it is used:** In all 4 class libraries — AlertsLibrary, RoomsLibrary, TemperatureLibrary, UserLibrary.

**Key EF Core command used:**
- `Add-Migration` — Creates a script describing database changes.
- `Update-Database` — Applies those changes to the actual SQL Server database.

---

### 2.3 SQL Server Express — The Database
**What it is:** A free version of Microsoft SQL Server. A database is like a spreadsheet that your application can read and write to very quickly.

**Why it is used:** SQL Server is reliable, widely used in .NET applications, and integrates perfectly with EF Core.

**Where it is used:** There are **4 separate databases**, one for each microservice:
- `PrjUsersDB` — Stores users
- `PrjRoomsDB` — Stores rooms
- `PrjTemperatureDB` — Stores temperature readings
- `PrjAlertsLogDB` — Stores alerts, activity logs

---

### 2.4 JWT (JSON Web Token) — Authentication
**What it is:** A small, encoded string (like a digital passport) that proves who you are. Once you log in, the server gives you a JWT token. Every time you make a request, you send this token along with it.

**Why it is used:** Without JWT, anyone could call the APIs without logging in. JWT ensures that only authenticated users (Technicians and Supervisors) can access the system.

**Where it is used:** Generated in `AuthenticationWebApi`. Sent by `authService.js`. Attached to every API call in `apiService.js`.

**Format:** `Bearer eyJhbGciOiJIUzI1NiJ9.eyJuYW...`

---

### 2.5 Ocelot — The API Gateway
**What it is:** A .NET library that acts as a single front door for all backend services. Instead of the browser calling 5 different ports, it calls ONE port (5065) and Ocelot forwards the request to the correct service.

**Why it is used:** Simplifies the frontend — it only needs to know one URL. Also good for security and scalability.

**Where it is used:** `AlarmLogViewerApiGateway` project, configured in `Ocelot.json`.

---

### 2.6 React (JavaScript) — The Frontend Framework
**What it is:** A JavaScript library made by Meta (Facebook) for building interactive user interfaces.

**Why it is used:** React makes it easy to build dynamic, real-time dashboards. When data changes (e.g. a new alert comes in), React automatically updates only the part of the page that changed — without refreshing the entire page.

**Where it is used:** All files inside the `Frontend/src/` folder.

---

### 2.7 Vite — The Frontend Build Tool
**What it is:** A fast development server and build tool for React applications.

**Why it is used:** It starts the development server very fast and provides instant hot-reloading (when you save a file, the browser updates immediately).

**Where it is used:** `Frontend/` folder. Run with `npm run dev`.

---

### 2.8 React Router — Page Navigation
**What it is:** A library that handles navigation in a React app without reloading the page.

**Why it is used:** Allows navigating between Login, Register, and Dashboard pages smoothly.

**Where it is used:** `App.jsx` — defines routes for `/login`, `/register`, `/dashboard`.

---

### 2.9 ILogger — Built-in .NET Logging
**What it is:** A built-in interface in ASP.NET Core for writing log messages. These messages appear in the Visual Studio Output window while the app is running.

**Why it is used:** Helps developers see exactly what is happening in real time — which API was called, what data was received, and if any errors occurred.

**Where it is used:** `AlertController.cs`, `RoomController.cs`, `TemperatureController.cs`.

---

### 2.10 CSS (Vanilla) — Styling
**What it is:** Cascading Style Sheets — used to style the HTML elements (colours, fonts, spacing, animations).

**Where it is used:** `Dashboards.css`, `App.css`, `index.css` in the Frontend.

---

## 3. Project Architecture — The Big Picture

This project uses a **Microservices Architecture**. This means instead of one big application, the system is split into several small, independent services. Each service does ONE job and has its own database.

```
BROWSER (React Frontend)
        |
        | (HTTP requests to port 5065)
        v
API GATEWAY (Ocelot) — port 5065
        |
        |--- /userSvc      --> UserViewerAPI        (port 5025)
        |--- /roomSvc      --> RoomViewerAPI        (port 5286)
        |--- /temperatureSvc --> TemperatureViewerAPI (port 5155)
        |--- /alertSvc     --> AlarmLogViewerAPI    (port 5179)
        |--- /authSvc      --> AuthenticationWebApi  (port 5228)
```

Each API service has its own Class Library (the data layer):

```
UserViewerAPI       <--> UserLibrary       <--> PrjUsersDB
RoomViewerAPI       <--> RoomsLibrary      <--> PrjRoomsDB
TemperatureViewerAPI <--> TemperatureLibrary <--> PrjTemperatureDB
AlarmLogViewerAPI   <--> AlertsLibrary     <--> PrjAlertsLogDB
```

---

## 4. How All Services Connect — Port Map

| Service | Port | Purpose |
|---|---|---|
| React Frontend | 5173 | The UI the user sees in the browser |
| API Gateway (Ocelot) | 5065 | Single entry point for all API calls |
| UserViewerAPI | 5025 | Manage users (create, get, delete) |
| RoomViewerAPI | 5286 | Manage rooms (create, edit, delete) |
| TemperatureViewerAPI | 5155 | Record and fetch temperature readings |
| AlarmLogViewerAPI | 5179 | Manage alerts, reasons, resolution notes, activity logs |
| AuthenticationWebApi | 5228 | Generate JWT tokens for login |

**Important:** All 6 services must be running at the same time for the application to work.

---

## 5. User Roles & What They Can Do

### Technician
- View all rooms or only their own rooms
- Create a new room (with min/max temperature range)
- Edit a room they created
- Delete a room they created
- Record the current temperature for any room
- File a reason when a room has an active alert (explain what caused it)

### Supervisor
- View the real-time monitoring dashboard (auto-refreshes every 5 seconds)
- See all rooms with their current temperature and alert status
- See the technician's filed reason for each alert
- Mark an alert as Resolved (with an optional resolution note)
- Delete an alert permanently
- Manage users (view, delete)

---

## 6. Database Design — All Tables Explained

### PrjUsersDB → Table: Users
| Column | Type | Description |
|---|---|---|
| UserId | VARCHAR(6) | Primary Key e.g. U12345 |
| Username | VARCHAR(100) | User's email address |
| Password | VARCHAR(100) | Password (stored as plain text) |
| Role | VARCHAR(30) | "Technician" or "Supervisor" |
| CreatedAt | VARCHAR(30) | Date the account was created |

---

### PrjRoomsDB → Table: Rooms
| Column | Type | Description |
|---|---|---|
| RoomId | VARCHAR(6) | Primary Key e.g. R12345 |
| RoomName | VARCHAR(100) | Name of the room |
| MinTemp | DECIMAL | Minimum safe temperature (°C) |
| MaxTemp | DECIMAL | Maximum safe temperature (°C) |
| CreatedByUserId | VARCHAR(6) | Which technician created this room |
| CreatedAt | VARCHAR(30) | Date the room was created |

---

### PrjTemperatureDB → Table: Temperatures
| Column | Type | Description |
|---|---|---|
| ReadingId | VARCHAR(6) | Primary Key |
| RoomId | VARCHAR(6) | Which room this reading belongs to |
| TemperatureValue | DECIMAL | The recorded temperature in °C |
| RecordedAt | DateTime | When this reading was taken |

---

### PrjAlertsLogDB → Table: Alerts
| Column | Type | Description |
|---|---|---|
| AlertId | VARCHAR(6) | Primary Key |
| RoomId | VARCHAR(6) | Which room triggered the alert |
| Temperature | DECIMAL | The temperature that caused the alert |
| Status | VARCHAR(30) | "Too Hot", "Too Cold", or "Resolved" |
| AlertTime | VARCHAR(30) | When the alert was triggered |
| Reason | VARCHAR(200) | Reason filed by the technician (optional) |
| ResolutionNote | VARCHAR(500) | Resolution note written by supervisor (optional) |

---

### PrjAlertsLogDB → Table: ActivityLogs
| Column | Type | Description |
|---|---|---|
| LogId | INT (auto) | Auto-incremented Primary Key |
| Action | VARCHAR(100) | Short name e.g. "Alert Created" |
| Details | VARCHAR(500) | Full description of what happened |
| Timestamp | DateTime | Exact date and time of the action |

---

## 7. Backend Services — Explained One by One

### 7.1 UserViewerAPI (Port 5025)
Manages user accounts. Uses `UserLibrary` and `PrjUsersDB`.

**Endpoints:**
| Method | URL | What it does |
|---|---|---|
| GET | /api/User | Get all users |
| GET | /api/User/{id} | Get one user by ID |
| GET | /api/User/credentials?username=&password= | Verify login credentials |
| POST | /api/User | Create a new user (Register) |
| PUT | /api/User/{id} | Update user details |
| DELETE | /api/User/{id} | Delete a user |

---

### 7.2 RoomViewerAPI (Port 5286)
Manages rooms. Uses `RoomsLibrary` and `PrjRoomsDB`.

**Special behaviour on room creation:** When a new room is created, the Room API automatically calls BOTH the Temperature API and the Alert API to create a matching "stub" record. This ensures all 3 databases stay in sync.

**Endpoints:**
| Method | URL | What it does |
|---|---|---|
| GET | /api/Room | Get all rooms |
| GET | /api/Room/{id} | Get one room |
| GET | /api/Room/creator/{userId} | Get rooms created by a specific user |
| POST | /api/Room | Create a new room |
| PUT | /api/Room/{id} | Edit a room |
| DELETE | /api/Room/{id} | Delete a room |

---

### 7.3 TemperatureViewerAPI (Port 5155)
Records and retrieves temperature readings. Uses `TemperatureLibrary` and `PrjTemperatureDB`.

**Endpoints:**
| Method | URL | What it does |
|---|---|---|
| GET | /api/Temperature | Get all readings |
| GET | /api/Temperature/{id} | Get one reading |
| GET | /api/Temperature/room/{roomId} | Get all readings for a room |
| GET | /api/Temperature/room/{roomId}/latest | Get the most recent reading |
| POST | /api/Temperature | Record a new temperature |
| PUT | /api/Temperature/{id} | Update a reading |
| DELETE | /api/Temperature/{id} | Delete a reading |

---

### 7.4 AlarmLogViewerAPI (Port 5179)
The most important service. Manages alerts, activity logs. Uses `AlertsLibrary` and `PrjAlertsLogDB`.

**Endpoints:**
| Method | URL | What it does |
|---|---|---|
| GET | /api/Alert | Get all alerts |
| GET | /api/Alert/{id} | Get one alert |
| GET | /api/Alert/room/{roomId} | Get all alerts for a room |
| GET | /api/Alert/status/{status} | Get alerts by status |
| GET | /api/Alert/logs | Get all activity logs |
| POST | /api/Alert | Create a new alert |
| PUT | /api/Alert/{id} | Update alert (file reason / mark resolved) |
| DELETE | /api/Alert/{id} | Delete an alert |

---

### 7.5 AuthenticationWebApi (Port 5228)
Generates JWT tokens. Has no database.

**Endpoint:**
| Method | URL | What it does |
|---|---|---|
| GET | /api/Auth/{userName}/{role}/{secretKey} | Returns a signed JWT token |

---

## 8. The API Gateway — The Traffic Controller

The API Gateway uses a library called **Ocelot**. Its configuration is in `Ocelot.json`.

**How it works (example):**
1. Browser calls: `GET http://localhost:5065/roomSvc/R12345`
2. Ocelot sees `/roomSvc/` → maps it to port 5286
3. Ocelot forwards: `GET http://localhost:5286/api/Room/R12345`
4. RoomViewerAPI responds with the room data
5. Ocelot sends the response back to the browser

**Route Mappings in Ocelot.json:**
| Frontend URL | Forwarded To |
|---|---|
| /userSvc/... | localhost:5025/api/User/... |
| /roomSvc/... | localhost:5286/api/Room/... |
| /temperatureSvc/... | localhost:5155/api/Temperature/... |
| /alertSvc/... | localhost:5179/api/Alert/... |
| /authSvc/... | localhost:5228/api/Auth/... |

---

## 9. Authentication — How Login Works

This is a step-by-step explanation of what happens when someone logs in:

**Step 1 — User enters email and password and clicks Login.**

**Step 2 — `authService.js` calls `/userSvc/credentials`**
- This hits the User API which checks if the email and password match a record in `PrjUsersDB`.
- If wrong credentials → returns an error → user sees "Invalid email or password."
- If correct → returns the user object (userId, username, role).

**Step 3 — `authService.js` calls `/authSvc/{username}/{role}/{secretKey}`**
- This hits the Auth API.
- The Auth API creates a JWT token containing the user's name and role (Technician or Supervisor).
- The token is signed with a secret key using the **HMAC SHA-256** algorithm.
- The token expires after **2 hours**.

**Step 4 — Token is stored in `localStorage`.**
- `localStorage.setItem('token', token)` — saved in the browser.
- `localStorage.setItem('user', JSON.stringify(userData))` — user info also saved.

**Step 5 — Every future API call includes the token.**
- In `apiService.js`, the `fetchWithAuth` function reads the token from localStorage and adds it to the `Authorization` header: `Bearer <token>`.
- The API Gateway passes it through, and each API controller validates it via `[Authorize]`.

**Step 6 — On logout, the token is removed.**
- `authService.logout()` calls `localStorage.removeItem('token')`.

---

## 10. Frontend — How the UI Works

### File Structure
```
Frontend/src/
├── App.jsx              — Defines routes (Login, Register, Dashboard)
├── main.jsx             — Entry point, renders the React app
├── pages/
│   ├── Login.jsx        — Login form
│   ├── Register.jsx     — Registration form
│   └── Dashboard.jsx    — Decides which dashboard to show (Technician or Supervisor)
├── components/
│   ├── TechnicianDashboard.jsx  — Technician's room management + temperature recording
│   ├── SupervisorDashboard.jsx  — Supervisor's live monitoring + user management
│   └── ProtectedRoute.jsx       — Blocks access to dashboard if not logged in
├── services/
│   ├── authService.js   — Login, Register, Logout, token management
│   └── apiService.js    — All API calls (rooms, alerts, temperatures, users)
├── context/
│   └── AuthContext.jsx  — Shares login state across the whole app
└── components/
    └── Dashboards.css   — All CSS styling for both dashboards
```

### How the Dashboard decides which view to show
In `Dashboard.jsx`, it reads the user's role from localStorage:
- If role === "Supervisor" → renders `<SupervisorDashboard />`
- If role === "Technician" → renders `<TechnicianDashboard />`

### Auto-Refresh (Polling)
Both dashboards use `setInterval` to automatically re-fetch data every **5 seconds**:
```js
const interval = setInterval(() => {
    fetchData(); // or fetchAllData() in Supervisor
}, 5000);
return () => clearInterval(interval); // Cleanup on unmount
```

---

## 11. Complete Request Flow — Step by Step

### Example: Technician records a temperature of 45°C for a room with max 35°C

**Step 1:** Technician clicks "Set Temp", enters 45, clicks "Record Reading".

**Step 2:** `TechnicianDashboard.jsx` calls `handleSetTemperature()`.

**Step 3:** It calls `apiService.setTemperature(...)` which sends:
```
POST http://localhost:5065/temperatureSvc
Body: { readingId: "T12345", roomId: "R11111", temperatureValue: 45, recordedAt: "..." }
```

**Step 4:** Ocelot forwards this to TemperatureViewerAPI (port 5155).

**Step 5:** TemperatureViewerAPI saves the reading to `PrjTemperatureDB` and logs to console via ILogger.

**Step 6:** Back in `handleSetTemperature()`, the code compares 45°C to the room's max (35°C).
Since 45 > 35, status = "Too Hot".

**Step 7:** It calls `apiService.createAlert(...)` which sends:
```
POST http://localhost:5065/alertSvc
Body: { alertId: "A12345", roomId: "R11111", temperature: 45, status: "Too Hot", alertTime: "..." }
```

**Step 8:** Ocelot forwards to AlarmLogViewerAPI (port 5179).

**Step 9:** AlertController saves the alert to `PrjAlertsLogDB`.
It also logs to console (ILogger) AND saves an ActivityLog record to the database.

**Step 10:** The Supervisor's dashboard (polling every 5 seconds) fetches alerts and now sees the new "Too Hot" alert on Room R11111. The room card turns red and shows a blinking ALERT indicator.

---

## 12. ILogger & Activity Logs

### ILogger (Console Logging)
ILogger is built into ASP.NET Core. You just inject it and use it:
```csharp
private readonly ILogger<AlertController> _logger;
// Then in a method:
_logger.LogInformation("Alert created: {AlertId}", alert.AlertId);
_logger.LogError("Failed to save: {Error}", ex.Message);
```
These messages appear in the Visual Studio Output window when the app runs.

**Where ILogger is used:**
- `AlertController.cs` — logs every alert action
- `RoomController.cs` — logs room create, update, delete
- `TemperatureController.cs` — logs temperature record and update

### Database Activity Logs
For a permanent record, all alert-related actions are also saved to the `ActivityLogs` table in `PrjAlertsLogDB`.

**Actions that are logged to the database:**
| Action | Triggered By |
|---|---|
| Alert Created | Technician records out-of-range temperature |
| Reason Filed by Technician | Technician submits a reason for the alert |
| Alert Resolved by Supervisor | Supervisor clicks "Mark Resolved" and submits |
| Alert Deleted by Supervisor | Supervisor clicks "Delete Alert" and confirms |

---

## 13. Alert Lifecycle — From Trigger to Resolution

```
TEMPERATURE RECORDED (by Technician)
        |
        v
Is temperature outside min/max range?
        |
   YES  |   NO
        |    └── Nothing happens. Room stays normal (green).
        v
ALERT CREATED (status: "Too Hot" or "Too Cold")
        |
        v
Supervisor sees blinking ALERT on room card
        |
        v
Technician can FILE A REASON
(selects from dropdown: Equipment malfunction, Power outage, etc.)
        |
        v
Supervisor sees the filed reason on the alert card
        |
        v
Supervisor clicks "Mark Resolved"
        |
        v
Popup appears — Supervisor writes optional resolution note
(e.g. "AC filter was cleaned and unit restarted")
        |
        v
Alert status updated to "Resolved"
Room card goes back to normal (green)
ActivityLog record saved to database
        |
     OR v
Supervisor clicks "Delete Alert" → Alert permanently removed
ActivityLog record saved to database
```

---

## 14. Validation & Error Handling

### Frontend Validation
- **Min/Max Temperature Check:** When creating or editing a room, if `maxTemp <= minTemp`, the form shows an error inside the modal and does NOT call the API.
- **Required Fields:** Room name and temperature value are required fields (HTML `required` attribute).
- **Empty Auth Check:** `apiService.js` checks if a JWT token exists before every call. If missing, it throws an error immediately without hitting the server.

### Backend Error Handling
Each repository method throws a custom exception when something goes wrong:
- `AlertException` — thrown by AlertsLibrary
- `RoomException` — thrown by RoomsLibrary
- `TemperatureException` — thrown by TemperatureLibrary

Each controller catches these exceptions and returns the appropriate HTTP status code:
- `200 OK` — Success
- `201 Created` — New record created
- `400 Bad Request` — Invalid data
- `404 Not Found` — Record doesn't exist

**Graceful degradation:** `GetByRoom` endpoints in both Temperature and Alert controllers catch exceptions and return an empty list `[]` instead of a 500 error. This prevents the frontend from crashing when a new room has no data yet.

---

## 15. Key Files Reference

| File | Location | Purpose |
|---|---|---|
| `Alert.cs` | AlertsLibrary/Models | Database model for alerts (with Reason, ResolutionNote) |
| `ActivityLog.cs` | AlertsLibrary/Models | Database model for activity history |
| `AlertDbContext.cs` | AlertsLibrary/Models | EF Core database context (registers all tables) |
| `IAlertRepository.cs` | AlertsLibrary/Repos | Interface defining all available database operations |
| `EFAlertRepository.cs` | AlertsLibrary/Repos | Actual implementation of database operations |
| `AlertController.cs` | AlarmLogViewerAPI/Controllers | HTTP API endpoints for alerts + logging |
| `RoomController.cs` | RoomViewerAPI/Controllers | HTTP API endpoints for rooms |
| `TemperatureController.cs` | TemperatureViewerAPI/Controllers | HTTP API endpoints for temperatures |
| `AuthController.cs` | AuthenticationWebApi/Controllers | Generates JWT tokens |
| `Ocelot.json` | AlarmLogViewerApiGateway | Maps frontend URLs to backend services |
| `apiService.js` | Frontend/src/services | All frontend API calls (with JWT token) |
| `authService.js` | Frontend/src/services | Login, register, logout logic |
| `TechnicianDashboard.jsx` | Frontend/src/components | Technician UI — rooms, temperatures, file reason |
| `SupervisorDashboard.jsx` | Frontend/src/components | Supervisor UI — live monitoring, resolve, delete alerts |
| `App.jsx` | Frontend/src | React routing (Login, Register, Dashboard pages) |
| `Dashboards.css` | Frontend/src/components | All CSS styling for dashboards |

---

## How to Run the Project

You need to start **6 things** in this order:

1. Start **SQL Server Express** (it usually starts automatically with Windows).
2. Run **AuthenticationWebApi** (port 5228)
3. Run **UserViewerAPI** (port 5025)
4. Run **RoomViewerAPI** (port 5286)
5. Run **TemperatureViewerAPI** (port 5155)
6. Run **AlarmLogViewerAPI** (port 5179)
7. Run **AlarmLogViewerApiGateway** (port 5065)
8. In the Frontend folder, run: `npm run dev` (starts on port 5173)
9. Open your browser and go to: `http://localhost:5173`

---

*Documentation generated for Alarm Log Viewer Using Microservices — May 2026*
