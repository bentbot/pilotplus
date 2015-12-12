$REDISPASSWORD = redispassword

apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
echo "deb http://repo.mongodb.org/apt/ubuntu precise/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
apt-get -y update
sudo apt-get install -y mongodb-org
mkdir /data
mkdir /data/db

wget http://download.redis.io/releases/redis-3.0.0.tar.gz
tar xzf redis-3.0.0.tar.gz
cd redis-3.0.0
make
mkdir /etc/redis
mkdir /var/redis
mkdir /var/redis/6379
cp ./src/redis-server /usr/local/bin
cp ./src/redis-cli /usr/local/bin
cp ./utils/redis_init_script /etc/init.d/redis_6375
cp ./redis.conf /etc/redis/6379.conf
echo "daemonize yes" >> /etc/redis/6379.conf
echo "dir /var/redis/6379" >> /etc/redis/6379.conf
echo "requirepass $REDISPASSWORD" >> /etc/redis/6379.conf

apt-get install dovecot-core dovecot-imapd dovecot-pop3d
echo "protocols = pop3 pop3s imap imaps" >> /etc/dovecot/dovecot.conf
echo "pop3_uidl_format = %08Xu%08Xv" >> /etc/dovecot/dovecot.conf
echo "mail_location = maildir:~/Maildir" >> /etc/dovecot/dovecot.conf
maildirmake.dovecot /etc/skel/Maildir
maildirmake.dovecot /etc/skel/Maildir/.Drafts
maildirmake.dovecot /etc/skel/Maildir/.Sent
maildirmake.dovecot /etc/skel/Maildir/.Trash
maildirmake.dovecot /etc/skel/Maildir/.Tempaltes
cp -r /etc/skel/Maildir /home/$USER/
chown -R $USER /home/$USER/Maildir
chmod +R 700 /home/$USER/Maildir
/etc/init.d/dovecot start

apt-get install postfix
echo "home_mailbox = Maildir/" >> /etc/postfix/main.cf
