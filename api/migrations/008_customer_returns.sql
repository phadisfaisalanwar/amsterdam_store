USE `amsterdam`;

ALTER TABLE `returns`
  ADD COLUMN `user_id` int(11) DEFAULT NULL AFTER `order_id`,
  ADD COLUMN `request_type` enum('refund','exchange') NOT NULL DEFAULT 'refund' AFTER `user_id`,
  ADD COLUMN `product_id` int(11) DEFAULT NULL AFTER `request_type`,
  ADD COLUMN `quantity` int(11) NOT NULL DEFAULT 1 AFTER `product_id`,
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);
