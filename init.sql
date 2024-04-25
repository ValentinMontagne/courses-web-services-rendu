CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    about VARCHAR(500),
    price FLOAT
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100),
    email VARCHAR(255),
    password VARCHAR(255)
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    total INTEGER,
    payement boolean,
    createdAt DATE,
    updatedAt DATE,
    userid INTEGER
);

INSERT INTO products (name, about, price) VALUES
    ('My first game', 'This is an awesome game', 60.00);

INSERT INTO users (username, email) VALUES
    ('abou', 'abou@here');

INSERT INTO orders (total, payement, userid) VALUES
    (60, true, 1);