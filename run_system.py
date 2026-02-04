import subprocess
import os
import sys
import time
import threading
from kill_ports import kill_port

def run_backend():
    print("Starting Backend...")
    backend_dir = os.path.join(os.getcwd(), 'backend')
    subprocess.run([sys.executable, 'run.py'], cwd=backend_dir)

def run_frontend():
    print("Starting Frontend...")
    frontend_dir = os.path.join(os.getcwd(), 'frontend')
    subprocess.run('npm run dev', cwd=frontend_dir, shell=True)

if __name__ == '__main__':
    print("Starting Face Attendance System")
    print("--------------------------------")
    print("1. Seed Database (Create Class & Teacher)")
    print("2. Run System (Backend + Frontend)")
    print("--------------------------------")
    
    choice = input("Enter choice (1 or 2): ")
    
    if choice == '1':
        backend_dir = os.path.join(os.getcwd(), 'backend')
        subprocess.run([sys.executable, 'seed.py'], cwd=backend_dir)
        print("\nDatabase seeded! Now run option 2.")
        time.sleep(2)
    elif choice == '2':
        # Kill any existing backend first
        kill_port(5000)
        
        # Start Backend in a separate thread
        backend_thread = threading.Thread(target=run_backend)
        backend_thread.start()
        
        # Wait a bit for backend to start
        time.sleep(5)
        
        # Start Frontend
        run_frontend()
    else:
        print("Invalid choice")
