# Pawchive File Ripper

A Tampermonkey/Violentmonkey userscript for downloading all images, videos, and linked files in a zip.

## Features

- **Batch Download:** Downloads all images, videos, and attached files (ZIPs, etc.) from Pawchive posts
- **File Picker Support:** Uses the fflate's file picker for fast zip file creation.
- **Button Integration:** Adds a "Download & ZIP" button next to Favorite/Flag on post pages.
- **Progress Bar:** Displays a progress bar for individual files during the download and zip process.
- **Folder Naming:** Zip file is named {post title} by {creator}.zip.
- **Individual File:** Naming: All files are saved after the post title followed by a number (order) to sort them.
- **Duplicate Handling:** Automatically skips duplicate files.
- **Works on:**: `pawchive.st` domain.
- **Efficiency and Performance:** This script is smaller in size compared to `Kemono Ripper`, and is faster for downloading and zipping files.

## Usage

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/) in your browser.
2. Add this userscript.
3. Visit any Pawchive post page.
4. Click the **Download & ZIP** button next to Favorite/Flag.
5. Wait for the progress bar to complete and save the zip file.

## Notes

- Large files may take longer to download and zip.
- All downloads are direct from Pawchive servers.
- The script does not support chunked downloads or resume for very large files.

## License

GPL-3.0 https://www.gnu.org/licenses/gpl-3.0.txt