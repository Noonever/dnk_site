import gspread
from loguru import logger
from pathlib import Path
from loguru import logger
from oauth2client.service_account import ServiceAccountCredentials

creds_file_path = Path(__file__).parent.parent/'dnk-test-402011-6436087599f1.json'

def write_rows_to_google_sheet(rows: list[list]):
    
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    creds = ServiceAccountCredentials.from_json_keyfile_name(creds_file_path, scope)
    
    client = gspread.authorize(creds)

    sheet = client.open_by_key("1nSZgM3TksoKPJgv4b-V_VIxV-Tsfz8rUSilouzyIO1Y").worksheet("Test")

    first_empty_row = len(sheet.col_values(1)) + 1

    logger.info("Started writing data to google sheet")
    for row in rows:
        sheet.insert_row(row, index=first_empty_row)
        first_empty_row += 1

    logger.success(f"{len(rows)} rows added to google sheet")
