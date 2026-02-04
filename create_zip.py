import os
import zipfile

def zip_project(output_filename):
    # Get the current directory (project root)
    source_dir = os.getcwd()
    
    # Folders to exclude
    exclude_folders = {'node_modules', '__pycache__', '.git', '.venv', 'env', 'dist', 'build'}
    exclude_files = {output_filename, 'attendance.db'} # Exclude the zip itself and the local DB (optional, but safer to share fresh)

    print(f"Zipping project from: {source_dir}")
    print(f"Excluding: {exclude_folders}")

    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # Modify dirs in-place to skip excluded folders
            dirs[:] = [d for d in dirs if d not in exclude_folders]
            
            for file in files:
                if file in exclude_files:
                    continue
                if file.endswith('.pyc'): # Skip compiled python files
                    continue
                    
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, source_dir)
                
                print(f"Adding: {arcname}")
                zipf.write(file_path, arcname)

    print(f"\nSuccess! Project zipped to: {os.path.abspath(output_filename)}")

if __name__ == "__main__":
    zip_project("FaceAttendanceProject_Share.zip")
