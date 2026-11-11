-- Create a new database
CREATE DATABASE padhai;

-- Create a new user
CREATE USER padhai_user WITH ENCRYPTED PASSWORD 'password';

-- Grant all privileges on the new database to the new user
GRANT ALL PRIVILEGES ON DATABASE padhai TO padhai_user;
