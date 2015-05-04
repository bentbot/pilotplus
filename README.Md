# Bitcoin Binary Options

## Setup

### 1. Install Redis and MongoDB for user management
```
Create a batch script to install MongoDB

$ sudo chmod +x ./dependencies.sh
$ sudo bash ./dependencies.sh

$ nano /etc/redis/6379.conf

     daemonize yes
     dir /var/redis/6379
     requirepass redismasterpass

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
