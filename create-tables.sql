CREATE TABLE author (
	id SERIAL PRIMARY KEY,
	api_id VARCHAR(50) UNIQUE NOT NULL,
	photo_id INTEGER,
	name TEXT UNIQUE NOT NULL,
	bio TEXT,
	rating INTEGER CONSTRAINT valid_rating CHECK (rating > 0 AND rating <= 10)
);

CREATE TABLE book (
	id SERIAL PRIMARY KEY,
	api_id VARCHAR(50) UNIQUE NOT NULL,
	cover_id INTEGER,
	title TEXT UNIQUE NOT NULL,
	description TEXT,
	date_read TIMESTAMP,
	notes TEXT,
	rating INTEGER CONSTRAINT valid_rating CHECK (rating > 0 AND rating <= 10),
	author_id INTEGER REFERENCES author(id)
);

