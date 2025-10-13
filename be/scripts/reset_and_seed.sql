-- reset database and seed minimal data
BEGIN;
TRUNCATE TABLE applications RESTART IDENTITY CASCADE;
TRUNCATE TABLE jobs RESTART IDENTITY CASCADE;
TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- insert users (passwords must be bcrypt-hashed by application or use test passwords)
INSERT INTO users (username, role, password) VALUES
('alice','candidate','password'),
('bob','hr','password'),
('carol','hm','password');

INSERT INTO jobs (title, department, location, description, status) VALUES
('Frontend Developer','Engineering','Bangkok','Build UIs using React','active'),
('Backend Engineer','Engineering','Bangkok','Design and implement REST APIs','active');

INSERT INTO applications (user_id, job_id, status, data) VALUES
((SELECT id FROM users WHERE username='alice'), (SELECT id FROM jobs WHERE title='Frontend Developer'), 'submitted', '{"resume":"/files/alice_cv.pdf"}'),
((SELECT id FROM users WHERE username='bob'), (SELECT id FROM jobs WHERE title='Backend Engineer'), 'screened', '{"note":"passed"}');

COMMIT;
