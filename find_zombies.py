import socket

def test_bind(port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind(('127.0.0.1', port))
        print(f"Port {port} is FREE (can bind successfully).")
    except Exception as e:
        print(f"Port {port} is OCCUPIED/BLOCKED: {e}")
    finally:
        s.close()

test_bind(8080)
test_bind(8000)
