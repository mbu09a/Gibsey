from setuptools import find_packages, setup

setup(
    name="gibsey-backend",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi>=0.68.0",
        "uvicorn>=0.15.0",
        "python-dotenv>=0.19.0",
        "supabase>=1.0.0",
        "openai>=1.0.0",
        "requests>=2.26.0",
    ],
)
