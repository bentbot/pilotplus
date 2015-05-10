apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
echo "deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen" |$
apt-get -y update
apt-get -y install mongodb-10gen
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

