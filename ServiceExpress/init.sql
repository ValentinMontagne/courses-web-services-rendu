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
                          email VARCHAR(100)
);

CREATE TABLE orders (
                        id SERIAL PRIMARY KEY,
                        userid INTEGER NOT NULL,
                        total FLOAT,
                        payement BOOLEAN,
                        created TIMESTAMP,
                        updated TIMESTAMP,
                        FOREIGN KEY (userid) REFERENCES users(id)
);
