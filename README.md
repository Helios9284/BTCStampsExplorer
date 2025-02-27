# BITCOIN STAMPS EXPLORER AND API

CHECK ENV VARS AND PLEAS ENSURE THE DB_USER ONLY HAS READ PERMISION

This is the API for https://stampchain.io/docs and the (WIP) open source block explorer for Bitcoin Stamps. This is intended to be run concurrently with the Bitcoin Stamps Indexer database https://github.com/stampchain-io/btc_stamps

## 1. Set environment variables
Create a .env file with the following variables:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=read_only_user
DB_PASSWORD=yourpassword
DB_NAME=btc_stamps
```
## 2. Install dependencies

```bash
npm install
```
## 3. Run the API
```bash
npm start
```
## Contributing
Feel free to fork and submit pull requests. Contributions are welcome!



