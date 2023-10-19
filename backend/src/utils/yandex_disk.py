from pathlib import Path
import pprint

import yadisk
from loguru import logger

YANDEX_DISK_TOKEN='y0_AgAAAAAoTDFjAAk4ZQAAAADdl6Wv9pI3krJ1Q5-INSoZ6ujoR6VjKoM'

YANDEX_LINK = "https://disk.yandex.ru/d/Td1MZlXz2wZlfQ"


class YandexApi:
    yadisk: yadisk.YaDisk

    def __init__(self, token: str):
        """
        Initialize a YandexApi object.

        Args:
            token (str): Yandex Disk API token.
        """
        self.yadisk: yadisk.YaDisk = yadisk.YaDisk(
            token=token
        )

        self.statistic_dir_path = "/Статистика. Новая/"


    def get_dirs(self) -> list:
        
        dirs = list(self.yadisk.listdir('/', limit=3))
        for item in dirs:
            pprint.pprint(item.path)
        return dirs


    def publish(self, path: str) -> str | None:
        try:
            dir_link = self.yadisk.publish(path).get_meta().public_url
            return dir_link
        except yadisk.exceptions.PathNotFoundError:
            logger.warning(f"Path to publish: {path} not found on Yadisk")
        except Exception as e:
            logger.exception(e)


    def remove(self, path: str):
        try:
            self.yadisk.remove(path, permanently=True)
        except yadisk.exceptions.PathNotFoundError:
            logger.warning(f"Path to remove: {path} not found on Yadisk")
        except Exception as e:
            logger.exception(e)


    def download_file(self, disk_path: str, download_path: Path) -> bool:
        """
        Download a file from Yandex Disk.

        Args:
            disk_path (str): Path to the file on Yandex Disk.
            download_path (Path): Path to save the downloaded file.

        Returns:
            bool: True if download was successful, False otherwise.
        """
        download_path.parent.mkdir(parents=True, exist_ok=True)
        status = False
        try:
            self.yadisk.download(disk_path, download_path.as_posix())
            status = True
            logger.debug(f"Download path {download_path.as_posix()}")
            logger.success(f"File {download_path.name} downloaded from YaDisk")

        except yadisk.exceptions.PathNotFoundError as e:
            logger.error(e)
            download_path.unlink(missing_ok=True)
            logger.warning(f"File {disk_path} not found on Yadisk")
        except Exception as e:
            download_path.unlink(missing_ok=True)
            logger.exception(e)

        return status


    def upload_file(self, local_path: Path, dst_path: str) -> str:
        """
        Upload a local file to Yandex Disk.

        Args:
            local_path (Path): Path to the local file.
            dst_path (str): Destination path on Yandex Disk.

        Returns:
            str: Path to the uploaded file on Yandex Disk.
        """
        try:
            resource_link = self.yadisk.upload(local_path.as_posix(), dst_path)
            return resource_link
        except yadisk.exceptions.PathExistsError:
            logger.warning(f"File {dst_path} already exists")
            return True
        except FileNotFoundError:
            logger.warning(f"File {local_path} not found")
            return False
        except Exception as e:
            logger.exception(e)

    def create_service_dir(self, path: str):
        """
        Create directories on Yandex Disk for the specified path.

        Args:
            path (str): Path to create directories for.
        """
        try :
            self.yadisk.mkdir(path)
        except yadisk.exceptions.PathExistsError:
            pass


def get_yadisk_api():
    return YandexApi(YANDEX_DISK_TOKEN)