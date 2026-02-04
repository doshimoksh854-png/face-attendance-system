import os
import zipfile

def is_source_file(filename):
    return filename.endswith(('.py', '.js', '.jsx', '.html', '.css', '.json', '.md', '.txt'))

def is_ignored(path):
    return 'node_modules' in path or '__pycache__' in path or 'venv' in path or '.git' in path or 'dist' in path

def create_single_file_bundle():
    output_file = 'project_code_bundle.txt'
    print(f"Creating {output_file}...")
    
    with open(output_file, 'w', encoding='utf-8') as outfile:
        outfile.write("FACE ATTENDANCE SYSTEM - COMPLETE SOURCE CODE\n")
        outfile.write("=============================================\n\n")
        
        for root, dirs, files in os.walk('.'):
            if is_ignored(root):
                continue
                
            for file in files:
                if is_source_file(file):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            outfile.write(f"--- START FILE: {file_path} ---\n")
                            outfile.write(infile.read())
                            outfile.write(f"\n--- END FILE: {file_path} ---\n\n")
                    except Exception as e:
                        print(f"Skipping {file}: {e}")
    
    print(f"Created {output_file} (Contains all code in one file)")

def create_zip_archive():
    zip_name = 'face_attendance_project.zip'
    print(f"Creating {zip_name}...")
    
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            if is_ignored(root):
                continue
            for file in files:
                file_path = os.path.join(root, file)
                zipf.write(file_path, os.path.relpath(file_path, '.'))
                
    print(f"Created {zip_name} (Ready for submission)")

if __name__ == '__main__':
    create_single_file_bundle()
    create_zip_archive()
