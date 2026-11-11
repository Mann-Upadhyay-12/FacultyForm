-- Insert an admin user
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES ('admin@example.com', 'hashed_password', 'Admin', 'User', 'admin');
