# WallStreetNinja Backend

## Environment Variables

All variables need to be set.

**HOST**  
The IP the backend shall listen on. (E.g. "0.0.0.0")

**PORT**  
The port the backend shall listen on. (E.g. "8000")

**DB_PATH**  
Path of the SQLite database.

**REFERRER_ADDRESS**  
The wallet address the 1Ich referer fees shall be sent to.

**REFERRER_FEE**  
The hight of the referrer fee. Min: 0 Max: 3

**SIGNING_PASSWORD**  
Secret to sign authenticated API calls.

**BSC_RPC_URL_1**  
Primary Binance Smart Chain RPC server.

**ETHEREUM_RPC_URL_1**  
Primary Ethereum mainnet RPC server.

**POLYGON_RPC_URL_1**  
Primary Polygon RPC server.

**BSC_RPC_URL_2**  
Secondary Binance Smart Chain RPC server.

**ETHEREUM_RPC_URL_2**  
Secondary Ethereum mainnet RPC server.

**POLYGON_RPC_URL_2**  
Secondary Polygon RPC server.

**COVALENT_API_KEY**  
Covalent API key

**ADMIN_PASSWORD_HASH**  
Hash of the salted admon password.

**ADMIN_PASSWORD_SALT**  
Salt of the admin password hash.

## Initialisation

```console
$ npm install
```

### Creating the admin password

The admin password is required to upload and download the database file.

```console
$ npm run create_admin_password
```

## Docker

### Building and pushing a new Docker image

```console
$ docker build -t wsndevop3/wsn-backend:<tag>  .
$ docker push wsndevop3/wsn-backend:<tag>
```

### Running with Docker

The docker container needs a volume which is mapped to "_/node/db_".

## Database initialisation

After the backend has been started the first time, it will not have a database. A prepared empty database file comes with the repository "_initial_database.sq3_". This files needs to be uploaded via the frontend. The link is "_https://\<domain\>/maintenance_".

When the database has been uploaded the backend is ready for usage.
