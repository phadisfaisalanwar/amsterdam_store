USE `amsterdam`;

CREATE TABLE IF NOT EXISTS `password_reset_codes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `channel` enum('email','phone') NOT NULL,
  `code_hash` varchar(255) NOT NULL,
  `ip_hash` char(64) NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `consumed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reset_user_channel_created` (`user_id`,`channel`,`created_at`),
  KEY `reset_ip_created` (`ip_hash`,`created_at`),
  CONSTRAINT `password_reset_codes_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;