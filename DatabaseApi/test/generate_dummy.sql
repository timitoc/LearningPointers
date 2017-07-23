INSERT INTO users (password, email, name) VALUES ('nu', 'imi', 'pasa');
INSERT INTO users (password, email, name) VALUES ('si', 'totusi', 'nu');
INSERT INTO users (password, email, name) VALUES ('desi', 'poate', 'ar trebui');

LOCK TABLES `courses` WRITE;
INSERT INTO `courses` VALUES (1,'lorem',3.5),(2,'ipsum',2);
UNLOCK TABLES;

LOCK TABLES `modules` WRITE;
INSERT INTO `modules` VALUES (1,'lore1','#LO1',1,3),(2,'lore2','#LO2',1,4),(3,'ipsum1','#IPSSSSSS1',2,2);
UNLOCK TABLES;

INSERT INTO user_courses (user_id, course_id) VALUES (1, 1);
INSERT INTO user_courses (user_id, course_id) VALUES (1, 2);