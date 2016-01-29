# popupvid.io

## Installation
1. Download the repository
2. Install npm modules: `npm install`
3. Install bower dependencies `bower install`
4. Install mongodb: 
	a. `brew install mongodb`
	b. Setup mongodb folder: `sudo mkdir -p /data/db`
	c. Set permissions on folder: ``sudo chown `whoami` /data/db``
	d. Start mongodb server: `mongod`
5. Start up the server: `grunt`
6. View in browser at http://localhost:8080