USE `amsterdam`;

ALTER TABLE `order_items`
  ADD COLUMN `selected_color` varchar(40) DEFAULT NULL AFTER `price`;