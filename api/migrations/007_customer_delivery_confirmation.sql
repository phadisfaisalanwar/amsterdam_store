USE `amsterdam`;

ALTER TABLE `shipments`
  ADD COLUMN `customer_confirmed_at` timestamp NULL DEFAULT NULL AFTER `shipped_at`;