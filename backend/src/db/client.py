import motor.motor_asyncio
client = motor.motor_asyncio.AsyncIOMotorClient('mongodb+srv://anonDNKworker:jWV7Ls5LsirxXdSi@cluster0.5v3enn8.mongodb.net/?retryWrites=true&w=majority')
db = client['main_database']