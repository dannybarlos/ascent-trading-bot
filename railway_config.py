"""
Railway-specific configuration and utilities
"""
import os
from typing import Optional

def get_railway_config() -> dict:
    """
    Get Railway-specific configuration from environment variables.
    Railway automatically injects these variables.
    """
    return {
        # Railway-injected variables
        'environment': os.getenv('RAILWAY_ENVIRONMENT', 'development'),
        'service_name': os.getenv('RAILWAY_SERVICE_NAME', 'ascent-trading-bot'),
        'deployment_id': os.getenv('RAILWAY_DEPLOYMENT_ID'),
        'replica_id': os.getenv('RAILWAY_REPLICA_ID'),

        # Service configuration
        'port': int(os.getenv('PORT', 8000)),
        'host': os.getenv('HOST', '0.0.0.0'),

        # Redis (auto-configured by Railway Redis plugin)
        'redis_url': os.getenv('REDIS_URL'),

        # Alpaca (must be manually set)
        'alpaca_api_key': os.getenv('ALPACA_API_KEY'),
        'alpaca_secret_key': os.getenv('ALPACA_SECRET_KEY'),
        'alpaca_base_url': os.getenv('ALPACA_BASE_URL', 'https://paper-api.alpaca.markets'),

        # Optional settings
        'log_level': os.getenv('LOG_LEVEL', 'INFO'),
        'workers': int(os.getenv('WORKERS', 2)),
    }

def is_railway_environment() -> bool:
    """Check if running on Railway"""
    return os.getenv('RAILWAY_ENVIRONMENT') is not None

def get_public_url() -> Optional[str]:
    """
    Get the public URL of the Railway deployment.
    Railway injects this as RAILWAY_PUBLIC_DOMAIN.
    """
    domain = os.getenv('RAILWAY_PUBLIC_DOMAIN')
    if domain:
        return f"https://{domain}"
    return None

def validate_railway_config() -> tuple[bool, list[str]]:
    """
    Validate Railway configuration.
    Returns (is_valid, errors)
    """
    errors = []
    config = get_railway_config()

    # Check required Alpaca credentials
    if not config['alpaca_api_key']:
        errors.append("ALPACA_API_KEY environment variable is not set")

    if not config['alpaca_secret_key']:
        errors.append("ALPACA_SECRET_KEY environment variable is not set")

    # Warn about missing Redis (not critical, but recommended)
    if not config['redis_url']:
        errors.append("REDIS_URL not set. Add Redis plugin: railway add --plugin redis")

    return len(errors) == 0, errors

if __name__ == "__main__":
    # Test configuration when run directly
    import json

    print("Railway Configuration Check")
    print("=" * 50)

    if is_railway_environment():
        print("✅ Running on Railway")
    else:
        print("⚠️  Not running on Railway (local development)")

    print("\nConfiguration:")
    config = get_railway_config()

    # Mask sensitive data
    safe_config = config.copy()
    if safe_config.get('alpaca_api_key'):
        safe_config['alpaca_api_key'] = safe_config['alpaca_api_key'][:8] + '...'
    if safe_config.get('alpaca_secret_key'):
        safe_config['alpaca_secret_key'] = '***'
    if safe_config.get('redis_url'):
        safe_config['redis_url'] = safe_config['redis_url'][:20] + '...'

    print(json.dumps(safe_config, indent=2))

    print("\nValidation:")
    is_valid, errors = validate_railway_config()

    if is_valid:
        print("✅ All required configuration is set")
    else:
        print("❌ Configuration errors:")
        for error in errors:
            print(f"   - {error}")

    if url := get_public_url():
        print(f"\n🌐 Public URL: {url}")
