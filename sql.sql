CREATE SCHEMA IF NOT EXISTS discord;

USE discord;


CREATE TABLE IF NOT EXISTS `allowed_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `allowed_users`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(20) NOT NULL,
  `username` varchar(255) NOT NULL,
  `timestamp` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `users`;
INSERT INTO `users` (`id`, `username`, `timestamp`) VALUES
	('533315728640573440', 'jekabso21', '2024-06-01 19:36:01');

CREATE TABLE IF NOT EXISTS `users_bakp` (
  `id` varchar(20) NOT NULL,
  `username` varchar(255) NOT NULL,
  `timestamp` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE FROM `users_bakp`;
INSERT INTO `users_bakp` (`id`, `username`, `timestamp`) VALUES
	('533315728640573440', 'jekabso21', '2024-06-01 19:36:01');

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    personalCode VARCHAR(255) UNIQUE NOT NULL,
    groupName VARCHAR(255) NOT NULL,
    roleId VARCHAR(255) NOT NULL,
    hasSignedIn BOOLEAN DEFAULT FALSE
);

