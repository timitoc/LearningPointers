#!/bin/bash

password=$1
db_name=$2
sql_generate=$3

mysql -uroot -p"$password" <<EOF
	DROP DATABASE IF EXISTS $db_name;
	CREATE DATABASE $db_name CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
	USE $db_name;
	source $sql_generate;
EOF
