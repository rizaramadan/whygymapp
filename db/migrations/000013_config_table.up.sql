-- create table to store config of many things. Add a column for each type, string, integer, datetime, boolean, jsonb
CREATE TABLE whygym.config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL,
    value_string VARCHAR(255),
    value_integer INTEGER,
    value_datetime timestamp with time zone,
    value_boolean BOOLEAN,
    value_jsonb JSONB
);

-- add a unique constraint on the key column
ALTER TABLE whygym.config ADD CONSTRAINT unique_key UNIQUE (key);
