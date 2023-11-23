from src.api.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="178.253.23.244", port=8000)