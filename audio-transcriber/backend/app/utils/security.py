import socket
import ipaddress
from urllib.parse import urlparse
from typing import Optional

from app.config import settings


_PRIVATE_RANGES = [
    "10.0.0.0/8",
    "172.16.0.0/12",
    "192.168.0.0/16",
    "127.0.0.0/8",
    "169.254.0.0/16",
    "::1/128",
    "fc00::/7",
    "fe80::/10",
]


def is_private_ip(hostname: str) -> bool:
    try:
        ip = socket.getaddrinfo(hostname, None)[0][4][0]
        addr = ipaddress.ip_address(ip)
        return any(addr in ipaddress.ip_network(r) for r in _PRIVATE_RANGES)
    except Exception:
        return True


def validate_url(url: str) -> tuple[bool, Optional[str]]:
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False, "Only http and https URLs are supported"
        if not parsed.netloc:
            return False, "Invalid URL: no hostname"

        hostname = parsed.netloc.split(":")[0].lower()

        if is_private_ip(hostname):
            return False, "URL points to a private/internal network address (SSRF protection)"

        if settings.ALLOWED_DOMAINS:
            allowed = any(
                hostname == d or hostname.endswith("." + d)
                for d in settings.ALLOWED_DOMAINS
            )
            if not allowed:
                return False, f"Domain not in allowed list: {hostname}"

        return True, None
    except Exception as e:
        return False, str(e)


def sanitize_filename(filename: str) -> str:
    import re
    filename = re.sub(r"[^\w\-_. ]", "_", filename)
    filename = filename.strip()
    if not filename:
        filename = "untitled"
    return filename


def get_extension(filename: str) -> str:
    import os
    _, ext = os.path.splitext(filename)
    return ext.lower() if ext else ""
