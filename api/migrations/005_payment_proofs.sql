USE `amsterdam`;

ALTER TABLE `payments`
  ADD COLUMN `proof_mime` varchar(30) DEFAULT NULL AFTER `status`,
  ADD COLUMN `proof_data` mediumblob DEFAULT NULL AFTER `proof_mime`;