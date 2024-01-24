from pathlib import Path
from mutagen import File
from pydub import AudioSegment

from loguru import logger

from ..config import download_dir, temp_dir

def format_duration(seconds):
    minutes = int(seconds // 60)
    seconds = int(seconds % 60)
    return f"{minutes}:{seconds:02d}"


def get_wav_duration(file_id: str, raw: bool = False) -> str | int | None:
    file_path = download_dir/f"{file_id}.wav"
    print(file_path)
    try:
        audio = File(file_path)
        print(audio)
        if audio is not None and hasattr(audio, 'info') and hasattr(audio.info, 'length'):
            duration = audio.info.length
            logger.debug(f"Duration: {duration}, type: {type(duration)}")
            formatted_duration = format_duration(duration)
            if raw:
                return duration
            return formatted_duration
    except Exception as e:
        logger.error(f"Error processing {file_path.name}: {e}")
        return None


def convert_wav_to_mp3(file_id: str) -> Path:
    temp_dir.mkdir(parents=True, exist_ok=True)
    wav_path = download_dir/f"{file_id}.wav"
    mp3_path = temp_dir/f"{file_id}.mp3"
    try:
        # Load the WAV file
        audio = AudioSegment.from_wav(wav_path)
        # Export as MP3
        audio.export(mp3_path, format="mp3")
        return mp3_path
    
    except Exception as e:
        logger.error(f"Error processing {wav_path.name}: {e}")
        return None
    
