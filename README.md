# Carsapp
a demonstration of node, react and a bunch of other things.

### Installation
In order to install on a clean debian 8.7 server, do the following:
```
sudo apt-get update
sudo apt-get install curl
sudo apt-get install redis-server
sudo apt-get install git
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash
```
reset the terminal, then do:
```
nvm install 6.10.2
sudo ln -s "$(which nodejs)" /usr/bin/node
sudo apt-get install npm
git clone https://github.com/zigszigsdk/carsapp.git
cd carsapp
sudo npm install sqlite3 -g
npm install
npm run build
export NODE_ENV=production
```
Edit externalAddress in source/config.prod.json to reflect your domain or external ip.

For automatic updates while developing, use `npm run dev`, for prod use `npm start`
The app should now serve requests on port 3000.
