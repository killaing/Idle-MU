import json
import mimetypes
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse


ROOT = Path(__file__).resolve().parents[1]
HOST = "127.0.0.1"


class StudioHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/__studio/status":
            return self.send_json({"ok": True, "root": str(ROOT)})
        if parsed.path == "/__studio/read":
            qs = parse_qs(parsed.query)
            rel = qs.get("path", [""])[0]
            path = self.safe_path(rel)
            if not path:
                return self.send_json({"ok": False, "error": "Invalid path"}, 400)
            if not path.exists():
                return self.send_json({"ok": False, "missing": True, "data": None})
            try:
                return self.send_json({"ok": True, "missing": False, "data": json.loads(path.read_text(encoding="utf-8"))})
            except Exception as exc:
                return self.send_json({"ok": False, "error": str(exc)}, 500)
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != "/__studio/write":
            return self.send_json({"ok": False, "error": "Unknown endpoint"}, 404)
        try:
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length).decode("utf-8")
            payload = json.loads(body)
            rel = payload.get("path", "")
            content = payload.get("content", "")
            path = self.safe_path(rel)
            if not path:
                return self.send_json({"ok": False, "error": "Invalid path"}, 400)
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")
            return self.send_json({"ok": True, "path": rel})
        except Exception as exc:
            return self.send_json({"ok": False, "error": str(exc)}, 500)

    def safe_path(self, rel):
        rel = str(rel).replace("\\", "/").lstrip("/")
        if not rel or ".." in Path(rel).parts:
            return None
        path = (ROOT / rel).resolve()
        try:
            path.relative_to(ROOT)
        except ValueError:
            return None
        return path

    def send_json(self, data, status=200):
        raw = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)


def run():
    port = int(os.environ.get("MU_IDLE_STUDIO_PORT", "8788"))
    mimetypes.add_type("text/javascript", ".js")
    httpd = ThreadingHTTPServer((HOST, port), StudioHandler)
    print(f"MU Idle Studio server: http://{HOST}:{port}/studio.html", flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    run()
