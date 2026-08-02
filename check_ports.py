import urllib.request

def check_port(url):
    try:
        req = urllib.request.Request(url, method='GET')
        with urllib.request.urlopen(req, timeout=2) as response:
            print(f"{url} is UP. Status code: {response.status}")
    except Exception as e:
        print(f"{url} is DOWN: {e}")

check_port("http://127.0.0.1:8080/")
check_port("http://127.0.0.1:8000/")
