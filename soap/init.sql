CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  about VARCHAR(500),
  price FLOAT
);

-- Ajouter le premier produit
INSERT INTO products (name, about, price) VALUES
  ('My first game', 'This is an awesome game', 60.00),
  ('Product 1', 'About product 1', 19.99);
