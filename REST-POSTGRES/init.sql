CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  about VARCHAR(500),
  price FLOAT
);

INSERT INTO products (name, about, price) VALUES
  ('My first game', 'This is an awesome game', '60');

CREATE TABLE users (
  name VARCHAR(50) PRIMARY KEY,
  email VARCHAR(100),
  mdp VARCHAR(500)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50),
  productId INT,
  total FLOAT,
  payment BOOLEAN,
  createdAt DATE,
  updatedAt DATE
)