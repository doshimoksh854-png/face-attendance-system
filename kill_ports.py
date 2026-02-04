import os
import subprocess
import sys

def kill_port(port):
    print(f"Attempting to kill processes on port {port}...")
    try:
        # Find PID using netstat (Windows)
        cmd = f'netstat -ano | findstr :{port}'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        lines = result.stdout.strip().split('\n')
        
        killed = False
        for line in lines:
            if 'LISTENING' in line:
                parts = line.split()
                # PID is usually the last element
                pid = parts[-1]
                print(f"Found process {pid} listening on port {port}. Killing...")
                subprocess.run(f'taskkill /F /PID {pid}', shell=True)
                killed = True
        
        if not killed:
            print(f"No process found listening on port {port}.")
    except Exception as e:
        print(f"Error killing port {port}: {e}")

if __name__ == "__main__":
    print("Killing lingering processes...")
    kill_port(5000)
    print("Port cleanup attempt finished.")
