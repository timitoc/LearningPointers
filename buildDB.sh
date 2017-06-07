#!/bin/bash
# Inspired from https://stackoverflow.com/questions/33470753/create-mysql-database-and-user-in-bash-script

USER='lp_user';
PASSWD='abc';
MAINDB='LP';

# If /root/.my.cnf exists then it won't ask for root password
if [ -f /root/.my.cnf ]; then
	mysql -e "DROP DATABASE IF EXISTS ${MAINDB};"
    mysql -e "CREATE DATABASE ${MAINDB} /*\!40100 DEFAULT CHARACTER SET utf8 */;"
	mysql -e "FLUSH PRIVILEGES;"
	mysql -e "DROP USER IF EXISTS ${USER}@localhost;"
    mysql -e "CREATE USER ${USER}@localhost IDENTIFIED BY '${PASSWD}';"
    mysql -e "GRANT ALL PRIVILEGES ON ${MAINDB}.* TO '${USER}'@'localhost';"
    mysql -e "FLUSH PRIVILEGES;"
    mysql -e "CREATE TABLE LP.code_share (id INT(9) AUTO_INCREMENT PRIMARY KEY, source_code VARCHAR(9000))"


# If /root/.my.cnf doesn't exist then it'll ask for root password
else
    echo "Please enter root user MySQL password!"
    read rootpasswd
	mysql -uroot -p${rootpasswd} -e "DROP DATABASE IF EXISTS ${MAINDB};"
    mysql -uroot -p${rootpasswd} -e "CREATE DATABASE ${MAINDB} /*\!40100 DEFAULT CHARACTER SET utf8 */;"
	mysql -uroot -p${rootpasswd} -e "FLUSH PRIVILEGES;"
	mysql -uroot -p${rootpasswd} -e "DROP USER IF EXISTS ${USER}@localhost;"
    mysql -uroot -p${rootpasswd} -e "CREATE USER ${USER}@localhost IDENTIFIED BY '${PASSWD}';"
    mysql -uroot -p${rootpasswd} -e "GRANT ALL PRIVILEGES ON ${MAINDB}.* TO '${USER}'@'localhost';"
    mysql -uroot -p${rootpasswd} -e "FLUSH PRIVILEGES;"
    mysql -uroot -p${rootpasswd} -e "CREATE TABLE LP.code_share (id INT(9) AUTO_INCREMENT PRIMARY KEY, source_code VARCHAR(9000))"
fi

