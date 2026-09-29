USE `amsterdam`;

ALTER TABLE `products`
  ADD COLUMN `original_price` decimal(10,2) DEFAULT NULL AFTER `price`,
  ADD COLUMN `capacity` varchar(50) DEFAULT NULL AFTER `weight`,
  ADD COLUMN `material` varchar(100) DEFAULT NULL AFTER `capacity`,
  ADD COLUMN `color` varchar(100) DEFAULT NULL AFTER `material`;

START TRANSACTION;

UPDATE `products`
SET `is_active` = 0
WHERE `sku` IS NULL
  AND ((`id` = 1 AND `name` = 'Amsterdam Active 500ml')
    OR (`id` = 2 AND `name` = 'Amsterdam Custom Name'));

INSERT INTO `categories` (`name`, `description`)
SELECT 'Classic', 'Koleksi Classic Amsterdam Store.'
WHERE NOT EXISTS (SELECT 1 FROM `categories` WHERE `name` = 'Classic');
INSERT INTO `categories` (`name`, `description`)
SELECT 'Premium', 'Koleksi Premium Amsterdam Store.'
WHERE NOT EXISTS (SELECT 1 FROM `categories` WHERE `name` = 'Premium');
INSERT INTO `categories` (`name`, `description`)
SELECT 'Elite', 'Koleksi Elite Amsterdam Store.'
WHERE NOT EXISTS (SELECT 1 FROM `categories` WHERE `name` = 'Elite');
INSERT INTO `categories` (`name`, `description`)
SELECT 'Sport', 'Koleksi Sport Amsterdam Store.'
WHERE NOT EXISTS (SELECT 1 FROM `categories` WHERE `name` = 'Sport');

INSERT INTO `products` (`sku`, `category_id`, `name`, `description`, `price`, `original_price`, `cogs`, `stock`, `weight`, `capacity`, `material`, `color`)
SELECT 'AMS-CLX-500-NVY', c.id, 'Amsterdam Classic 500ml', 'Tumbler stainless steel premium dengan lapisan vacuum insulation double-wall untuk menjaga minuman tetap segar.', 95000, 150000, 55000, 45, 500, '500ml', 'Stainless Steel 18/8', 'Navy Blue'
FROM `categories` c WHERE c.name = 'Classic' AND NOT EXISTS (SELECT 1 FROM `products` WHERE `sku` = 'AMS-CLX-500-NVY') LIMIT 1;

INSERT INTO `products` (`sku`, `category_id`, `name`, `description`, `price`, `original_price`, `cogs`, `stock`, `weight`, `capacity`, `material`, `color`)
SELECT 'AMS-PRM-750-GRN', c.id, 'Amsterdam Premium 750ml', 'Kapasitas besar dengan teknologi insulasi terbaik untuk menemani petualanganmu seharian penuh.', 165000, NULL, 95000, 32, 750, '750ml', 'Stainless Steel 18/8', 'Forest Green'
FROM `categories` c WHERE c.name = 'Premium' AND NOT EXISTS (SELECT 1 FROM `products` WHERE `sku` = 'AMS-PRM-750-GRN') LIMIT 1;

INSERT INTO `products` (`sku`, `category_id`, `name`, `description`, `price`, `original_price`, `cogs`, `stock`, `weight`, `capacity`, `material`, `color`)
SELECT 'AMS-ELT-900-BLK', c.id, 'Amsterdam Elite 900ml', 'Untuk para petualang sejati. Kapasitas 1 liter dengan ketahanan ekstra dan desain ergonomis.', 175000, NULL, 100000, 18, 900, '900ml', 'Stainless Steel 18/8', 'Matte Black'
FROM `categories` c WHERE c.name = 'Elite' AND NOT EXISTS (SELECT 1 FROM `products` WHERE `sku` = 'AMS-ELT-900-BLK') LIMIT 1;

INSERT INTO `products` (`sku`, `category_id`, `name`, `description`, `price`, `original_price`, `cogs`, `stock`, `weight`, `capacity`, `material`, `color`)
SELECT 'AMS-SLM-710-RGD', c.id, 'Amsterdam Slim 710ml', 'Desain ramping yang muat di cup holder mobil. Pilihan sempurna untuk commuter dan traveler.', 224000, 185000, 125000, 56, 710, '710ml', 'Stainless Steel 18/8', 'Rose Gold'
FROM `categories` c WHERE c.name = 'Classic' AND NOT EXISTS (SELECT 1 FROM `products` WHERE `sku` = 'AMS-SLM-710-RGD') LIMIT 1;

INSERT INTO `products` (`sku`, `category_id`, `name`, `description`, `price`, `original_price`, `cogs`, `stock`, `weight`, `capacity`, `material`, `color`)
SELECT 'AMS-SPT-600-RED', c.id, 'Amsterdam Sport 600ml', 'Dirancang khusus untuk aktivitas olahraga dengan tutup flip-top yang mudah dibuka satu tangan.', 150000, NULL, 85000, 40, 600, '600ml', 'Stainless Steel 18/8', 'Coral Red'
FROM `categories` c WHERE c.name = 'Sport' AND NOT EXISTS (SELECT 1 FROM `products` WHERE `sku` = 'AMS-SPT-600-RED') LIMIT 1;

COMMIT;