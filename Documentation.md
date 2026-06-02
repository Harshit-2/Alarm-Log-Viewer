# 1. Project Overview

## What the project does
The **Alarm Log Viewer** is a real-time temperature monitoring and alerting system. It is designed to track temperatures in critical environments (like vaccine freezers or server rooms). It allows technicians to log temperatures, supervisors to monitor alerts when temperatures go out of bounds, and administrators to manage system users.

## Main purpose
To ensure that environments requiring strict temperature control are constantly monitored, and that any deviations (too hot or too cold) trigger instant alerts that must be documented and resolved, creating a fully audited safety trail.

## High-level architecture
The project uses a **Microservices Architecture**. Instead of one giant application, the backend is split into five small, independent web APIs (Authentication, Users, Rooms, Temperatures, and Alerts). They all sit behind an API Gateway (Ocelot). The frontend is a modern Single Page Application (SPA) built with React.

```mermaid
flowchart TD
    Client[React Frontend UI] -->|HTTP Requests| Gateway[Ocelot API Gateway :5065]
    
    Gateway -->|Routes /authSvc| Auth[Authentication API :5228]
    Gateway -->|Routes /userSvc| User[User API :5025]
    Gateway -->|Routes /roomSvc| Room[Room API :5286]
    Gateway -->|Routes /temperatureSvc| Temp[Temperature API :5155]
    Gateway -->|Routes /alertSvc| Alert[Alert API :5179]
    
    User --> DB1[(PrjUserLogDB)]
    Room --> DB2[(PrjRoomsDB)]
    Temp --> DB3[(PrjTemperatureDB)]
    Alert --> DB4[(PrjAlertsLogDB)]
```

## Main technologies used
- **Backend:** C# .NET Core, ASP.NET Core Web API
- **Database:** Microsoft SQL Server Express, Entity Framework Core (EF Core)
- **Security:** JSON Web Tokens (JWT)
- **Routing:** Ocelot API Gateway
- **Frontend:** React.js, Vite

---

# 2. Folder Structure Explanation

Here is a breakdown of the important folders and why they exist in this solution:

- **`Frontend/`**: Contains the entire React.js user interface (HTML, CSS, JavaScript, Vite config). This is the only part the user interacts with.
- **`AlarmLogViewerApiGateway/`**: The Ocelot Gateway project. It receives frontend requests and routes them to the correct microservice.
- **`AuthenticationWebApi/`**: A tiny microservice dedicated entirely to verifying credentials and generating JWT tokens.
- **Microservice APIs (`UserViewerAPI`, `RoomViewerAPI`, `TemperatureViewerAPI`, `AlarmLogViewerAPI`)**: These are the ASP.NET Core API projects containing the `Controllers`. They handle HTTP requests.
- **Class Libraries (`UserLibrary`, `RoomsLibrary`, `TemperatureLibrary`, `AlertsLibrary`)**: These contain the business logic and database connections. Each one contains:
  - **`Models/`**: The C# classes representing database tables.
  - **`Models/*DbContext.cs`**: The EF Core database connection manager.
  - **`Migrations/`**: Auto-generated C# files that create the SQL tables.
  - **`Repos/`**: The Repositories (Data Access Layer) where SQL operations happen.
- **`SharedContracts/`**: Contains Data Transfer Objects (DTOs) used to pass data between the microservices without exposing database models directly.

---

# 3. Technology Stack

### C# & ASP.NET Core
*   **Why used:** Fast, strongly-typed, and secure backend language/framework.
*   **Problem solved:** Handles incoming HTTP requests, processes logic, and returns JSON.
*   **How used:** Used to build all the microservices and controllers.

### Entity Framework Core (EF Core)
*   **Why used:** An Object-Relational Mapper (ORM).
*   **Problem solved:** Saves developers from writing raw SQL queries. You write C#, and EF Core translates it to SQL.
*   **How used:** Used in the `Repos/` folders to Add, Update, or Delete records in the database.

### SQL Server Express
*   **Why used:** Reliable, free database engine by Microsoft.
*   **Problem solved:** Stores all application data permanently.
*   **How used:** The project uses 4 independent databases (e.g., `PrjUserLogDB`, `PrjRoomsDB`) to ensure microservice isolation.

### JWT (JSON Web Tokens)
*   **Why used:** Stateless authentication.
*   **Problem solved:** Securely verifies who the user is and what their role is without needing to check the database on every single request.
*   **How used:** Generated upon login and sent as a `Bearer` token in the HTTP header for all subsequent API requests.

### Ocelot API Gateway
*   **Why used:** Centralized routing.
*   **Problem solved:** Prevents the React frontend from having to remember 5 different port numbers for 5 different microservices.
*   **How used:** React calls Port `5065`, and Ocelot routes the traffic internally based on the URL (e.g., `/userSvc` goes to port `5025`).

### React.js & Vite
*   **Why used:** Fast frontend rendering.
*   **Problem solved:** Allows building interactive dashboards that update instantly without page reloads.
*   **How used:** Renders the Admin, Supervisor, and Technician dashboards in the browser.

---

# 4. Complete Request Lifecycle

When a frontend user clicks a button to get a list of users, this is the exact journey the request takes:

1.  **Frontend Action:** User clicks "View Users" in React.
2.  **HTTP Request:** React (using the native `fetch` API) sends an HTTP GET request to `http://localhost:5065/userSvc` with the JWT token in the header.
3.  **API Gateway (Ocelot):** Ocelot receives the request on Port `5065`, looks at `Ocelot.json`, and sees `/userSvc` maps to the User microservice on Port `5025`. It forwards the request.
4.  **Middleware/Routing:** The `UserViewerAPI` receives the request. The ASP.NET routing engine matches the HTTP GET method to the `UserController.GetAll()` method.
5.  **Controller:** The `UserController` receives the call. It asks the injected `IUserRepository` for data.
6.  **Repository:** `EFUserRepository.GetAllAsync()` is executed. It calls `_context.Users.ToListAsync()`.
7.  **DbContext:** `UserDbContext` translates the LINQ command into a raw SQL query (`SELECT * FROM Users`).
8.  **Database:** SQL Server executes the query and returns the rows.
9.  **Response:** The rows become C# `User` objects, pass back to the Controller, get serialized into JSON, and are returned via HTTP 200 OK to the frontend.
10. **Frontend Rendering:** React receives the JSON array and updates the DOM to display the user table.

```mermaid
sequenceDiagram
    autonumber
    actor User as Frontend User
    participant React as React UI
    participant Ocelot as Ocelot Gateway
    participant API as UserViewerAPI
    participant Repo as EFUserRepository
    participant DB as SQL Database

    User->>React: Clicks "View Users"
    React->>Ocelot: GET /userSvc with JWT
    Ocelot->>API: Forwards to Port 5025
    API->>API: JWT Middleware Validates Token
    API->>Repo: userRepo.GetAllAsync()
    Repo->>DB: EF Core Translates to SQL SELECT
    DB-->>Repo: Returns Data Rows
    Repo-->>API: Returns List<User>
    API-->>Ocelot: Returns JSON (200 OK)
    Ocelot-->>React: Forwards Response
    React-->>User: Updates Dashboard UI
```

---

# 5. Frontend to Backend Communication

### How frontend calls backend
The React application uses the native `fetch` API inside a centralized `apiService.js` file to make requests to the backend.

### API calling mechanism
All requests are sent to the **Base URL** of the Ocelot Gateway: `http://localhost:5065`.

### Headers & JWT token sending
Before a request leaves the browser, React pulls the saved JWT from `localStorage` and attaches it to the HTTP Headers:
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5..."
}
```

### JSON Request/Response Flow
When sending data (like a new room), React converts a JavaScript object into a JSON string and sets the `Content-Type: application/json` header. The backend ASP.NET controller automatically deserializes this JSON back into a C# class via `[FromBody]`.

---

# 6. Controllers Explanation

### `UserController` (UserViewerAPI)
*   **Purpose:** Manages user accounts.
*   **Endpoints:**
    *   `GET /api/User` - Gets all users.
    *   `GET /api/User/{id}` - Gets one user.
    *   `POST /api/User` - Creates a user.
    *   `PUT /api/User/{id}` - Updates a user.
    *   `DELETE /api/User/{id}` - Deletes a user (Requires Admin role).
*   **Flow:** Receives request → calls `IUserRepository` → returns `Ok(data)` or `BadRequest()`.

### `RoomController` (RoomViewerAPI)
*   **Purpose:** Manages rooms and temperature thresholds.
*   **Endpoints:** `GET`, `POST`, `PUT`, `DELETE` for rooms.
*   **Flow:** When a room is created via `POST`, this controller also makes direct HTTP calls to the Temperature and Alert microservices to ensure data is synced.

### `AuthController` (AuthenticationWebApi)
*   **Purpose:** Issues JWT tokens.
*   **Endpoints:** `GET /api/Auth/{userName}/{role}/{secretKey}`
*   **Flow:** Receives valid user info, signs a token using the `SymmetricSecurityKey`, and returns the raw string.

---

# 7. Services Explanation

In this project, the **Repository Pattern** is used in place of traditional "Services". The repositories (`EFUserRepository`, `EFRoomRepository`, etc.) handle the business logic and database interactions.

### `EFUserRepository`
*   **Why it exists:** To abstract the database away from the Controller. The Controller shouldn't know SQL or EF Core commands.
*   **Methods:** `GetAllAsync()`, `GetByIdAsync()`, `AddAsync()`, `UpdateAsync()`, `DeleteAsync()`.
*   **Logic:** Checks if a user exists before updating/deleting. If not, it throws a custom `UserException`.
*   **Communication:** Interacts directly with `UserDbContext`.

---

# 8. DTOs Explanation (Data Transfer Objects)

*   **Why DTO is needed:** Sometimes your database table has 20 columns (like passwords, secret keys, creation dates), but the frontend only needs 3 columns (ID, Name, Role).
*   **Problem solved:** Prevents over-posting (sending too much data) and hides sensitive database properties from the public API.
*   **Input/Output Mapping:** Data from the database `Model` is mapped to the `DTO` before being sent out.
*   **Difference:** `Model` = Database representation. `DTO` = API representation. (Found in the `SharedContracts` project).

---

# 9. Models / Entities Explanation

### `User` Entity
*   **Properties:** `UserId` (PK), `Username`, `Password`, `Role`, `CreatedAt`.
*   **Table Mapping:** Mapped to the `Users` table in SQL Server.
*   **Relationships:** A User can have many Rooms (`ICollection<Room>`).

### `Room` Entity
*   **Properties:** `RoomId` (PK), `RoomName`, `MinTemp`, `MaxTemp`, `CreatedByUserId`.
*   **Table Mapping:** Mapped to the `Rooms` table.

---

# 10. Database Explanation

Because this is a microservices project, data is split across multiple databases to ensure that if one service goes down, the others survive.

*   **PrjUserLogDB:** Holds the `Users` table.
*   **PrjRoomsDB:** Holds the `Rooms` table.
*   **PrjTemperatureDB:** Holds the `Temperatures` history table.
*   **PrjAlertsLogDB:** Holds `Alerts` and `ActivityLogs`.

### Entity Framework Mapping & Migrations
The C# models are translated to SQL tables using EF Core Migrations. The commands `Add-Migration` and `Update-Database` generate the schema.

```mermaid
erDiagram
    Users {
        VARCHAR(6) UserId PK
        VARCHAR(30) Username
        VARCHAR(30) Password
        VARCHAR(30) Role
        VARCHAR(30) CreatedAt
    }
    
    Rooms {
        VARCHAR(6) RoomId PK
        VARCHAR(100) RoomName
        DECIMAL MinTemp
        DECIMAL MaxTemp
        VARCHAR(6) CreatedByUserId FK
        VARCHAR(30) CreatedAt
    }
    
    Temperatures {
        VARCHAR(6) ReadingId PK
        VARCHAR(6) RoomId FK
        DECIMAL TemperatureValue
        DateTime RecordedAt
    }
    
    Alerts {
        VARCHAR(6) AlertId PK
        VARCHAR(6) RoomId FK
        DECIMAL Temperature
        VARCHAR(30) Status
        VARCHAR(30) AlertTime
        VARCHAR(200) Reason
        VARCHAR(500) ResolutionNote
    }
    
    ActivityLogs {
        INT LogId PK
        VARCHAR(100) Action
        VARCHAR(500) Details
        DateTime Timestamp
    }

    Users ||--o{ Rooms : "creates"
    Rooms ||--o{ Temperatures : "has"
    Rooms ||--o{ Alerts : "triggers"
```

---

# 11. DbContext Deep Explanation

### What is DbContext?
`DbContext` is the bridge between the C# application and the SQL database.

### How it works:
In `UserDbContext.cs`:
```csharp
public virtual DbSet<User> Users { get; set; }
```
`DbSet` represents the actual table. When the repository calls `_context.Users.Add(user)`, EF Core begins **Entity Tracking**. It tracks that a new object exists in memory.

### `SaveChangesAsync()`
The database is not updated immediately! Only when `await _context.SaveChangesAsync();` is called does EF Core generate the `INSERT` SQL statement and execute a transaction against SQL Server.

---

# 12. Authentication & Authorization

### The Full Login Flow

```mermaid
sequenceDiagram
    participant React as Frontend (React)
    participant Ocelot as Gateway (Port 5065)
    participant UserAPI as User Microservice
    participant AuthAPI as Auth Microservice

    React->>Ocelot: POST /userSvc/credentials (username, password)
    Ocelot->>UserAPI: Forwards Request
    UserAPI-->>Ocelot: Validates DB, Returns User Profile & Role
    Ocelot-->>React: Returns User Profile
    React->>Ocelot: GET /authSvc (userName, role, secret)
    Ocelot->>AuthAPI: Forwards Request
    AuthAPI-->>Ocelot: Generates and Signs JWT Token
    Ocelot-->>React: Returns Token String
    React->>React: Stores JWT in localStorage
```

### Authorization (Role-Based)
If a user is logged in as a "Supervisor", their token contains `Role: "Supervisor"`. If they try to hit the `[Authorize(Roles = "Admin")]` delete endpoint, the server reads the token, sees they are not an Admin, and returns a `403 Forbidden` error.

---

# 13. JWT Complete Deep Dive

### What is JWT?
JSON Web Token. It is a mathematically cryptographically signed string.

### How token is generated
Inside `AuthController.cs`, the server creates `Claims` (statements about the user, like their name and role). It then uses a `SymmetricSecurityKey` (a secret password only the server knows) to sign the token using the HMAC SHA256 algorithm.

### Validation
Because the token is signed with a secret key, the server doesn't need to look in the database to see if the token is valid. If a hacker tries to modify their token to change their role to "Admin", the cryptographic signature will break, and the ASP.NET middleware will reject it instantly.

### Why is `AuthenticationWebApi` a Separate Microservice?
In a standard app, login and token generation are handled by the `UserController`. In this project, `AuthenticationWebApi` is an **independent microservice running on Port 5228**. 
*   **Security Isolation:** The only responsibility of this service is cryptographic signing. It doesn't even connect to the SQL database.
*   **How it works:** 
    1. The React app first asks the `UserViewerAPI` if the username/password are correct.
    2. If correct, `UserViewerAPI` returns the user's role.
    3. The React app then calls `AuthenticationWebApi` with that role.
    4. `AuthenticationWebApi` mathematically signs the token and returns it. 
*   **Benefits:** If the database crashes, or the User API goes down under heavy load, the Authentication server remains entirely unaffected and isolated, strictly generating and signing secure digital passports.

---

# 14. Middleware Explanation

Middleware is code that runs in the "pipeline" between the incoming HTTP request and your Controller.

1.  **CORS Middleware:** Allows the React app on Port `5173` to talk to the API on Port `5065`.
2.  **Authentication Middleware (`UseAuthentication`):** Reads the incoming HTTP header, extracts the JWT, and validates the signature.
3.  **Authorization Middleware (`UseAuthorization`):** Checks if the authenticated user has the correct Role for the requested Controller endpoint.
4.  **Routing Middleware:** Directs the traffic to the correct C# method.

```mermaid
flowchart LR
    Start([Incoming Request]) --> Middleware1[CORS Middleware]
    Middleware1 -->|If Blocked| Rej1([403 Blocked])
    Middleware1 -->|If Allowed| Middleware2[Authentication Middleware]
    
    Middleware2 -->|Invalid Token| Rej2([401 Unauthorized])
    Middleware2 -->|Valid Token| Middleware3[Authorization Middleware]
    
    Middleware3 -->|Wrong Role| Rej3([403 Forbidden])
    Middleware3 -->|Right Role| Middleware4[Routing Middleware]
    
    Middleware4 --> Controller[Controller Logic]
    Controller --> End([HTTP Response Generated])
```

---

# 15. Logging System

### ILogger (Console/Developer Logging)
ASP.NET Core provides `ILogger`. It is used to print messages to the developer console while the app is running (e.g., `_logger.LogInformation("Request received");`).

### Database Logging (`ActivityLogs`)
For business compliance, the `AlarmLogViewerAPI` has an `ActivityLogs` table. Whenever an alert is created or resolved, a custom method writes a permanent string to the SQL database detailing exactly who did what, and when.

---

# 16. Exception Handling

### Try/Catch blocks
Every controller method is wrapped in a `try/catch` block.
```csharp
try {
    var user = await repo.GetByIdAsync(id);
    return Ok(user);
} catch (UserException ex) {
    return NotFound(ex.Message);
}
```
If the repository cannot find the user, it throws a custom `UserException`. The controller catches this and returns a clean `404 Not Found` to the frontend instead of crashing the server with a `500 Internal Server Error`.

---

# 17. Dependency Injection (DI)

### What is DI?
Instead of a Controller creating its own repository using `new EFUserRepository()`, the ASP.NET framework "injects" the repository into the Controller's constructor.

### Registration in `Program.cs`
```csharp
builder.Services.AddScoped<IUserRepository, EFUserRepository>();
```
*   **Scoped Lifetime:** A new instance of `EFUserRepository` is created once per HTTP request and destroyed when the response is sent. This ensures database connections are closed properly.

```mermaid
flowchart TD
    Container[ASP.NET DI Container]
    Req[Incoming Request] --> Controller[UserController]
    
    Controller -- "I need an IUserRepository" --> Container
    Container -- "Here is a new EFUserRepository" --> Controller
    
    Controller --> DB[(Database)]
    DB --> Controller
    
    Controller --> Res[Response sent back]
    Res --> Destroy["EFUserRepository is Disposed (Destroyed)"]
```

---

# 18. Interfaces Explanation

### Why `IUserRepository` exists
The `UserController` depends on the *Interface* (`IUserRepository`), not the concrete class (`EFUserRepository`).
This is called **Loose Coupling**. If we wanted to switch from SQL Server to MongoDB tomorrow, we just create a `MongoUserRepository` that implements `IUserRepository`, and the Controller code never has to change!

---

# 19. Status Codes Used

*   **200 OK:** Request was successful (e.g., fetching a list of rooms).
*   **201 Created:** A new resource was successfully added to the DB (e.g., creating a new user).
*   **400 Bad Request:** The frontend sent invalid data, or a database constraint failed.
*   **401 Unauthorized:** The frontend forgot to send the JWT token, or the token expired.
*   **403 Forbidden:** The user is logged in, but they don't have the right Role (e.g., a Technician trying to delete a user).
*   **404 Not Found:** The requested ID does not exist in the database.

---

# 20. Configuration Files & Program.cs

### `Program.cs` (The Startup File)
Every ASP.NET Core microservice starts in `Program.cs`. It has two main jobs:
1.  **Service Registration (The Builder):** This is where we inject dependencies and configure settings *before* the app starts.
    ```csharp
    var builder = WebApplication.CreateBuilder(args);
    builder.Services.AddControllers(); // Enables API controllers
    builder.Services.AddDbContext<UserDbContext>(...); // Connects to SQL Server
    builder.Services.AddScoped<IUserRepository, EFUserRepository>(); // Registers DI
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)... // Configures JWT verification
    ```
2.  **Middleware Pipeline (The App):** This controls the exact order HTTP requests are processed.
    ```csharp
    var app = builder.Build();
    app.UseCors(); // 1. Allow React frontend to connect
    app.UseAuthentication(); // 2. Read the JWT token
    app.UseAuthorization();  // 3. Check role permissions
    app.MapControllers();    // 4. Send request to the Controller
    app.Run();               // Starts listening on the port
    ```

### `appsettings.json`
Contains environment variables like database connection strings and JWT secret keys. The `Program.cs` file reads this file on startup.

### `Ocelot.json`
Contains the Gateway routing maps. It defines the `UpstreamPathTemplate` (what the frontend requests) and maps it to the `DownstreamPathTemplate` (the actual microservice port).

---

# 21. Async/Await Explanation

### Why async?
In web applications, database queries take time (milliseconds). If a method is synchronous, the server's thread is "blocked" and cannot serve other users while waiting for the database.
By using `async/await` (`await _context.SaveChangesAsync()`), the server's thread is released to help other users while SQL Server processes the data. When SQL finishes, the thread resumes. This makes the backend highly scalable.

---

# 22. NuGet Packages Used

*   **`Microsoft.EntityFrameworkCore` & `Microsoft.EntityFrameworkCore.SqlServer`:** Used for EF Core and connecting to SQL Server.
*   **`Microsoft.EntityFrameworkCore.Tools`:** Allows using `Add-Migration` in the Package Manager Console.
*   **`Ocelot`:** The API Gateway library.
*   **`Microsoft.AspNetCore.Authentication.JwtBearer`:** Middleware that validates incoming JWT tokens.

---

# 23. API Endpoints Documentation

| Route | Method | Required Role | Description | Response Code |
| :--- | :--- | :--- | :--- | :--- |
| `/api/User` | GET | Authenticated | Gets all users | 200 OK |
| `/api/User` | POST | None (Anon) | Registers new user | 201 Created |
| `/api/User/{id}`| DELETE | **Admin** | Deletes a user | 200 OK, 404 Not Found |
| `/api/Auth/...` | GET | None | Gets JWT token | 200 OK |

---

# 24. Flowcharts & Diagrams

### Complete System Pipeline
```mermaid
graph TD
    UI[React Dashboard Client] -->|HTTP + Bearer Token| Ocelot[Ocelot Gateway :5065]
    
    subgraph Microservices Layer
        Ocelot -->|/authSvc| Auth[Authentication API :5228]
        Ocelot -->|/userSvc| US[User API :5025]
        Ocelot -->|/roomSvc| RS[Room API :5286]
        Ocelot -->|/temperatureSvc| TS[Temperature API :5155]
        Ocelot -->|/alertSvc| AS[Alert API :5179]
    end
    
    subgraph Database Layer
        US --> UDB[(PrjUserLogDB)]
        RS --> RDB[(PrjRoomsDB)]
        TS --> TDB[(PrjTemperatureDB)]
        AS --> ADB[(PrjAlertsLogDB)]
    end
    
    classDef ui fill:#00d8ff,stroke:#333,stroke-width:2px,color:#000;
    classDef gateway fill:#f96,stroke:#333,stroke-width:2px,color:#000;
    classDef ms fill:#85C1E9,stroke:#333,stroke-width:2px,color:#000;
    classDef db fill:#f1c40f,stroke:#333,stroke-width:2px,color:#000;
    
    class UI ui;
    class Ocelot gateway;
    class Auth,US,RS,TS,AS ms;
    class UDB,RDB,TDB,ADB db;
```

---

# 25. Step-by-Step Real Execution Example

**Scenario: Technician deletes a room.**

1.  **Frontend:** Technician clicks "Delete" on Room `R101`. React calls `DELETE http://localhost:5065/roomSvc/R101` with their JWT token.
2.  **Ocelot:** Gateway receives request, sees `/roomSvc/`, and forwards to Port `5286` (RoomViewerAPI).
3.  **Middleware:** ASP.NET on Port `5286` checks the JWT token, confirms the user is authenticated.
4.  **Controller:** `RoomController.Delete("R101")` is triggered.
5.  **Repository:** Calls `EFRoomRepository.DeleteAsync("R101")`.
6.  **Logic:** Repo queries EF Core `_context.Rooms.FindAsync("R101")`.
7.  **Database check:** If room exists, calls `_context.Rooms.Remove(room)`.
8.  **Database commit:** `await _context.SaveChangesAsync()` generates `DELETE FROM Rooms WHERE RoomId = 'R101'` in SQL.
9.  **Controller Return:** Returns `Ok("Room deleted")`.
10. **Frontend:** React receives 200 OK and removes the room card from the screen dynamically.

---

# 26. Important Learnings

*   **Microservices Isolate Failure:** If the Room database crashes, the Authentication and User systems stay perfectly online.
*   **Gateways Simplify Frontend:** Ocelot completely hides the complexity of the backend from the React team. They just talk to one URL.
*   **EF Core Speeds Development:** C# developers don't have to write manual SQL strings, reducing SQL Injection risks and speeding up coding.
*   **Stateless Security:** Using JWT means the backend doesn't need to store active sessions in server memory, making the system highly scalable to thousands of users.

---

# 27. Complete File-by-File Breakdown

To truly understand this microservices project, you must understand why every single file was created and what problem it solves.

### Gateway Project (`AlarmLogViewerApiGateway`)
*   **`Ocelot.json`**: Created to act as the traffic controller. **Problem Solved:** The React frontend would normally have to memorize 5 different ports (5025, 5286, etc.). This file maps all requests coming into port `5065` to their respective downstream microservices, simplifying frontend API calls.
*   **`Program.cs`**: Registers Ocelot into the .NET pipeline.

### Authentication Project (`AuthenticationWebApi`)
*   **`Controllers/AuthController.cs`**: Created strictly to generate JWT tokens. **Problem Solved:** Centralizes token generation into one highly secure, stateless API that doesn't need database access.

### Shared Contracts Project (`SharedContracts`)
*   **`DTOs/UserDto.cs`, `RoomDto.cs`, `AlertDto.cs`**: Created to define data structures transferred over the network. **Problem Solved:** Prevents over-posting attacks and stops the backend from exposing sensitive database columns (like passwords or internal IDs) to the public frontend.

### Frontend Project (`Frontend/src`)
*   **`components/AdminDashboard.jsx`, `SupervisorDashboard.jsx`, `TechnicianDashboard.jsx`**: Created to render role-specific user interfaces. **Problem Solved:** Ensures that an Admin sees a completely different layout (User Management) compared to a Technician (Room Management).
*   **`services/apiService.js`**: Created to handle all HTTP requests using the native `fetch` API. **Problem Solved:** Prevents developers from having to manually attach the `Authorization: Bearer <token>` header on every single request across the app. It automatically injects the token centrally.
*   **`App.jsx` & `main.jsx`**: Created to bootstrap the React application and manage frontend route navigation (e.g., `/login` vs `/dashboard`).

### The Microservice Class Libraries (e.g., `UserLibrary`, `RoomsLibrary`)
Each microservice has its own dedicated library containing the following exact pattern:
*   **`Models/User.cs`, `Room.cs`, `Alert.cs`**: Created to represent database tables as C# objects. **Problem Solved:** Allows Entity Framework to understand what columns need to be created in SQL.
*   **`Models/*DbContext.cs`**: Created to establish the SQL database connection (`UseSqlServer`). **Problem Solved:** Acts as the bridge between C# memory and the physical SQL Express database.
*   **`Migrations/..._InitialMigration.cs`**: Created by the EF Core CLI (`Add-Migration`). **Problem Solved:** Contains the exact C# instructions to build the SQL schema if the database is deleted or deployed to a new server.
*   **`Repos/IUserRepository.cs`, `IRoomRepository.cs`**: Created to define the contract (interface) for database operations. **Problem Solved:** Enables Loose Coupling and Dependency Injection.
*   **`Repos/EFUserRepository.cs`, `EFRoomRepository.cs`**: Created to implement the actual database queries (`_context.Users.Add()`). **Problem Solved:** Hides all Entity Framework syntax from the API Controllers, keeping the controllers clean.
*   **`Repos/*Exception.cs`**: Created to define custom error types. **Problem Solved:** Differentiates between a fatal SQL crash and a simple "User Not Found" error.

### The Microservice APIs (e.g., `UserViewerAPI`, `RoomViewerAPI`)
*   **`Controllers/*Controller.cs`**: Created to receive HTTP requests from Ocelot. **Problem Solved:** Reads incoming JSON, calls the Repository, and returns HTTP Status Codes (200 OK, 404 Not Found).
*   **`Program.cs`**: Created to configure the pipeline for that specific microservice. **Problem Solved:** Registers the DbContext, sets up JWT bearer validation, and injects the Repositories so the controllers can function.

---

# 28. Microservices Database Syncing & Stub Tables

### The Microservice Relationship Problem
In a Monolithic application with a single SQL database, you can create a **Foreign Key** between the `Users` table and the `Rooms` table to ensure that a Room cannot be created by a User that doesn't exist.

However, in this **Microservices Architecture**, the `Users` are stored in `PrjUserLogDB` and the `Rooms` are stored in `PrjRoomsDB`. 
**SQL Server physically cannot enforce Foreign Keys across two completely separate databases.** 

### The Solution: Stub/Dummy Tables
To solve this, we use a concept called **Stub Tables** (or Dummy Tables) to maintain referential integrity within each isolated microservice.

For example, look at the `UserLibrary`. Inside `UserLibrary/Models`, there is a `User.cs` file, but there is ALSO a `Room.cs` stub file.
```csharp
// UserLibrary/Models/Room.cs (Stub)
public class Room
{
    [Key]
    public string RoomId { get; set; }
    // No MinTemp, No MaxTemp! Just the ID to satisfy EF Core relationships.
}
```

### How Data Stays Synchronized
If a Room is just a stub in the User database, how does it get there? We use **Synchronous HTTP Communication** between microservices.

When a Technician creates a new Room, they send a POST request to the `RoomViewerAPI`:
1. The `RoomViewerAPI` saves the full, detailed Room to `PrjRoomsDB`.
2. Immediately after saving, the `RoomController` makes a hidden, backend-to-backend HTTP request using `HttpClient` to the other microservices (like User API or Alert API).
3. It sends *only the IDs* (`RoomId`, `UserId`) to those other APIs.
4. The other APIs receive this request and insert the ID into their "Stub/Dummy" tables.

### Why this solves the problem
By pushing these IDs to the stub tables, Entity Framework within the `UserLibrary` can successfully query a User and `Include()` their associated Room IDs without crashing, maintaining a localized version of the relationship tree without violating microservice boundary rules!

---

# 29. Frontend UI & Features

The React frontend is designed to be clean, professional, and intuitive.

### 1. Light Theme & Modern Design
The application features a clean, relaxing **Light Theme** (white surfaces, light gray backgrounds, and soft shadows). This modern design ensures the dashboard is comfortable for the eyes during extended use.

### 2. Real-Time Auto-Refresh
The dashboard automatically stays up to date without requiring manual page reloads:
- **Admin Dashboard:** Automatically checks for new users every 5 seconds.
- **Supervisor Dashboard:** Automatically pulls new alerts from the system every 5 seconds.
- **Technician Dashboard:** Automatically refreshes the moment a temperature is recorded, displaying the "File Reason" button instantly if a room's temperature goes out of bounds.

### 3. Smart Background Animations
The **Supervisor Dashboard** utilizes intuitive, pure CSS background animations to indicate room states visually:
- **When a room is Too Cold:** Faint clouds float and snowflakes fall gently in the background.
- **When a room is Too Hot:** A soft pulsing sun and a desert scene appear in the background.
These animations are highly transparent so they never distract from the critical text and data.

### 4. Native Fetch API
The project uses the browser's native `fetch` API for all network requests. This zero-dependency approach makes the frontend fast, secure, and lightweight.
