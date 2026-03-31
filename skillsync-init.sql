CREATE DATABASE IF NOT EXISTS skillsync_auth;
CREATE DATABASE IF NOT EXISTS skillsync_users;
CREATE DATABASE IF NOT EXISTS skillsync_mentors;
CREATE DATABASE IF NOT EXISTS skillsync_skills;
CREATE DATABASE IF NOT EXISTS skillsync_sessions;
CREATE DATABASE IF NOT EXISTS skillsync_groups;
CREATE DATABASE IF NOT EXISTS skillsync_reviews;
CREATE DATABASE IF NOT EXISTS skillsync_notifications;

-- Grant root access from any host to allow microservices in the Docker network to connect
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
