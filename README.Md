# Bitcoin Binary Options

## Setup

### 1. Install Redis and MongoDB for user management
```
Create a batch script to install MongoDB

$ sudo nano mongo.sh

apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
echo "deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen" | tee -a /etc/apt/sources.list.d/10gen.list
apt-get -y update
apt-get -y install mongodb-10gen

$ sudo chmod +x ./mongo.sh
$ sudo bash ./mongo.sh

Install Redis and configure the daemon

$ sudo nano redis.sh

wget http://download.redis.io/releases/redis-3.0.0.tar.gz
tar xzf redis-3.0.0.tar.gz
cd redis-3.0.0
make

mkdir /etc/redis
mkdir /var/redis
mkdir /var/redis/6379
cp ./redis-3.0.0/utils/redis_init_script /etc/init.d/redis_6375
cp ./redis-3.0.0/redis.conf /etc/redis/6379.conf

$ sudo chmod +x ./redis.sh
$ sudo bash ./redis.sh

$ nano /etc/redis/6379.conf

* Set *daemonize* to yes
* Set *dir* to /var/redis/6379
* Set *requirepass* redismasterpass

```
Setup Mongodb with a local admin and so that NodeJS can connect.
```
$ mongo
use admin
db.addUser("supermongo", "7zof44Xncx2J1p8")
db.auth("supermongo", "7zof44Xncx2J1p8")
use binarybtc
db.addUser("nodemongo", "WYd224Oa612h147")
```

### 2. Install NodeJS both locally and remotely to start the servers
```
$ sudo apt-get install npm
$ wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.24.1/install.sh | bash
$ nvm install 0.10.25
$ npm install -g forever
$ npm install -g nodemon

$ npm install
$ npm update
     
$ nodemon binarybtc.js

$ apt-add-repository ppa:bitcoin/bitcoin
$ apt-get update
$ apt-get install bitcoind
$ bitcoind
    
$ forever kapitalcoin.js
```    
### 3. Create necessary remote/local keyfiles in your /home/ubuntu/keys/ directory 
```
$ nano /home/ubuntu/keys/...
authy.key	Authy private access token
coin.key	Kapitalcoin.js API private key
irc.host	irc://localhost:6697/vbit
mail.id		Mail from address
mail.key	Mail IMAP password
mongo.key	Mongo connection URL: mongodb://nodemongo:MasterPassword@localhost/binarybtc
redis.key	Redis requirepass
send.key	Master Bitcoin sending password
server.csr	Server SSL CSR
server.key	Server SSL Key
www_io.crt	Domain SSL Crt

* Kapitalcoin.js private key
$ nano /home/ubuntu/keys/coin.key
```
