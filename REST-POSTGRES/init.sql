CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  about VARCHAR(500),
  price FLOAT
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255)
);


-- Ajouter le premier produit
INSERT INTO products (name, about, price) VALUES
  ('My first game', 'This is an awesome game', 60.00);

  INSERT INTO users (username, email, password) VALUES
  ('john_doe', 'john@example.com', 'password123'),
  ('jane_doe', 'jane@example.com', 'password456');



