DROP DATABASE IF EXISTS learning_pointers;
CREATE DATABASE learning_pointers CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE learning_pointers;

CREATE TABLE `users` (
	`id` INT(8) NOT NULL AUTO_INCREMENT UNIQUE,
	`password` varchar(100) NOT NULL,
	`email` varchar(50) NOT NULL UNIQUE,
	`name` varchar(50) NOT NULL,
	`bio` TEXT,
	`avatar` varchar(20) NOT NULL DEFAULT 'default.svg',
	PRIMARY KEY (`id`)
);

CREATE TABLE `modules` (
	`id` INT(8) NOT NULL AUTO_INCREMENT UNIQUE,
	`title` varchar(50) NOT NULL,
	`text_md` TEXT(8000) NOT NULL,
	`parent_course_id` INT(8) NOT NULL,
	`avg_rating` FLOAT NOT NULL DEFAULT '0',
	PRIMARY KEY (`id`)
);

CREATE TABLE `favorites` (
	`user_id` INT(8) NOT NULL,
	`module_id` INT(8) NOT NULL
);

CREATE TABLE `courses` (
	`id` INT(8) NOT NULL AUTO_INCREMENT UNIQUE,
	`name` varchar(50) NOT NULL,
	`avg_rating` FLOAT NOT NULL DEFAULT '0',
	`description` TEXT(8000) NOT NULL,
	`difficulty` varchar(20) NOT NULL,
	`url` varchar(50) NOT NULL UNIQUE,
	PRIMARY KEY (`id`)
);

CREATE TABLE `user_courses` (
	`user_id` INT(8) NOT NULL,
	`course_id` INT(8) NOT NULL
);

CREATE TABLE `ratings` (
	`user_id` INT(8) NOT NULL,
	`module_id` INT(8) NOT NULL,
	`rating` INT(8) NOT NULL
);

CREATE TABLE `comments` (
	`id` INT(8) NOT NULL AUTO_INCREMENT UNIQUE,
	`user_id` INT(8) NOT NULL,
	`module_id` INT(8) NOT NULL,
	`comment_text` TEXT(500) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `finished` (
	`user_id` INT(8) NOT NULL,
	`module_id` INT(8) NOT NULL
);

CREATE TABLE `authors` (
	`user_id` INT(8) NOT NULL,
	`course_id` INT(8) NOT NULL
);

CREATE TABLE `code_sharing` (
	`id` INT(8) NOT NULL AUTO_INCREMENT UNIQUE,
	`code` TEXT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `breakpoints` (
	`id` INT(8) NOT NULL AUTO_INCREMENT UNIQUE,
	`parent_id` INT(8) NOT NULL,
	`line` INT(8) NOT NULL,
	`temporary` INT(8) NOT NULL,
	`condition` varchar(100) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `watches` (
	`id` INT(8) NOT NULL AUTO_INCREMENT UNIQUE,
	`parent_id` INT(8) NOT NULL,
	`expr` varchar(100) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `md_images` (
	`id` INT(8) NOT NULL AUTO_INCREMENT UNIQUE,
	`uri` varchar(30) NOT NULL DEFAULT 'default.svg',
	PRIMARY KEY (`id`)
);

CREATE TABLE `exercises` (
	`id` INT(8) NOT NULL AUTO_INCREMENT UNIQUE,
	`course_parent` INT(8) NOT NULL,
	`question` varchar(200) NOT NULL,
	`correct_answer` INT(8),
	PRIMARY KEY (`id`)
);

CREATE TABLE `answers` (
	`id` INT(8) NOT NULL AUTO_INCREMENT UNIQUE,
	`exercise_parent` INT(8) NOT NULL,
	`answer_text` varchar(100) NOT NULL,
	PRIMARY KEY (`id`)
);

ALTER TABLE `modules` ADD CONSTRAINT `modules_fk0` FOREIGN KEY (`parent_course_id`) REFERENCES `courses`(`id`);

ALTER TABLE `favorites` ADD CONSTRAINT `favorites_fk0` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);

ALTER TABLE `favorites` ADD CONSTRAINT `favorites_fk1` FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`);

ALTER TABLE `user_courses` ADD CONSTRAINT `user_courses_fk0` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);

ALTER TABLE `user_courses` ADD CONSTRAINT `user_courses_fk1` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`);

ALTER TABLE `ratings` ADD CONSTRAINT `ratings_fk0` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);

ALTER TABLE `ratings` ADD CONSTRAINT `ratings_fk1` FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`);

ALTER TABLE `comments` ADD CONSTRAINT `comments_fk0` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);

ALTER TABLE `comments` ADD CONSTRAINT `comments_fk1` FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`);

ALTER TABLE `finished` ADD CONSTRAINT `finished_fk0` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);

ALTER TABLE `finished` ADD CONSTRAINT `finished_fk1` FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`);

ALTER TABLE `authors` ADD CONSTRAINT `authors_fk0` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);

ALTER TABLE `authors` ADD CONSTRAINT `authors_fk1` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`);

ALTER TABLE `breakpoints` ADD CONSTRAINT `breakpoints_fk0` FOREIGN KEY (`parent_id`) REFERENCES `code_sharing`(`id`);

ALTER TABLE `watches` ADD CONSTRAINT `watches_fk0` FOREIGN KEY (`parent_id`) REFERENCES `code_sharing`(`id`);

ALTER TABLE `exercises` ADD CONSTRAINT `exercises_fk0` FOREIGN KEY (`course_parent`) REFERENCES `courses`(`id`);

ALTER TABLE `exercises` ADD CONSTRAINT `exercises_fk1` FOREIGN KEY (`correct_answer`) REFERENCES `answers`(`id`);

ALTER TABLE `answers` ADD CONSTRAINT `answers_fk0` FOREIGN KEY (`exercise_parent`) REFERENCES `exercises`(`id`);


ALTER TABLE `ratings` ADD PRIMARY KEY (`user_id`, `module_id`);
