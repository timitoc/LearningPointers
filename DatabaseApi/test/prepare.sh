#!/bin/bash

password=$1
db_name=$2
sql_generate=$3

mysql -uroot -p"$password" <<EOF
	DROP DATABASE IF EXISTS $db_name;
	CREATE DATABASE $db_name;
	USE $db_name;
	source $sql_generate;
EOF
