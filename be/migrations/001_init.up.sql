-- create users, jobs, applications
CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  username text UNIQUE NOT NULL,
  role text,
  password text
);

CREATE TABLE IF NOT EXISTS jobs (
  id serial PRIMARY KEY,
  title text UNIQUE NOT NULL,
  department text,
  location text,
  description text,
  status text,
  created_at timestamptz DEFAULT now(),
  closing_date timestamptz
);

CREATE TABLE IF NOT EXISTS applications (
  id serial PRIMARY KEY,
  user_id int REFERENCES users(id) ON DELETE CASCADE,
  job_id int REFERENCES jobs(id) ON DELETE CASCADE,
  status text,
  created_at timestamptz DEFAULT now(),
  data jsonb
);
