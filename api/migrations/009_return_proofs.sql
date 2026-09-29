USE `amsterdam`;

ALTER TABLE `returns`
  ADD COLUMN `proof_mime` varchar(30) DEFAULT NULL AFTER `reason`,
  ADD COLUMN `proof_data` mediumblob DEFAULT NULL AFTER `proof_mime`;
