@echo off
echo Connecting to ECS PostgreSQL...
ssh -i "C:/Users/Lenovo/Downloads/my-origin.pem" -o StrictHostKeyChecking=no -f -N -L 5433:localhost:5432 root@47.114.121.178
if %errorlevel% equ 0 (
    echo Tunnel established: localhost:5433 -^> ECS PostgreSQL
) else (
    echo Tunnel may already be running or connection failed.
)
pause
