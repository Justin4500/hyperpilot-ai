import re
import ipaddress
from urllib.parse import urlparse

# Private and loopback IP networks
BLOCKED_IP_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("169.254.0.0/16"),  # Link-local / cloud metadata
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10"),
]

BLOCKED_HOSTNAMES = {
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "metadata.google.internal",
    "169.254.169.254",
}

# Consequential keywords that require explicit user confirmation or policy safety gate
SENSITIVE_PATTERNS = [
    r"\b(buy|purchase|checkout|pay|payment|order|credit card|paypal|stripe)\b",
    r"\b(send email|post tweet|publish|delete account|wire transfer)\b",
]

def validate_url_safety(url: str) -> tuple[bool, str]:
    """
    Validate that a URL does not target localhost, internal networks, or cloud metadata endpoints.
    Returns (is_safe, error_message).
    """
    if not url:
        return True, ""
        
    try:
        parsed = urlparse(url)
        scheme = (parsed.scheme or "").lower()
        if scheme not in ("http", "https"):
            return False, f"Unsupported URL scheme: {scheme}. Only HTTP/HTTPS are allowed."
            
        hostname = (parsed.hostname or "").lower()
        if not hostname:
            return False, "Invalid URL: missing hostname"
            
        if hostname in BLOCKED_HOSTNAMES:
            return False, f"Access to restricted hostname '{hostname}' is prohibited for security."
            
        try:
            ip = ipaddress.ip_address(hostname)
            for network in BLOCKED_IP_NETWORKS:
                if ip in network:
                    return False, f"Access to internal IP address '{hostname}' is blocked."
        except ValueError:
            # It is a domain name, not a raw IP address
            pass
            
        return True, ""
    except Exception as e:
        return False, f"Failed to validate URL: {str(e)}"

def check_prompt_sensitivity(prompt: str) -> tuple[bool, str]:
    """
    Check if the prompt requests financial transactions or consequential actions.
    Returns (is_sensitive, warning_reason).
    """
    lower = prompt.lower()
    for pattern in SENSITIVE_PATTERNS:
        match = re.search(pattern, lower)
        if match:
            return True, f"Action contains sensitive or consequential keyword '{match.group(0)}'. Explicit user confirmation or policy mode is required."
    return False, ""
