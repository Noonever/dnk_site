FROM python:3.11-slim

RUN apt update && apt upgrade -y

WORKDIR /app
COPY . .

RUN apt install -y ffmpeg
RUN pip install -r requirements.txt

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
