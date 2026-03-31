# SkillSync Advanced Startup Script (Low Memory)

Write-Host "Starting SkillSync Platform (Optimized for Low Memory)..." -ForegroundColor Cyan

# 1. Build All Services Once (Saves memory by not keeping Maven running for each service)
Write-Host "Building all services (this may take a minute)..." -ForegroundColor Yellow
mvn clean install -DskipTests

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed. Please check your Java/Maven setup."
    exit
}

# 2. Start Service Registry (Wait for it to be ready)
Write-Host "Starting Service Registry..." -ForegroundColor Yellow
$registryJar = Get-ChildItem -Path "service-registry/target/*.jar" | Select-Object -First 1
Start-Process java -ArgumentList "-Xmx128m -jar `"$($registryJar.FullName)`"" -NoNewWindow
Start-Sleep -Seconds 15

# 3. Start Config Server
Write-Host "Starting Config Server..." -ForegroundColor Yellow
$configJar = Get-ChildItem -Path "config-server/target/*.jar" | Select-Object -First 1
Start-Process java -ArgumentList "-Xmx128m -jar `"$($configJar.FullName)`"" -NoNewWindow
Start-Sleep -Seconds 10

# 4. Start API Gateway
Write-Host "Starting API Gateway..." -ForegroundColor Yellow
$gatewayJar = Get-ChildItem -Path "api-gateway/target/*.jar" | Select-Object -First 1
Start-Process java -ArgumentList "-Xmx128m -jar `"$($gatewayJar.FullName)`"" -NoNewWindow

# 5. Start Core Services
$services = @("auth-service", "user-service", "mentor-service", "skill-service", "session-service", "group-service", "review-service", "notification-service")

foreach ($service in $services) {
    Write-Host "Starting $service..." -ForegroundColor Yellow
    $jar = Get-ChildItem -Path "$service/target/*.jar" | Select-Object -First 1
    Start-Process java -ArgumentList "-Xmx128m -jar `"$($jar.FullName)`"" -NoNewWindow
}

# 6. Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "cd skillsync-frontend; npm install; npm run dev" -NoNewWindow

Write-Host "All services are starting up with 128MB RAM limit." -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Eureka: http://localhost:8761" -ForegroundColor Green
