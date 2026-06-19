# College Resource Sharing Portal

A full-stack portal for students to upload and share college study materials, with admin approval workflow. Built with **Java Servlets** (backend) and **React + Vite** (frontend).

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Backend | Java 17, Servlets, JDBC, JWT, BCrypt, Jackson |
| Frontend | React 19, Vite, React Router, TanStack Query, Tailwind CSS, Axios |
| Database | MySQL 8 |
| Server | Apache Tomcat 9 |

## Project Structure

```
CollageResourcePortal/
├── src/main/java/          # Backend source (servlets, DAOs, models, utils)
├── src/main/webapp/        # Web app root (WEB-INF, JSP pages)
├── frontend/               # React frontend (Vite)
├── schema.sql              # MySQL database schema
└── pom.xml                 # Maven dependencies
```

## Prerequisites

Install these before running the project:

- **Java JDK 17+**
- **Apache Maven** (or use the Maven bundled with IntelliJ IDEA)
- **Node.js 18+** and **npm**
- **MySQL Server 8.0+**
- **Apache Tomcat 9+**
- **IntelliJ IDEA** (recommended for Tomcat deployment via Smart Tomcat plugin)

## How to Run

You need **three things running**: MySQL, the backend (Tomcat), and the frontend (Vite).

### Step 1 — Configure the database

1. Start the MySQL service.
2. Open `src/main/java/util/DBUtil.java` and set your MySQL credentials:

   | Setting | Default |
   |---------|---------|
   | Database | `collage_resources` |
   | User | `root` |
   | Password | `12345` |

3. Create the database and tables by running `schema.sql`:

   **Windows (Command Prompt):**
   ```cmd
   mysql -u root -p < schema.sql
   ```

   **Windows (PowerShell):**
   ```powershell
   cmd /c "mysql -u root -p < schema.sql"
   ```

   **MySQL Workbench:** open `schema.sql` and execute the script.

   > **Important:** The database name in `schema.sql` must match the name in `DBUtil.java`. If they differ, update one of them before running.

### Step 2 — Start the backend (Tomcat)

#### Option A — IntelliJ IDEA (recommended)

1. Open the project in IntelliJ IDEA.
2. Install the **Smart Tomcat** plugin if you do not already have it.
3. Create a **Smart Tomcat** run configuration:

   | Setting | Value |
   |---------|-------|
   | Tomcat Server | Apache Tomcat 9+ |
   | Deployment Directory | `src/main/webapp` |
   | Context Path | `/CollegeResourcePortal` |
   | Port | `8080` |

4. Build the project so compiled classes are available:

   ```bash
   mvn compile
   ```

5. Run the Tomcat configuration.

#### Option B — Command line

1. Compile the backend:

   ```bash
   mvn compile
   ```

2. Start Tomcat using your Smart Tomcat `CATALINA_BASE` (created when you first run via IntelliJ), or deploy `src/main/webapp` with `target/classes` and the Maven dependencies from `~/.m2/repository`.

   **Windows example:**
   ```cmd
   set CATALINA_HOME=C:\Program Files\Apache Software Foundation\Tomcat 9.0
   set CATALINA_BASE=C:\Users\<you>\.SmartTomcat\CollageResourcePortal\CollegeResourcePortal
   "%CATALINA_HOME%\bin\catalina.bat" run
   ```

   Ensure the Tomcat context points to this project's `src/main/webapp` and `target/classes`.

3. Verify the backend is up:

   ```
   http://localhost:8080/CollegeResourcePortal/api/resources
   ```

   A JSON response (or an auth-related response) means the server started correctly.

### Step 3 — Start the frontend

Open a terminal in the `frontend` folder:

```bash
cd frontend
npm install
npm run dev
```

Open the app in your browser:

```
http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://127.0.0.1:8080/CollegeResourcePortal` (see `frontend/vite.config.js`).

## Default URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API base | http://localhost:8080/CollegeResourcePortal/api |
| Tomcat context path | `/CollegeResourcePortal` |

## User Roles

| Role | Capabilities |
|------|--------------|
| **STUDENT** | Register, browse resources, upload files, view own uploads |
| **ADMIN** | Approve or reject pending uploads |

Register a new account from the UI, or insert users directly in MySQL. Passwords are stored as BCrypt hashes.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| GET | `/api/resources` | List approved resources |
| POST | `/api/resources/upload` | Upload a resource (student) |
| GET | `/api/resources/download` | Download a resource |
| POST | `/api/resources/rate` | Rate a resource |
| GET | `/api/admin/pending` | List pending uploads (admin) |
| POST | `/api/admin/approve/{id}` | Approve a resource (admin) |
| POST | `/api/admin/reject/{id}` | Reject a resource (admin) |

Protected routes require a JWT token in the `Authorization` header.

## Features

- **Resource upload** with file storage under `uploads/` on the server
- **Admin approval workflow** — uploads start as `PENDING`
- **Download tracking** and **ratings**
- **Live UI updates** via TanStack Query
- **Toast notifications** and upload progress feedback

## Troubleshooting

| Problem | Fix |
|---------|-----|
| **404 on API calls** | Tomcat context path must be `/CollegeResourcePortal` to match `frontend/vite.config.js`. |
| **CORS errors** | Check `src/main/java/filter/JWTFilter.java` for CORS headers. |
| **Database connection failed** | Confirm MySQL is running, credentials in `DBUtil.java` are correct, and the database name matches `schema.sql`. |
| **`mvn` not found** | Add Maven to your PATH, or use IntelliJ's bundled Maven at `plugins/maven/lib/maven3/bin/mvn.cmd`. |
| **Vite / Rollup error on Windows** | Delete `frontend/node_modules` and `frontend/package-lock.json`, then run `npm install` again. |
| **Frontend cannot reach backend** | Make sure Tomcat is running on port `8080` before starting `npm run dev`. |

## Build for Production

```bash
# Backend — compile Java classes
mvn compile

# Frontend — create static build
cd frontend
npm run build
```

Deploy `src/main/webapp` (with compiled classes and dependencies) to Tomcat, and serve the frontend `dist/` folder with a static file server or reverse proxy.
