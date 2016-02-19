echo "Please enter a Redis password: "
read REDISPASSWORD

apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
echo "deb http://repo.mongodb.org/apt/ubuntu precise/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
sudo apt-get -y update
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