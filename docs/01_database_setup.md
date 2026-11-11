# Padh.ai Database Setup

This document provides instructions on how to set up and initialize the PostgreSQL database for the Padh.ai application.

## Prerequisites

- Docker and Docker Compose must be installed on your system.

## 1. Starting the Database Service

The project uses Docker to run a PostgreSQL database in a container. The configuration is defined in the `docker-compose.yaml` file.

To start the database service, run the following command from the project root directory:

```bash
docker-compose up -d postgres
```

This command will:
- Pull the official `postgres:13` image if you don't have it.
- Create a container named `postgres`.
- Set up the database with the credentials specified in `docker-compose.yaml` (e.g., user `admin`, database `padhaidb`).
- Mount the `./database/init.sql` script to perform initial setup.
- Persist data in a Docker volume named `postgres_data` to ensure data is not lost when the container is stopped or restarted.

## 2. Applying the Database Schema

After the database container is running, you need to apply the application's schema. The full schema is defined in `database/schemas/schema.sql`.

You can connect to the database and apply the schema using a `psql` command.

1.  **Connect to the running PostgreSQL container:**

    ```bash
    docker-compose exec -T postgres psql -U admin -d padhaidb
    ```

    - `exec -T`: Executes a command in the `postgres` service container without allocating a pseudo-TTY, which is useful for piping.
    - `-U admin`: Connects as the `admin` user.
    - `-d padhaidb`: Connects to the `padhaidb` database.

2.  **Apply the schema:**

    Pipe the schema file into the `psql` command:

    ```bash
    cat ./database/schemas/schema.sql | docker-compose exec -T postgres psql -U admin -d padhaidb
    ```

    This command reads the content of `schema.sql` and executes it against the `padhaidb` database.

## 3. Verifying the Setup

You can verify that the tables were created correctly by listing them.

1.  **Connect to the database:**
    ```bash
    docker-compose exec -it postgres psql -U admin -d padhaidb
    ```

2.  **List tables:**
    Once inside the `psql` shell, use the `\dt` command:
    ```sql
    \dt
    ```

    You should see a list of tables, including `users`, `courses`, `modules`, `lessons`, etc.

Your database is now set up and ready for the backend services to connect to it.
