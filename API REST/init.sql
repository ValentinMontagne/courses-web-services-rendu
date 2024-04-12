CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  about VARCHAR(500),
  price FLOAT
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100),
  password VARCHAR(500),
  email VARCHAR(500)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  userId SERIAL,
  productId SERIAL,
  total FLOAT
  payment BOOLEAN
  createdAt DATE
  updatedAt DATE
);
